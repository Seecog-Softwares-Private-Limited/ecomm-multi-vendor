import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/image_url.dart';

enum NotificationType { order, payment, offer, returnType, system, general }

/// Customer notification from GET /api/notifications.
@immutable
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.read = false,
    this.readAt,
    this.orderId,
    this.productId,
    this.productImageUrl,
    this.actionHref,
    this.actionLabel,
  });

  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime createdAt;
  final bool read;
  final DateTime? readAt;
  final String? orderId;
  final String? productId;
  final String? productImageUrl;
  final String? actionHref;
  final String? actionLabel;

  String? get image => resolveImageUrl(productImageUrl);

  String? get shortOrderId {
    final id = orderId;
    if (id == null || id.isEmpty) return null;
    return '#${id.substring(0, id.length.clamp(0, 8)).toUpperCase()}';
  }

  AppNotification copyWith({bool? read, DateTime? readAt}) => AppNotification(
        id: id,
        title: title,
        body: body,
        type: type,
        createdAt: createdAt,
        read: read ?? this.read,
        readAt: readAt ?? this.readAt,
        orderId: orderId,
        productId: productId,
        productImageUrl: productImageUrl,
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
        readAt: json['readAt'] != null ? DateTime.tryParse(json['readAt'].toString()) : null,
        orderId: json['orderId']?.toString(),
        productId: json['productId']?.toString(),
        productImageUrl: json['productImageUrl']?.toString(),
        actionHref: json['actionHref']?.toString(),
        actionLabel: json['actionLabel']?.toString(),
      );

  static NotificationType _parseType(String? raw) {
    switch (raw?.toUpperCase()) {
      case 'ORDER':
        return NotificationType.order;
      case 'RETURN':
        return NotificationType.returnType;
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
        NotificationType.returnType => Icons.assignment_return_outlined,
        NotificationType.payment => Icons.payments_outlined,
        NotificationType.offer => Icons.local_offer_outlined,
        NotificationType.system => Icons.security_outlined,
        NotificationType.general => Icons.notifications_none,
      };

  Color get color => switch (type) {
        NotificationType.order => AppColors.primary,
        NotificationType.returnType => AppColors.warning,
        NotificationType.payment => AppColors.info,
        NotificationType.offer => AppColors.accentDark,
        NotificationType.system => AppColors.warning,
        NotificationType.general => AppColors.textSecondary,
      };

  String get categoryKey => switch (type) {
        NotificationType.order => 'orders',
        NotificationType.returnType => 'returns',
        NotificationType.payment => 'payments',
        NotificationType.offer => 'offers',
        NotificationType.system => 'system',
        NotificationType.general => 'system',
      };
}
