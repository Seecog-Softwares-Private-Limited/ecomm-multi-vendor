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

  Future<Map<String, dynamic>> loginWithGoogle(String idToken) async {
    final data = await _client.post(ApiEndpoints.google, data: {'idToken': idToken});
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> body) async {
    final data = await _client.post(ApiEndpoints.register, data: body);
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> sendRegisterEmailOtp(String email, {bool resend = false}) async {
    await _client.post(
      ApiEndpoints.registerEmailOtpSend,
      data: {'email': email, 'resend': resend},
    );
  }

  Future<String> verifyRegisterEmailOtp(String email, String otp) async {
    final data = await _client.post(
      ApiEndpoints.registerEmailOtpVerify,
      data: {'email': email, 'otp': otp},
    );
    final map = Map<String, dynamic>.from(data as Map);
    final token = map['emailProofToken']?.toString();
    if (token == null || token.isEmpty) {
      throw StateError('Email verification failed');
    }
    return token;
  }

  Future<void> sendRegisterPhoneOtp(String phone, {bool resend = false}) async {
    await _client.post(
      ApiEndpoints.registerPhoneOtpSend,
      data: {'phone': phone, 'resend': resend},
    );
  }

  Future<String> verifyRegisterPhoneOtp(String phone, String otp) async {
    final data = await _client.post(
      ApiEndpoints.registerPhoneOtpVerify,
      data: {'phone': phone, 'otp': otp},
    );
    final map = Map<String, dynamic>.from(data as Map);
    final token = map['phoneProofToken']?.toString();
    if (token == null || token.isEmpty) {
      throw StateError('Phone verification failed');
    }
    return token;
  }

  Future<void> sendOnboardingEmailOtp(String email, {bool resend = false}) async {
    await _client.post(
      ApiEndpoints.onboardingEmailOtpSend,
      data: {'email': email, 'resend': resend},
    );
  }

  Future<Map<String, dynamic>> verifyOnboardingEmailOtp(String email, String otp) async {
    final data = await _client.post(
      ApiEndpoints.onboardingEmailOtpVerify,
      data: {'email': email, 'otp': otp},
    );
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
    final data = await _client.post(
      ApiEndpoints.verifyOtp,
      data: {'phone': phone, 'otp': code, 'code': code},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<Map<String, dynamic>> submitOnboardingProfile({
    required String name,
    required String email,
  }) async {
    final data = await _client.post(
      ApiEndpoints.onboardingProfile,
      data: {'name': name, 'email': email},
    );
    return Map<String, dynamic>.from(data as Map);
  }

  Future<void> resendCustomerVerification(String email) async {
    await _client.post(ApiEndpoints.resendCustomerVerification, data: {'email': email});
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
