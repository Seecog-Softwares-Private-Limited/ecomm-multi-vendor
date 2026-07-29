import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/app_notification.dart';
import '../notifications_controller.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  NotificationType? _filter;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(notificationsControllerProvider);
    final notifier = ref.read(notificationsControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          async.maybeWhen(
            data: (all) {
              if (!all.any((n) => !n.read)) return null;
              return TextButton(
                onPressed: () => notifier.markAllRead(),
                child: const Text('Mark all read'),
              );
            },
            orElse: () => null,
          ) ?? const SizedBox.shrink(),
        ],
      ),
      body: async.when(
        loading: () => const AppLoader(),
        error: (_, __) => ErrorStateView(
          message: 'Could not load notifications.',
          onRetry: () => ref.invalidate(notificationsControllerProvider),
        ),
        data: (all) {
          final items = _filter == null ? all : all.where((n) => n.type == _filter).toList();
          return Column(
            children: [
              SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
                  children: [
                    _chip('All', null),
                    _chip('Orders', NotificationType.order),
                    _chip('Offers', NotificationType.offer),
                    _chip('Updates', NotificationType.general),
                  ],
                ),
              ),
              Expanded(
                child: items.isEmpty
                    ? const EmptyStateView(
                        title: 'No notifications',
                        message: 'You are all caught up.',
                        icon: Icons.notifications_off_outlined,
                      )
                    : RefreshIndicator(
                        onRefresh: notifier.refresh,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(AppSpacing.lg),
                          itemCount: items.length,
                          separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
                          itemBuilder: (context, i) => _NotificationTile(
                            notification: items[i],
                            onTap: () => notifier.markRead(items[i].id),
                          ),
                        ),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _chip(String label, NotificationType? type) {
    return Padding(
      padding: const EdgeInsets.only(right: AppSpacing.sm),
      child: ChoiceChip(
        label: Text(label),
        selected: _filter == type,
        onSelected: (_) => setState(() => _filter = type),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification, required this.onTap});

  final AppNotification notification;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      color: notification.read ? null : AppColors.primarySurface.withValues(alpha: 0.5),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: notification.color.withValues(alpha: 0.15),
                child: Icon(notification.icon, color: notification.color, size: 20),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: notification.read ? FontWeight.w600 : FontWeight.w800,
                            ),
                          ),
                        ),
                        if (!notification.read)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(notification.body, style: theme.textTheme.bodyMedium),
                    const SizedBox(height: 4),
                    Text(
                      Formatters.dayMonthYear(notification.createdAt),
                      style: theme.textTheme.labelSmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
