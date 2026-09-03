import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../cart_controller.dart';
import '../widgets/cart_empty_view.dart';
import '../widgets/cart_item_card.dart';
import '../widgets/cart_skeleton.dart';
import '../widgets/cart_summary_card.dart';
import '../widgets/coupon_field.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(cartControllerProvider);
    final theme = Theme.of(context);

    return ShellTabBackScope(
      child: Scaffold(
        appBar: AppBar(
          leading: const ShellTabBackButton(),
          automaticallyImplyLeading: false,
          title: Text('My Cart (${async.value?.totalQuantity ?? 0})'),
          centerTitle: false,
        ),
      body: async.when(
        loading: () => const CartSkeleton(),
        error: (error, _) => ErrorStateView(
          title: 'Could not load cart',
          message: 'We had trouble loading your cart. Please try again.',
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (state) {
          if (state.isEmpty && state.savedForLater.isEmpty) {
            return const CartEmptyView();
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(cartControllerProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 120),
              children: [
                if (state.items.isNotEmpty) ...[
                  Text(
                    '${state.totalQuantity} item${state.totalQuantity == 1 ? '' : 's'} in cart',
                    style: theme.textTheme.titleSmall?.copyWith(color: context.adaptiveColors.textSecondary),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  for (final item in state.items)
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: CartItemCard(item: item),
                    ),
                  const SizedBox(height: AppSpacing.sm),
                  CouponField(
                    appliedCode: state.couponVerified ? state.couponCode : null,
                    verified: state.couponVerified,
                    onApply: (code) async {
                      // Cart has no checkout session — do not mark as applied.
                      // Store candidate for checkout to validate against the backend.
                      ref.read(cartControllerProvider.notifier).setPendingCoupon(code);
                      if (context.mounted) {
                        context.showSnack(
                          'Coupon saved. It will be verified when you checkout.',
                        );
                      }
                    },
                    onRemove: () => ref.read(cartControllerProvider.notifier).clearCoupon(),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  CartSummaryCard(summary: state.summary),
                ],
                if (state.savedForLater.isNotEmpty)
                  SavedForLaterSection(items: state.savedForLater),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: async.maybeWhen(
        data: (state) => state.isEmpty
            ? null
            : CartStickySummary(
                summary: state.summary,
                itemCount: state.totalQuantity,
                onCheckout: () => context.push(AppRoutes.checkout),
              ),
        orElse: () => null,
      ),
      ),
    );
  }
}
