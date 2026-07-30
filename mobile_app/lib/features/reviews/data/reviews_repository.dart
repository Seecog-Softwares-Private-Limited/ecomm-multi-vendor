import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../catalog/domain/entities/product.dart';
import '../domain/review_summary.dart';

class ReviewsRepository {
  ReviewsRepository(this._client);

  final DioClient _client;

  Future<ReviewSummary> fetchSummary(String productId) async {
    final data = await _client.get(ApiEndpoints.productReviewSummary(productId));
    return ReviewSummary.fromJson(Map<String, dynamic>.from(data as Map));
  }

  Future<List<Review>> fetchReviews(String productId, {int limit = 100}) async {
    final data = await _client.get(
      ApiEndpoints.productReviews(productId),
      query: {'limit': limit.clamp(1, 100)},
    );
    final list = (data as List?) ?? const [];
    return list
        .whereType<Map>()
        .map((e) => Review.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  Future<Review> submitReview(
    String productId, {
    required int rating,
    required String comment,
  }) async {
    final data = await _client.post(
      ApiEndpoints.productReviews(productId),
      data: {'rating': rating, 'comment': comment.trim()},
    );
    final map = Map<String, dynamic>.from(data as Map);
    final review = Map<String, dynamic>.from(map['review'] as Map);
    return Review(
      id: review['id']?.toString() ?? '',
      user: review['user']?.toString() ?? 'User',
      rating: (review['rating'] as num?)?.toInt() ?? rating,
      date: (review['createdAt']?.toString() ?? '').length >= 10
          ? review['createdAt'].toString().substring(0, 10)
          : DateTime.now().toIso8601String().substring(0, 10),
      comment: review['comment']?.toString(),
      verified: review['verified'] == true,
      helpful: (review['helpfulCount'] as num?)?.toInt() ?? 0,
    );
  }

  Future<({int helpfulCount, bool voted})> toggleHelpful(String reviewId) async {
    final data = await _client.post(ApiEndpoints.reviewHelpful(reviewId));
    final map = Map<String, dynamic>.from(data as Map);
    return (
      helpfulCount: (map['helpfulCount'] as num?)?.toInt() ?? 0,
      voted: map['voted'] == true,
    );
  }
}
