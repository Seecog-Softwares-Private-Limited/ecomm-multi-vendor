import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/shimmer_box.dart';

class CheckoutSkeleton extends StatelessWidget {
  const CheckoutSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: const [
        ShimmerBox(width: double.infinity, height: 120, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.md),
        ShimmerBox(width: double.infinity, height: 180, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.md),
        ShimmerBox(width: double.infinity, height: 160, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.md),
        ShimmerBox(width: double.infinity, height: 200, borderRadius: AppRadius.lg),
      ],
    );
  }
}

class OrdersSkeleton extends StatelessWidget {
  const OrdersSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        for (var i = 0; i < 4; i++) ...[
          const ShimmerBox(width: double.infinity, height: 130, borderRadius: AppRadius.lg),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class OrderDetailSkeleton extends StatelessWidget {
  const OrderDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: const [
        ShimmerBox(width: double.infinity, height: 80, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.lg),
        ShimmerBox(width: double.infinity, height: 280, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.lg),
        ShimmerBox(width: double.infinity, height: 120, borderRadius: AppRadius.lg),
        SizedBox(height: AppSpacing.md),
        ShimmerBox(width: double.infinity, height: 120, borderRadius: AppRadius.lg),
      ],
    );
  }
}
