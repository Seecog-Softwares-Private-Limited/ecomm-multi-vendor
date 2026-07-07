import 'package:firebase_messaging/firebase_messaging.dart';

import '../../../firebase/firebase_bootstrap.dart';
import '../../logging/app_logger.dart';
import 'app_notification_message.dart';
import 'local_notification_service.dart';
import 'push_notification_service.dart';

class FirebasePushNotificationService implements PushNotificationService {
  FirebasePushNotificationService(this._localNotificationService);

  final LocalNotificationService _localNotificationService;
  FirebaseMessaging? _messaging;

  @override
  Future<void> initialize() async {
    if (!FirebaseBootstrap.isAvailable) {
      appLogger.i(
        'FCM disabled. Add Firebase config via flutterfire configure, then build with --dart-define=FIREBASE_ENABLED=true.',
      );
      return;
    }

    _messaging = FirebaseMessaging.instance;
    await _messaging!.requestPermission();

    FirebaseMessaging.onMessage.listen((message) async {
      final notification = message.notification;
      if (notification == null) {
        return;
      }

      await handleForegroundMessage(
        AppNotificationMessage(
          id: message.hashCode,
          title: notification.title ?? 'Notification',
          body: notification.body ?? '',
          payload: message.data['payload']?.toString(),
        ),
      );
    });

    appLogger.i('Firebase Cloud Messaging listeners registered.');
  }

  @override
  Future<String?> getDeviceToken() async {
    if (_messaging == null) {
      return null;
    }
    return _messaging!.getToken();
  }

  @override
  Future<void> handleForegroundMessage(AppNotificationMessage message) {
    return _localNotificationService.show(message);
  }
}
