import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../network/dio_client.dart';
import '../storage/preferences_service.dart';
import '../storage/secure_storage_service.dart';
import 'service_locator.dart';

/// Riverpod bridge to the get_it-registered core singletons, so feature
/// providers can depend on them idiomatically.
final dioClientProvider = Provider<DioClient>((ref) => sl<DioClient>());

final secureStorageProvider = Provider<SecureStorageService>((ref) => sl<SecureStorageService>());

final preferencesProvider = Provider<PreferencesService>((ref) => sl<PreferencesService>());

/// App theme mode, persisted in shared preferences. Defaults to system.
class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final stored = ref.read(preferencesProvider).themeMode;
    return _fromString(stored);
  }

  Future<void> setMode(ThemeMode mode) async {
    state = mode;
    await ref.read(preferencesProvider).setThemeMode(_toString(mode));
  }

  static ThemeMode _fromString(String value) => switch (value) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };

  static String _toString(ThemeMode mode) => switch (mode) {
        ThemeMode.light => 'light',
        ThemeMode.dark => 'dark',
        ThemeMode.system => 'system',
      };
}

final themeModeProvider =
    NotifierProvider<ThemeModeController, ThemeMode>(ThemeModeController.new);
