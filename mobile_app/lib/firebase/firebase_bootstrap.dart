import 'package:firebase_core/firebase_core.dart';

import '../core/logging/app_logger.dart';
import 'firebase_options.dart';

abstract final class FirebaseBootstrap {
  static var _initialized = false;

  static bool get isAvailable => _initialized;

  static Future<void> initialize() async {
    if (_initialized || !DefaultFirebaseOptions.isConfigured) {
      return;
    }

    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      _initialized = true;
      appLogger.i('Firebase initialized for push notifications.');
    } catch (error, stackTrace) {
      appLogger.w(
        'Firebase initialization skipped. Run flutterfire configure and rebuild with FIREBASE_ENABLED=true.',
        error: error,
        stackTrace: stackTrace,
      );
    }
  }
}
