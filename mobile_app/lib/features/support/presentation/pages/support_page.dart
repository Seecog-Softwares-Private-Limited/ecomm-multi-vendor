import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/state_views.dart';
import '../support_controller.dart';

class SupportPage extends ConsumerStatefulWidget {
  const SupportPage({this.orderId, super.key});

  final String? orderId;

  @override
  ConsumerState<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends ConsumerState<SupportPage> {
  final _formKey = GlobalKey<FormState>();
  final _subject = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.orderId != null) {
      _subject.text = 'Help with order #${widget.orderId!.substring(0, widget.orderId!.length.clamp(0, 8)).toUpperCase()}: ';
    }
  }

  @override
  void dispose() {
    _subject.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ref.read(supportControllerProvider.notifier).create(
            subject: _subject.text.trim(),
            orderId: widget.orderId,
          );
      if (!mounted) return;
      _subject.clear();
      context.showSnack('Support ticket created. We will get back to you soon.');
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
    final tickets = ref.watch(supportControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Raise a request', style: theme.textTheme.titleMedium),
                    const SizedBox(height: AppSpacing.sm),
                    AppTextField(
                      controller: _subject,
                      label: 'How can we help?',
                      hint: 'Describe your issue',
                      maxLength: 200,
                      validator: (v) => Validators.required(v, field: 'Subject'),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppButton(label: 'Submit request', isLoading: _submitting, onPressed: _submit),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _ContactRow(icon: Icons.email_outlined, label: 'support@indovyapar.com'),
          _ContactRow(icon: Icons.phone_outlined, label: '1800-123-4567 (9am – 8pm)'),
          const SizedBox(height: AppSpacing.lg),
          Text('Your requests', style: theme.textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          tickets.when(
            loading: () => const Padding(padding: EdgeInsets.all(AppSpacing.xl), child: AppLoader()),
            error: (error, _) => ErrorStateView(
              message: 'Could not load your requests.',
              onRetry: () => ref.invalidate(supportControllerProvider),
            ),
            data: (list) {
              if (list.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Text('You have no support requests yet.',
                      style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)),
                );
              }
              return Column(
                children: [
                  for (final ticket in list)
                    Card(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: ListTile(
                        leading: const Icon(Icons.confirmation_number_outlined, color: AppColors.primary),
                        title: Text(ticket.subject, maxLines: 2, overflow: TextOverflow.ellipsis),
                        subtitle: Text(
                          '${ticket.shortId} · ${Formatters.dayMonthYear(ticket.createdAt)}',
                        ),
                        trailing: Chip(
                          label: Text(ticket.status, style: theme.textTheme.labelSmall),
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: AppSpacing.md),
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
