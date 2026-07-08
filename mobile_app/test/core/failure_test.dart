import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/core/error/exceptions.dart';
import 'package:indovyapar_customer/core/error/failure.dart';

void main() {
  group('Failure.from', () {
    test('maps UnauthorizedException to UnauthorizedFailure', () {
      final failure = Failure.from(const UnauthorizedException('expired'));
      expect(failure, isA<UnauthorizedFailure>());
      expect(failure.isUnauthorized, isTrue);
      expect(failure.message, 'expired');
    });

    test('maps NetworkException to NetworkFailure', () {
      final failure = Failure.from(const NetworkException());
      expect(failure, isA<NetworkFailure>());
    });

    test('maps ServerException to ServerFailure with status code', () {
      final failure = Failure.from(const ServerException('boom', statusCode: 500));
      expect(failure, isA<ServerFailure>());
      expect(failure.message, 'boom');
    });

    test('maps unknown errors to UnexpectedFailure', () {
      final failure = Failure.from(Exception('weird'));
      expect(failure, isA<UnexpectedFailure>());
    });
  });
}
