import '../entities/auth_session.dart';

abstract interface class AuthRepository {
  Future<AuthSession> login({
    required String email,
    required String password,
  });

  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  });

  Future<void> forgotPassword({required String email});
  Future<AuthSession?> restoreSession();
  Future<void> logout();
}
