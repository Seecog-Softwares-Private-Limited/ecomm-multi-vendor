import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/support_helpers.dart';
import '../../domain/support_ticket.dart';
import 'support_status_badge.dart';

/// Memoized ticket list card — rebuilds only when [ticket] identity changes.
class TicketCard extends StatelessWidget {
  const TicketCard({required this.ticket, super.key});

  final SupportTicket ticket;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final orderLabel = shortOrderLabel(ticket.orderId);
    final updated = ticket.lastUpdateAt ?? ticket.updatedAt ?? ticket.createdAt;

    return Semantics(
      button: true,
      label: 'Ticket ${ticket.shortId}, ${ticket.subject}, status ${ticket.status}',
      child: Material(
        color: adaptive.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.push(AppRoutes.supportTicketPath(ticket.id)),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: adaptive.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          ticket.shortId.isEmpty
                              ? '#${ticket.id.substring(0, ticket.id.length.clamp(0, 8)).toUpperCase()}'
                              : ticket.shortId,
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      SupportStatusBadge(status: ticket.status),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    ticket.subject,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.xs,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      _MetaChip(
                        icon: Icons.calendar_today_outlined,
                        label: Formatters.dayMonthYear(ticket.createdAt),
                      ),
                      _MetaChip(
                        icon: Icons.update_outlined,
                        label: 'Updated ${Formatters.relativeTime(updated)}',
                      ),
                      if (orderLabel.isNotEmpty)
                        _MetaChip(
                          icon: Icons.receipt_long_outlined,
                          label: 'Order $orderLabel',
                        ),
                      if (ticket.hasSupportReply) const SupportReplyIndicator(),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: adaptive.textMuted),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(color: adaptive.textSecondary),
        ),
      ],
    );
  }
}
