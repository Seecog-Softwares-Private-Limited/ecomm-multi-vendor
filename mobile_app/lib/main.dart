import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'core/di/service_locator.dart';
import 'core/env/env_config.dart';
import 'core/logging/app_logger.dart';
import 'core/services/notifications/notification_coordinator.dart';
import 'core/storage/hive_database.dart';
import 'firebase/firebase_bootstrap.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseBootstrap.initialize();
  appLogger.i('Background FCM message received: ${message.messageId}');
}

Future<void> main() async {
  runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      await HiveDatabase.init();
      await EnvConfig.load();
      await FirebaseBootstrap.initialize();
      setupServiceLocator();

      if (FirebaseBootstrap.isAvailable) {
        FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
      }

      FlutterError.onError = (details) {
        appLogger.e(
          'Unhandled Flutter framework error',
          error: details.exception,
          stackTrace: details.stack,
        );
      };

      runApp(const ProviderScope(child: App()));

      WidgetsBinding.instance.addPostFrameCallback((_) {
        unawaited(sl<NotificationCoordinator>().initialize());
      });
    },
    (error, stackTrace) => appLogger.e(
      'Unhandled zoned error',
      error: error,
      stackTrace: stackTrace,
    ),
  );
}
