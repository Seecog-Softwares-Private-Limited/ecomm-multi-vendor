import 'package:dio/dio.dart';

/// Cookie name used by the Next.js API (see src/lib/auth/config.ts).
const authCookieName = 'auth_token';

/// Parses Indovyapar API envelopes: `{ success, data }` / `{ success, error }`.
abstract final class ApiResponseParser {
  static Map<String, dynamic> unwrapData(Response<Map<String, dynamic>> response) {
    final body = response.data;
    if (body == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Empty server response',
      );
    }

    if (body['success'] == false) {
      final error = body['error'];
      final message = error is Map
          ? (error['message'] as String? ?? 'Request failed')
          : 'Request failed';
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        message: message,
      );
    }

    final data = body['data'];
    if (data is Map<String, dynamic>) {
      return data;
    }
    if (data is List) {
      return {'items': data};
    }
    if (data == null && body.containsKey('user')) {
      return body;
    }

    throw DioException(
      requestOptions: response.requestOptions,
      message: 'Unexpected server response',
    );
  }

  static String? extractAuthToken(Headers headers) {
    final raw = headers['set-cookie'];
    if (raw == null || raw.isEmpty) return null;

    for (final cookie in raw) {
      final match = RegExp('$authCookieName=([^;]+)').firstMatch(cookie);
      if (match != null) {
        return Uri.decodeComponent(match.group(1)!);
      }
    }
    return null;
  }
}
