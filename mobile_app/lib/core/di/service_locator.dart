import 'package:get_it/get_it.dart';

import '../network/dio_client.dart';
import '../storage/preferences_service.dart';
import '../storage/secure_storage_service.dart';

/// Global service locator. Core singletons are registered here at startup;
/// feature repositories will be registered in their respective phases.
final GetIt sl = GetIt.instance;

/// Initializes core dependencies. Must be awaited before `runApp`.
Future<void> initServiceLocator() async {
  // Storage
  sl.registerLazySingleton<SecureStorageService>(SecureStorageService.new);

  final preferences = await PreferencesService.create();
  sl.registerSingleton<PreferencesService>(preferences);

  // Network
  sl.registerLazySingleton<DioClient>(() => DioClient(sl<SecureStorageService>()));
}
