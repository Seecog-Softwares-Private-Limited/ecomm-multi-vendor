import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/service_locator.dart';
import '../../../../core/services/notifications/notification_coordinator.dart';

final notificationCoordinatorProvider = Provider<NotificationCoordinator>((ref) {
  return sl<NotificationCoordinator>();
});
