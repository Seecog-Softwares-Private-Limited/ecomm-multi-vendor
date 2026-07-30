import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/notifications_repository.dart';
import '../domain/notification_preferences.dart';

final notificationPreferencesRepositoryProvider = Provider<NotificationsRepository>(
  (ref) => NotificationsRepository(ref.read(dioClientProvider)),
);

class NotificationPreferencesController extends AsyncNotifier<NotificationPreferences> {
  NotificationsRepository get _repo => ref.read(notificationPreferencesRepositoryProvider);

  @override
  Future<NotificationPreferences> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) {
      throw StateError('Not authenticated');
    }
    return _repo.getPreferences();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _repo.getPreferences());
  }

  Future<void> toggle(String apiKey, bool value) async {
    final current = state.value;
    if (current == null) return;

    state = AsyncData(applyPreference(current, apiKey, value));
    try {
      final updated = await _repo.updatePreferences(preferencePatch(apiKey, value));
      state = AsyncData(updated);
    } catch (error, stack) {
      state = AsyncData(current);
      Error.throwWithStackTrace(error, stack);
    }
  }
}

final notificationPreferencesControllerProvider =
    AsyncNotifierProvider<NotificationPreferencesController, NotificationPreferences>(
  NotificationPreferencesController.new,
);
