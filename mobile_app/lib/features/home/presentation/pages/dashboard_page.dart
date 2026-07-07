import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/navigation/app_routes.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_button.dart';
import '../../../../core/design_system/widgets/app_card.dart';
import '../../../../core/design_system/widgets/indovyapar_logo.dart';
import '../../../../core/utils/responsive_layout.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final columns = switch (context.deviceType) {
      DeviceType.phone => 2,
      DeviceType.tablet => 3,
      DeviceType.desktop => 4,
    };

    return CustomScrollView(
      physics: const BouncingScrollPhysics(
        parent: AlwaysScrollableScrollPhysics(),
      ),
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.md,
            ),
            color: AppColors.brandGreen,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const IndovyaparLogo(
                  fontSize: 24,
                  variant: IndovyaparLogoVariant.light,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  AppConstants.appTagline,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                        letterSpacing: 1.5,
                      ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'Shop from lakhs of products with fast delivery',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.92),
                      ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          sliver: SliverToBoxAdapter(
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search products, brands and more',
                prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                suffixIcon: Container(
                  margin: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: IconButton(
                    onPressed: () => context.push(AppRoutes.products),
                    icon: const Icon(Icons.arrow_forward, color: Colors.white),
                  ),
                ),
              ),
              onSubmitted: (_) => context.push(AppRoutes.products),
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
              childAspectRatio: 1.1,
            ),
            delegate: SliverChildListDelegate([
              _QuickTile(
                icon: Icons.grid_view,
                label: 'Categories',
                color: AppColors.navCategories,
                onTap: () => context.push(AppRoutes.products),
              ),
              _QuickTile(
                icon: Icons.receipt_long,
                label: 'My Orders',
                color: AppColors.navOrders,
                onTap: () {},
              ),
              _QuickTile(
                icon: Icons.local_offer_outlined,
                label: 'Offers',
                color: AppColors.primary,
                onTap: () => context.push(AppRoutes.products),
              ),
              _QuickTile(
                icon: Icons.favorite_border,
                label: 'Wishlist',
                color: AppColors.navCart,
                onTap: () {},
              ),
            ]),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          sliver: SliverToBoxAdapter(
            child: AppCard(
              elevated: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Continue shopping',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Browse the latest products from trusted vendors across India.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppButton(
                    label: 'Browse products',
                    expanded: true,
                    onPressed: () => context.push(AppRoutes.products),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _QuickTile extends StatelessWidget {
  const _QuickTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Icon(icon, color: color, size: 28),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 14),
          ),
        ],
      ),
    );
  }
}
