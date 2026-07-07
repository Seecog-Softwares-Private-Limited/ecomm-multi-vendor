import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_bottom_sheets.dart';
import '../../../../core/design_system/widgets/app_button.dart';
import '../../../../core/design_system/widgets/app_card.dart';
import '../../../../core/design_system/widgets/app_dialogs.dart';
import '../../../../core/design_system/widgets/app_loading.dart';
import '../../../../core/design_system/widgets/app_state_views.dart';
import '../../../../core/design_system/widgets/app_text_field.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../auth/presentation/providers/auth_controller.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceType = context.deviceType;
    final horizontalPadding = switch (deviceType) {
      DeviceType.phone => AppSpacing.md,
      DeviceType.tablet => AppSpacing.xl,
      DeviceType.desktop => 120.0,
    };

    return Scaffold(
      appBar: AppBar(title: const Text('Design System Showcase')),
      body: ListView(
        padding: EdgeInsets.symmetric(
          horizontal: horizontalPadding,
          vertical: AppSpacing.lg,
        ),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Buttons', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: AppSpacing.md),
                AppButton(
                  label: 'Open Dialog',
                  expanded: true,
                  onPressed: () => showAppConfirmDialog(
                    context: context,
                    title: 'Confirm Action',
                    message: 'This is a reusable Material 3 dialog.',
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                AppButton(
                  label: 'Open Bottom Sheet',
                  expanded: true,
                  onPressed: () => showAppBottomSheet<void>(
                    context: context,
                    child: const Padding(
                      padding: EdgeInsets.all(AppSpacing.lg),
                      child: Text('Reusable bottom sheet content'),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const AppCard(
            child: Column(
              children: [
                AppTextField(
                  label: 'Email',
                  hintText: 'you@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                SizedBox(height: AppSpacing.md),
                AppTextField(
                  label: 'Password',
                  hintText: 'Enter your password',
                  obscureText: true,
                  prefixIcon: Icon(Icons.lock_outline),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Loading + Skeleton'),
                SizedBox(height: AppSpacing.md),
                AppLoadingIndicator(label: 'Loading content...'),
                SizedBox(height: AppSpacing.md),
                AppSkeletonBox(height: 14),
                SizedBox(height: AppSpacing.xs),
                AppSkeletonBox(height: 14, width: 220),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const AppCard(
            child: AppEmptyState(
              title: 'No items yet',
              message: 'Create your first item to populate this state.',
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const AppCard(
            child: AppErrorState(
              title: 'Something went wrong',
              message: 'Please try again in a moment.',
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Logout',
            expanded: true,
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
    );
  }
}
