import 'package:flutter/material.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../domain/support_ticket_message.dart';

class ChatBubble extends StatelessWidget {
  const ChatBubble({required this.message, super.key});

  final SupportTicketMessage message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final isCustomer = message.isCustomer;
    final bubbleColor = isCustomer ? AppColors.primary : adaptive.surfaceVariant;
    final textColor = isCustomer ? Colors.white : adaptive.textPrimary;
    final metaColor = isCustomer ? Colors.white70 : adaptive.textMuted;
    final align = isCustomer ? Alignment.centerRight : Alignment.centerLeft;
    final radius = BorderRadius.only(
      topLeft: const Radius.circular(AppRadius.lg),
      topRight: const Radius.circular(AppRadius.lg),
      bottomLeft: Radius.circular(isCustomer ? AppRadius.lg : AppRadius.xs),
      bottomRight: Radius.circular(isCustomer ? AppRadius.xs : AppRadius.lg),
    );

    return Semantics(
      label: '${isCustomer ? 'You' : 'Support'}: ${message.body}',
      child: Align(
        alignment: align,
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
          child: Opacity(
            opacity: message.isOptimistic ? 0.7 : 1,
            child: Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              decoration: BoxDecoration(
                color: bubbleColor,
                borderRadius: radius,
                border: isCustomer ? null : Border.all(color: adaptive.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isCustomer
                        ? (message.authorName.isEmpty ? 'You' : message.authorName)
                        : (message.authorName.isEmpty ? 'Support' : message.authorName),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: metaColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    message.body,
                    style: theme.textTheme.bodyMedium?.copyWith(color: textColor, height: 1.4),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    Formatters.relativeTime(message.createdAt),
                    style: theme.textTheme.labelSmall?.copyWith(color: metaColor),
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
