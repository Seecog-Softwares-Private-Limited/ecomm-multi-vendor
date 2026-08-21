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
  (ref) {
    final search = ref.watch(ordersSearchQueryProvider);
    return ref.read(ordersRepositoryProvider).getOrders(
          search: search.trim().isEmpty ? null : search.trim(),
        );
  },
);

final ordersSearchQueryProvider = NotifierProvider<_OrdersSearchQuery, String>(_OrdersSearchQuery.new);

final ordersStatusFilterProvider = NotifierProvider<_OrdersStatusFilter, String>(_OrdersStatusFilter.new);

class _OrdersSearchQuery extends Notifier<String> {
  @override
  String build() => '';

  void update(String value) => state = value;
}

class _OrdersStatusFilter extends Notifier<String> {
  @override
  String build() => 'all';

  void update(String value) => state = value;
}

int countOrdersByStatus(List<OrderSummary> orders, String status) {
  if (status == 'all') return orders.length;
  return orders.where((o) => orderStatusCategory(o.status) == status).length;
}

String orderStatusCategory(String status) {
  switch (status.toUpperCase()) {
    case 'PENDING_PAYMENT':
    case 'PLACED':
    case 'PAYMENT_CONFIRMED':
      return 'pending';
    case 'PROCESSING':
      return 'processing';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 'shipped';
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
    case 'RETURNED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

List<OrderSummary> filterOrdersByStatus(List<OrderSummary> orders, String status) {
  if (status == 'all') return orders;
  return orders.where((o) => orderStatusCategory(o.status) == status).toList(growable: false);
}

Map<String, List<OrderSummary>> groupOrdersByMonth(List<OrderSummary> orders) {
  final grouped = <String, List<OrderSummary>>{};
  for (final order in orders) {
    final key = '${_monthName(order.createdAt.month)} ${order.createdAt.year}';
    grouped.putIfAbsent(key, () => []).add(order);
  }
  return grouped;
}

String _monthName(int month) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[month - 1];
}

final orderDetailProvider = FutureProvider.autoDispose.family<OrderDetail, String>(
  (ref, id) => ref.read(ordersRepositoryProvider).getOrder(id),
);

/// Ordered fulfilment milestones for the tracking timeline.
const List<String> kOrderProgress = [
  'PLACED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/// UI presentation for an order status code.
({String label, Color color, IconData icon}) orderStatusPresentation(String status) {
  switch (status.toUpperCase()) {
    case 'PENDING_PAYMENT':
      return (label: 'Awaiting payment', color: AppColors.warning, icon: Icons.hourglass_top_outlined);
    case 'PLACED':
      return (label: 'Order placed', color: AppColors.info, icon: Icons.receipt_long);
    case 'PAYMENT_CONFIRMED':
      return (label: 'Confirmed', color: AppColors.info, icon: Icons.verified_outlined);
    case 'PROCESSING':
      return (label: 'Packed', color: AppColors.warning, icon: Icons.inventory_2_outlined);
    case 'SHIPPED':
      return (label: 'Shipped', color: AppColors.primary, icon: Icons.local_shipping_outlined);
    case 'OUT_FOR_DELIVERY':
      return (label: 'Out for delivery', color: const Color(0xFF7C3AED), icon: Icons.delivery_dining_outlined);
    case 'DELIVERED':
      return (label: 'Delivered', color: AppColors.success, icon: Icons.check_circle_outline);
    case 'CANCELLED':
      return (label: 'Cancelled', color: AppColors.error, icon: Icons.cancel_outlined);
    case 'RETURNED':
      return (label: 'Returned', color: AppColors.textMuted, icon: Icons.assignment_return_outlined);
    default:
      return (label: status, color: AppColors.textMuted, icon: Icons.info_outline);
  }
}

bool orderIsCancellable(String status) =>
    const {'PENDING_PAYMENT', 'PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'}
        .contains(status.toUpperCase());
