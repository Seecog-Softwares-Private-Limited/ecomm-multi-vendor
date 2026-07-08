import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/theme/app_colors.dart';
import '../data/orders_repository.dart';
import '../domain/entities/order.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>(
  (ref) => OrdersRepositoryImpl(ref.read(dioClientProvider)),
);

final ordersListProvider = FutureProvider.autoDispose<List<OrderSummary>>(
  (ref) => ref.read(ordersRepositoryProvider).getOrders(),
);

final orderDetailProvider = FutureProvider.autoDispose.family<OrderDetail, String>(
  (ref, id) => ref.read(ordersRepositoryProvider).getOrder(id),
);

/// Ordered checkout/fulfilment milestones for the tracking timeline.
const List<String> kOrderProgress = [
  'PLACED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

/// UI presentation for an order status code.
({String label, Color color, IconData icon}) orderStatusPresentation(String status) {
  switch (status.toUpperCase()) {
    case 'PLACED':
      return (label: 'Order placed', color: AppColors.info, icon: Icons.receipt_long);
    case 'PAYMENT_CONFIRMED':
      return (label: 'Payment confirmed', color: AppColors.info, icon: Icons.payments_outlined);
    case 'PROCESSING':
      return (label: 'Processing', color: AppColors.warning, icon: Icons.inventory_2_outlined);
    case 'SHIPPED':
      return (label: 'Shipped', color: AppColors.primary, icon: Icons.local_shipping_outlined);
    case 'DELIVERED':
      return (label: 'Delivered', color: AppColors.success, icon: Icons.check_circle_outline);
    case 'CANCELLED':
      return (label: 'Cancelled', color: AppColors.error, icon: Icons.cancel_outlined);
    case 'RETURNED':
      return (label: 'Returned', color: AppColors.textSecondary, icon: Icons.assignment_return_outlined);
    default:
      return (label: status, color: AppColors.textSecondary, icon: Icons.info_outline);
  }
}

bool orderIsCancellable(String status) =>
    const {'PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'}.contains(status.toUpperCase());
