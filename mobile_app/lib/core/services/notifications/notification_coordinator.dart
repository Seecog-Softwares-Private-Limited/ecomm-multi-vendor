import 'app_notification_message.dart';
import 'local_notification_service.dart';
import 'push_notification_service.dart';

class NotificationCoordinator {
  NotificationCoordinator({
    required LocalNotificationService localNotificationService,
    required PushNotificationService pushNotificationService,
  })  : _localNotificationService = localNotificationService,
        _pushNotificationService = pushNotificationService;

  final LocalNotificationService _localNotificationService;
  final PushNotificationService _pushNotificationService;

  Future<void> initialize() async {
    try {
      await _localNotificationService.initialize();
    } catch (_) {
      // Local notifications are not supported on every platform (e.g. web).
    }
    await _pushNotificationService.initialize();
  }

  Future<bool> requestPermission() {
    return _localNotificationService.requestPermission();
  }

  Future<void> showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) {
    return _localNotificationService.show(
      AppNotificationMessage(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        title: title,
        body: body,
        payload: payload,
      ),
    );
  }

  Future<void> simulateForegroundPush({
    required String title,
    required String body,
  }) {
    return _pushNotificationService.handleForegroundMessage(
      AppNotificationMessage(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        title: title,
        body: body,
        payload: 'simulated_push',
      ),
    );
  }

  Future<String?> getDeviceToken() => _pushNotificationService.getDeviceToken();
}
