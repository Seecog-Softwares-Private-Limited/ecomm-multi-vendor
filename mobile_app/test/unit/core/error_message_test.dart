import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/utils/error_message.dart';

void main() {
  test('formatAppError extracts server message from Dio response', () {
    final error = DioException(
      requestOptions: RequestOptions(path: '/auth/login'),
      response: Response(
        requestOptions: RequestOptions(path: '/auth/login'),
        data: {'message': 'Email already exists'},
      ),
    );

    expect(formatAppError(error), 'Email already exists');
  });

  test('formatAppError strips Exception prefix', () {
    expect(
      formatAppError(Exception('Invalid credentials')),
      'Invalid credentials',
    );
  });
}
