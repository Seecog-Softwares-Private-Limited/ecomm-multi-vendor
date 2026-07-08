import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../addresses/domain/entities/address.dart';
import '../../../addresses/presentation/addresses_controller.dart';
import '../../../addresses/presentation/pages/address_form_page.dart';
import '../../../addresses/presentation/pages/addresses_page.dart';
import '../../../cart/presentation/cart_controller.dart';
import '../../../cart/presentation/widgets/cart_summary_card.dart';
import '../../../cart/presentation/widgets/coupon_field.dart';
import '../orders_providers.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  Address? _address;
  String _payment = 'cod';
  bool _placing = false;

  Address? get _effectiveAddress => _address ?? ref.read(defaultAddressProvider);

  Future<void> _selectAddress() async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AddressesPage(
          selectable: true,
          onSelected: (address) {
            setState(() => _address = address);
            Navigator.of(context).pop();
          },
        ),
      ),
    );
  }

  Future<void> _placeOrder() async {
    final address = _effectiveAddress;
    if (address == null) {
      context.showSnack('Please add a delivery address first.', isError: true);
      return;
    }
    setState(() => _placing = true);
    try {
      final cart = ref.read(cartControllerProvider).value;
      final result = await ref.read(ordersRepositoryProvider).placeOrder(
            shippingAddressId: address.id,
            paymentMethod: _payment,
            couponCode: cart?.couponCode,
          );
      ref.read(cartControllerProvider.notifier).clearAfterOrder();
      ref.invalidate(ordersListProvider);
      if (!mounted) return;
      context.pushReplacement(
        '${AppRoutes.orderSuccess}?orderId=${result.orderId}&total=${result.totalAmount}&pending=${result.requiresRazorpay}',
      );
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cartAsync = ref.watch(cartControllerProvider);
    ref.watch(addressesControllerProvider);
    final address = _effectiveAddress;
    final cart = cartAsync.value;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: cart == null || cart.isEmpty
          ? const Center(child: Text('Your cart is empty.'))
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                _SectionTitle('Delivery address', trailing: address == null ? null : 'Change', onTrailing: _selectAddress),
                if (address == null)
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.add_location_alt_outlined, color: AppColors.primary),
                      title: const Text('Add a delivery address'),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AddressFormPage()),
                      ),
                    ),
                  )
                else
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(address.fullName, style: theme.textTheme.titleSmall),
                              const SizedBox(width: AppSpacing.sm),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceVariant,
                                  borderRadius: BorderRadius.circular(AppRadius.xs),
                                ),
                                child: Text(address.name, style: theme.textTheme.labelSmall),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(address.formatted, style: theme.textTheme.bodyMedium),
                          Text('Phone: ${address.phone}', style: theme.textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: AppSpacing.lg),
                _SectionTitle('Delivery method'),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.local_shipping_outlined, color: AppColors.primary),
                    title: const Text('Standard Delivery'),
                    subtitle: const Text('Delivered in 3–5 business days'),
                    trailing: Text(
                      cart.summary.shipping == 0 ? 'FREE' : '₹${cart.summary.shipping.toStringAsFixed(0)}',
                      style: theme.textTheme.titleSmall?.copyWith(color: AppColors.success),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                _SectionTitle('Payment method'),
                _PaymentTile(
                  value: 'cod',
                  groupValue: _payment,
                  title: 'Cash on Delivery',
                  subtitle: 'Pay when your order arrives',
                  icon: Icons.payments_outlined,
                  onChanged: (v) => setState(() => _payment = v),
                ),
                _PaymentTile(
                  value: 'upi',
                  groupValue: _payment,
                  title: 'UPI',
                  subtitle: 'Pay via any UPI app',
                  icon: Icons.account_balance_wallet_outlined,
                  onChanged: (v) => setState(() => _payment = v),
                ),
                _PaymentTile(
                  value: 'card',
                  groupValue: _payment,
                  title: 'Credit / Debit Card',
                  subtitle: 'Visa, Mastercard, RuPay',
                  icon: Icons.credit_card,
                  onChanged: (v) => setState(() => _payment = v),
                ),
                const SizedBox(height: AppSpacing.lg),
                _SectionTitle('Coupon'),
                CouponField(
                  appliedCode: cart.couponCode,
                  onApply: (code) => ref.read(cartControllerProvider.notifier).applyCoupon(code),
                  onRemove: () => ref.read(cartControllerProvider.notifier).clearCoupon(),
                ),
                const SizedBox(height: AppSpacing.lg),
                CartSummaryCard(summary: cart.summary),
                const SizedBox(height: AppSpacing.md),
                if (_payment != 'cod')
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Text(
                      'Online payment is completed securely after you place the order.',
                      style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
              ],
            ),
      bottomNavigationBar: cart == null || cart.isEmpty
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: AppButton(
                  label: 'Place order',
                  isLoading: _placing,
                  onPressed: _placeOrder,
                ),
              ),
            ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title, {this.trailing, this.onTrailing});
  final String title;
  final String? trailing;
  final VoidCallback? onTrailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(child: Text(title, style: Theme.of(context).textTheme.titleMedium)),
          if (trailing != null) TextButton(onPressed: onTrailing, child: Text(trailing!)),
        ],
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onChanged,
  });

  final String value;
  final String groupValue;
  final String title;
  final String subtitle;
  final IconData icon;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: BorderSide(color: selected ? AppColors.primary : Theme.of(context).dividerColor),
      ),
      child: InkWell(
        onTap: () => onChanged(value),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          child: Row(
            children: [
              Icon(icon, color: selected ? AppColors.primary : AppColors.textSecondary),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleSmall),
                    Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              Icon(
                selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
