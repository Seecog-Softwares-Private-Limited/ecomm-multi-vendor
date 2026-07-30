import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/app_notification.dart';
import '../notifications_controller.dart';
import '../utils/notification_navigation.dart';
import '../widgets/notification_card.dart';
import '../widgets/notifications_empty_state.dart';
import '../widgets/notifications_skeleton.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> with WidgetsBindingObserver {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      ref.read(notificationsControllerProvider.notifier).refresh();
    }
  }

  Future<void> _onTap(AppNotification notification) async {
    final notifier = ref.read(notificationsControllerProvider.notifier);
    if (!notification.read) {
      await notifier.markRead(notification.id);
    }
    if (!mounted) return;
    if (notificationHasDeepLink(notification)) {
      navigateFromNotification(context, notification);
    }
  }

  void _showContextMenu(AppNotification notification) {
    final notifier = ref.read(notificationsControllerProvider.notifier);
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!notification.read)
              ListTile(
                leading: const Icon(Icons.mark_email_read_outlined, color: AppColors.primary),
                title: const Text('Mark as read'),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  await notifier.markRead(notification.id);
                },
              ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: AppColors.error),
              title: const Text('Delete notification'),
              onTap: () async {
                Navigator.pop(sheetContext);
                await notifier.delete(notification.id);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(notificationsControllerProvider);
    final notifier = ref.read(notificationsControllerProvider.notifier);
    final category = ref.watch(notificationsCategoryFilterProvider);
    final search = ref.watch(notificationsSearchQueryProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            tooltip: 'Notification settings',
            onPressed: () => context.push(AppRoutes.notificationPreferences),
            icon: const Icon(Icons.settings_outlined),
          ),
          async.maybeWhen(
            data: (state) {
              if (state.unreadCount <= 0) return null;
              return TextButton(
                onPressed: () async {
                  try {
                    await notifier.markAllRead();
                    if (context.mounted) context.showSnack('All notifications marked as read');
                  } catch (error) {
                    if (context.mounted) {
                      context.showSnack(Failure.from(error).message, isError: true);
                    }
                  }
                },
                child: const Text('Mark all read'),
              );
            },
            orElse: () => null,
          ) ?? const SizedBox.shrink(),
        ],
      ),
      body: async.when(
        loading: () => const NotificationsSkeleton(),
        error: (error, _) => ErrorStateView(
          title: 'Could not load notifications',
          message: Failure.from(error).message,
          onRetry: () => ref.invalidate(notificationsControllerProvider),
        ),
        data: (state) {
          final counts = countNotificationsByCategory(state.items);
          final visible = filterNotifications(
            state.items,
            category: category,
            search: search,
          );
          final filteredEmpty = visible.isEmpty;
          final isFiltered = category != 'all' || search.trim().isNotEmpty;

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.sm),
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) =>
                      ref.read(notificationsSearchQueryProvider.notifier).update(value),
                  decoration: InputDecoration(
                    hintText: 'Search title, message or order ID',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            onPressed: () {
                              _searchController.clear();
                              ref.read(notificationsSearchQueryProvider.notifier).update('');
                              setState(() {});
                            },
                            icon: const Icon(Icons.close),
                          )
                        : null,
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 48,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  children: [
                    for (final chip in kNotificationCategories)
                      if (chip.key == 'all' || (counts[chip.key] ?? 0) > 0)
                        Padding(
                          padding: const EdgeInsets.only(right: AppSpacing.sm),
                          child: FilterChip(
                            label: Text('${chip.label} (${counts[chip.key] ?? 0})'),
                            selected: category == chip.key,
                            onSelected: (_) =>
                                ref.read(notificationsCategoryFilterProvider.notifier).update(chip.key),
                            selectedColor: AppColors.primarySurface,
                            checkmarkColor: AppColors.primary,
                          ),
                        ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Expanded(
                child: filteredEmpty
                    ? NotificationsEmptyState(filtered: isFiltered)
                    : RefreshIndicator(
                        onRefresh: notifier.refresh,
                        child: ListView.separated(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          itemCount: visible.length,
                          separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                          itemBuilder: (context, index) {
                            final notification = visible[index];
                            return NotificationCard(
                              key: ValueKey(notification.id),
                              notification: notification,
                              onTap: () => _onTap(notification),
                              onMarkRead: () => notifier.markRead(notification.id),
                              onDelete: () => notifier.delete(notification.id),
                              onLongPress: () => _showContextMenu(notification),
                            );
                          },
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
