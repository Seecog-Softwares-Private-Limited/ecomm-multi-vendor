import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/features/auth/domain/usecases/forgot_password_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/login_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/logout_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/register_usecase.dart';
import 'package:mobile_app/features/auth/domain/usecases/restore_session_usecase.dart';
import 'package:mobile_app/features/auth/presentation/pages/login_page.dart';
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

  setUp(() {
    restoreSessionUseCase = _MockRestoreSessionUseCase();
    loginUseCase = _MockLoginUseCase();
    registerUseCase = _MockRegisterUseCase();
    forgotPasswordUseCase = _MockForgotPasswordUseCase();
    logoutUseCase = _MockLogoutUseCase();

    when(() => restoreSessionUseCase()).thenAnswer((_) async => null);
  });

  Widget buildLoginPage() {
    return ProviderScope(
      overrides: [
        authControllerProvider.overrideWith(
          (ref) => AuthController(
            restoreSessionUseCase: restoreSessionUseCase,
            loginUseCase: loginUseCase,
            registerUseCase: registerUseCase,
            forgotPasswordUseCase: forgotPasswordUseCase,
            logoutUseCase: logoutUseCase,
          ),
        ),
      ],
      child: const MaterialApp(home: LoginPage()),
    );
  }

  testWidgets('renders email, password, and sign-in controls', (tester) async {
    await tester.pumpWidget(buildLoginPage());
    await tester.pumpAndSettle();

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Email address'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Create account'), findsOneWidget);
    expect(find.text('Forgot password?'), findsOneWidget);
  });

  testWidgets('shows validation errors for empty fields', (tester) async {
    await tester.pumpWidget(buildLoginPage());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('This field is required'), findsNWidgets(2));
    verifyNever(
      () => loginUseCase(email: any(named: 'email'), password: any(named: 'password')),
    );
  });
}
