import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/auth/data/datasources/auth_remote_data_source.dart';

void main() {
  test('login rejects empty auth payload', () async {
    final dio = Dio();
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              data: <String, dynamic>{'success': true, 'data': <String, dynamic>{}},
            ),
          );
        },
      ),
    );
    final source = AuthRemoteDataSource(dio);

    expect(
      () => source.login(email: 'user@example.com', password: 'secret'),
      throwsA(isA<DioException>()),
    );
  });

  test('login parses valid auth payload', () async {
    final dio = Dio();
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              data: {
                'success': true,
                'data': {
                  'token': 'token-1',
                  'user': {
                    'id': 'user-1',
                    'email': 'user@example.com',
                  },
                },
              },
            ),
          );
        },
      ),
    );
    final source = AuthRemoteDataSource(dio);

    final session = await source.login(
      email: 'user@example.com',
      password: 'secret',
    );

    expect(session.accessToken, 'token-1');
    expect(session.userId, 'user-1');
    expect(session.email, 'user@example.com');
  });
}
