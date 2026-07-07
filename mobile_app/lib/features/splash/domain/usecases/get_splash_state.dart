import '../entities/splash_state.dart';
import '../repositories/splash_repository.dart';

class GetSplashState {
  const GetSplashState(this.repository);

  final SplashRepository repository;

  SplashState call() => repository.getState();
}
