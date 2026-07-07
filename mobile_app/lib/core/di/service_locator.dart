import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/forgot_password_usecase.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';
import '../../features/auth/domain/usecases/register_usecase.dart';
import '../../features/auth/domain/usecases/restore_session_usecase.dart';
import '../../features/products/data/datasources/products_local_data_source.dart';
import '../../features/products/data/datasources/products_remote_data_source.dart';
import '../../features/products/data/repositories/products_repository_impl.dart';
import '../../features/products/domain/repositories/products_repository.dart';
import '../../features/products/domain/usecases/get_products_usecase.dart';
import '../../features/splash/data/repositories/splash_repository_impl.dart';
import '../../features/splash/domain/repositories/splash_repository.dart';
import '../../features/splash/domain/usecases/get_splash_state.dart';
import '../network/connectivity_service.dart';
import '../network/dio_client.dart';
import '../services/notifications/firebase_push_notification_service.dart';
import '../services/notifications/local_notification_service.dart';
import '../services/notifications/notification_coordinator.dart';
import '../services/notifications/push_notification_service.dart';

final sl = GetIt.instance;

void setupServiceLocator() {
  if (sl.isRegistered<Dio>()) {
    return;
  }

  sl.registerLazySingleton<FlutterSecureStorage>(FlutterSecureStorage.new);
  sl.registerLazySingleton<Connectivity>(() => Connectivity());
  sl.registerLazySingleton<ConnectivityService>(() => ConnectivityService(sl()));
  sl.registerLazySingleton<AuthLocalDataSource>(() => AuthLocalDataSource(sl()));
  sl.registerLazySingleton<DioClient>(
    () => DioClient(
      getAccessToken: () async => (await sl<AuthLocalDataSource>().readSession())
          ?.accessToken,
    ),
  );
  sl.registerLazySingleton<Dio>(() => sl<DioClient>().instance);
  sl.registerLazySingleton<AuthRemoteDataSource>(() => AuthRemoteDataSource(sl()));
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );
  sl.registerLazySingleton<LoginUseCase>(() => LoginUseCase(sl()));
  sl.registerLazySingleton<RegisterUseCase>(() => RegisterUseCase(sl()));
  sl.registerLazySingleton<ForgotPasswordUseCase>(
    () => ForgotPasswordUseCase(sl()),
  );
  sl.registerLazySingleton<RestoreSessionUseCase>(
    () => RestoreSessionUseCase(sl()),
  );
  sl.registerLazySingleton<LogoutUseCase>(() => LogoutUseCase(sl()));
  sl.registerLazySingleton<ProductsRemoteDataSource>(
    () => ProductsRemoteDataSource(sl()),
  );
  sl.registerLazySingleton<ProductsLocalDataSource>(ProductsLocalDataSource.new);
  sl.registerLazySingleton<ProductsRepository>(
    () => ProductsRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      connectivityService: sl(),
    ),
  );
  sl.registerLazySingleton<GetProductsUseCase>(() => GetProductsUseCase(sl()));
  sl.registerLazySingleton<SplashRepository>(SplashRepositoryImpl.new);
  sl.registerLazySingleton<GetSplashState>(() => GetSplashState(sl()));
  sl.registerLazySingleton<LocalNotificationService>(LocalNotificationService.new);
  sl.registerLazySingleton<PushNotificationService>(
    () => FirebasePushNotificationService(sl()),
  );
  sl.registerLazySingleton<NotificationCoordinator>(
    () => NotificationCoordinator(
      localNotificationService: sl(),
      pushNotificationService: sl(),
    ),
  );
}
