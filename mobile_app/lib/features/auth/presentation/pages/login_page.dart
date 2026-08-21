import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../auth_controller.dart';
import '../widgets/auth_header.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _rememberMe = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final remembered = ref.read(preferencesProvider).rememberedEmail;
    if (remembered != null) _emailController.text = remembered;
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    final email = _emailController.text.trim();
    final prefs = ref.read(preferencesProvider);
    await prefs.setRememberedEmail(_rememberMe ? email : null);

    final failure = await ref.read(authControllerProvider.notifier).login(
          email,
          _passwordController.text,
        );

    if (!mounted) return;
    setState(() => _submitting = false);

    if (failure == null) {
      final needsProfile =
          ref.read(authControllerProvider).value?.user?.needsProfileCompletion ?? false;
      context.go(AppRoutes.afterAuth(needsProfileCompletion: needsProfile));
    } else {
      context.showSnack(failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const AuthHeader(
                      title: 'Welcome back',
                      subtitle: 'Sign in to continue shopping with IndoVyapar.',
                    ),
                    const SizedBox(height: AppSpacing.xxxl),
                    AppTextField(
                      controller: _emailController,
                      label: 'Email',
                      hint: 'you@example.com',
                      prefixIcon: Icons.mail_outline,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      validator: Validators.email,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    AppTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Enter your password',
                      prefixIcon: Icons.lock_outline,
                      obscureText: true,
                      enableObscureToggle: true,
                      textInputAction: TextInputAction.done,
                      validator: Validators.password,
                      onSubmitted: (_) => _submit(),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (v) => setState(() => _rememberMe = v ?? false),
                        ),
                        const Text('Remember me'),
                        const Spacer(),
                        TextButton(
                          onPressed: () => context.push(AppRoutes.forgotPassword),
                          child: const Text('Forgot password?'),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppButton(
                      label: 'Sign in',
                      isLoading: _submitting,
                      onPressed: _submit,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Row(
                      children: [
                        const Expanded(child: Divider()),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                          child: Text('or', style: theme.textTheme.bodySmall),
                        ),
                        const Expanded(child: Divider()),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    AppButton(
                      label: 'Sign in with OTP',
                      icon: Icons.sms_outlined,
                      variant: AppButtonVariant.secondary,
                      onPressed: () => context.push(AppRoutes.otpLogin),
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account?",
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: context.adaptiveColors.textSecondary,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push(AppRoutes.register),
                          child: const Text('Create one'),
                        ),
                      ],
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
