import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../catalog/domain/entities/product.dart';
import '../../../catalog/presentation/widgets/rating_stars.dart';
import '../../domain/review_summary.dart';
import '../reviews_providers.dart';

class ReviewCard extends ConsumerWidget {
  const ReviewCard({
    required this.review,
    required this.productId,
    super.key,
  });

  final Review review;
  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final adaptive = context.adaptiveColors;
    final votes = ref.watch(reviewHelpfulVotesProvider);
    final loading = ref.watch(reviewHelpfulLoadingProvider);
    final voted = votes[review.id] ?? false;
    final helpfulCount = review.helpful;
    final isLoading = loading.contains(review.id);

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: adaptive.border.withValues(alpha: 0.7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: adaptive.primarySurface,
                child: Text(
                  reviewUserInitials(review.user),
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            review.user,
                            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ),
                        Text(
                          _formatReviewDate(review.date),
                          style: theme.textTheme.labelSmall?.copyWith(color: adaptive.textMuted),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        RatingStars(rating: review.rating.toDouble(), size: 14),
                        if (review.verified) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(AppRadius.xs),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified, size: 12, color: AppColors.success),
                                const SizedBox(width: 2),
                                Text(
                                  'Verified Purchase',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: AppColors.success,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if ((review.comment ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Text(review.comment!.trim(), style: theme.textTheme.bodyMedium),
          ],
          const SizedBox(height: AppSpacing.md),
          Semantics(
            button: true,
            label: voted ? 'Marked helpful' : 'Mark review helpful',
            enabled: !isLoading,
            child: OutlinedButton.icon(
              onPressed: isLoading ? null : () => _toggleHelpful(context, ref, voted),
              icon: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Icon(voted ? Icons.thumb_up : Icons.thumb_up_outlined, size: 18),
              label: Text('Helpful${helpfulCount > 0 ? ' ($helpfulCount)' : ''}'),
            ),
          ),
        ],
      ),
    );
  }

  String _formatReviewDate(String raw) {
    final parsed = DateTime.tryParse(raw);
    if (parsed == null) return raw;
    return Formatters.relativeTime(parsed);
  }

  Future<void> _toggleHelpful(BuildContext context, WidgetRef ref, bool currentlyVoted) async {
    final loadingNotifier = ref.read(reviewHelpfulLoadingProvider.notifier);
    loadingNotifier.setLoading(review.id, true);

    ref.read(reviewHelpfulVotesProvider.notifier).setVote(review.id, !currentlyVoted);

    try {
      final result = await ref.read(reviewsRepositoryProvider).toggleHelpful(review.id);
      ref.read(reviewHelpfulVotesProvider.notifier).setVote(review.id, result.voted);
      ref.invalidate(productReviewsListProvider(productId));
    } catch (error) {
      ref.read(reviewHelpfulVotesProvider.notifier).setVote(review.id, currentlyVoted);
      if (context.mounted) {
        context.showSnack(Failure.from(error).message, isError: true);
      }
    } finally {
      loadingNotifier.setLoading(review.id, false);
    }
  }
}
