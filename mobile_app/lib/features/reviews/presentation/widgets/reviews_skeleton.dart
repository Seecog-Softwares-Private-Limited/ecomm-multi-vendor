import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/shimmer_box.dart';

class ReviewsSkeleton extends StatelessWidget {
  const ReviewsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ShimmerBox(width: double.infinity, height: 140, borderRadius: AppRadius.lg),
        const SizedBox(height: AppSpacing.lg),
        for (var i = 0; i < 3; i++) ...[
          const ShimmerBox(width: double.infinity, height: 110, borderRadius: AppRadius.lg),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}
