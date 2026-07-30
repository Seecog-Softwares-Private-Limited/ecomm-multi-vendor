import 'package:shared_preferences/shared_preferences.dart';

import '../constants/app_constants.dart';

/// Non-sensitive persisted app preferences (onboarding, theme, remembered
/// email, recent searches). Wraps [SharedPreferences].
class PreferencesService {
  PreferencesService(this._prefs);

  final SharedPreferences _prefs;

  static Future<PreferencesService> create() async {
    final prefs = await SharedPreferences.getInstance();
    return PreferencesService(prefs);
  }

  // Onboarding
  bool get onboardingComplete => _prefs.getBool(StorageKeys.onboardingComplete) ?? false;
  Future<void> setOnboardingComplete(bool value) =>
      _prefs.setBool(StorageKeys.onboardingComplete, value);

  // Remember me
  String? get rememberedEmail => _prefs.getString(StorageKeys.rememberedEmail);
  Future<void> setRememberedEmail(String? email) async {
    if (email == null || email.isEmpty) {
      await _prefs.remove(StorageKeys.rememberedEmail);
    } else {
      await _prefs.setString(StorageKeys.rememberedEmail, email);
    }
  }

  // Theme mode: 'light' | 'dark' | 'system'
  String get themeMode => _prefs.getString(StorageKeys.themeMode) ?? 'system';
  Future<void> setThemeMode(String mode) => _prefs.setString(StorageKeys.themeMode, mode);

  // Recent searches
  List<String> get recentSearches => _prefs.getStringList(StorageKeys.recentSearches) ?? const [];
  Future<void> setRecentSearches(List<String> searches) =>
      _prefs.setStringList(StorageKeys.recentSearches, searches);

  // Language: 'en' | 'hi'
  String get language => _prefs.getString(StorageKeys.language) ?? 'en';
  Future<void> setLanguage(String code) => _prefs.setString(StorageKeys.language, code);

  Future<void> clear() => _prefs.clear();
}
