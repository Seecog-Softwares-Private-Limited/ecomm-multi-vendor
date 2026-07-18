import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../auth_controller.dart';
import '../widgets/auth_header.dart';

class OtpLoginPage extends ConsumerStatefulWidget {
  const OtpLoginPage({super.key});

  @override
  ConsumerState<OtpLoginPage> createState() => _OtpLoginPageState();
}

class _OtpLoginPageState extends ConsumerState<OtpLoginPage> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _phoneFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();

  bool _otpSent = false;
  bool _busy = false;
  int _resendIn = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _startResendCountdown() {
    _timer?.cancel();
    setState(() => _resendIn = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendIn <= 1) {
        t.cancel();
        if (mounted) setState(() => _resendIn = 0);
      } else if (mounted) {
        setState(() => _resendIn--);
      }
    });
  }

  Future<void> _sendOtp({bool resend = false}) async {
    FocusScope.of(context).unfocus();
    if (!_phoneFormKey.currentState!.validate()) return;

    setState(() => _busy = true);
    try {
      await ref.read(authRepositoryProvider).sendOtp(_phoneController.text.trim(), resend: resend);
      if (!mounted) return;
      setState(() => _otpSent = true);
      _startResendCountdown();
      context.showSnack('OTP sent to your mobile number.');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verify() async {
    FocusScope.of(context).unfocus();
    if (!_otpFormKey.currentState!.validate()) return;

    setState(() => _busy = true);
    final failure = await ref.read(authControllerProvider.notifier).verifyOtp(
          _phoneController.text.trim(),
          _otpController.text.trim(),
        );
    if (!mounted) return;
    setState(() => _busy = false);

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
      appBar: AppBar(title: const Text('OTP sign in')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AuthHeader(
                    title: _otpSent ? 'Enter OTP' : 'Sign in with OTP',
                    subtitle: _otpSent
                        ? 'We sent a 6-digit code to ${_phoneController.text.trim()}.'
                        : 'We will send a one-time password to your mobile number.',
                  ),
                  const SizedBox(height: AppSpacing.xxxl),
                  Form(
                    key: _phoneFormKey,
                    child: AppTextField(
                      controller: _phoneController,
                      label: 'Mobile number',
                      prefixIcon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      enabled: !_otpSent,
                      maxLength: 10,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      validator: (v) => Validators.phone(v),
                    ),
                  ),
                  if (_otpSent) ...[
                    const SizedBox(height: AppSpacing.lg),
                    Form(
                      key: _otpFormKey,
                      child: AppTextField(
                        controller: _otpController,
                        label: 'OTP',
                        hint: '6-digit code',
                        prefixIcon: Icons.password_outlined,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        autofocus: true,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                        validator: Validators.otp,
                        onSubmitted: (_) => _verify(),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppButton(label: 'Verify & continue', isLoading: _busy, onPressed: _verify),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Didn't get the code?",
                          style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                        ),
                        TextButton(
                          onPressed: _resendIn > 0 || _busy ? null : () => _sendOtp(resend: true),
                          child: Text(_resendIn > 0 ? 'Resend in ${_resendIn}s' : 'Resend OTP'),
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: _busy
                          ? null
                          : () => setState(() {
                                _otpSent = false;
                                _otpController.clear();
                              }),
                      child: const Text('Change number'),
                    ),
                  ] else ...[
                    const SizedBox(height: AppSpacing.xl),
                    AppButton(label: 'Send OTP', isLoading: _busy, onPressed: _sendOtp),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
