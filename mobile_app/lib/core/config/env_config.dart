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

  static const String _baseUrlOverride = String.fromEnvironment('BASE_URL');

  static String get baseUrl {
    if (_baseUrlOverride.isNotEmpty) return _baseUrlOverride;
    return _read('BASE_URL', fallback: 'https://indovyapar.com');
  }

  static bool get logNetwork =>
      _read('LOG_NETWORK', fallback: kDebugMode ? 'true' : 'false').toLowerCase() == 'true';
}
