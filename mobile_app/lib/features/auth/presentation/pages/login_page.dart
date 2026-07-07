import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/navigation/app_routes.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_button.dart';
import '../../../../core/design_system/widgets/app_text_field.dart';
import '../../../../core/design_system/widgets/auth_form_shell.dart';
import '../providers/auth_controller.dart';

enum _LoginMode { email, phone }

enum _PhoneStep { number, otp }

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  var _loginMode = _LoginMode.email;
  var _phoneStep = _PhoneStep.number;
  var _obscurePassword = true;
  var _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return AuthFormShell(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (authState.errorMessage != null) ...[
              _ErrorBanner(message: authState.errorMessage!),
              const SizedBox(height: AppSpacing.md),
            ],
            _LoginModeTabs(
              mode: _loginMode,
              onEmailTap: () => setState(() {
                _loginMode = _LoginMode.email;
                _phoneStep = _PhoneStep.number;
              }),
              onPhoneTap: () => setState(() {
                _loginMode = _LoginMode.phone;
                _phoneStep = _PhoneStep.number;
              }),
            ),
            const SizedBox(height: AppSpacing.lg),
            if (_loginMode == _LoginMode.email) ...[
              AppTextField(
                label: 'Email address',
                hintText: 'you@example.com',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: const Icon(Icons.mail_outline, color: AppColors.textMuted),
                validator: _requiredValidator,
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                label: 'Password',
                hintText: '••••••••',
                controller: _passwordController,
                obscureText: _obscurePassword,
                prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textMuted),
                suffixIcon: IconButton(
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: AppColors.textMuted,
                  ),
                ),
                validator: _requiredValidator,
              ),
              const SizedBox(height: AppSpacing.md),
              Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.xs,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        height: 24,
                        width: 24,
                        child: Checkbox(
                          value: _rememberMe,
                          activeColor: AppColors.primary,
                          onChanged: (value) => setState(() => _rememberMe = value ?? false),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      const Text('Remember me'),
                    ],
                  ),
                  TextButton(
                    onPressed: () => context.go(AppRoutes.forgotPassword),
                    child: const Text('Forgot password?'),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: 'Sign in',
                expanded: true,
                isLoading: authState.isSubmitting,
                leading: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                onPressed: () async {
                  if (!_formKey.currentState!.validate()) return;
                  await ref.read(authControllerProvider.notifier).login(
                        email: _emailController.text.trim(),
                        password: _passwordController.text,
                      );
                },
              ),
            ] else if (_phoneStep == _PhoneStep.number) ...[
              AppTextField(
                label: 'Mobile number',
                hintText: '98765 43210',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: const Icon(Icons.smartphone_outlined, color: AppColors.textMuted),
                validator: _requiredValidator,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                "We'll send a one-time code by SMS. Enter 10 digits starting with 6–9.",
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
              ),
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: 'Get OTP',
                expanded: true,
                leading: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                onPressed: () {
                  if (!_formKey.currentState!.validate()) return;
                  setState(() => _phoneStep = _PhoneStep.otp);
                },
              ),
            ] else ...[
              Text(
                'Enter the code sent to ${_phoneController.text.trim()}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                label: 'One-time password',
                hintText: '6-digit OTP',
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                validator: _requiredValidator,
              ),
              const SizedBox(height: AppSpacing.md),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: () => setState(() {
                    _phoneStep = _PhoneStep.number;
                    _otpController.clear();
                  }),
                  child: const Text('Change number'),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              AppButton(
                label: 'Verify & sign in',
                expanded: true,
                leading: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                onPressed: () {
                  if (!_formKey.currentState!.validate()) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Phone OTP sign-in will connect to the API soon.')),
                  );
                },
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            const _SocialLoginDivider(),
            const SizedBox(height: AppSpacing.md),
            const _SocialLoginButtons(),
            const SizedBox(height: AppSpacing.md),
            TextButton(
              onPressed: () => context.go(AppRoutes.register),
              child: const Text('Create account'),
            ),
          ],
        ),
      ),
    );
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }
    return null;
  }
}

class _LoginModeTabs extends StatelessWidget {
  const _LoginModeTabs({
    required this.mode,
    required this.onEmailTap,
    required this.onPhoneTap,
  });

  final _LoginMode mode;
  final VoidCallback onEmailTap;
  final VoidCallback onPhoneTap;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.inputFill.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Row(
          children: [
            Expanded(
              child: _TabButton(
                label: 'Mobile OTP',
                icon: Icons.smartphone_outlined,
                selected: mode == _LoginMode.phone,
                onTap: onPhoneTap,
              ),
            ),
            Expanded(
              child: _TabButton(
                label: 'Email',
                icon: Icons.mail_outline,
                selected: mode == _LoginMode.email,
                onTap: onEmailTap,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.surface : Colors.transparent,
      borderRadius: BorderRadius.circular(10),
      elevation: selected ? 1 : 0,
      shadowColor: Colors.black12,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: selected ? AppColors.textPrimary : AppColors.textMuted),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: selected ? AppColors.textPrimary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.errorSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Text(
          message,
          style: const TextStyle(
            color: Color(0xFFB91C1C),
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class _SocialLoginDivider extends StatelessWidget {
  const _SocialLoginDivider();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: Text(
            'OR CONTINUE WITH',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  fontSize: 11,
                  letterSpacing: 0.6,
                ),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.border)),
      ],
    );
  }
}

class _SocialLoginButtons extends StatelessWidget {
  const _SocialLoginButtons();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _showComingSoon(context, 'Google'),
            icon: const _GoogleLogo(),
            label: const Text('Google'),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => _showComingSoon(context, 'Facebook'),
            icon: const Icon(Icons.facebook, color: Color(0xFF1877F2)),
            label: const Text('Facebook'),
          ),
        ),
      ],
    );
  }

  static void _showComingSoon(BuildContext context, String provider) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$provider sign-in will open in the browser soon.')),
    );
  }
}

class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    // Simplified multi-color G approximation for parity with web buttons.
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), -0.4, 1.2, true, paint);
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), 1.0, 1.0, true, paint);
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), 2.2, 0.8, true, paint);
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), 3.2, 0.9, true, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
