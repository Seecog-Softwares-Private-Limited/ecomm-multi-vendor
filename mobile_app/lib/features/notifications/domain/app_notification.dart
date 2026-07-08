import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

enum NotificationType { order, offer, general }

/// A single in-app notification. Persisted locally; ready to be fed by push
/// (FCM) once server delivery is wired.
@immutable
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.read = false,
  });

  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime createdAt;
  final bool read;

  AppNotification copyWith({bool? read}) => AppNotification(
        id: id,
        title: title,
        body: body,
        type: type,
        createdAt: createdAt,
        read: read ?? this.read,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'type': type.name,
        'createdAt': createdAt.toIso8601String(),
        'read': read,
      };

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        title: json['title'] as String? ?? '',
        body: json['body'] as String? ?? '',
        type: NotificationType.values.firstWhere(
          (t) => t.name == json['type'],
          orElse: () => NotificationType.general,
        ),
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
        read: json['read'] as bool? ?? false,
      );

  IconData get icon => switch (type) {
        NotificationType.order => Icons.local_shipping_outlined,
        NotificationType.offer => Icons.local_offer_outlined,
        NotificationType.general => Icons.notifications_none,
      };

  Color get color => switch (type) {
        NotificationType.order => AppColors.primary,
        NotificationType.offer => AppColors.accentDark,
        NotificationType.general => AppColors.info,
      };
}
