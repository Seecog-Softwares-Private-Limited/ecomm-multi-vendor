import 'package:dio/dio.dart';

import '../config/env_config.dart';
import '../constants/app_constants.dart';
import '../error/exceptions.dart';
import '../storage/secure_storage_service.dart';
import 'api_interceptors.dart';

/// Wraps [Dio] and normalizes the backend's `{ success, data }` /
/// `{ success, error }` envelope into either the raw `data` payload or a thrown
/// [AppException]. All repositories talk to the API through this client.
class DioClient {
  DioClient(SecureStorageService storage) {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.baseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        headers: const {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // We inspect the envelope ourselves; only 5xx should throw at Dio level.
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    _dio.interceptors.add(AuthInterceptor(storage));

    if (EnvConfig.logNetwork) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (Object obj) => _logSink(obj.toString()),
        ),
      );
    }
  }

  late final Dio _dio;

  // ignore: avoid_print
  static void _logSink(String line) => print(line);

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) =>
      _request(() => _dio.get(path, queryParameters: query));

  Future<dynamic> post(String path, {Object? data}) =>
      _request(() => _dio.post(path, data: data));

  Future<dynamic> patch(String path, {Object? data}) =>
      _request(() => _dio.patch(path, data: data));

  Future<dynamic> put(String path, {Object? data}) =>
      _request(() => _dio.put(path, data: data));

  Future<dynamic> delete(String path, {Object? data}) =>
      _request(() => _dio.delete(path, data: data));

  Future<dynamic> _request(Future<Response<dynamic>> Function() run) async {
    late final Response<dynamic> response;
    try {
      response = await run();
    } on DioException catch (e) {
      if (e.response != null) {
        return _unwrap(e.response!);
      }
      switch (e.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          throw const NetworkException('The connection timed out. Please try again.');
        case DioExceptionType.connectionError:
          throw const NetworkException();
        default:
          throw const ServerException('Unexpected network error.');
      }
    }
    return _unwrap(response);
  }

  dynamic _unwrap(Response<dynamic> response) {
    final status = response.statusCode ?? 0;
    final body = response.data;

    if (body is Map) {
      final success = body['success'] == true;
      if (success) return body['data'];

      final error = body['error'];
      final message = error is Map ? error['message']?.toString() : null;
      final code = error is Map ? error['code']?.toString() : null;
      final details = error is Map ? error['details'] : null;
      final resolved = message ?? 'Request failed ($status).';

      if (status == 401) throw UnauthorizedException(resolved);
      if (status == 422) throw ValidationException(resolved, details: details);
      throw ServerException(resolved, statusCode: status, code: code, details: details);
    }

    if (status >= 200 && status < 300) return body;
    throw ServerException('Unexpected server response ($status).', statusCode: status);
  }
}
