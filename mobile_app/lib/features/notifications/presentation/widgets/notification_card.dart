import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../domain/app_notification.dart';

/// Premium notification card with unread styling and swipe actions.
class NotificationCard extends StatelessWidget {
  const NotificationCard({
    required this.notification,
    required this.onTap,
    required this.onMarkRead,
    required this.onDelete,
    required this.onLongPress,
    super.key,
  });

  final AppNotification notification;
  final VoidCallback onTap;
  final VoidCallback onMarkRead;
  final VoidCallback onDelete;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final unread = !notification.read;

    final card = Semantics(
      label: '${notification.title}. ${notification.body}. ${unread ? 'Unread' : 'Read'}',
      button: true,
      child: Material(
        color: unread ? AppColors.primarySurface.withValues(alpha: 0.55) : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: InkWell(
          onTap: onTap,
          onLongPress: onLongPress,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border(
                left: BorderSide(color: unread ? AppColors.primary : Colors.transparent, width: 4),
                top: BorderSide(color: unread ? AppColors.primary.withValues(alpha: 0.35) : AppColors.border.withValues(alpha: 0.7)),
                right: BorderSide(color: unread ? AppColors.primary.withValues(alpha: 0.35) : AppColors.border.withValues(alpha: 0.7)),
                bottom: BorderSide(color: unread ? AppColors.primary.withValues(alpha: 0.35) : AppColors.border.withValues(alpha: 0.7)),
              ),
            ),
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: notification.color.withValues(alpha: 0.14),
                  child: Icon(notification.icon, color: notification.color, size: 22),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.titleSmall?.copyWith(
                                fontWeight: unread ? FontWeight.w800 : FontWeight.w600,
                              ),
                            ),
                          ),
                          if (unread) ...[
                            const SizedBox(width: AppSpacing.sm),
                            Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        notification.body,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Text(
                            Formatters.relativeTime(notification.createdAt),
                            style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textMuted),
                          ),
                          if (notification.shortOrderId != null) ...[
                            Text(' · ', style: theme.textTheme.labelSmall),
                            Text(
                              notification.shortOrderId!,
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ],
                      ),
                      if (notification.actionLabel != null && notification.actionLabel!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          notification.actionLabel!,
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (notification.image != null) ...[
                  const SizedBox(width: AppSpacing.sm),
                  AppCachedImage(
                    imageUrl: notification.image,
                    width: 52,
                    height: 52,
                    fallbackLabel: notification.title,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );

    return Dismissible(
      key: Key('notification-${notification.id}'),
      direction: DismissDirection.horizontal,
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.startToEnd) {
          if (!notification.read) onMarkRead();
          return false;
        }
        onDelete();
        return true;
      },
      background: Container(
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.primarySurface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: const Row(
          children: [
            Icon(Icons.mark_email_read_outlined, color: AppColors.primary),
            SizedBox(width: AppSpacing.sm),
            Text('Mark read', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
      secondaryBackground: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text('Delete', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
            SizedBox(width: AppSpacing.sm),
            Icon(Icons.delete_outline, color: AppColors.error),
          ],
        ),
      ),
      child: card,
    );
  }
}
