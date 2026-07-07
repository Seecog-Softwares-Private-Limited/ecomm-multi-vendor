import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../constants/app_constants.dart';
import '../env/env_config.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

class DioClient {
  DioClient({required Future<String?> Function() getAccessToken}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.baseUrl,
        connectTimeout: const Duration(
          milliseconds: AppConstants.apiConnectTimeoutMs,
        ),
        receiveTimeout: const Duration(
          milliseconds: AppConstants.apiReceiveTimeoutMs,
        ),
      ),
    );

    _dio.interceptors.add(AuthInterceptor(getAccessToken: getAccessToken));
    _dio.interceptors.add(RetryInterceptor(dio: _dio));

    if (EnvConfig.shouldLogNetwork) {
      _dio.interceptors.add(
        PrettyDioLogger(requestBody: true, requestHeader: false),
      );
    }
  }

  late final Dio _dio;

  Dio get instance => _dio;
}
