import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/auth_session_model.dart';

class AuthLocalDataSource {
  AuthLocalDataSource(this._storage);

  final FlutterSecureStorage _storage;
  static const _sessionKey = 'auth_session';

  Future<void> persistSession(AuthSessionModel session) async {
    try {
      await _storage.write(key: _sessionKey, value: jsonEncode(session.toMap()));
    } catch (_) {
      // Test environments may not have secure storage bindings.
    }
  }

  Future<AuthSessionModel?> readSession() async {
    try {
      final raw = await _storage.read(key: _sessionKey);
      if (raw == null || raw.isEmpty) {
        return null;
      }
      return AuthSessionModel.fromMap(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearSession() async {
    try {
      await _storage.delete(key: _sessionKey);
    } catch (_) {
      // Test environments may not have secure storage bindings.
    }
  }
}
