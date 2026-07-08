import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/app_constants.dart';

/// Secure, encrypted key-value storage for sensitive data (auth token).
class SecureStorageService {
  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  Future<void> saveToken(String token) =>
      _storage.write(key: StorageKeys.authToken, value: token);

  Future<String?> readToken() => _storage.read(key: StorageKeys.authToken);

  Future<void> clearToken() => _storage.delete(key: StorageKeys.authToken);

  Future<void> clearAll() => _storage.deleteAll();
}
