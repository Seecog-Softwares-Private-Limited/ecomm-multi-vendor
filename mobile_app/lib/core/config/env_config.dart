import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Runtime environment (selected by build flavor / dart-define).
enum AppEnvironment { dev, prod }

/// Loads and exposes environment configuration from the bundled `.env` assets.
///
/// Selection order for each key: `--dart-define` override → `.env` file value →
/// hard-coded fallback. The active file is chosen by the `APP_FLAVOR`
/// dart-define, defaulting to dev in debug and prod in release builds.
abstract final class EnvConfig {
  const EnvConfig._();

  static bool _loaded = false;

  static AppEnvironment get environment {
    const flavor = String.fromEnvironment('APP_FLAVOR');
    if (flavor == 'prod') return AppEnvironment.prod;
    if (flavor == 'dev') return AppEnvironment.dev;
    return kReleaseMode ? AppEnvironment.prod : AppEnvironment.dev;
  }

  static bool get isProd => environment == AppEnvironment.prod;

  static Future<void> load() async {
    if (_loaded) return;
    final fileName = isProd ? 'assets/env/.env.prod' : 'assets/env/.env.dev';
    await dotenv.load(fileName: fileName);
    _loaded = true;
  }

  static String _read(String key, {required String fallback}) {
    if (_loaded) {
      final value = dotenv.env[key];
      if (value != null && value.isNotEmpty) return value;
    }
    return fallback;
  }

  /// Optional global override: `--dart-define=BASE_URL=...`
  static const String _baseUrlOverride = String.fromEnvironment('BASE_URL');

  /// Platform-specific overrides: `--dart-define=BASE_URL_IOS=...` / `BASE_URL_ANDROID=...`
  static const String _baseUrlIosOverride = String.fromEnvironment('BASE_URL_IOS');
  static const String _baseUrlAndroidOverride = String.fromEnvironment('BASE_URL_ANDROID');

  static String get baseUrl {
    if (_baseUrlOverride.isNotEmpty) return _baseUrlOverride;

    if (!kIsWeb) {
      try {
        if (Platform.isIOS || Platform.isMacOS) {
          if (_baseUrlIosOverride.isNotEmpty) return _baseUrlIosOverride;
          return _read('BASE_URL_IOS', fallback: 'http://127.0.0.1:3005');
        }
        if (Platform.isAndroid) {
          if (_baseUrlAndroidOverride.isNotEmpty) return _baseUrlAndroidOverride;
          return _read('BASE_URL_ANDROID', fallback: 'http://10.0.2.2:3005');
        }
      } catch (_) {
        // Platform can throw in some test environments.
      }
    }

    return _read('BASE_URL', fallback: 'https://indovyapar.com');
  }

  static bool get logNetwork =>
      _read('LOG_NETWORK', fallback: kDebugMode ? 'true' : 'false').toLowerCase() == 'true';

  /// Web OAuth client ID used as `serverClientId` so Google returns a
  /// backend-verifiable ID token (`aud` = this value).
  static const String _googleServerClientIdOverride =
      String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');

  static String get googleServerClientId {
    if (_googleServerClientIdOverride.isNotEmpty) {
      return _googleServerClientIdOverride;
    }
    return _read('GOOGLE_SERVER_CLIENT_ID', fallback: '');
  }
}
