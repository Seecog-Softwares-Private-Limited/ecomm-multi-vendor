import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../core/widgets/state_views.dart';
import '../catalog_providers.dart';

/// The "Categories" tab — a browsable department list with subcategories.
class CategoriesPage extends ConsumerWidget {
  const CategoriesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tree = ref.watch(categoryTreeProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Categories'),
        actions: [
          IconButton(
            onPressed: () => context.push(AppRoutes.search),
            icon: const Icon(Icons.search),
          ),
        ],
      ),
      body: tree.when(
        loading: () => const AppLoader(message: 'Loading categories…'),
        error: (error, _) => ErrorStateView(
          message: 'Could not load categories.',
          onRetry: () => ref.invalidate(categoryTreeProvider),
        ),
        data: (categories) {
          if (categories.isEmpty) {
            return const EmptyStateView(
              title: 'No categories yet',
              message: 'Check back soon as our catalog grows.',
              icon: Icons.category_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(categoryTreeProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: categories.length,
              itemBuilder: (context, i) {
                final category = categories[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        InkWell(
                          onTap: () => context.push(AppRoutes.categoryPath(category.slug)),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: context.adaptiveColors.primarySurface,
                                  shape: BoxShape.circle,
                                ),
                                child: (category.icon ?? '').trim().isEmpty
                                    ? const Icon(Icons.category_outlined, color: AppColors.primary, size: 22)
                                    : Text(category.icon!, style: const TextStyle(fontSize: 20)),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Text(category.name, style: Theme.of(context).textTheme.titleMedium),
                              ),
                              Icon(Icons.chevron_right, color: context.adaptiveColors.textMuted),
                            ],
                          ),
                        ),
                        if (category.subcategories.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.md),
                          Wrap(
                            spacing: AppSpacing.sm,
                            runSpacing: AppSpacing.sm,
                            children: [
                              for (final sub in category.subcategories)
                                ActionChip(
                                  label: Text(sub.name),
                                  onPressed: () => context.push(
                                    '${AppRoutes.categoryPath(category.slug)}?sub=${sub.slug}',
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
