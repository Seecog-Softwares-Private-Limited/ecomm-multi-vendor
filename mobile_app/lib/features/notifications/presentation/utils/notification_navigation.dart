import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../domain/app_notification.dart';

/// Deep-link navigation for notification taps using backend metadata.
void navigateFromNotification(BuildContext context, AppNotification notification) {
  final orderId = notification.orderId;
  if (orderId != null && orderId.isNotEmpty) {
    context.push(AppRoutes.orderPath(orderId));
    return;
  }

  final productId = notification.productId;
  if (productId != null && productId.isNotEmpty) {
    context.push(AppRoutes.productPath(productId));
    return;
  }

  final href = notification.actionHref?.trim();
  if (href == null || href.isEmpty) return;

  final lower = href.toLowerCase();
  if (lower.contains('support')) {
    context.push(AppRoutes.support);
    return;
  }

  final orderMatch = RegExp(r'(?:order-detail|track-order)/([^/?#]+)', caseSensitive: false).firstMatch(href);
  if (orderMatch != null) {
    context.push(AppRoutes.orderPath(orderMatch.group(1)!));
    return;
  }

  final productMatch = RegExp(r'/product/([^/?#]+)', caseSensitive: false).firstMatch(href);
  if (productMatch != null) {
    context.push(AppRoutes.productPath(productMatch.group(1)!));
  }
}

bool notificationHasDeepLink(AppNotification notification) {
  if (notification.orderId != null && notification.orderId!.isNotEmpty) return true;
  if (notification.productId != null && notification.productId!.isNotEmpty) return true;
  final href = notification.actionHref?.trim();
  if (href == null || href.isEmpty) return false;
  final lower = href.toLowerCase();
  return lower.contains('support') ||
      lower.contains('order-detail') ||
      lower.contains('track-order') ||
      lower.contains('/product/');
}
