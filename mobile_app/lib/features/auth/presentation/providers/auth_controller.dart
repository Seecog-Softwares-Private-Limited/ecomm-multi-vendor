import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/service_locator.dart';
import '../../../../core/utils/error_message.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/usecases/forgot_password_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/restore_session_usecase.dart';

enum AuthStatus { checking, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    required this.status,
    this.session,
    this.errorMessage,
    this.isSubmitting = false,
  });

  final AuthStatus status;
  final AuthSession? session;
  final String? errorMessage;
  final bool isSubmitting;

  AuthState copyWith({
    AuthStatus? status,
    AuthSession? session,
    String? errorMessage,
    bool? isSubmitting,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController({
    required this.restoreSessionUseCase,
    required this.loginUseCase,
    required this.registerUseCase,
    required this.forgotPasswordUseCase,
    required this.logoutUseCase,
  })  :
        super(const AuthState(status: AuthStatus.checking)) {
    bootstrap();
  }

  final RestoreSessionUseCase restoreSessionUseCase;
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final ForgotPasswordUseCase forgotPasswordUseCase;
  final LogoutUseCase logoutUseCase;

  Future<void> bootstrap() async {
    final session = await restoreSessionUseCase();
    if (session == null) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }
    state = AuthState(status: AuthStatus.authenticated, session: session);
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final session = await loginUseCase(email: email, password: password);
      state = AuthState(status: AuthStatus.authenticated, session: session);
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: formatAppError(error),
      );
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final session = await registerUseCase(
        name: name,
        email: email,
        password: password,
      );
      state = AuthState(status: AuthStatus.authenticated, session: session);
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: formatAppError(error),
      );
    }
  }

  Future<void> forgotPassword({required String email}) async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      await forgotPasswordUseCase(email: email);
      state = state.copyWith(isSubmitting: false, clearError: true);
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: formatAppError(error),
      );
    }
  }

  Future<void> logout() async {
    await logoutUseCase();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
      return AuthController(
        restoreSessionUseCase: sl<RestoreSessionUseCase>(),
        loginUseCase: sl<LoginUseCase>(),
        registerUseCase: sl<RegisterUseCase>(),
        forgotPasswordUseCase: sl<ForgotPasswordUseCase>(),
        logoutUseCase: sl<LogoutUseCase>(),
      );
    });
