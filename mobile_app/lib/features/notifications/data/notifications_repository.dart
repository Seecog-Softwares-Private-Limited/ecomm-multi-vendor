import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/app_notification.dart';
import '../domain/notification_preferences.dart';

class NotificationsRepository {
  NotificationsRepository(this._client);

  final DioClient _client;

  Future<({List<AppNotification> items, int unreadCount})> fetch({int limit = 100}) async {
    final data = await _client.get(
      ApiEndpoints.notifications,
      query: {'limit': limit.clamp(1, 100).toString()},
    );
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['notifications'] as List?) ?? const [];
    final unread = (map['unreadCount'] as num?)?.toInt() ?? 0;
    final items = list
        .whereType<Map>()
        .map((e) => AppNotification.fromApi(Map<String, dynamic>.from(e)))
        .toList(growable: false);
    return (items: items, unreadCount: unread);
  }

  Future<void> markRead(String id) async {
    await _client.patch(ApiEndpoints.notification(id));
  }

  Future<int> markAllRead() async {
    final data = await _client.patch(ApiEndpoints.notifications);
    final map = Map<String, dynamic>.from(data as Map);
    return (map['updated'] as num?)?.toInt() ?? 0;
  }

  Future<void> delete(String id) async {
    await _client.delete(ApiEndpoints.notification(id));
  }

  Future<NotificationPreferences> getPreferences() async {
    final data = await _client.get(ApiEndpoints.notificationPreferences);
    final map = Map<String, dynamic>.from(data as Map);
    final prefs = map['preferences'];
    if (prefs is! Map) {
      throw StateError('Invalid preferences response');
    }
    return NotificationPreferences.fromJson(Map<String, dynamic>.from(prefs));
  }

  Future<NotificationPreferences> updatePreferences(Map<String, bool> patch) async {
    final data = await _client.patch(ApiEndpoints.notificationPreferences, data: patch);
    final map = Map<String, dynamic>.from(data as Map);
    final prefs = map['preferences'];
    if (prefs is! Map) {
      throw StateError('Invalid preferences response');
    }
    return NotificationPreferences.fromJson(Map<String, dynamic>.from(prefs));
  }
}
