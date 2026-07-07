import '../../domain/entities/splash_state.dart';
import '../../domain/repositories/splash_repository.dart';

class SplashRepositoryImpl implements SplashRepository {
  @override
  SplashState getState() {
    return const SplashState(message: 'Foundation ready');
  }
}
