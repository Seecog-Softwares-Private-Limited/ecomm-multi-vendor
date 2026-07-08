import 'package:dio/dio.dart';

import '../storage/secure_storage_service.dart';

/// Attaches the bearer token (and matching cookie the Next.js backend accepts)
/// to every request when a session exists.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage);

  final SecureStorageService _storage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
      options.headers['Cookie'] = 'token=$token';
    }
    handler.next(options);
  }
}
