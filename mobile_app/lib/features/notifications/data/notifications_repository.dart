import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/app_notification.dart';

class NotificationsRepository {
  NotificationsRepository(this._client);

  final DioClient _client;

  Future<({List<AppNotification> items, int unreadCount})> fetch({int limit = 50}) async {
    final data = await _client.get(ApiEndpoints.notifications, query: {'limit': limit});
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
    await _client.patch(ApiEndpoints.notification(id), data: {'read': true});
  }

  Future<void> markAllRead() async {
    await _client.patch(ApiEndpoints.notifications);
  }

  Future<void> delete(String id) async {
    await _client.delete(ApiEndpoints.notification(id));
  }
}
