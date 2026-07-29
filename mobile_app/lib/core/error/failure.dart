import 'package:freezed_annotation/freezed_annotation.dart';

import 'exceptions.dart';

part 'failure.freezed.dart';

/// UI-facing, exhaustive representation of an error. Repositories convert
/// exceptions into a [Failure] so presentation code can pattern-match safely.
@freezed
sealed class Failure with _$Failure {
  const Failure._();

  const factory Failure.network([
    @Default('No internet connection. Please check your network and try again.') String message,
  ]) = NetworkFailure;

  const factory Failure.server({
    required String message,
    int? statusCode,
    String? code,
  }) = ServerFailure;

  const factory Failure.unauthorized([
    @Default('Your session has expired. Please log in again.') String message,
  ]) = UnauthorizedFailure;

  const factory Failure.validation({
    required String message,
    Map<String, dynamic>? details,
  }) = ValidationFailure;

  const factory Failure.unexpected([
    @Default('Something went wrong. Please try again.') String message,
  ]) = UnexpectedFailure;

  /// A short, user-friendly message safe to show in the UI.
  @override
  String get message => switch (this) {
        NetworkFailure(:final message) => message,
        ServerFailure(:final message) => message,
        UnauthorizedFailure(:final message) => message,
        ValidationFailure(:final message) => message,
        UnexpectedFailure(:final message) => message,
      };

  bool get isUnauthorized => this is UnauthorizedFailure;

  /// Maps a caught error into a [Failure].
  factory Failure.from(Object error) {
    if (error is UnauthorizedException) return Failure.unauthorized(error.message);
    if (error is ValidationException) {
      final details = error.details is Map ? Map<String, dynamic>.from(error.details as Map) : null;
      final detailMessage = _firstValidationDetail(details);
      return Failure.validation(
        message: detailMessage ?? error.message,
        details: details,
      );
    }
    if (error is NetworkException) return Failure.network(error.message);
    if (error is ServerException) {
      return Failure.server(
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
      );
    }
    if (error is AppException) return Failure.unexpected(error.message);
    return const Failure.unexpected();
  }

  static String? _firstValidationDetail(Map<String, dynamic>? details) {
    if (details == null || details.isEmpty) return null;
    for (final value in details.values) {
      final text = value?.toString().trim();
      if (text != null && text.isNotEmpty) return text;
    }
    return null;
  }
}
