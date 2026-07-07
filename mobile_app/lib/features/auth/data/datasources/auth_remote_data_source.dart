import 'package:dio/dio.dart';

import '../../../../core/network/api_response_parser.dart';
import '../models/auth_session_model.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<AuthSessionModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/login',
      data: {'email': email, 'password': password},
    );
    return _parseSession(response, fallbackEmail: email);
  }

  Future<AuthSessionModel> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final parts = name.trim().split(RegExp(r'\s+'));
    final firstName = parts.isNotEmpty ? parts.first : name;
    final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : '';

    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/register',
      data: {
        'email': email,
        'password': password,
        'firstName': firstName,
        if (lastName.isNotEmpty) 'lastName': lastName,
      },
    );
    return _parseSession(response, fallbackEmail: email);
  }

  Future<void> forgotPassword({required String email}) {
    return _dio.post<void>(
      '/api/auth/forgot-password',
      data: {'email': email},
    );
  }

  AuthSessionModel _parseSession(
    Response<Map<String, dynamic>> response, {
    required String fallbackEmail,
  }) {
    final data = ApiResponseParser.unwrapData(response);
    final user = data['user'] as Map<String, dynamic>?;
    final userId = user?['id']?.toString();
    final email = user?['email']?.toString() ?? fallbackEmail;

    final accessToken = (data['token'] as String?) ??
        ApiResponseParser.extractAuthToken(response.headers);

    if (accessToken == null ||
        accessToken.isEmpty ||
        userId == null ||
        userId.isEmpty) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: user == null
            ? 'Account created. Please verify your email before signing in.'
            : 'Invalid credentials',
      );
    }

    return AuthSessionModel(
      accessToken: accessToken,
      userId: userId,
      email: email,
    );
  }
}
