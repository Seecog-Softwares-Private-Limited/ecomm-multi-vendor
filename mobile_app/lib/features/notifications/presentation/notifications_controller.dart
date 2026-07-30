import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/notifications_repository.dart';
import '../domain/app_notification.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>(
  (ref) => NotificationsRepository(ref.read(dioClientProvider)),
);

class NotificationsState {
  const NotificationsState({
    required this.items,
    required this.unreadCount,
  });

  final List<AppNotification> items;
  final int unreadCount;

  NotificationsState copyWith({
    List<AppNotification>? items,
    int? unreadCount,
  }) {
    return NotificationsState(
      items: items ?? this.items,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

class NotificationsController extends AsyncNotifier<NotificationsState> {
  NotificationsRepository get _repo => ref.read(notificationsRepositoryProvider);

  @override
  Future<NotificationsState> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const NotificationsState(items: [], unreadCount: 0);
    return _load();
  }

  Future<NotificationsState> _load() async {
    final result = await _repo.fetch();
    return NotificationsState(items: result.items, unreadCount: result.unreadCount);
  }

  Future<void> refresh() async {
    final previous = state.value;
    if (previous != null) {
      state = AsyncData(previous);
    }
    state = await AsyncValue.guard(_load);
  }

  Future<void> markRead(String id) async {
    final current = state.value;
    if (current == null) return;
    final target = current.items.where((n) => n.id == id).firstOrNull;
    if (target == null || target.read) return;

    await _repo.markRead(id);
    final updatedItems = [
      for (final n in current.items)
        if (n.id == id) n.copyWith(read: true, readAt: DateTime.now()) else n,
    ];
    state = AsyncData(
      current.copyWith(
        items: updatedItems,
        unreadCount: (current.unreadCount - 1).clamp(0, 9999),
      ),
    );
  }

  Future<void> markAllRead() async {
    await _repo.markAllRead();
    final current = state.value;
    if (current == null) return;
    state = AsyncData(
      current.copyWith(
        items: [for (final n in current.items) n.copyWith(read: true, readAt: DateTime.now())],
        unreadCount: 0,
      ),
    );
  }

  Future<void> delete(String id) async {
    final current = state.value;
    if (current == null) return;
    final removed = current.items.where((n) => n.id == id).firstOrNull;
    await _repo.delete(id);
    final updatedItems = current.items.where((n) => n.id != id).toList(growable: false);
    final unreadDelta = removed != null && !removed.read ? 1 : 0;
    state = AsyncData(
      current.copyWith(
        items: updatedItems,
        unreadCount: (current.unreadCount - unreadDelta).clamp(0, 9999),
      ),
    );
  }
}

final notificationsControllerProvider =
    AsyncNotifierProvider<NotificationsController, NotificationsState>(NotificationsController.new);

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsControllerProvider).maybeWhen(
        data: (state) => state.unreadCount,
        orElse: () => 0,
      );
});

/// Client-side search query for the notification center.
final notificationsSearchQueryProvider = NotifierProvider<_NotificationsSearch, String>(
  _NotificationsSearch.new,
);

class _NotificationsSearch extends Notifier<String> {
  @override
  String build() => '';

  void update(String value) => state = value;
}

/// Category filter key: all | orders | payments | returns | offers | system
final notificationsCategoryFilterProvider = NotifierProvider<_NotificationsCategory, String>(
  _NotificationsCategory.new,
);

class _NotificationsCategory extends Notifier<String> {
  @override
  String build() => 'all';

  void update(String value) => state = value;
}

List<AppNotification> filterNotifications(
  List<AppNotification> items, {
  required String category,
  required String search,
}) {
  Iterable<AppNotification> result = items;

  if (category != 'all') {
    result = result.where((n) => n.categoryKey == category);
  }

  final q = search.trim().toLowerCase();
  if (q.isNotEmpty) {
    result = result.where((n) {
      if (n.title.toLowerCase().contains(q)) return true;
      if (n.body.toLowerCase().contains(q)) return true;
      if (n.orderId != null && n.orderId!.toLowerCase().contains(q)) return true;
      if (n.shortOrderId != null && n.shortOrderId!.toLowerCase().contains(q)) return true;
      return false;
    });
  }

  return result.toList(growable: false);
}

Map<String, int> countNotificationsByCategory(List<AppNotification> items) {
  final counts = <String, int>{
    'all': items.length,
    'orders': 0,
    'payments': 0,
    'returns': 0,
    'offers': 0,
    'system': 0,
  };
  for (final n in items) {
    counts[n.categoryKey] = (counts[n.categoryKey] ?? 0) + 1;
  }
  return counts;
}

const kNotificationCategories = <({String key, String label})>[
  (key: 'all', label: 'All'),
  (key: 'orders', label: 'Orders'),
  (key: 'payments', label: 'Payments'),
  (key: 'returns', label: 'Returns'),
  (key: 'offers', label: 'Offers'),
  (key: 'system', label: 'System'),
];
