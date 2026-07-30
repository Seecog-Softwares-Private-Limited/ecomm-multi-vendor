import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_snackbar.dart';
import '../../../catalog/presentation/catalog_providers.dart';
import '../reviews_providers.dart';
import 'star_rating_selector.dart';

Future<bool?> showWriteReviewSheet({
  required BuildContext context,
  required WidgetRef ref,
  required String productId,
  required String productName,
  required String idOrSlug,
}) {
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => WriteReviewSheet(
      productId: productId,
      productName: productName,
      idOrSlug: idOrSlug,
    ),
  );
}

class WriteReviewSheet extends ConsumerStatefulWidget {
  const WriteReviewSheet({
    required this.productId,
    required this.productName,
    required this.idOrSlug,
    super.key,
  });

  final String productId;
  final String productName;
  final String idOrSlug;

  @override
  ConsumerState<WriteReviewSheet> createState() => _WriteReviewSheetState();
}

class _WriteReviewSheetState extends ConsumerState<WriteReviewSheet> {
  final _commentController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  int _rating = 0;
  bool _submitting = false;
  bool _success = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating < 1) {
      context.showSnack('Please select a star rating.', isError: true);
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      await ref.read(reviewsRepositoryProvider).submitReview(
            widget.productId,
            rating: _rating,
            comment: _commentController.text.trim(),
          );
      ref.invalidate(productReviewSummaryProvider(widget.productId));
      ref.invalidate(productReviewsListProvider(widget.productId));
      ref.invalidate(productDetailProvider(widget.idOrSlug));
      if (!mounted) return;
      setState(() {
        _submitting = false;
        _success = true;
      });
      await Future<void>.delayed(const Duration(milliseconds: 900));
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(() => _submitting = false);
        context.showSnack(Failure.from(error).message, isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottom = MediaQuery.viewInsetsOf(context).bottom;

    if (_success) {
      return Padding(
        padding: EdgeInsets.fromLTRB(AppSpacing.xxl, AppSpacing.xl, AppSpacing.xxl, AppSpacing.xxl + bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: const Duration(milliseconds: 500),
              curve: Curves.elasticOut,
              builder: (context, value, child) => Transform.scale(scale: value, child: child),
              child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 72),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Review submitted!', style: theme.textTheme.titleLarge),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Thank you for sharing your experience.',
              style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg + bottom),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Write a Review', style: theme.textTheme.titleLarge),
              const SizedBox(height: AppSpacing.xs),
              Text(
                widget.productName,
                style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xl),
              StarRatingSelector(
                rating: _rating,
                onChanged: (value) => setState(() => _rating = value),
              ),
              const SizedBox(height: AppSpacing.lg),
              TextFormField(
                controller: _commentController,
                maxLines: 5,
                maxLength: 2000,
                decoration: const InputDecoration(
                  labelText: 'Your review',
                  hintText: 'Share details about quality, fit, delivery…',
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please write a comment.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppSpacing.lg),
              AppButton(
                label: 'Submit Review',
                isLoading: _submitting,
                onPressed: _submitting ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
