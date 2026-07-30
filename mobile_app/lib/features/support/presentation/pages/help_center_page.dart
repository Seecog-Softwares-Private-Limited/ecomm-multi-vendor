import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/faq_item.dart';
import '../support_controller.dart';
import '../widgets/support_empty_state.dart';
import '../widgets/support_skeletons.dart';
import '../widgets/ticket_card.dart';

/// Premium Help Center dashboard (Material 3).
class HelpCenterPage extends ConsumerStatefulWidget {
  const HelpCenterPage({this.orderId, super.key});

  final String? orderId;

  @override
  ConsumerState<HelpCenterPage> createState() => _HelpCenterPageState();
}

class _HelpCenterPageState extends ConsumerState<HelpCenterPage> {
  late final TextEditingController _search;

  @override
  void initState() {
    super.initState();
    _search = TextEditingController();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    ref.invalidate(faqsProvider);
    await ref.read(supportControllerProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final query = ref.watch(helpCenterSearchQueryProvider).trim().toLowerCase();
    final faqsAsync = ref.watch(faqsProvider);
    final ticketsAsync = ref.watch(supportControllerProvider);
    final loading = faqsAsync.isLoading && ticketsAsync.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Center'),
        actions: [
          Semantics(
            button: true,
            label: 'Create support ticket',
            child: IconButton(
              tooltip: 'New ticket',
              icon: const Icon(Icons.add_comment_outlined),
              onPressed: () => context.push(
                AppRoutes.supportCreatePath(orderId: widget.orderId),
              ),
            ),
          ),
        ],
      ),
      body: loading
          ? const HelpCenterSkeleton()
          : RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  AppSpacing.huge,
                ),
                children: [
                  if (widget.orderId != null) ...[
                    _OrderHelpBanner(
                      orderId: widget.orderId!,
                      onCreate: () => context.push(
                        AppRoutes.supportCreatePath(orderId: widget.orderId),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                  Semantics(
                    textField: true,
                    label: 'Search help articles and tickets',
                    child: TextField(
                      controller: _search,
                      textInputAction: TextInputAction.search,
                      onChanged: (v) =>
                          ref.read(helpCenterSearchQueryProvider.notifier).update(v),
                      decoration: InputDecoration(
                        hintText: 'Search FAQs, tickets, subjects…',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: query.isEmpty
                            ? null
                            : IconButton(
                                tooltip: 'Clear search',
                                onPressed: () {
                                  _search.clear();
                                  ref.read(helpCenterSearchQueryProvider.notifier).update('');
                                },
                                icon: const Icon(Icons.close),
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  if (query.isEmpty) ...[
                    Text(
                      'Quick actions',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.support_agent,
                            label: 'Contact Support',
                            onTap: () => context.push(
                              AppRoutes.supportCreatePath(orderId: widget.orderId),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.confirmation_number_outlined,
                            label: 'My Tickets',
                            onTap: () => context.push(AppRoutes.supportTickets),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: _QuickActionCard(
                            icon: Icons.quiz_outlined,
                            label: 'FAQs',
                            onTap: () => context.push(AppRoutes.supportFaqs),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Text(
                      'Browse topics',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    ..._topicTiles(context),
                    const SizedBox(height: AppSpacing.xl),
                    _AboutSupportCard(),
                    const SizedBox(height: AppSpacing.xl),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Recent tickets',
                            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push(AppRoutes.supportTickets),
                          child: const Text('View all'),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ticketsAsync.when(
                      loading: () => const TicketListSkeleton(),
                      error: (error, _) => ErrorStateView(
                        message: 'Could not load your tickets.',
                        onRetry: () => ref.read(supportControllerProvider.notifier).refresh(),
                      ),
                      data: (tickets) {
                        if (tickets.isEmpty) {
                          return SupportEmptyState(
                            kind: SupportEmptyKind.tickets,
                            onAction: () => context.push(
                              AppRoutes.supportCreatePath(orderId: widget.orderId),
                            ),
                          );
                        }
                        return Column(
                          children: [
                            for (final ticket in tickets.take(3))
                              Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                                child: TicketCard(ticket: ticket, key: ValueKey(ticket.id)),
                              ),
                          ],
                        );
                      },
                    ),
                  ] else ...[
                    _SearchResults(query: query),
                  ],
                  const SizedBox(height: AppSpacing.lg),
                  AppButton(
                    label: 'Continue Shopping',
                    icon: Icons.storefront_outlined,
                    variant: AppButtonVariant.secondary,
                    onPressed: () => context.go(AppRoutes.home),
                  ),
                ],
              ),
            ),
    );
  }

  List<Widget> _topicTiles(BuildContext context) {
    const topics = <({String id, String title, IconData icon, String subtitle})>[
      (id: FaqCategories.orders, title: 'Orders', icon: Icons.local_shipping_outlined, subtitle: 'Tracking, cancellations'),
      (id: FaqCategories.returns, title: 'Returns & Refunds', icon: Icons.assignment_return_outlined, subtitle: 'Return window & refunds'),
      (id: FaqCategories.payments, title: 'Payments', icon: Icons.payments_outlined, subtitle: 'UPI, cards & refunds'),
      (id: FaqCategories.account, title: 'Account & Security', icon: Icons.security_outlined, subtitle: 'Login & profile help'),
      (id: FaqCategories.general, title: 'General', icon: Icons.info_outline, subtitle: 'Policies & basics'),
    ];

    return [
      for (final topic in topics)
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: _TopicTile(
            icon: topic.icon,
            title: topic.title,
            subtitle: topic.subtitle,
            onTap: () => context.push(AppRoutes.supportFaqsPath(category: topic.id)),
          ),
        ),
    ];
  }
}

class _OrderHelpBanner extends StatelessWidget {
  const _OrderHelpBanner({required this.orderId, required this.onCreate});

  final String orderId;
  final VoidCallback onCreate;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    final short = orderId.substring(0, orderId.length.clamp(0, 8)).toUpperCase();
    return Material(
      color: adaptive.primarySurface,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            const Icon(Icons.receipt_long_outlined, color: AppColors.primary),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Need help with order #$short?',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'Create a ticket — this order will be linked automatically.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: adaptive.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            AppButton(
              label: 'Create',
              expanded: false,
              onPressed: onCreate,
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: adaptive.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Ink(
            height: 96,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: adaptive.border),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: adaptive.primarySurface,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 22),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TopicTile extends StatelessWidget {
  const _TopicTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return Material(
      color: adaptive.surface,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: ListTile(
        onTap: onTap,
        minVerticalPadding: 14,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: BorderSide(color: adaptive.border),
        ),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: adaptive.primarySurface,
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: Icon(Icons.chevron_right, color: adaptive.textMuted),
      ),
    );
  }
}

class _AboutSupportCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        gradient: LinearGradient(
          colors: [
            adaptive.primarySurface,
            adaptive.surface,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: adaptive.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'About Support',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Our team helps with orders, returns, payments and account issues. '
            'Most tickets receive a response within one business day.',
            style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }
}

class _SearchResults extends ConsumerWidget {
  const _SearchResults({required this.query});

  final String query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final faqsAsync = ref.watch(faqsProvider);
    final ticketsAsync = ref.watch(supportControllerProvider);

    final faqs = faqsAsync.value ?? const [];
    final tickets = ticketsAsync.value ?? const [];

    final matchedFaqs = faqs
        .where(
          (f) =>
              f.question.toLowerCase().contains(query) ||
              f.answer.toLowerCase().contains(query) ||
              f.category.toLowerCase().contains(query),
        )
        .toList(growable: false);
    final matchedTickets = tickets
        .where((t) {
          return t.subject.toLowerCase().contains(query) ||
              t.shortId.toLowerCase().contains(query) ||
              t.id.toLowerCase().contains(query);
        })
        .toList(growable: false);

    if (matchedFaqs.isEmpty && matchedTickets.isEmpty) {
      return const SupportEmptyState(kind: SupportEmptyKind.search);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (matchedFaqs.isNotEmpty) ...[
          Text('FAQs', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: AppSpacing.sm),
          for (final faq in matchedFaqs.take(8))
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.help_outline, color: AppColors.primary),
              title: Text(faq.question, maxLines: 2, overflow: TextOverflow.ellipsis),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(AppRoutes.supportFaqsPath(q: query)),
            ),
          const SizedBox(height: AppSpacing.lg),
        ],
        if (matchedTickets.isNotEmpty) ...[
          Text('Tickets', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: AppSpacing.sm),
          for (final ticket in matchedTickets)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: TicketCard(ticket: ticket, key: ValueKey(ticket.id)),
            ),
        ],
      ],
    );
  }
}
