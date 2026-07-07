import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/features/splash/domain/entities/splash_state.dart';
import 'package:mobile_app/features/splash/domain/repositories/splash_repository.dart';
import 'package:mobile_app/features/splash/domain/usecases/get_splash_state.dart';

class _MockSplashRepository extends Mock implements SplashRepository {}

void main() {
  late _MockSplashRepository repository;
  late GetSplashState useCase;

  setUp(() {
    repository = _MockSplashRepository();
    useCase = GetSplashState(repository);
  });

  test('returns splash state from repository', () {
    const expected = SplashState(message: 'Foundation ready');

    when(() => repository.getState()).thenReturn(expected);

    expect(useCase(), expected);
    verify(() => repository.getState()).called(1);
  });
}
