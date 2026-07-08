import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';

/// Supported UI languages. English is fully translated; additional languages
/// persist the user's choice, ready for localized copy.
enum AppLanguage {
  english('en', 'English'),
  hindi('hi', 'हिन्दी (Hindi)');

  const AppLanguage(this.code, this.label);
  final String code;
  final String label;

  static AppLanguage fromCode(String code) =>
      AppLanguage.values.firstWhere((l) => l.code == code, orElse: () => AppLanguage.english);
}

class LanguageController extends Notifier<AppLanguage> {
  @override
  AppLanguage build() => AppLanguage.fromCode(ref.read(preferencesProvider).language);

  Future<void> setLanguage(AppLanguage language) async {
    state = language;
    await ref.read(preferencesProvider).setLanguage(language.code);
  }
}

final languageProvider = NotifierProvider<LanguageController, AppLanguage>(LanguageController.new);
