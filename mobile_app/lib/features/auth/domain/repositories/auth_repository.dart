import '../entities/app_user.dart';

/// Result of loading the current session.
class AuthSession {
  const AuthSession({required this.user, this.stats});
  final AppUser user;
  final ProfileStats? stats;
}

/// Result of registration (email verification flow).
class RegisterResult {
  const RegisterResult({required this.message, this.verificationLink});
  final String message;
  final String? verificationLink;
}

/// Contract for authentication + session operations.
abstract interface class AuthRepository {
  Future<AuthSession> login({required String email, required String password});

  Future<RegisterResult> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  });

  Future<void> sendOtp(String phone, {bool resend});

  Future<AuthSession> verifyOtp({required String phone, required String code});

  Future<String> forgotPassword(String email);

  Future<AuthSession?> currentSession();

  Future<void> updateProfile({String? firstName, String? lastName, String? phone});

  Future<void> logout();
}
