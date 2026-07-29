import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/notifications_repository.dart';
import '../domain/app_notification.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>(
  (ref) => NotificationsRepository(ref.read(dioClientProvider)),
);

class NotificationsController extends AsyncNotifier<List<AppNotification>> {
  @override
  Future<List<AppNotification>> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const [];
    final result = await ref.read(notificationsRepositoryProvider).fetch();
    return result.items;
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final result = await ref.read(notificationsRepositoryProvider).fetch();
      return result.items;
    });
  }

  Future<void> markRead(String id) async {
    await ref.read(notificationsRepositoryProvider).markRead(id);
    state = state.whenData(
      (items) => AsyncData([
        for (final n in items) if (n.id == id) n.copyWith(read: true) else n,
      ]),
    );
  }

  Future<void> markAllRead() async {
    await ref.read(notificationsRepositoryProvider).markAllRead();
    state = state.whenData(
      (items) => AsyncData([for (final n in items) n.copyWith(read: true)]),
    );
  }

  Future<void> delete(String id) async {
    await ref.read(notificationsRepositoryProvider).delete(id);
    await refresh();
  }
}

final notificationsControllerProvider =
    AsyncNotifierProvider<NotificationsController, List<AppNotification>>(NotificationsController.new);

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsControllerProvider).maybeWhen(
        data: (items) => items.where((n) => !n.read).length,
        orElse: () => 0,
      );
});
