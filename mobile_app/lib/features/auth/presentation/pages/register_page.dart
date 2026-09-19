import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../auth_controller.dart';
import '../widgets/auth_header.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _emailOtp = TextEditingController();
  final _phoneOtp = TextEditingController();

  bool _submitting = false;
  bool _emailSent = false;
  bool _phoneSent = false;
  bool _emailVerified = false;
  bool _phoneVerified = false;
  String? _emailProofToken;
  String? _phoneProofToken;
  bool _emailSendBusy = false;
  bool _emailVerifyBusy = false;
  bool _phoneSendBusy = false;
  bool _phoneVerifyBusy = false;
  int _emailCooldown = 0;
  int _phoneCooldown = 0;
  Timer? _emailTimer;
  Timer? _phoneTimer;

  @override
  void dispose() {
    _emailTimer?.cancel();
    _phoneTimer?.cancel();
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    _confirm.dispose();
    _emailOtp.dispose();
    _phoneOtp.dispose();
    super.dispose();
  }

  void _startCooldown(bool email) {
    if (email) {
      _emailTimer?.cancel();
      setState(() => _emailCooldown = 60);
      _emailTimer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (!mounted) return;
        if (_emailCooldown <= 1) {
          t.cancel();
          setState(() => _emailCooldown = 0);
        } else {
          setState(() => _emailCooldown -= 1);
        }
      });
    } else {
      _phoneTimer?.cancel();
      setState(() => _phoneCooldown = 60);
      _phoneTimer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (!mounted) return;
        if (_phoneCooldown <= 1) {
          t.cancel();
          setState(() => _phoneCooldown = 0);
        } else {
          setState(() => _phoneCooldown -= 1);
        }
      });
    }
  }

  Future<void> _sendEmailOtp({bool resend = false}) async {
    final email = _email.text.trim();
    if (Validators.email(email) != null) {
      context.showSnack('Enter a valid email', isError: true);
      return;
    }
    setState(() => _emailSendBusy = true);
    try {
      await ref.read(authRepositoryProvider).sendRegisterEmailOtp(email, resend: resend);
      if (!mounted) return;
      setState(() {
        _emailSent = true;
        _emailVerified = false;
        _emailProofToken = null;
        _emailOtp.clear();
      });
      _startCooldown(true);
      context.showSnack('OTP sent to your email');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _emailSendBusy = false);
    }
  }

  Future<void> _verifyEmailOtp() async {
    final otp = _emailOtp.text.trim();
    if (otp.length != 6) {
      context.showSnack('Enter the 6-digit email OTP', isError: true);
      return;
    }
    setState(() => _emailVerifyBusy = true);
    try {
      final token = await ref.read(authRepositoryProvider).verifyRegisterEmailOtp(
            email: _email.text.trim(),
            otp: otp,
          );
      if (!mounted) return;
      setState(() {
        _emailProofToken = token;
        _emailVerified = true;
      });
      context.showSnack('Email verified');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _emailVerifyBusy = false);
    }
  }

  Future<void> _sendPhoneOtp({bool resend = false}) async {
    final phone = _phone.text.trim();
    if (Validators.phone(phone) != null) {
      context.showSnack('Enter a valid 10-digit mobile', isError: true);
      return;
    }
    setState(() => _phoneSendBusy = true);
    try {
      await ref.read(authRepositoryProvider).sendRegisterPhoneOtp(phone, resend: resend);
      if (!mounted) return;
      setState(() {
        _phoneSent = true;
        _phoneVerified = false;
        _phoneProofToken = null;
        _phoneOtp.clear();
      });
      _startCooldown(false);
      context.showSnack('OTP sent to your phone');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _phoneSendBusy = false);
    }
  }

  Future<void> _verifyPhoneOtp() async {
    final otp = _phoneOtp.text.trim();
    if (otp.length != 6) {
      context.showSnack('Enter the 6-digit phone OTP', isError: true);
      return;
    }
    setState(() => _phoneVerifyBusy = true);
    try {
      final token = await ref.read(authRepositoryProvider).verifyRegisterPhoneOtp(
            phone: _phone.text.trim(),
            otp: otp,
          );
      if (!mounted) return;
      setState(() {
        _phoneProofToken = token;
        _phoneVerified = true;
      });
      context.showSnack('Phone verified');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _phoneVerifyBusy = false);
    }
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    if (!_emailVerified || _emailProofToken == null) {
      context.showSnack('Verify your email with OTP first', isError: true);
      return;
    }
    if (!_phoneVerified || _phoneProofToken == null) {
      context.showSnack('Verify your phone with OTP first', isError: true);
      return;
    }
    if (_password.text != _confirm.text) {
      context.showSnack('Passwords do not match', isError: true);
      return;
    }

    setState(() => _submitting = true);
    try {
      final result = await ref.read(authRepositoryProvider).register(
            email: _email.text.trim(),
            password: _password.text,
            emailProofToken: _emailProofToken!,
            phoneProofToken: _phoneProofToken!,
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim(),
            phone: _phone.text.trim(),
          );
      if (!mounted) return;
      context.showSnack(result.message);
      if (result.needsOnboarding) {
        context.go('/complete-profile');
      } else {
        context.go('/');
      }
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
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
                      title: 'Join IndoVyapar',
                      subtitle: 'Verify email and phone with OTP, then create your account.',
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    AppTextField(
                      controller: _firstName,
                      label: 'First name',
                      prefixIcon: Icons.person_outline,
                      validator: (v) =>
                          (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _lastName,
                      label: 'Last name',
                      prefixIcon: Icons.person_outline,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _email,
                      label: 'Email',
                      hint: 'you@gmail.com',
                      prefixIcon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      enabled: !_emailVerified,
                      validator: Validators.email,
                      onChanged: (_) {
                        if (_emailVerified || _emailSent) {
                          setState(() {
                            _emailVerified = false;
                            _emailProofToken = null;
                            _emailSent = false;
                            _emailOtp.clear();
                          });
                        }
                      },
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    AppButton(
                      label: _emailVerified
                          ? 'Email verified'
                          : _emailCooldown > 0
                              ? 'Resend in ${_emailCooldown}s'
                              : _emailSent
                                  ? 'Resend OTP'
                                  : 'Send email OTP',
                      isLoading: _emailSendBusy,
                      onPressed: _emailVerified || _emailCooldown > 0
                          ? null
                          : () => _sendEmailOtp(resend: _emailSent),
                    ),
                    if (_emailSent && !_emailVerified) ...[
                      const SizedBox(height: AppSpacing.md),
                      AppTextField(
                        controller: _emailOtp,
                        label: 'Email OTP',
                        hint: '6-digit code',
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(6),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      AppButton(
                        label: 'Verify email OTP',
                        isLoading: _emailVerifyBusy,
                        onPressed: _verifyEmailOtp,
                      ),
                    ],
                    if (_emailVerified)
                      const Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: Text('✓ Email verified', style: TextStyle(color: AppColors.primary)),
                      ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _password,
                      label: 'Password',
                      prefixIcon: Icons.lock_outline,
                      obscureText: true,
                      validator: Validators.password,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _confirm,
                      label: 'Confirm password',
                      prefixIcon: Icons.lock_outline,
                      obscureText: true,
                      validator: (v) =>
                          v != _password.text ? 'Passwords do not match' : null,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _phone,
                      label: 'Phone',
                      hint: '10-digit mobile',
                      prefixIcon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      enabled: !_phoneVerified,
                      validator: Validators.phone,
                      onChanged: (_) {
                        if (_phoneVerified || _phoneSent) {
                          setState(() {
                            _phoneVerified = false;
                            _phoneProofToken = null;
                            _phoneSent = false;
                            _phoneOtp.clear();
                          });
                        }
                      },
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    AppButton(
                      label: _phoneVerified
                          ? 'Phone verified'
                          : _phoneCooldown > 0
                              ? 'Resend in ${_phoneCooldown}s'
                              : _phoneSent
                                  ? 'Resend OTP'
                                  : 'Send phone OTP',
                      isLoading: _phoneSendBusy,
                      onPressed: _phoneVerified || _phoneCooldown > 0
                          ? null
                          : () => _sendPhoneOtp(resend: _phoneSent),
                    ),
                    if (_phoneSent && !_phoneVerified) ...[
                      const SizedBox(height: AppSpacing.md),
                      AppTextField(
                        controller: _phoneOtp,
                        label: 'Phone OTP',
                        hint: '6-digit code',
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(6),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      AppButton(
                        label: 'Verify phone OTP',
                        isLoading: _phoneVerifyBusy,
                        onPressed: _verifyPhoneOtp,
                      ),
                    ],
                    if (_phoneVerified)
                      const Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: Text('✓ Phone verified', style: TextStyle(color: AppColors.primary)),
                      ),
                    const SizedBox(height: AppSpacing.xl),
                    AppButton(
                      label: 'Create account',
                      isLoading: _submitting,
                      onPressed: (_emailVerified && _phoneVerified) ? _submit : null,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      child: const Text('Already have an account? Sign in'),
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
