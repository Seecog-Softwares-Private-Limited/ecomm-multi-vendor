import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';

/// Persisted list of the user's recent search terms (most recent first).
class RecentSearchesController extends Notifier<List<String>> {
  static const int _max = 10;

  @override
  List<String> build() => ref.read(preferencesProvider).recentSearches;

  Future<void> add(String term) async {
    final value = term.trim();
    if (value.isEmpty) return;
    final next = [
      value,
      ...state.where((e) => e.toLowerCase() != value.toLowerCase()),
    ].take(_max).toList();
    state = next;
    await ref.read(preferencesProvider).setRecentSearches(next);
  }

  Future<void> remove(String term) async {
    final next = state.where((e) => e != term).toList();
    state = next;
    await ref.read(preferencesProvider).setRecentSearches(next);
  }

  Future<void> clear() async {
    state = const [];
    await ref.read(preferencesProvider).setRecentSearches(const []);
  }
}

final recentSearchesProvider =
    NotifierProvider<RecentSearchesController, List<String>>(RecentSearchesController.new);

const List<String> kPopularSearches = [
  'Mobiles',
  'Kurti',
  'Shoes',
  'Headphones',
  'Watches',
  'Home decor',
  'Kitchen',
  'Toys',
];
