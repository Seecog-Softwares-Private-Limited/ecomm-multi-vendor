import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/di/providers.dart';
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
import '../../data/checkout_remote_data_source.dart';
import '../../data/orders_repository.dart';
import '../../data/razorpay_checkout_service.dart';
import '../../domain/entities/order.dart';
import '../../domain/entities/razorpay_session.dart';
import '../orders_providers.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key, this.sessionId});

  /// Checkout session from Buy Now or cart proceed flow.
  final String? sessionId;

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  Address? _address;
  String _payment = 'cod';
  bool _placing = false;
  bool _sessionLoading = true;
  String? _checkoutSessionId;
  Map<String, dynamic>? _sessionPreview;
  late final RazorpayCheckoutService _razorpayCheckout;

  Address? get _effectiveAddress => _address ?? ref.read(defaultAddressProvider);

  String get _orderIdempotencyKey =>
      _checkoutSessionId == null ? '' : 'order-session:$_checkoutSessionId';

  CartSummary? get _checkoutSummary {
    final totals = _sessionPreview?['totals'];
    if (totals is! Map) return null;
    final map = Map<String, dynamic>.from(totals);
    return CartSummary(
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0,
      savings: (map['discountAmount'] as num?)?.toDouble() ?? 0,
      shipping: (map['shippingAmount'] as num?)?.toDouble() ?? 0,
      tax: (map['taxAmount'] as num?)?.toDouble() ?? 0,
      totalOverride: (map['totalAmount'] as num?)?.toDouble(),
    );
  }

  bool get _hasCheckoutContent {
    if (_checkoutSessionId != null) {
      final items = _sessionPreview?['items'];
      if (items is List && items.isNotEmpty) return true;
    }
    final cart = ref.read(cartControllerProvider).value;
    return cart != null && !cart.isEmpty;
  }

  @override
  void initState() {
    super.initState();
    _razorpayCheckout = RazorpayCheckoutService();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initCheckoutSession());
  }

  Future<void> _loadSessionPreview({String? sessionId, String? couponCode}) async {
    final id = sessionId ?? _checkoutSessionId;
    if (id == null || id.isEmpty) return;
    final ds = CheckoutRemoteDataSource(ref.read(dioClientProvider));
    final preview = await ds.getSession(id, couponCode: couponCode);
    if (!mounted) return;
    setState(() => _sessionPreview = preview);
  }

  Future<void> _initCheckoutSession() async {
    final fromRoute = widget.sessionId ?? GoRouterState.of(context).uri.queryParameters['session'];
    final ds = CheckoutRemoteDataSource(ref.read(dioClientProvider));
    try {
      late final String sessionId;
      if (fromRoute != null && fromRoute.isNotEmpty) {
        sessionId = fromRoute;
      } else {
        final cart = ref.read(cartControllerProvider).value;
        if (cart == null || cart.isEmpty) {
          setState(() => _sessionLoading = false);
          return;
        }
        sessionId = await ds.createCartSession(cart.items.map((e) => e.id).toList());
      }
      setState(() => _checkoutSessionId = sessionId);
      final cart = ref.read(cartControllerProvider).value;
      await _loadSessionPreview(sessionId: sessionId, couponCode: cart?.couponCode);
    } catch (error) {
      if (mounted) {
        context.showSnack(Failure.from(error).message, isError: true);
      }
    } finally {
      if (mounted) setState(() => _sessionLoading = false);
    }
  }

  Future<void> _applyCoupon(String code) async {
    ref.read(cartControllerProvider.notifier).applyCoupon(code);
    final cart = ref.read(cartControllerProvider).value;
    try {
      await _loadSessionPreview(couponCode: cart?.couponCode);
    } catch (error) {
      if (mounted) {
        context.showSnack(Failure.from(error).message, isError: true);
      }
    }
  }

  Future<void> _clearCoupon() async {
    ref.read(cartControllerProvider.notifier).clearCoupon();
    try {
      await _loadSessionPreview();
    } catch (error) {
      if (mounted) {
        context.showSnack(Failure.from(error).message, isError: true);
      }
    }
  }

  @override
  void dispose() {
    _razorpayCheckout.dispose();
    super.dispose();
  }

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

  void _goToOrderSuccess({
    required String orderId,
    required double total,
    required bool paymentPending,
  }) {
    context.pushReplacement(
      '${AppRoutes.orderSuccess}?orderId=$orderId&total=$total&pending=$paymentPending',
    );
  }

  Future<void> _completeOnlinePayment({
    required PlaceOrderResult result,
    required OrdersRepository ordersRepo,
  }) async {
    final session = await ordersRepo.createRazorpayOrder(result.orderId);

    if (!session.configured || !session.isReady) {
      if (!mounted) return;
      context.showSnack(
        session.message ?? 'Online payment is not configured. Your order is confirmed.',
      );
      ref.read(cartControllerProvider.notifier).clearAfterOrder();
      ref.invalidate(ordersListProvider);
      _goToOrderSuccess(
        orderId: result.orderId,
        total: result.totalAmount,
        paymentPending: true,
      );
      return;
    }

    final checkoutResult = await _razorpayCheckout.openCheckout(
      session,
      paymentMethod: _payment,
    );

    if (!mounted) return;

    switch (checkoutResult) {
      case RazorpayCheckoutSuccess(:final paymentId, :final orderId, :final signature):
        if (paymentId.isEmpty || orderId.isEmpty || signature.isEmpty) {
          context.showSnack('Payment response was incomplete.', isError: true);
          _goToOrderSuccess(
            orderId: result.orderId,
            total: result.totalAmount,
            paymentPending: true,
          );
          return;
        }
        try {
          await ordersRepo.verifyRazorpayPayment(
            orderId: result.orderId,
            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
            razorpaySignature: signature,
          );
          ref.read(cartControllerProvider.notifier).clearAfterOrder();
          ref.invalidate(ordersListProvider);
          if (!mounted) return;
          context.showSnack('Payment successful!');
          _goToOrderSuccess(
            orderId: result.orderId,
            total: result.totalAmount,
            paymentPending: false,
          );
        } catch (error) {
          if (!mounted) return;
          context.showSnack(Failure.from(error).message, isError: true);
          _goToOrderSuccess(
            orderId: result.orderId,
            total: result.totalAmount,
            paymentPending: true,
          );
        }
      case RazorpayCheckoutFailure(:final message, :final cancelled):
        context.showSnack(
          cancelled
              ? 'Payment cancelled. Your order is saved — you can retry payment from order details.'
              : message,
          isError: !cancelled,
        );
        _goToOrderSuccess(
          orderId: result.orderId,
          total: result.totalAmount,
          paymentPending: true,
        );
    }
  }

  Future<void> _placeOrder() async {
    final address = _effectiveAddress;
    if (address == null) {
      context.showSnack('Please add a delivery address first.', isError: true);
      return;
    }
    if (_checkoutSessionId == null || _checkoutSessionId!.isEmpty) {
      context.showSnack('Checkout session is not ready. Please try again.', isError: true);
      return;
    }
    setState(() => _placing = true);
    try {
      final cart = ref.read(cartControllerProvider).value;
      final ordersRepo = ref.read(ordersRepositoryProvider);
      final result = await ordersRepo.placeOrder(
        shippingAddressId: address.id,
        paymentMethod: _payment,
        couponCode: cart?.couponCode,
        checkoutSessionId: _checkoutSessionId,
        idempotencyKey: _orderIdempotencyKey,
      );

      if (result.requiresRazorpay) {
        await _completeOnlinePayment(result: result, ordersRepo: ordersRepo);
      } else {
        ref.read(cartControllerProvider.notifier).clearAfterOrder();
        ref.invalidate(ordersListProvider);
        if (!mounted) return;
        _goToOrderSuccess(
          orderId: result.orderId,
          total: result.totalAmount,
          paymentPending: false,
        );
      }
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
    final summary = _checkoutSummary ?? cart?.summary;
    final couponCode = cart?.couponCode;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: _sessionLoading
          ? const Center(child: CircularProgressIndicator())
          : !_hasCheckoutContent
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
                      summary != null && summary.shipping == 0
                          ? 'FREE'
                          : '₹${(summary?.shipping ?? 0).toStringAsFixed(0)}',
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
                  subtitle: 'Pay via Razorpay (GPay, PhonePe, etc.)',
                  icon: Icons.account_balance_wallet_outlined,
                  onChanged: (v) => setState(() => _payment = v),
                ),
                _PaymentTile(
                  value: 'card',
                  groupValue: _payment,
                  title: 'Credit / Debit Card',
                  subtitle: 'Visa, Mastercard, RuPay via Razorpay',
                  icon: Icons.credit_card,
                  onChanged: (v) => setState(() => _payment = v),
                ),
                const SizedBox(height: AppSpacing.lg),
                _SectionTitle('Coupon'),
                CouponField(
                  appliedCode: couponCode,
                  onApply: _applyCoupon,
                  onRemove: _clearCoupon,
                ),
                const SizedBox(height: AppSpacing.lg),
                if (summary != null) CartSummaryCard(summary: summary),
                const SizedBox(height: AppSpacing.md),
                if (_payment != 'cod')
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Text(
                      'Secured by Razorpay. You will complete payment right after placing the order.',
                      style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
              ],
            ),
      bottomNavigationBar: _sessionLoading || !_hasCheckoutContent || summary == null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: AppButton(
                  label: _payment == 'cod' ? 'Place order' : 'Place order & pay',
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
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: BorderSide(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: RadioListTile<String>(
          value: value,
          groupValue: groupValue,
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
          title: Text(title),
          subtitle: Text(subtitle),
          secondary: Icon(icon, color: selected ? AppColors.primary : AppColors.textSecondary),
        ),
      ),
    );
  }
}
