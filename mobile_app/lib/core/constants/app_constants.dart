/// App-wide constant values that are not environment-specific.
abstract final class AppConstants {
  const AppConstants._();

  static const String appName = 'IndoVyapar';
  static const String appTagline = 'Shop smart. Shop local.';

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 20);

  static const int defaultPageSize = 20;

  static const Duration splashMinDuration = Duration(milliseconds: 1200);
}

/// Keys used with persistent storage. Centralized to avoid typos/collisions.
abstract final class StorageKeys {
  const StorageKeys._();

  // Secure storage
  static const String authToken = 'auth_token';

  // Shared preferences
  static const String onboardingComplete = 'onboarding_complete';
  static const String rememberedEmail = 'remembered_email';
  static const String themeMode = 'theme_mode';
  static const String recentSearches = 'recent_searches';
  static const String language = 'app_language';
}
