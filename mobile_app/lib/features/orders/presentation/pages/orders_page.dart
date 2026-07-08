import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/state_views.dart';
import '../orders_providers.dart';

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(ordersListProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: async.when(
        loading: () => const AppLoader(),
        error: (error, _) => ErrorStateView(
          message: 'Could not load your orders.',
          onRetry: () => ref.invalidate(ordersListProvider),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return EmptyStateView(
              title: 'No orders yet',
              message: 'When you place an order it will show up here.',
              icon: Icons.receipt_long_outlined,
              actionLabel: 'Start shopping',
              onAction: () => context.go(AppRoutes.home),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(ordersListProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: orders.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, i) {
                final order = orders[i];
                final status = orderStatusPresentation(order.status);
                return Card(
                  child: InkWell(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    onTap: () => context.push(AppRoutes.orderPath(order.id)),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(status.icon, color: status.color, size: 20),
                              const SizedBox(width: AppSpacing.sm),
                              Text(status.label,
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(color: status.color)),
                              const Spacer(),
                              const Icon(Icons.chevron_right, color: AppColors.textMuted),
                            ],
                          ),
                          const Divider(height: AppSpacing.xl),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('#${order.id.substring(0, order.id.length.clamp(0, 8)).toUpperCase()}',
                                  style: Theme.of(context).textTheme.bodyMedium),
                              Text('${order.itemCount} item(s)',
                                  style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(Formatters.dayMonthYear(order.createdAt),
                                  style: Theme.of(context).textTheme.bodySmall),
                              Text(Formatters.rupees(order.totalAmount),
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall
                                      ?.copyWith(fontWeight: FontWeight.w800)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
