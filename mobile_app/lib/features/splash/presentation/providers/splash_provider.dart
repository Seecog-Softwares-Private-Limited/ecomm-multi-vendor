import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/service_locator.dart';
import '../../domain/usecases/get_splash_state.dart';

final splashProvider = Provider<String>((ref) {
  final useCase = sl<GetSplashState>();
  return useCase().message;
});
