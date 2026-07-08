import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../domain/app_notification.dart';

/// Manages the locally-persisted notification feed. Seeds a small starter feed
/// on first launch so the notification centre is populated.
class NotificationsController extends Notifier<List<AppNotification>> {
  @override
  List<AppNotification> build() {
    final raw = ref.read(preferencesProvider).notificationsJson;
    if (raw == null || raw.isEmpty) {
      final seed = _seed();
      _persist(seed);
      return seed;
    }
    try {
      final decoded = jsonDecode(raw) as List;
      return decoded
          .whereType<Map>()
          .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      return const [];
    }
  }

  void _persist(List<AppNotification> items) {
    final json = jsonEncode(items.map((e) => e.toJson()).toList());
    ref.read(preferencesProvider).setNotificationsJson(json);
  }

  void markRead(String id) {
    state = [
      for (final n in state) if (n.id == id) n.copyWith(read: true) else n,
    ];
    _persist(state);
  }

  void markAllRead() {
    state = [for (final n in state) n.copyWith(read: true)];
    _persist(state);
  }

  void clearAll() {
    state = const [];
    _persist(state);
  }

  List<AppNotification> _seed() {
    final now = DateTime.now();
    return [
      AppNotification(
        id: 'welcome',
        title: 'Welcome to IndoVyapar!',
        body: 'Discover great products from local sellers at the best prices.',
        type: NotificationType.general,
        createdAt: now,
      ),
      AppNotification(
        id: 'offer-1',
        title: 'Mega Savings Days are live',
        body: 'Enjoy up to 60% off across categories. Limited time only!',
        type: NotificationType.offer,
        createdAt: now.subtract(const Duration(hours: 3)),
      ),
      AppNotification(
        id: 'offer-2',
        title: 'Free delivery unlocked',
        body: 'Get free delivery on every order above ₹500.',
        type: NotificationType.offer,
        createdAt: now.subtract(const Duration(days: 1)),
      ),
    ];
  }
}

final notificationsControllerProvider =
    NotifierProvider<NotificationsController, List<AppNotification>>(NotificationsController.new);

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsControllerProvider).where((n) => !n.read).length;
});
