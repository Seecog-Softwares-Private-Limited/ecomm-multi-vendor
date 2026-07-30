import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../orders/domain/entities/order.dart';
import '../../../orders/presentation/orders_providers.dart';
import '../support_controller.dart';

class CreateTicketPage extends ConsumerStatefulWidget {
  const CreateTicketPage({this.orderId, this.categoryHint, super.key});

  final String? orderId;
  final String? categoryHint;

  @override
  ConsumerState<CreateTicketPage> createState() => _CreateTicketPageState();
}

class _CreateTicketPageState extends ConsumerState<CreateTicketPage>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _subject;
  String? _selectedOrderId;
  bool _submitting = false;
  bool _success = false;
  late final AnimationController _successAnim;

  @override
  void initState() {
    super.initState();
    _selectedOrderId = widget.orderId;
    final prefix = widget.orderId != null
        ? 'Help with order #${widget.orderId!.substring(0, widget.orderId!.length.clamp(0, 8)).toUpperCase()}: '
        : (widget.categoryHint != null && widget.categoryHint!.isNotEmpty
            ? '${FaqSubjectHints.label(widget.categoryHint!)}: '
            : '');
    _subject = TextEditingController(text: prefix);
    _successAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 520),
    );
  }

  @override
  void dispose() {
    _subject.dispose();
    _successAnim.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final ticket = await ref.read(supportControllerProvider.notifier).create(
            subject: _subject.text.trim(),
            orderId: _selectedOrderId,
          );
      if (!mounted) return;
      setState(() => _success = true);
      await _successAnim.forward();
      await Future<void>.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;
      context.showSnack('Support ticket ${ticket.shortId} created.');
      context.pushReplacement(AppRoutes.supportTicketPath(ticket.id));
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final ordersAsync = ref.watch(ordersListProvider);

    if (_success) {
      return Scaffold(
        appBar: AppBar(title: const Text('Ticket created')),
        body: Center(
          child: ScaleTransition(
            scale: CurvedAnimation(parent: _successAnim, curve: Curves.elasticOut),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_rounded, size: 56, color: AppColors.success),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  'Request submitted',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'Our team will get back to you soon.',
                  style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Contact Support')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            'Tell us how we can help',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Share a clear subject. You can optionally link an order so we can assist faster.',
            style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextField(
                  controller: _subject,
                  label: 'Subject',
                  hint: 'Describe your issue',
                  maxLength: 200,
                  validator: (v) {
                    final required = Validators.required(v, field: 'Subject');
                    if (required != null) return required;
                    if (v!.trim().length < 8) return 'Please add a bit more detail';
                    return null;
                  },
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  'Linked order (optional)',
                  style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: AppSpacing.sm),
                ordersAsync.when(
                  loading: () => const LinearProgressIndicator(minHeight: 2),
                  error: (_, _) => Text(
                    'Orders unavailable right now. You can still submit without linking an order.',
                    style: theme.textTheme.bodySmall?.copyWith(color: adaptive.textMuted),
                  ),
                  data: (orders) => _OrderPicker(
                    orders: orders,
                    selectedOrderId: _selectedOrderId,
                    onChanged: (id) => setState(() => _selectedOrderId = id),
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                AppButton(
                  label: 'Submit ticket',
                  icon: Icons.send_outlined,
                  isLoading: _submitting,
                  onPressed: _submitting ? null : _submit,
                ),
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: 'Cancel',
                  variant: AppButtonVariant.text,
                  onPressed: _submitting ? null : () => context.pop(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

abstract final class FaqSubjectHints {
  static String label(String category) => switch (category.toLowerCase()) {
        'orders' => 'Order help',
        'returns' => 'Return / refund help',
        'payments' => 'Payment help',
        'account' => 'Account help',
        _ => 'Support request',
      };
}

class _OrderPicker extends StatelessWidget {
  const _OrderPicker({
    required this.orders,
    required this.selectedOrderId,
    required this.onChanged,
  });

  final List<OrderSummary> orders;
  final String? selectedOrderId;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    if (orders.isEmpty) {
      return Text(
        'No orders found to link.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: adaptive.textMuted),
      );
    }

    return DropdownButtonFormField<String?>(
      initialValue: selectedOrderId,
      isExpanded: true,
      decoration: const InputDecoration(
        prefixIcon: Icon(Icons.receipt_long_outlined),
        hintText: 'Select an order',
      ),
      items: [
        const DropdownMenuItem<String?>(
          child: Text('No linked order'),
        ),
        for (final order in orders)
          DropdownMenuItem<String?>(
            value: order.id,
            child: Text(
              '#${order.id.substring(0, order.id.length.clamp(0, 8)).toUpperCase()} · '
              '${Formatters.rupees(order.totalAmount)} · '
              '${Formatters.dayMonthYear(order.createdAt)}',
              overflow: TextOverflow.ellipsis,
            ),
          ),
      ],
      onChanged: onChanged,
    );
  }
}
