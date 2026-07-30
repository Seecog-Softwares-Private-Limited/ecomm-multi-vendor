import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/state_views.dart';
import '../../../auth/presentation/auth_controller.dart';
import '../../../catalog/presentation/widgets/rating_stars.dart';
import '../../domain/review_summary.dart';
import '../reviews_providers.dart';
import 'review_card.dart';
import 'review_distribution_bars.dart';
import 'reviews_empty_state.dart';
import 'reviews_skeleton.dart';
import 'reviews_sort_filter_bar.dart';
import 'write_review_sheet.dart';

class ProductReviewsSection extends ConsumerStatefulWidget {
  const ProductReviewsSection({
    required this.productId,
    required this.productName,
    required this.idOrSlug,
    this.scrollAnchorKey,
    super.key,
  });

  final String productId;
  final String productName;
  final String idOrSlug;
  final GlobalKey? scrollAnchorKey;

  @override
  ConsumerState<ProductReviewsSection> createState() => ProductReviewsSectionState();
}

class ProductReviewsSectionState extends ConsumerState<ProductReviewsSection> {
  ReviewSortOption _sort = ReviewSortOption.newest;
  ReviewFilterOption _filter = ReviewFilterOption.all;

  Future<void> openWriteReview() async {
    final authed = ref.read(isAuthenticatedProvider);
    if (!authed) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please sign in to write a review.')),
        );
      }
      return;
    }
    final canReview = await ref.read(canReviewProductProvider(widget.productId).future);
    if (!mounted) return;
    if (!canReview) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reviews are available after your order is delivered.')),
      );
      return;
    }
    final reviews = ref.read(productReviewsListProvider(widget.productId)).value ?? const [];
    final displayName = currentUserDisplayName(ref);
    if (userAlreadyReviewed(reviews, displayName)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You have already reviewed this product.')),
      );
      return;
    }
    await showWriteReviewSheet(
      context: context,
      ref: ref,
      productId: widget.productId,
      productName: widget.productName,
      idOrSlug: widget.idOrSlug,
    );
  }

  void _retry() {
    ref.invalidate(productReviewSummaryProvider(widget.productId));
    ref.invalidate(productReviewsListProvider(widget.productId));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final summaryAsync = ref.watch(productReviewSummaryProvider(widget.productId));
    final reviewsAsync = ref.watch(productReviewsListProvider(widget.productId));
    final canReviewAsync = ref.watch(canReviewProductProvider(widget.productId));

    final loading = summaryAsync.isLoading || reviewsAsync.isLoading;
    final error = summaryAsync.hasError ? summaryAsync.error : reviewsAsync.error;

    if (loading && !summaryAsync.hasValue && !reviewsAsync.hasValue) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ratings & Reviews', style: theme.textTheme.titleMedium),
              const SizedBox(height: AppSpacing.md),
              const ReviewsSkeleton(),
            ],
          ),
        ),
      );
    }

    if (error != null && !summaryAsync.hasValue && !reviewsAsync.hasValue) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: ErrorStateView(
            title: 'Could not load reviews',
            message: 'Check your connection and try again.',
            onRetry: _retry,
          ),
        ),
      );
    }

    final summary = summaryAsync.value;
    final allReviews = reviewsAsync.value ?? const [];
    final filtered = filterReviews(sortReviews(allReviews, _sort), _filter);

    return SliverToBoxAdapter(
      child: KeyedSubtree(
        key: widget.scrollAnchorKey,
        child: Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('Ratings & Reviews', style: theme.textTheme.titleMedium),
                ),
                canReviewAsync.maybeWhen(
                  data: (can) {
                    if (!can) return const SizedBox.shrink();
                    final already = userAlreadyReviewed(allReviews, currentUserDisplayName(ref));
                    if (already) return const SizedBox.shrink();
                    return AppButton(
                      label: 'Write Review',
                      icon: Icons.edit_outlined,
                      expanded: false,
                      variant: AppButtonVariant.secondary,
                      onPressed: openWriteReview,
                    );
                  },
                  orElse: () => const SizedBox.shrink(),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            if (summary != null && summary.reviewCount > 0) ...[
              _SummaryPanel(summary: summary),
              const SizedBox(height: AppSpacing.lg),
            ],
            if (allReviews.isEmpty)
              const ReviewsEmptyState()
            else ...[
              ReviewsSortFilterBar(
                sort: _sort,
                filter: _filter,
                onSortChanged: (value) => setState(() => _sort = value),
                onFilterChanged: (value) => setState(() => _filter = value),
              ),
              const SizedBox(height: AppSpacing.md),
              if (filtered.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                  child: Center(
                    child: Text(
                      'No reviews match this filter.',
                      style: theme.textTheme.bodyMedium?.copyWith(color: adaptive.textSecondary),
                    ),
                  ),
                )
              else
                for (final review in filtered)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: RepaintBoundary(
                      child: ReviewCard(review: review, productId: widget.productId),
                    ),
                  ),
            ],
          ],
        ),
        ),
      ),
    );
  }
}

class _SummaryPanel extends StatelessWidget {
  const _SummaryPanel({required this.summary});

  final ReviewSummary summary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: adaptive.border.withValues(alpha: 0.7)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Text(
                summary.avgRating.toStringAsFixed(1),
                style: theme.textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              RatingStars(rating: summary.avgRating, size: 18),
              const SizedBox(height: 4),
              Text(
                '${summary.reviewCount} review${summary.reviewCount == 1 ? '' : 's'}',
                style: theme.textTheme.bodySmall?.copyWith(color: adaptive.textMuted),
              ),
            ],
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(child: ReviewDistributionBars(summary: summary)),
        ],
      ),
    );
  }
}
