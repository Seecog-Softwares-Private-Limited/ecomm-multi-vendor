import 'package:dio/dio.dart';

String formatAppError(Object error) {
  if (error is DioException) {
    final responseData = error.response?.data;
    if (responseData is Map) {
      final apiError = responseData['error'];
      if (apiError is Map) {
        final message = apiError['message'];
        if (message is String && message.isNotEmpty) {
          return message;
        }
      }
      final message = responseData['message'];
      if (message is String && message.isNotEmpty) {
        return message;
      }
    }
    if (error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.unknown) {
      return 'Cannot reach the server. Start the Indovyapar API (npm run dev) and check BASE_URL in mobile_app/assets/env/.env.dev.';
    }
    if (error.message != null && error.message!.isNotEmpty) {
      return error.message!;
    }
    return 'Network request failed. Please try again.';
  }

  final text = error.toString();
  const exceptionPrefix = 'Exception: ';
  if (text.startsWith(exceptionPrefix)) {
    return text.substring(exceptionPrefix.length);
  }
  return text;
}
