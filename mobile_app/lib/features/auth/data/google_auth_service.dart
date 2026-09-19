import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/config/env_config.dart';
import '../../../core/error/exceptions.dart';

/// Native Google Sign-in → Google ID token for `POST /api/auth/google`.
class GoogleAuthService {
  GoogleAuthService();

  bool _initialized = false;

  Future<void> _ensureInitialized() async {
    if (_initialized) return;
    final serverClientId = EnvConfig.googleServerClientId;
    if (serverClientId.isEmpty) {
      throw const ServerException(
        'Google Sign-in is not configured. Set GOOGLE_SERVER_CLIENT_ID in the app env.',
        code: 'GOOGLE_NOT_CONFIGURED',
      );
    }
    await GoogleSignIn.instance.initialize(serverClientId: serverClientId);
    _initialized = true;
  }

  /// Interactive Google Sign-in. Returns a backend-verifiable ID token.
  /// Throws [AppException] on cancel / missing token / config errors.
  Future<String> getIdToken() async {
    await _ensureInitialized();

    if (!GoogleSignIn.instance.supportsAuthenticate()) {
      throw const ServerException(
        'Google Sign-in is not supported on this device.',
        code: 'GOOGLE_UNSUPPORTED',
      );
    }

    try {
      final account = await GoogleSignIn.instance.authenticate();
      final idToken = account.authentication.idToken?.trim() ?? '';
      if (idToken.isEmpty) {
        throw const ServerException(
          'Unable to sign in with Google. Please try again.',
          code: 'GOOGLE_NO_ID_TOKEN',
        );
      }
      return idToken;
    } on GoogleSignInException catch (e) {
      switch (e.code) {
        case GoogleSignInExceptionCode.canceled:
          throw const AppException('Google Sign-In was cancelled.');
        case GoogleSignInExceptionCode.interrupted:
          throw const AppException('Google Sign-In was interrupted. Please try again.');
        case GoogleSignInExceptionCode.clientConfigurationError:
        case GoogleSignInExceptionCode.providerConfigurationError:
          throw const ServerException(
            'Google Sign-In is misconfigured. Check the Android OAuth client and SHA-1.',
            code: 'GOOGLE_CONFIG_ERROR',
          );
        case GoogleSignInExceptionCode.uiUnavailable:
          throw const ServerException(
            'Unable to open Google Sign-In. Please try again.',
            code: 'GOOGLE_UI_UNAVAILABLE',
          );
        default:
          throw const ServerException(
            'Unable to sign in with Google. Please try again.',
            code: 'GOOGLE_SIGN_IN_FAILED',
          );
      }
    }
  }

  Future<void> signOut() async {
    try {
      await _ensureInitialized();
      await GoogleSignIn.instance.signOut();
    } catch (_) {
      // Best-effort; app session logout still proceeds.
    }
  }
}
