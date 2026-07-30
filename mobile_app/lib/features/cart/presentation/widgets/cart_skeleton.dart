import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/shimmer_box.dart';
import '../../../commerce/presentation/widgets/premium_card.dart';

class CartSkeleton extends StatelessWidget {
  const CartSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        for (var i = 0; i < 3; i++) ...[
          const PremiumCard(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerBox(width: 100, height: 100, borderRadius: AppRadius.md),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShimmerBox(width: double.infinity, height: 16),
                      SizedBox(height: AppSpacing.sm),
                      ShimmerBox(width: 120, height: 14),
                      SizedBox(height: AppSpacing.md),
                      ShimmerBox(width: 100, height: 18),
                      SizedBox(height: AppSpacing.sm),
                      ShimmerBox(width: 80, height: 12),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
        const ShimmerBox(width: double.infinity, height: 160, borderRadius: AppRadius.lg),
      ],
    );
  }
}

class CartCarouselSkeleton extends StatelessWidget {
  const CartCarouselSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      itemCount: 4,
      separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
      itemBuilder: (_, _) => const ShimmerBox(width: 168, height: 280, borderRadius: AppRadius.lg),
    );
  }
}
