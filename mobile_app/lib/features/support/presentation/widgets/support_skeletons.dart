import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/shimmer_box.dart';

class HelpCenterSkeleton extends StatelessWidget {
  const HelpCenterSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      physics: const NeverScrollableScrollPhysics(),
      children: [
        const ShimmerBox(height: 48, borderRadius: AppRadius.lg),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            for (var i = 0; i < 3; i++) ...[
              if (i > 0) const SizedBox(width: AppSpacing.md),
              const Expanded(child: ShimmerBox(height: 88, borderRadius: AppRadius.lg)),
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        const ShimmerBox(width: 140, height: 18),
        const SizedBox(height: AppSpacing.md),
        for (var i = 0; i < 4; i++) ...[
          const ShimmerBox(height: 64, borderRadius: AppRadius.lg),
          const SizedBox(height: AppSpacing.sm),
        ],
      ],
    );
  }
}

class FaqListSkeleton extends StatelessWidget {
  const FaqListSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: 6,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (_, _) => const ShimmerBox(height: 72, borderRadius: AppRadius.lg),
    );
  }
}

class TicketListSkeleton extends StatelessWidget {
  const TicketListSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: 5,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (_, _) => const ShimmerBox(height: 118, borderRadius: AppRadius.lg),
    );
  }
}

class TicketDetailSkeleton extends StatelessWidget {
  const TicketDetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              ShimmerBox(height: 22, width: 220),
              SizedBox(height: AppSpacing.sm),
              ShimmerBox(height: 16, width: 160),
              SizedBox(height: AppSpacing.md),
              ShimmerBox(height: 64, borderRadius: AppRadius.lg),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            itemCount: 4,
            itemBuilder: (_, i) => Align(
              alignment: i.isEven ? Alignment.centerRight : Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: ShimmerBox(
                  width: MediaQuery.sizeOf(context).width * 0.65,
                  height: 64,
                  borderRadius: AppRadius.lg,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
