import '../../logging/app_logger.dart';
import 'app_notification_message.dart';
import 'local_notification_service.dart';

/// Push notification scaffold.
/// Replace with Firebase Messaging integration once `google-services.json`
/// and `firebase_options.dart` are added in the release phase.
abstract interface class PushNotificationService {
  Future<void> initialize();
  Future<String?> getDeviceToken();
  Future<void> handleForegroundMessage(AppNotificationMessage message);
}

class StubPushNotificationService implements PushNotificationService {
  StubPushNotificationService(this._localNotificationService);

  final LocalNotificationService _localNotificationService;

  @override
  Future<void> initialize() async {
    appLogger.i(
      'Push notifications scaffold ready. Configure Firebase Cloud Messaging to enable remote push.',
    );
  }

  @override
  Future<String?> getDeviceToken() async => null;

  @override
  Future<void> handleForegroundMessage(AppNotificationMessage message) {
    return _localNotificationService.show(message);
  }
}
