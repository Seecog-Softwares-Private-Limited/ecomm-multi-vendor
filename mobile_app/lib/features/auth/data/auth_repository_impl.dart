import '../../../core/error/exceptions.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../domain/entities/app_user.dart';
import '../domain/repositories/auth_repository.dart';
import 'auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._storage);

  final AuthRemoteDataSource _remote;
  final SecureStorageService _storage;

  Future<AuthSession> _persistSession(Map<String, dynamic> data) async {
    final token = data['token']?.toString();
    if (token != null && token.isNotEmpty) {
      await _storage.saveToken(token);
    }
    final user = AppUser.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    return AuthSession(user: user);
  }

  @override
  Future<AuthSession> login({required String email, required String password}) async {
    final data = await _remote.login(email, password);
    await _persistSession(data);
    // Refresh with stats from /me for a complete session.
    return (await currentSession()) ?? await _persistSession(data);
  }

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    final data = await _remote.register({
      'email': email,
      'password': password,
      if (firstName != null && firstName.isNotEmpty) 'firstName': firstName,
      if (lastName != null && lastName.isNotEmpty) 'lastName': lastName,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
    });
    return RegisterResult(
      message: data['message']?.toString() ?? 'Account created. Please verify your email.',
      verificationLink: data['verificationLink']?.toString(),
    );
  }

  @override
  Future<void> sendOtp(String phone, {bool resend = false}) =>
      _remote.sendOtp(phone, resend: resend);

  @override
  Future<AuthSession> verifyOtp({required String phone, required String code}) async {
    final data = await _remote.verifyOtp(phone, code);
    await _persistSession(data);
    return (await currentSession()) ?? await _persistSession(data);
  }

  @override
  Future<String> forgotPassword(String email) => _remote.forgotPassword(email);

  @override
  Future<AuthSession?> currentSession() async {
    // No token → guest. Skip the network call entirely so guest launches are
    // instant and work offline.
    final token = await _storage.readToken();
    if (token == null || token.isEmpty) return null;

    try {
      final data = await _remote.me();
      if (data == null) return null;
      final user = AppUser.fromJson(Map<String, dynamic>.from(data['user'] as Map));
      final statsRaw = data['stats'];
      final stats = statsRaw is Map
          ? ProfileStats.fromJson(Map<String, dynamic>.from(statsRaw))
          : null;
      return AuthSession(user: user, stats: stats);
    } on UnauthorizedException {
      // Stored token is stale/invalid — drop it so we don't keep retrying.
      await _storage.clearToken();
      return null;
    }
  }

  @override
  Future<void> updateProfile({String? firstName, String? lastName, String? phone}) {
    return _remote.updateProfile({
      'firstName': ?firstName,
      'lastName': ?lastName,
      'phone': ?phone,
    });
  }

  @override
  Future<void> logout() => _storage.clearToken();
}
