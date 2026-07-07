import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/features/auth/domain/entities/auth_session.dart';
import 'package:mobile_app/features/auth/domain/usecases/forgot_password_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/login_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/logout_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/register_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/restore_session_usecase.dart';
import 'package:mobile_app/features/auth/presentation/providers/auth_controller.dart';

class _MockRestoreSessionUseCase extends Mock implements RestoreSessionUseCase {}

class _MockLoginUseCase extends Mock implements LoginUseCase {}

class _MockRegisterUseCase extends Mock implements RegisterUseCase {}

class _MockForgotPasswordUseCase extends Mock implements ForgotPasswordUseCase {}

class _MockLogoutUseCase extends Mock implements LogoutUseCase {}

void main() {
  late _MockRestoreSessionUseCase restoreSessionUseCase;
  late _MockLoginUseCase loginUseCase;
  late _MockRegisterUseCase registerUseCase;
  late _MockForgotPasswordUseCase forgotPasswordUseCase;
  late _MockLogoutUseCase logoutUseCase;

  const session = AuthSession(
    accessToken: 'token',
    userId: 'user-1',
    email: 'user@example.com',
  );

  setUp(() {
    restoreSessionUseCase = _MockRestoreSessionUseCase();
    loginUseCase = _MockLoginUseCase();
    registerUseCase = _MockRegisterUseCase();
    forgotPasswordUseCase = _MockForgotPasswordUseCase();
    logoutUseCase = _MockLogoutUseCase();
  });

  AuthController buildController() {
    return AuthController(
      restoreSessionUseCase: restoreSessionUseCase,
      loginUseCase: loginUseCase,
      registerUseCase: registerUseCase,
      forgotPasswordUseCase: forgotPasswordUseCase,
      logoutUseCase: logoutUseCase,
    );
  }

  test('bootstrap sets unauthenticated when no stored session', () async {
    when(() => restoreSessionUseCase()).thenAnswer((_) async => null);

    final controller = buildController();
    await Future<void>.delayed(Duration.zero);

    expect(controller.state.status, AuthStatus.unauthenticated);
    expect(controller.state.session, isNull);
  });

  test('bootstrap restores authenticated session', () async {
    when(() => restoreSessionUseCase()).thenAnswer((_) async => session);

    final controller = buildController();
    await Future<void>.delayed(Duration.zero);

    expect(controller.state.status, AuthStatus.authenticated);
    expect(controller.state.session, session);
  });

  test('login updates state on success', () async {
    when(() => restoreSessionUseCase()).thenAnswer((_) async => null);
    when(
      () => loginUseCase(email: any(named: 'email'), password: any(named: 'password')),
    ).thenAnswer((_) async => session);

    final controller = buildController();
    await Future<void>.delayed(Duration.zero);

    await controller.login(email: 'user@example.com', password: 'secret');

    expect(controller.state.status, AuthStatus.authenticated);
    expect(controller.state.session, session);
    expect(controller.state.isSubmitting, isFalse);
  });

  test('login surfaces error message on failure', () async {
    when(() => restoreSessionUseCase()).thenAnswer((_) async => null);
    when(
      () => loginUseCase(email: any(named: 'email'), password: any(named: 'password')),
    ).thenThrow(Exception('Invalid credentials'));

    final controller = buildController();
    await Future<void>.delayed(Duration.zero);

    await controller.login(email: 'user@example.com', password: 'wrong');

    expect(controller.state.status, AuthStatus.unauthenticated);
    expect(controller.state.errorMessage, contains('Invalid credentials'));
    expect(controller.state.isSubmitting, isFalse);
  });
}
