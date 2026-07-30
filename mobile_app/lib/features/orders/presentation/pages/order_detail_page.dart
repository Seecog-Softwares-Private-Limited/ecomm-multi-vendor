import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_cached_image.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../../cart/presentation/cart_controller.dart';
import '../../../commerce/presentation/widgets/premium_card.dart';
import '../../../commerce/presentation/widgets/price_hierarchy.dart';
import '../../domain/entities/order.dart';
import '../orders_providers.dart';
import '../widgets/commerce_skeletons.dart';
import '../widgets/order_tracker.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  const OrderDetailPage({required this.orderId, super.key});

  final String orderId;

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  bool _working = false;

  Future<void> _reorder(OrderDetail order) async {
    setState(() => _working = true);
    final cart = ref.read(cartControllerProvider.notifier);
    Failure? failure;
    for (final item in order.items) {
      failure = await cart.add(
        item.productId,
        quantity: item.quantity,
        variantKey: item.variantKey,
      );
      if (failure != null) break;
    }
    if (!mounted) return;
    setState(() => _working = false);
    if (failure == null) {
      context.showSnack('Items added to cart');
      ShellNavigation.openCart(context, ref);
    } else {
      context.showSnack(failure.message, isError: true);
    }
  }

  Future<void> _cancel(OrderDetail order) async {
    final reasonController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cancel order?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Let us know why you are cancelling (optional).'),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(hintText: 'Reason'),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Keep order')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Cancel order'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _working = true);
    try {
      await ref.read(ordersRepositoryProvider).cancel(order.id, reason: reasonController.text.trim());
      ref.invalidate(orderDetailProvider(order.id));
      ref.invalidate(ordersListProvider);
      if (mounted) context.showSnack('Order cancelled');
    } catch (error) {
      if (mounted) context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  void _showInvoice(OrderDetail order) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _InvoiceSheet(order: order),
    );
  }

  String _variantLabel(String? key) {
    if (key == null || key.isEmpty) return '';
    return key.replaceAll('|', ' · ').replaceAll(':', ': ');
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(orderDetailProvider(widget.orderId));
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
        actions: [
          async.maybeWhen(
            data: (order) => IconButton(
              onPressed: () => _showInvoice(order),
              icon: const Icon(Icons.receipt_long_outlined),
              tooltip: 'View invoice',
            ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: async.when(
        loading: () => const OrderDetailSkeleton(),
        error: (error, _) => ErrorStateView(
          title: 'Could not load order',
          message: 'We had trouble loading this order. Please try again.',
          onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId)),
        ),
        data: (order) => _buildBody(order),
      ),
    );
  }

  Widget _buildBody(OrderDetail order) {
    final theme = Theme.of(context);
    final status = orderStatusPresentation(order.status);
    final itemsTotal = order.items.fold<double>(0, (sum, i) => sum + i.totalPrice);
    final category = orderStatusCategory(order.status);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(orderDetailProvider(widget.orderId)),
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          PremiumCard(
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: status.color.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(status.icon, color: status.color),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(status.label, style: theme.textTheme.titleMedium?.copyWith(color: status.color)),
                      Text(
                        'Order ${_shortId(order.id)} · ${Formatters.dayMonthYear(order.createdAt)}',
                        style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          OrderTracker(status: order.status, timeline: order.timeline),
          const SizedBox(height: AppSpacing.lg),
          Text('Ordered Items', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpacing.sm),
          for (final item in order.items)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: PremiumCard(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppCachedImage(
                      imageUrl: item.image,
                      width: 72,
                      height: 72,
                      fallbackLabel: item.productName,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          if (_variantLabel(item.variantKey).isNotEmpty)
                            Text(
                              _variantLabel(item.variantKey),
                              style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textSecondary),
                            ),
                          const SizedBox(height: AppSpacing.xs),
                          Text('Qty: ${item.quantity}', style: theme.textTheme.labelSmall),
                          const SizedBox(height: AppSpacing.xs),
                          PriceHierarchy(
                            sellingPrice: item.unitPrice,
                            mrp: item.unitPrice,
                            compact: true,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      Formatters.rupees(item.totalPrice),
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ),
          if (order.address != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text('Shipping Address', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: AppSpacing.sm),
            PremiumCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(order.address!.fullName, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(order.address!.formatted, style: theme.textTheme.bodyMedium),
                  Text('Phone: ${order.address!.phone}', style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.md),
          Text('Price Breakdown', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: AppSpacing.sm),
          PremiumCard(
            child: Column(
              children: [
                _priceRow(theme, 'Items Total', Formatters.rupees(itemsTotal)),
                if (order.discountAmount > 0)
                  _priceRow(theme, 'Discount', '- ${Formatters.rupees(order.discountAmount)}'),
                _priceRow(theme, 'Tax', Formatters.rupees(order.taxAmount)),
                _priceRow(
                  theme,
                  'Delivery',
                  order.shippingAmount == 0 ? 'FREE' : Formatters.rupees(order.shippingAmount),
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Grand Total', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                    Text(
                      Formatters.rupees(order.totalAmount),
                      style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (category == 'delivered' && order.items.isNotEmpty) ...[
            AppButton(
              label: 'Rate & Review',
              icon: Icons.rate_review_outlined,
              onPressed: () {
                final item = order.items.first;
                context.push(AppRoutes.productPath(item.productId, writeReview: true));
              },
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
          Row(
            children: [
              if (category == 'delivered' || category == 'cancelled')
                Expanded(
                  child: AppButton(
                    label: 'Buy Again',
                    icon: Icons.refresh,
                    variant: AppButtonVariant.secondary,
                    isLoading: _working,
                    onPressed: () => _reorder(order),
                  ),
                ),
              if (category == 'delivered' || category == 'cancelled')
                const SizedBox(width: AppSpacing.md),
              Expanded(
                child: AppButton(
                  label: 'Need Help',
                  icon: Icons.support_agent,
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.push(
                    Uri(
                      path: AppRoutes.support,
                      queryParameters: {'orderId': order.id},
                    ).toString(),
                  ),
                ),
              ),
            ],
          ),
          if (orderIsCancellable(order.status)) ...[
            const SizedBox(height: AppSpacing.sm),
            AppButton(
              label: 'Cancel Order',
              variant: AppButtonVariant.text,
              onPressed: _working ? null : () => _cancel(order),
            ),
          ],
        ],
      ),
    );
  }

  String _shortId(String id) => '#${id.substring(0, id.length.clamp(0, 8)).toUpperCase()}';

  Widget _priceRow(ThemeData theme, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
          Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _InvoiceSheet extends StatelessWidget {
  const _InvoiceSheet({required this.order});
  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final itemsTotal = order.items.fold<double>(0, (sum, i) => sum + i.totalPrice);
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xl),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(child: Text('Tax Invoice', style: theme.textTheme.titleLarge)),
            const SizedBox(height: AppSpacing.xs),
            Center(
              child: Text(
                'Order #${order.id.substring(0, order.id.length.clamp(0, 8)).toUpperCase()}',
                style: theme.textTheme.bodySmall,
              ),
            ),
            const Divider(height: AppSpacing.xl),
            for (final item in order.items)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(child: Text('${item.productName} × ${item.quantity}')),
                    Text(Formatters.rupees(item.totalPrice)),
                  ],
                ),
              ),
            const Divider(),
            _row(theme, 'Items total', Formatters.rupees(itemsTotal)),
            if (order.discountAmount > 0) _row(theme, 'Discount', '- ${Formatters.rupees(order.discountAmount)}'),
            _row(theme, 'Tax (GST)', Formatters.rupees(order.taxAmount)),
            _row(theme, 'Delivery', order.shippingAmount == 0 ? 'FREE' : Formatters.rupees(order.shippingAmount)),
            const Divider(),
            _row(theme, 'Grand total', Formatters.rupees(order.totalAmount), bold: true),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'This is a system-generated invoice.',
              style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(ThemeData theme, String label, String value, {bool bold = false}) {
    final style = bold
        ? theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)
        : theme.textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: style), Text(value, style: style)],
      ),
    );
  }
}
