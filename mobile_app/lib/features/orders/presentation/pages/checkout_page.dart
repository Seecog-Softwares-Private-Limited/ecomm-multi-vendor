import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/state_views.dart';
import '../../../addresses/domain/entities/address.dart';
import '../../../addresses/presentation/addresses_controller.dart';
import '../../../addresses/presentation/pages/address_form_page.dart';
import '../../../addresses/presentation/pages/addresses_page.dart';
import '../../../cart/presentation/cart_controller.dart';
import '../../../cart/presentation/widgets/cart_summary_card.dart';
import '../../../cart/presentation/widgets/coupon_field.dart';
import '../../../commerce/presentation/widgets/premium_card.dart';
import '../../data/checkout_remote_data_source.dart';
import '../../data/orders_repository.dart';
import '../../data/razorpay_checkout_service.dart';
import '../../domain/entities/order.dart';
import '../../domain/entities/razorpay_session.dart';
import '../orders_providers.dart';
import '../widgets/checkout_expandable_section.dart';
import '../widgets/checkout_order_items.dart';
import '../widgets/commerce_skeletons.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key, this.sessionId});

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

  List<Map<String, dynamic>> get _sessionItems {
    final items = _sessionPreview?['items'];
    if (items is! List) return const [];
    return items.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList(growable: false);
  }

  CartSummary? get _checkoutSummary {
    final totals = _sessionPreview?['totals'];
    if (totals is! Map) return null;
    final map = Map<String, dynamic>.from(totals);
    final discount = (map['discountAmount'] as num?)?.toDouble() ?? 0;
    return CartSummary(
      subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0,
      savings: 0,
      shipping: (map['shippingAmount'] as num?)?.toDouble() ?? 0,
      tax: (map['taxAmount'] as num?)?.toDouble() ?? 0,
      couponDiscount: discount,
      totalOverride: (map['totalAmount'] as num?)?.toDouble(),
    );
  }

  bool get _hasCheckoutContent {
    if (_checkoutSessionId != null && _sessionItems.isNotEmpty) return true;
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
      if (mounted) context.showSnack(Failure.from(error).message, isError: true);
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
      if (mounted) context.showSnack(Failure.from(error).message, isError: true);
    }
  }

  Future<void> _clearCoupon() async {
    ref.read(cartControllerProvider.notifier).clearCoupon();
    try {
      await _loadSessionPreview();
    } catch (error) {
      if (mounted) context.showSnack(Failure.from(error).message, isError: true);
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
      context.showSnack(session.message ?? 'Online payment is not configured. Your order is confirmed.');
      ref.read(cartControllerProvider.notifier).clearAfterOrder();
      ref.invalidate(ordersListProvider);
      _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: true);
      return;
    }

    final checkoutResult = await _razorpayCheckout.openCheckout(session, paymentMethod: _payment);
    if (!mounted) return;

    switch (checkoutResult) {
      case RazorpayCheckoutSuccess(:final paymentId, :final orderId, :final signature):
        if (paymentId.isEmpty || orderId.isEmpty || signature.isEmpty) {
          context.showSnack('Payment response was incomplete.', isError: true);
          _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: true);
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
          _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: false);
        } catch (error) {
          if (!mounted) return;
          context.showSnack(Failure.from(error).message, isError: true);
          _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: true);
        }
      case RazorpayCheckoutFailure(:final message, :final cancelled):
        context.showSnack(
          cancelled
              ? 'Payment cancelled. Your order is saved — you can retry payment from order details.'
              : message,
          isError: !cancelled,
        );
        _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: true);
    }
  }

  Future<void> _placeOrder() async {
    if (_placing) return;
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
        _goToOrderSuccess(orderId: result.orderId, total: result.totalAmount, paymentPending: false);
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
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(title: const Text('Checkout')),
      body: _sessionLoading
          ? const CheckoutSkeleton()
          : !_hasCheckoutContent
          ? ErrorStateView(
              title: 'Nothing to checkout',
              message: 'Your cart is empty. Add products before checking out.',
              onRetry: () => ShellNavigation.openCart(context, ref),
            )
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                CheckoutExpandableSection(
                  title: 'Delivery Address',
                  icon: Icons.location_on_outlined,
                  subtitle: address?.fullName,
                  trailing: TextButton(onPressed: _selectAddress, child: const Text('Change')),
                  child: address == null
                      ? PremiumCard(
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const AddressFormPage()),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.add_location_alt_outlined, color: AppColors.primary),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Text('Add a delivery address', style: theme.textTheme.titleSmall),
                              ),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(address.fullName, style: theme.textTheme.titleSmall),
                                if (address.isDefault) ...[
                                  const SizedBox(width: AppSpacing.sm),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: context.adaptiveColors.primarySurface,
                                      borderRadius: BorderRadius.circular(AppRadius.xs),
                                    ),
                                    child: Text(
                                      'Default',
                                      style: theme.textTheme.labelSmall?.copyWith(color: AppColors.primary),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(address.formatted, style: theme.textTheme.bodyMedium),
                            Text('Phone: ${address.phone}', style: theme.textTheme.bodySmall),
                            const SizedBox(height: AppSpacing.sm),
                            OutlinedButton.icon(
                              onPressed: _selectAddress,
                              icon: const Icon(Icons.edit_outlined, size: 18),
                              label: const Text('Change Address'),
                            ),
                          ],
                        ),
                ),
                CheckoutExpandableSection(
                  title: 'Payment Method',
                  icon: Icons.payments_outlined,
                  subtitle: _payment == 'cod' ? 'Cash on Delivery' : _payment.toUpperCase(),
                  child: Column(
                    children: [
                      _PaymentOption(
                        value: 'cod',
                        groupValue: _payment,
                        title: 'Cash on Delivery',
                        subtitle: 'Pay when your order arrives',
                        icon: Icons.payments_outlined,
                        onChanged: (v) => setState(() => _payment = v),
                      ),
                      _PaymentOption(
                        value: 'upi',
                        groupValue: _payment,
                        title: 'UPI',
                        subtitle: 'GPay, PhonePe via Razorpay',
                        icon: Icons.account_balance_wallet_outlined,
                        onChanged: (v) => setState(() => _payment = v),
                      ),
                      _PaymentOption(
                        value: 'card',
                        groupValue: _payment,
                        title: 'Credit / Debit Card',
                        subtitle: 'Visa, Mastercard, RuPay',
                        icon: Icons.credit_card,
                        onChanged: (v) => setState(() => _payment = v),
                      ),
                    ],
                  ),
                ),
                if (_sessionItems.isNotEmpty)
                  CheckoutExpandableSection(
                    title: 'Order Summary',
                    icon: Icons.shopping_bag_outlined,
                    subtitle: '${_sessionItems.length} item${_sessionItems.length == 1 ? '' : 's'}',
                    child: CheckoutOrderItemsList(items: _sessionItems),
                  ),
                CheckoutExpandableSection(
                  title: 'Coupon',
                  icon: Icons.local_offer_outlined,
                  initiallyExpanded: couponCode != null,
                  child: CouponField(
                    appliedCode: couponCode,
                    onApply: _applyCoupon,
                    onRemove: _clearCoupon,
                  ),
                ),
                CheckoutExpandableSection(
                  title: 'Price Breakdown',
                  icon: Icons.receipt_long_outlined,
                  child: summary != null
                      ? CartSummaryCard(summary: summary, compact: true)
                      : const SizedBox.shrink(),
                ),
                if (_payment != 'cod')
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.sm),
                    child: Text(
                      'Secured by Razorpay. Complete payment after placing the order.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: context.adaptiveColors.textSecondary,
                      ),
                    ),
                  ),
                const SizedBox(height: 100),
              ],
            ),
      bottomNavigationBar: _sessionLoading || !_hasCheckoutContent || summary == null
          ? null
          : SafeArea(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  boxShadow: [
                    BoxShadow(
                      color: context.adaptiveColors.shadow,
                      blurRadius: 16,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: AppButton(
                  label: _payment == 'cod' ? 'Place Order' : 'Place Order & Pay',
                  isLoading: _placing,
                  onPressed: _placing ? null : _placeOrder,
                ),
              ),
            ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
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
    final adaptive = context.adaptiveColors;
    return Semantics(
      label: title,
      selected: selected,
      child: Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: InkWell(
          onTap: () => onChanged(value),
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: selected ? AppColors.primary : adaptive.border,
                width: selected ? 2 : 1,
              ),
              color: selected ? adaptive.primarySurface.withValues(alpha: 0.4) : null,
            ),
            child: Row(
              children: [
                Icon(icon, color: selected ? AppColors.primary : adaptive.textSecondary),
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
                if (selected)
                  const Icon(Icons.check_circle, color: AppColors.primary)
                else
                  Icon(Icons.circle_outlined, color: adaptive.border),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
