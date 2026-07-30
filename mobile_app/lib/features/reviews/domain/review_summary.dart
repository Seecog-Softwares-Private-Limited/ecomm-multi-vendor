import '../../catalog/domain/entities/product.dart';

/// Rating summary from GET /api/products/:id/reviews/summary
class ReviewSummary {
  const ReviewSummary({
    required this.avgRating,
    required this.reviewCount,
    required this.distribution,
  });

  final double avgRating;
  final int reviewCount;
  final Map<int, int> distribution;

  factory ReviewSummary.fromJson(Map<String, dynamic> json) {
    final raw = json['distribution'];
    final dist = <int, int>{1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    if (raw is Map) {
      for (final entry in raw.entries) {
        final star = int.tryParse(entry.key.toString());
        if (star != null && star >= 1 && star <= 5) {
          dist[star] = (entry.value as num?)?.toInt() ?? 0;
        }
      }
    }
    return ReviewSummary(
      avgRating: (json['avgRating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      distribution: dist,
    );
  }

  int countForStar(int star) => distribution[star] ?? 0;

  double fractionForStar(int star) {
    if (reviewCount <= 0) return 0;
    return countForStar(star) / reviewCount;
  }
}

enum ReviewSortOption {
  newest('Newest'),
  highest('Highest Rating'),
  lowest('Lowest Rating'),
  mostHelpful('Most Helpful');

  const ReviewSortOption(this.label);
  final String label;
}

enum ReviewFilterOption {
  all('All'),
  star5('5★'),
  star4('4★'),
  star3('3★'),
  star2('2★'),
  star1('1★'),
  verified('Verified Purchase');

  const ReviewFilterOption(this.label);
  final String label;

  int? get minRating => switch (this) {
        ReviewFilterOption.star5 => 5,
        ReviewFilterOption.star4 => 4,
        ReviewFilterOption.star3 => 3,
        ReviewFilterOption.star2 => 2,
        ReviewFilterOption.star1 => 1,
        _ => null,
      };
}

List<Review> sortReviews(List<Review> reviews, ReviewSortOption sort) {
  final copy = [...reviews];
  switch (sort) {
    case ReviewSortOption.newest:
      copy.sort((a, b) => b.date.compareTo(a.date));
    case ReviewSortOption.highest:
      copy.sort((a, b) => b.rating.compareTo(a.rating));
    case ReviewSortOption.lowest:
      copy.sort((a, b) => a.rating.compareTo(b.rating));
    case ReviewSortOption.mostHelpful:
      copy.sort((a, b) => b.helpful.compareTo(a.helpful));
  }
  return copy;
}

List<Review> filterReviews(List<Review> reviews, ReviewFilterOption filter) {
  switch (filter) {
    case ReviewFilterOption.all:
      return reviews;
    case ReviewFilterOption.verified:
      return reviews.where((r) => r.verified).toList(growable: false);
    default:
      final star = filter.minRating!;
      return reviews.where((r) => r.rating == star).toList(growable: false);
  }
}

String reviewUserInitials(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first[0].toUpperCase();
  return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
}
