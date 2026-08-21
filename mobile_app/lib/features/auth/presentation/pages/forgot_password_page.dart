import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../auth_controller.dart';
import '../widgets/auth_header.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _submitting = false;
  String? _sentMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      final message = await ref.read(authRepositoryProvider).forgotPassword(_emailController.text.trim());
      if (!mounted) return;
      setState(() => _sentMessage = message);
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
    return Scaffold(
      appBar: AppBar(title: const Text('Reset password')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: _sentMessage != null
                  ? _SentView(message: _sentMessage!, onBack: () => context.pop())
                  : Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const AuthHeader(
                            title: 'Forgot password?',
                            subtitle: 'Enter your email and we will send you a reset link.',
                          ),
                          const SizedBox(height: AppSpacing.xxxl),
                          AppTextField(
                            controller: _emailController,
                            label: 'Email',
                            prefixIcon: Icons.mail_outline,
                            keyboardType: TextInputType.emailAddress,
                            validator: Validators.email,
                            onSubmitted: (_) => _submit(),
                          ),
                          const SizedBox(height: AppSpacing.xl),
                          AppButton(
                            label: 'Send reset link',
                            isLoading: _submitting,
                            onPressed: _submit,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            'You will receive an email if an account exists for this address.',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SentView extends StatelessWidget {
  const _SentView({required this.message, required this.onBack});

  final String message;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: AppSpacing.huge),
        Container(
          width: 96,
          height: 96,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: context.adaptiveColors.primarySurface, shape: BoxShape.circle),
          child: const Icon(Icons.mark_email_read_outlined, color: AppColors.primary, size: 48),
        ),
        const SizedBox(height: AppSpacing.xl),
        Text('Check your inbox', textAlign: TextAlign.center, style: theme.textTheme.headlineSmall),
        const SizedBox(height: AppSpacing.sm),
        Text(
          message,
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(color: context.adaptiveColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.xxxl),
        AppButton(label: 'Back to sign in', onPressed: onBack),
      ],
    );
  }
}
