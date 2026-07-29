import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

enum NotificationType { order, payment, offer, system, general }

@immutable
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.read = false,
    this.orderId,
    this.productId,
    this.actionHref,
    this.actionLabel,
  });

  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime createdAt;
  final bool read;
  final String? orderId;
  final String? productId;
  final String? actionHref;
  final String? actionLabel;

  AppNotification copyWith({bool? read}) => AppNotification(
        id: id,
        title: title,
        body: body,
        type: type,
        createdAt: createdAt,
        read: read ?? this.read,
        orderId: orderId,
        productId: productId,
        actionHref: actionHref,
        actionLabel: actionLabel,
      );

  factory AppNotification.fromApi(Map<String, dynamic> json) => AppNotification(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        body: json['message']?.toString() ?? '',
        type: _parseType(json['type']?.toString()),
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
        read: json['read'] == true,
        orderId: json['orderId']?.toString(),
        productId: json['productId']?.toString(),
        actionHref: json['actionHref']?.toString(),
        actionLabel: json['actionLabel']?.toString(),
      );

  static NotificationType _parseType(String? raw) {
    switch (raw?.toUpperCase()) {
      case 'ORDER':
      case 'RETURN':
        return NotificationType.order;
      case 'PAYMENT':
        return NotificationType.payment;
      case 'SELLER':
        return NotificationType.offer;
      case 'SYSTEM':
        return NotificationType.system;
      default:
        return NotificationType.general;
    }
  }

  IconData get icon => switch (type) {
        NotificationType.order => Icons.local_shipping_outlined,
        NotificationType.payment => Icons.payments_outlined,
        NotificationType.offer => Icons.local_offer_outlined,
        NotificationType.system => Icons.security_outlined,
        NotificationType.general => Icons.notifications_none,
      };

  Color get color => switch (type) {
        NotificationType.order => AppColors.primary,
        NotificationType.payment => AppColors.info,
        NotificationType.offer => AppColors.accentDark,
        NotificationType.system => AppColors.warning,
        NotificationType.general => AppColors.textSecondary,
      };
}
