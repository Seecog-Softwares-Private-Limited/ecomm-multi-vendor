import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_button.dart';

class OrderSuccessPage extends StatefulWidget {
  const OrderSuccessPage({
    required this.orderId,
    required this.total,
    this.paymentPending = false,
    super.key,
  });

  final String orderId;
  final double total;
  final bool paymentPending;

  @override
  State<OrderSuccessPage> createState() => _OrderSuccessPageState();
}

class _OrderSuccessPageState extends State<OrderSuccessPage> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;
  late final Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _scale = CurvedAnimation(parent: _controller, curve: Curves.elasticOut);
    _fade = CurvedAnimation(parent: _controller, curve: const Interval(0.3, 1, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String get _shortOrderId {
    if (widget.orderId.isEmpty) return '—';
    return '#${widget.orderId.substring(0, widget.orderId.length.clamp(0, 8)).toUpperCase()}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ScaleTransition(
                  scale: _scale,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [adaptive.primarySurface, AppColors.success.withValues(alpha: 0.35)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.success.withValues(alpha: 0.25),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 72),
                  ),
                ),
                FadeTransition(
                  opacity: _fade,
                  child: Column(
                    children: [
                      const SizedBox(height: AppSpacing.xl),
                      Text(
                        widget.paymentPending ? 'Order saved!' : 'Order placed!',
                        style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        widget.paymentPending
                            ? 'Your order is confirmed. Complete payment to speed up dispatch.'
                            : 'Thank you for shopping with IndoVyapar. Your order is confirmed.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          border: Border.all(color: adaptive.border),
                        ),
                        child: Column(
                          children: [
                            _row(context, theme, 'Order ID', _shortOrderId),
                            const SizedBox(height: AppSpacing.sm),
                            _row(context, theme, 'Amount Paid', Formatters.rupees(widget.total)),
                            const SizedBox(height: AppSpacing.sm),
                            _row(
                              context,
                              theme,
                              'Estimated Delivery',
                              '3–5 business days',
                              muted: true,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xxl),
                      AppButton(
                        label: 'Track Order',
                        icon: Icons.local_shipping_outlined,
                        onPressed: widget.orderId.isEmpty
                            ? null
                            : () => context.pushReplacement(AppRoutes.orderPath(widget.orderId)),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      AppButton(
                        label: 'Continue Shopping',
                        variant: AppButtonVariant.text,
                        onPressed: () => context.go(AppRoutes.home),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row(BuildContext context, ThemeData theme, String label, String value, {bool muted = false}) {
    final adaptive = context.adaptiveColors;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary)),
        Text(
          value,
          style: theme.textTheme.titleSmall?.copyWith(
            color: muted ? adaptive.textMuted : null,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
