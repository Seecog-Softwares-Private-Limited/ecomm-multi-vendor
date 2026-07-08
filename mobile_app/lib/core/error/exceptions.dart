/// Low-level exceptions thrown by the data/network layer. These are caught and
/// mapped to [Failure]s (see `failure.dart`) before reaching the UI.
class AppException implements Exception {
  const AppException(this.message, {this.statusCode, this.code, this.details});

  final String message;
  final int? statusCode;
  final String? code;
  final Object? details;

  @override
  String toString() => 'AppException($statusCode, $code): $message';
}

/// No connectivity / timeout / socket errors.
class NetworkException extends AppException {
  const NetworkException([super.message = 'No internet connection. Please try again.']);
}

/// Non-2xx server responses / API error envelopes.
class ServerException extends AppException {
  const ServerException(super.message, {super.statusCode, super.code, super.details});
}

/// 401 responses — token missing/expired.
class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message = 'Your session has expired. Please log in again.'])
      : super(statusCode: 401);
}

/// 422 validation errors from the API.
class ValidationException extends AppException {
  const ValidationException(super.message, {super.details}) : super(statusCode: 422);
}

/// Local storage read/write errors.
class CacheException extends AppException {
  const CacheException([super.message = 'Local storage error.']);
}
