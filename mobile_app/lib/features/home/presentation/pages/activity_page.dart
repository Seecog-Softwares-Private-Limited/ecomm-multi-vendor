import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/navigation/app_routes.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_button.dart';
import '../../../../core/design_system/widgets/app_card.dart';
import '../../../../core/utils/responsive_layout.dart';

class ActivityPage extends StatelessWidget {
  const ActivityPage({super.key});

  @override
  Widget build(BuildContext context) {
    final columns = switch (context.deviceType) {
      DeviceType.phone => 2,
      DeviceType.tablet => 3,
      DeviceType.desktop => 4,
    };

    final categories = const [
      ('Electronics', Icons.devices_outlined),
      ('Fashion', Icons.checkroom_outlined),
      ('Home', Icons.home_outlined),
      ('Beauty', Icons.spa_outlined),
      ('Sports', Icons.sports_soccer_outlined),
      ('Books', Icons.menu_book_outlined),
    ];

    return CustomScrollView(
      physics: const BouncingScrollPhysics(
        parent: AlwaysScrollableScrollPhysics(),
      ),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          sliver: SliverToBoxAdapter(
            child: Text(
              'Shop by category',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          sliver: SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.md,
              childAspectRatio: 0.95,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final (label, icon) = categories[index];
                return AppCard(
                  onTap: () => context.push(AppRoutes.products),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(icon, size: 32, color: AppColors.navCategories),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        label,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontSize: 14,
                            ),
                      ),
                    ],
                  ),
                );
              },
              childCount: categories.length,
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          sliver: SliverToBoxAdapter(
            child: AppButton(
              label: 'View all products',
              expanded: true,
              onPressed: () => context.push(AppRoutes.products),
            ),
          ),
        ),
      ],
    );
  }
}
