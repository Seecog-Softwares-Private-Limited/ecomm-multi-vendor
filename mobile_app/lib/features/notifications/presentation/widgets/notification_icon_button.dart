import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../notifications_controller.dart';

/// AppBar notification icon with unread badge.
class NotificationIconButton extends ConsumerWidget {
  const NotificationIconButton({required this.onPressed, super.key});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(notificationsControllerProvider);
    final unread = ref.watch(unreadNotificationsCountProvider);

    return Semantics(
      label: unread > 0 ? 'Notifications, $unread unread' : 'Notifications',
      button: true,
      child: IconButton(
        onPressed: onPressed,
        icon: Badge(
          isLabelVisible: unread > 0,
          label: Text(unread > 99 ? '99+' : '$unread'),
          backgroundColor: AppColors.accentDark,
          child: const Icon(Icons.notifications_none),
        ),
      ),
    );
  }
}
