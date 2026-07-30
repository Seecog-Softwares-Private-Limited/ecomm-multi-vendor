import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/support_helpers.dart';
import '../support_controller.dart';
import '../widgets/support_empty_state.dart';
import '../widgets/support_skeletons.dart';
import '../widgets/ticket_card.dart';

class SupportTicketsPage extends ConsumerStatefulWidget {
  const SupportTicketsPage({super.key});

  @override
  ConsumerState<SupportTicketsPage> createState() => _SupportTicketsPageState();
}

class _SupportTicketsPageState extends ConsumerState<SupportTicketsPage> {
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

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    final status = ref.watch(ticketsStatusFilterProvider);
    final query = ref.watch(ticketsSearchQueryProvider);
    final ticketsAsync = ref.watch(filteredTicketsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Support Tickets'),
        actions: [
          Semantics(
            button: true,
            label: 'Create support ticket',
            child: IconButton(
              tooltip: 'New ticket',
              icon: const Icon(Icons.add_comment_outlined),
              onPressed: () => context.push(AppRoutes.supportCreateTicket),
            ),
          ),
        ],
      ),
      floatingActionButton: Semantics(
        button: true,
        label: 'Create support ticket',
        child: FloatingActionButton.extended(
          onPressed: () => context.push(AppRoutes.supportCreateTicket),
          icon: const Icon(Icons.add),
          label: const Text('New ticket'),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
            child: Semantics(
              textField: true,
              label: 'Search tickets by subject or ID',
              child: TextField(
                controller: _search,
                textInputAction: TextInputAction.search,
                onChanged: (v) => ref.read(ticketsSearchQueryProvider.notifier).update(v),
                decoration: InputDecoration(
                  hintText: 'Search subject or ticket ID…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: query.isEmpty
                      ? null
                      : IconButton(
                          tooltip: 'Clear',
                          onPressed: () {
                            _search.clear();
                            ref.read(ticketsSearchQueryProvider.notifier).update('');
                          },
                          icon: const Icon(Icons.close),
                        ),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              itemCount: kSupportStatusFilters.length,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
              itemBuilder: (context, index) {
                final id = kSupportStatusFilters[index];
                final selected = status.toUpperCase() == id.toUpperCase();
                return FilterChip(
                  selected: selected,
                  label: Text(supportStatusFilterLabel(id)),
                  onSelected: (_) => ref.read(ticketsStatusFilterProvider.notifier).update(id),
                  showCheckmark: false,
                  selectedColor: adaptive.primarySurface,
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Expanded(
            child: ticketsAsync.when(
              loading: () => const TicketListSkeleton(),
              error: (error, _) => ErrorStateView(
                message: 'Could not load support tickets. Please try again.',
                onRetry: () => ref.read(supportControllerProvider.notifier).refresh(),
              ),
              data: (tickets) {
                if (tickets.isEmpty) {
                  final filtered = query.isNotEmpty || status.toUpperCase() != 'ALL';
                  return SupportEmptyState(
                    kind: filtered ? SupportEmptyKind.search : SupportEmptyKind.tickets,
                    onAction: filtered
                        ? null
                        : () => context.push(AppRoutes.supportCreateTicket),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () => ref.read(supportControllerProvider.notifier).refresh(),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      0,
                      AppSpacing.lg,
                      100,
                    ),
                    itemCount: tickets.length,
                    separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, index) {
                      final ticket = tickets[index];
                      return TicketCard(ticket: ticket, key: ValueKey(ticket.id));
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
