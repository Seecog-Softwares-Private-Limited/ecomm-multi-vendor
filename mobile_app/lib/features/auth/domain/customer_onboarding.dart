import 'entities/app_user.dart';

/// UI steps for Customer auth onboarding. Backend flags remain authoritative.
enum CustomerOnboardingStep {
  done,
  phoneOtp,
  nameEmail,
  awaitEmailVerification,
}

const _placeholderEmailSuffixes = <String>[
  '@phone-otp.indovyapar.local',
  '@pending.indovyapar.local',
];

bool isPlaceholderCustomerEmail(String? email) {
  if (email == null || email.trim().isEmpty) return true;
  final lower = email.trim().toLowerCase();
  return _placeholderEmailSuffixes.any(lower.endsWith);
}

CustomerOnboardingStep resolveCustomerOnboardingStep(AppUser? user) {
  if (user == null) return CustomerOnboardingStep.done;
  if (!user.requiresAuthOnboarding) return CustomerOnboardingStep.done;

  final phoneOk = user.phoneVerified && (user.phone?.trim().isNotEmpty ?? false);
  if (!phoneOk) return CustomerOnboardingStep.phoneOtp;

  final hasRealEmail = !isPlaceholderCustomerEmail(user.email);
  final hasName =
      (user.firstName?.trim().isNotEmpty ?? false) || (user.lastName?.trim().isNotEmpty ?? false);

  if (!hasRealEmail || !hasName) return CustomerOnboardingStep.nameEmail;
  if (!user.emailVerified) return CustomerOnboardingStep.awaitEmailVerification;

  return CustomerOnboardingStep.nameEmail;
}

bool isAccountIncompleteFailure({String? code, Object? details}) {
  if (code == 'ACCOUNT_INCOMPLETE') return true;
  if (details is Map && details['needsAuthOnboarding'] == true && code == 'ACCOUNT_INCOMPLETE') {
    return true;
  }
  return false;
}
