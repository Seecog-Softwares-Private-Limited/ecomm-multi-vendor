import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  RetryInterceptor({required this.dio});

  final Dio dio;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final retries = (err.requestOptions.extra['retries'] as int?) ?? 0;
    final shouldRetry = retries < 2 && _isTransient(err);
    if (!shouldRetry) {
      handler.next(err);
      return;
    }

    await Future<void>.delayed(Duration(milliseconds: 300 * (retries + 1)));

    final options = err.requestOptions;
    options.extra['retries'] = retries + 1;
    try {
      final response = await dio.fetch<dynamic>(options);
      handler.resolve(response);
    } catch (error) {
      if (error is DioException) {
        handler.next(error);
        return;
      }
      handler.next(err);
    }
  }

  bool _isTransient(DioException error) {
    return error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError;
  }
}
