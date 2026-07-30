import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';
import '../widgets/commerce_skeletons.dart';
import '../widgets/order_list_card.dart';

class OrdersPage extends ConsumerStatefulWidget {
  const OrdersPage({super.key});

  @override
  ConsumerState<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends ConsumerState<OrdersPage> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      ref.read(ordersSearchQueryProvider.notifier).update(value.trim());
    });
    setState(() {});
  }

  Future<void> _buyAgain(OrderSummary order) async {
    context.push(AppRoutes.orderPath(order.id));
  }

  void _reviewOrder(OrderSummary order) {
    final slug = order.previewItems.isNotEmpty
        ? (order.previewItems.first.productSlug ?? order.previewItems.first.productId)
        : null;
    if (slug == null) {
      context.showSnack('No product found to review for this order.', isError: true);
      return;
    }
    context.push(AppRoutes.productPath(slug, writeReview: true));
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(ordersListProvider);
    final statusFilter = ref.watch(ordersStatusFilterProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.sm),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search by product or order ID',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        onPressed: () {
                          _searchController.clear();
                          ref.read(ordersSearchQueryProvider.notifier).update('');
                          setState(() {});
                        },
                        icon: const Icon(Icons.close),
                      )
                    : null,
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              children: [
                for (final chip in const [
                  ('all', 'All'),
                  ('pending', 'Pending'),
                  ('processing', 'Processing'),
                  ('shipped', 'Shipped'),
                  ('delivered', 'Delivered'),
                  ('cancelled', 'Cancelled'),
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: FilterChip(
                      label: Text(
                        async.maybeWhen(
                          data: (orders) {
                            final count = countOrdersByStatus(orders, chip.$1);
                            return '${chip.$2} ($count)';
                          },
                          orElse: () => chip.$2,
                        ),
                      ),
                      selected: statusFilter == chip.$1,
                      onSelected: (_) => ref.read(ordersStatusFilterProvider.notifier).update(chip.$1),
                      selectedColor: AppColors.primarySurface,
                      checkmarkColor: AppColors.primary,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Expanded(
            child: async.when(
              loading: () => const OrdersSkeleton(),
              error: (error, _) => ErrorStateView(
                title: 'Could not load orders',
                message: 'We had trouble loading your orders. Please try again.',
                onRetry: () => ref.invalidate(ordersListProvider),
              ),
              data: (orders) {
                final visible = filterOrdersByStatus(orders, statusFilter);
                if (visible.isEmpty) {
                  return EmptyStateView(
                    title: orders.isEmpty ? 'No orders yet' : 'No matching orders',
                    message: orders.isEmpty
                        ? 'When you place an order it will show up here with tracking and updates.'
                        : 'Try a different search or filter.',
                    icon: Icons.receipt_long_outlined,
                    actionLabel: orders.isEmpty ? 'Continue Shopping' : null,
                    onAction: orders.isEmpty ? () => context.go(AppRoutes.home) : null,
                  );
                }
                final grouped = groupOrdersByMonth(visible);
                final sections = grouped.entries.toList();
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(ordersListProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    itemCount: sections.fold<int>(0, (sum, e) => sum + 1 + e.value.length),
                    itemBuilder: (context, index) {
                      var cursor = 0;
                      for (final section in sections) {
                        if (index == cursor) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.md, top: AppSpacing.sm),
                            child: Text(
                              section.key,
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                            ),
                          );
                        }
                        cursor++;
                        for (final order in section.value) {
                          if (index == cursor) {
                            final category = orderStatusCategory(order.status);
                            return Padding(
                              padding: const EdgeInsets.only(bottom: AppSpacing.md),
                              child: OrderListCard(
                                order: order,
                                onTap: () => context.push(AppRoutes.orderPath(order.id)),
                                onTrack: category == 'shipped'
                                    ? () => context.push(AppRoutes.orderPath(order.id))
                                    : null,
                                onBuyAgain: category == 'delivered' || category == 'cancelled'
                                    ? () => _buyAgain(order)
                                    : null,
                                onReview: category == 'delivered' ? () => _reviewOrder(order) : null,
                              ),
                            );
                          }
                          cursor++;
                        }
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
