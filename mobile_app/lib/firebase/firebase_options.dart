import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Placeholder Firebase options for release scaffolding.
///
/// Run `flutterfire configure` and replace this file, then build with:
/// `--dart-define=FIREBASE_ENABLED=true`
class DefaultFirebaseOptions {
  static bool get isConfigured {
    return const String.fromEnvironment(
      'FIREBASE_ENABLED',
      defaultValue: 'false',
    ) == 'true';
  }

  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Firebase web is not configured for this project.');
    }

    return switch (defaultTargetPlatform) {
      TargetPlatform.android => android,
      TargetPlatform.iOS => ios,
      _ => throw UnsupportedError(
          'Firebase is not configured for $defaultTargetPlatform.',
        ),
    };
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'REPLACE_WITH_FLUTTERFIRE_API_KEY',
    appId: 'REPLACE_WITH_FLUTTERFIRE_APP_ID',
    messagingSenderId: 'REPLACE_WITH_FLUTTERFIRE_SENDER_ID',
    projectId: 'REPLACE_WITH_FLUTTERFIRE_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_FLUTTERFIRE_STORAGE_BUCKET',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'REPLACE_WITH_FLUTTERFIRE_API_KEY',
    appId: 'REPLACE_WITH_FLUTTERFIRE_APP_ID',
    messagingSenderId: 'REPLACE_WITH_FLUTTERFIRE_SENDER_ID',
    projectId: 'REPLACE_WITH_FLUTTERFIRE_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_FLUTTERFIRE_STORAGE_BUCKET',
    iosBundleId: 'com.seecog.ecomm',
  );
}
