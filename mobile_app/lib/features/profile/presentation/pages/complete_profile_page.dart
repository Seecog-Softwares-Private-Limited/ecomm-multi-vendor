import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../auth/domain/customer_onboarding.dart';
import '../../../auth/presentation/auth_controller.dart';

/// Post-auth onboarding driven by backend `authOnboardingComplete` / `needsAuthOnboarding`.
class CompleteProfilePage extends ConsumerStatefulWidget {
  const CompleteProfilePage({super.key});

  @override
  ConsumerState<CompleteProfilePage> createState() => _CompleteProfilePageState();
}

class _CompleteProfilePageState extends ConsumerState<CompleteProfilePage> {
  final _nameEmailFormKey = GlobalKey<FormState>();
  final _phoneFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();

  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _otp = TextEditingController();

  CustomerOnboardingStep _step = CustomerOnboardingStep.done;
  bool _phoneOtpSent = false;
  bool _busy = false;
  bool _resendBusy = false;
  int _resendIn = 0;
  Timer? _timer;
  String? _formError;
  String? _emailAwaitMessage;
  bool _hydrated = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _timer?.cancel();
    _fullName.dispose();
    _email.dispose();
    _phone.dispose();
    _otp.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await ref.read(authControllerProvider.notifier).refresh();
    if (!mounted) return;
    _applyUser();
  }

  void _applyUser() {
    final user = ref.read(authControllerProvider).value?.user;
    if (user == null) return;
    final next = resolveCustomerOnboardingStep(user);
    if (!_hydrated) {
      _hydrated = true;
      final name = [user.firstName, user.lastName].whereType<String>().where((e) => e.trim().isNotEmpty).join(' ');
      if (name.isNotEmpty) _fullName.text = name;
      if (!isPlaceholderCustomerEmail(user.email)) {
        _email.text = user.email;
      }
      final phone = user.phone ?? '';
      if (phone.isNotEmpty) {
        final digits = phone.replaceAll(RegExp(r'\D'), '');
        _phone.text = digits.length > 10 ? digits.substring(digits.length - 10) : digits;
      }
    }
    setState(() {
      _step = next;
      if (next == CustomerOnboardingStep.done) {
        context.go(AppRoutes.home);
      }
    });
  }

  void _startResendCountdown() {
    _timer?.cancel();
    setState(() => _resendIn = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendIn <= 1) {
        t.cancel();
        if (mounted) setState(() => _resendIn = 0);
      } else if (mounted) {
        setState(() => _resendIn--);
      }
    });
  }

  Future<void> _logout() async {
    await ref.read(authControllerProvider.notifier).logout();
    if (!mounted) return;
    context.go(AppRoutes.login);
  }

  Future<void> _sendOtp({bool resend = false}) async {
    FocusScope.of(context).unfocus();
    if (!_phoneFormKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _formError = null;
    });
    try {
      await ref.read(authRepositoryProvider).sendOtp(_phone.text.trim(), resend: resend);
      if (!mounted) return;
      setState(() {
        _phoneOtpSent = true;
        _otp.clear();
      });
      _startResendCountdown();
      context.showSnack('OTP sent to your mobile number.');
    } catch (error) {
      if (!mounted) return;
      setState(() => _formError = Failure.from(error).message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verifyOtp() async {
    FocusScope.of(context).unfocus();
    if (!_otpFormKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _formError = null;
    });
    final failure = await ref.read(authControllerProvider.notifier).verifyOtp(
          _phone.text.trim(),
          _otp.text.trim(),
        );
    if (!mounted) return;
    setState(() => _busy = false);
    if (failure != null) {
      setState(() => _formError = failure.message);
      return;
    }
    context.showSnack('Phone verified.');
    _applyUser();
  }

  Future<void> _submitNameEmail() async {
    FocusScope.of(context).unfocus();
    if (!_nameEmailFormKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _formError = null;
    });
    try {
      final data = await ref.read(dioClientProvider).post(
        ApiEndpoints.onboardingProfile,
        data: {
          'name': _fullName.text.trim(),
          'email': _email.text.trim().toLowerCase(),
        },
      );
      final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
      setState(() {
        _emailAwaitMessage = map['message']?.toString() ??
            'Check your email and confirm your address using the link we sent.';
        _step = CustomerOnboardingStep.awaitEmailVerification;
      });
      await ref.read(authControllerProvider.notifier).refresh();
      if (!mounted) return;
      _applyUser();
      context.showSnack('Check your email to verify your address.');
    } catch (error) {
      if (!mounted) return;
      setState(() => _formError = Failure.from(error).message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resendVerification() async {
    final mail = _email.text.trim().isNotEmpty
        ? _email.text.trim()
        : (ref.read(authControllerProvider).value?.user?.email ?? '');
    if (mail.isEmpty || isPlaceholderCustomerEmail(mail)) {
      context.showSnack('Enter your email first.', isError: true);
      return;
    }
    setState(() => _resendBusy = true);
    try {
      await ref.read(dioClientProvider).post(
        ApiEndpoints.resendCustomerVerification,
        data: {'email': mail},
      );
      if (!mounted) return;
      context.showSnack('If pending, a new verification link was sent.');
    } catch (error) {
      if (!mounted) return;
      context.showSnack(Failure.from(error).message, isError: true);
    } finally {
      if (mounted) setState(() => _resendBusy = false);
    }
  }

  Future<void> _refreshAfterEmailVerify() async {
    setState(() => _busy = true);
    try {
      await ref.read(authControllerProvider.notifier).refresh();
      if (!mounted) return;
      _applyUser();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider).value?.user;
    final theme = Theme.of(context);

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final title = switch (_step) {
      CustomerOnboardingStep.phoneOtp => 'Verify your phone',
      CustomerOnboardingStep.awaitEmailVerification => 'Check your email',
      _ => 'Complete your account',
    };
    final subtitle = switch (_step) {
      CustomerOnboardingStep.phoneOtp =>
        'Add and verify your phone number to finish setting up your account.',
      CustomerOnboardingStep.awaitEmailVerification =>
        'Email verification required. Open the link we sent to finish setup.',
      _ =>
        'Your phone number has already been verified. Verify your email to finish setting up your account.',
    };

    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          title: Text(title),
          automaticallyImplyLeading: false,
          actions: [
            TextButton(
              onPressed: _busy ? null : _logout,
              child: const Text('Log out'),
            ),
          ],
        ),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.xxl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      subtitle,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: context.adaptiveColors.textSecondary,
                      ),
                    ),
                    if (_formError != null) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        _formError!,
                        style: theme.textTheme.bodyMedium?.copyWith(color: Colors.red.shade700),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.xl),
                    if (_step == CustomerOnboardingStep.phoneOtp && !_phoneOtpSent)
                      Form(
                        key: _phoneFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AppTextField(
                              controller: _phone,
                              label: 'Mobile number',
                              hint: '10-digit mobile',
                              prefixIcon: Icons.phone_outlined,
                              keyboardType: TextInputType.phone,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(10),
                              ],
                              validator: Validators.phone,
                            ),
                            const SizedBox(height: AppSpacing.xl),
                            AppButton(
                              label: 'Send OTP',
                              isLoading: _busy,
                              onPressed: () => _sendOtp(),
                            ),
                          ],
                        ),
                      ),
                    if (_step == CustomerOnboardingStep.phoneOtp && _phoneOtpSent)
                      Form(
                        key: _otpFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Enter the 6-digit code sent to ${_phone.text}.',
                              style: theme.textTheme.bodyMedium,
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            AppTextField(
                              controller: _otp,
                              label: 'OTP',
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(6),
                              ],
                              validator: Validators.otp,
                            ),
                            const SizedBox(height: AppSpacing.xl),
                            AppButton(
                              label: 'Verify phone',
                              isLoading: _busy,
                              onPressed: _verifyOtp,
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                TextButton(
                                  onPressed: _busy
                                      ? null
                                      : () => setState(() {
                                            _phoneOtpSent = false;
                                            _otp.clear();
                                            _formError = null;
                                          }),
                                  child: const Text('Change number'),
                                ),
                                TextButton(
                                  onPressed: (_busy || _resendIn > 0) ? null : () => _sendOtp(resend: true),
                                  child: Text(_resendIn > 0 ? 'Resend in ${_resendIn}s' : 'Resend OTP'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    if (_step == CustomerOnboardingStep.nameEmail)
                      Form(
                        key: _nameEmailFormKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AppTextField(
                              controller: _fullName,
                              label: 'Full name',
                              prefixIcon: Icons.person_outline,
                              textInputAction: TextInputAction.next,
                              validator: (v) => Validators.required(v, field: 'Full name'),
                            ),
                            const SizedBox(height: AppSpacing.lg),
                            AppTextField(
                              controller: _email,
                              label: 'Email address',
                              prefixIcon: Icons.mail_outline,
                              keyboardType: TextInputType.emailAddress,
                              validator: Validators.email,
                            ),
                            const SizedBox(height: AppSpacing.xl),
                            AppButton(
                              label: 'Continue',
                              isLoading: _busy,
                              onPressed: _submitNameEmail,
                            ),
                          ],
                        ),
                      ),
                    if (_step == CustomerOnboardingStep.awaitEmailVerification) ...[
                      Text(
                        _emailAwaitMessage ??
                            'We sent a verification link to ${_email.text.isNotEmpty ? _email.text : user.email}.',
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      AppButton(
                        label: 'Resend verification email',
                        variant: AppButtonVariant.secondary,
                        isLoading: _resendBusy,
                        onPressed: _resendVerification,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      AppButton(
                        label: "I've verified my email",
                        isLoading: _busy,
                        onPressed: _refreshAfterEmailVerify,
                      ),
                    ],
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
