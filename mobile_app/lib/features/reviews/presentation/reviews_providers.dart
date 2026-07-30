import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../catalog/domain/entities/product.dart';
import '../../orders/presentation/orders_providers.dart';
import '../data/reviews_repository.dart';
import '../domain/review_summary.dart';

final reviewsRepositoryProvider = Provider<ReviewsRepository>(
  (ref) => ReviewsRepository(ref.read(dioClientProvider)),
);

final productReviewSummaryProvider = FutureProvider.autoDispose.family<ReviewSummary, String>(
  (ref, productId) => ref.read(reviewsRepositoryProvider).fetchSummary(productId),
);

final productReviewsListProvider = FutureProvider.autoDispose.family<List<Review>, String>(
  (ref, productId) => ref.read(reviewsRepositoryProvider).fetchReviews(productId, limit: 100),
);

/// Local helpful vote state keyed by review id (from POST /api/reviews/:id/helpful).
class ReviewHelpfulVotes extends Notifier<Map<String, bool>> {
  @override
  Map<String, bool> build() => {};

  void setVote(String reviewId, bool voted) => state = {...state, reviewId: voted};
}

final reviewHelpfulVotesProvider =
    NotifierProvider<ReviewHelpfulVotes, Map<String, bool>>(ReviewHelpfulVotes.new);

/// Tracks reviews currently submitting helpful vote to prevent duplicate taps.
class ReviewHelpfulLoading extends Notifier<Set<String>> {
  @override
  Set<String> build() => {};

  bool isLoading(String reviewId) => state.contains(reviewId);

  void setLoading(String reviewId, bool loading) {
    state = loading ? {...state, reviewId} : state.where((id) => id != reviewId).toSet();
  }
}

final reviewHelpfulLoadingProvider =
    NotifierProvider<ReviewHelpfulLoading, Set<String>>(ReviewHelpfulLoading.new);

/// Whether the signed-in customer likely has a delivered order containing [productId].
final canReviewProductProvider = FutureProvider.autoDispose.family<bool, String>((ref, productId) async {
  final authed = ref.watch(isAuthenticatedProvider);
  if (!authed) return false;
  final orders = await ref.read(ordersRepositoryProvider).getOrders(status: 'DELIVERED');
  for (final order in orders) {
    if (order.previewItems.any((item) => item.productId == productId)) {
      return true;
    }
  }
  return false;
});

bool userAlreadyReviewed(List<Review> reviews, String? displayName) {
  if (displayName == null || displayName.trim().isEmpty) return false;
  final normalized = displayName.trim().toLowerCase();
  return reviews.any((r) => r.user.trim().toLowerCase() == normalized);
}

String? currentUserDisplayName(WidgetRef ref) {
  final user = ref.read(authControllerProvider).value?.user;
  if (user == null) return null;
  final parts = [user.firstName, user.lastName].where((p) => p != null && p.trim().isNotEmpty);
  final name = parts.join(' ').trim();
  return name.isEmpty ? null : name;
}
