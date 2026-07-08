import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';

/// Talks to the `/api/auth/*` endpoints. Returns raw decoded maps; mapping to
/// entities happens in the repository.
class AuthRemoteDataSource {
  AuthRemoteDataSource(this._client);

  final DioClient _client;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final data = await _client.post(ApiEndpoints.login, data: {'email': email, 'password': password});
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> body) async {
    final data = await _client.post(ApiEndpoints.register, data: body);
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>?> me() async {
    final data = await _client.get(ApiEndpoints.me);
    final map = Map<String, dynamic>.from(data as Map);
    if (map['user'] == null) return null;
    return map;
  }

  Future<void> sendOtp(String phone, {bool resend = false}) async {
    await _client.post(ApiEndpoints.sendOtp, data: {'phone': phone, 'resend': resend});
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String code) async {
    final data = await _client.post(ApiEndpoints.verifyOtp, data: {'phone': phone, 'code': code});
    return Map<String, dynamic>.from(data as Map);
  }

  Future<String> forgotPassword(String email) async {
    final data = await _client.post(ApiEndpoints.forgotPassword, data: {'email': email});
    final map = Map<String, dynamic>.from(data as Map);
    return map['message']?.toString() ??
        'If an account exists with this email, a reset link has been sent.';
  }

  Future<void> updateProfile(Map<String, dynamic> body) async {
    await _client.patch(ApiEndpoints.me, data: body);
  }
}
