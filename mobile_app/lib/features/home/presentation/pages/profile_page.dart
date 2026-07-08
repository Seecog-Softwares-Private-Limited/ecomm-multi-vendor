import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../auth/presentation/auth_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to sign in again to continue shopping.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(authControllerProvider.notifier).logout();
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final state = ref.watch(authControllerProvider).value;
    final user = state?.user;
    final stats = state?.stats;

    return Scaffold(
      appBar: AppBar(title: const Text('My Account')),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppColors.primary,
                  child: Text(user?.initials ?? '?',
                      style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.displayName ?? 'Guest', style: theme.textTheme.titleLarge),
                      Text(user?.email ?? '', style: theme.textTheme.bodySmall),
                      if ((user?.phone ?? '').isNotEmpty)
                        Text(user!.phone!, style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => context.push(AppRoutes.editProfile),
                  icon: const Icon(Icons.edit_outlined),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              children: [
                _StatCard(label: 'Orders', value: stats?.orderCount ?? 0, icon: Icons.receipt_long_outlined,
                    onTap: () => context.push(AppRoutes.orders)),
                const SizedBox(width: AppSpacing.md),
                _StatCard(label: 'Wishlist', value: stats?.wishlistCount ?? 0, icon: Icons.favorite_border,
                    onTap: () => context.go(AppRoutes.wishlist)),
                const SizedBox(width: AppSpacing.md),
                _StatCard(label: 'Addresses', value: stats?.addressCount ?? 0, icon: Icons.location_on_outlined,
                    onTap: () => context.push(AppRoutes.addresses)),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          _MenuGroup(title: 'Orders & shopping', tiles: [
            _MenuTile(icon: Icons.receipt_long_outlined, label: 'My orders', onTap: () => context.push(AppRoutes.orders)),
            _MenuTile(icon: Icons.favorite_border, label: 'My wishlist', onTap: () => context.go(AppRoutes.wishlist)),
            _MenuTile(icon: Icons.location_on_outlined, label: 'My addresses', onTap: () => context.push(AppRoutes.addresses)),
          ]),
          _MenuGroup(title: 'Preferences', tiles: [
            _MenuTile(icon: Icons.notifications_none, label: 'Notifications', onTap: () => context.push(AppRoutes.notifications)),
            _MenuTile(icon: Icons.settings_outlined, label: 'Settings', onTap: () => context.push(AppRoutes.settings)),
          ]),
          _MenuGroup(title: 'Help & legal', tiles: [
            _MenuTile(icon: Icons.support_agent, label: 'Help & support', onTap: () => context.push(AppRoutes.support)),
            _MenuTile(icon: Icons.privacy_tip_outlined, label: 'Privacy policy', onTap: () => context.push(AppRoutes.legalPath('privacy'))),
            _MenuTile(icon: Icons.description_outlined, label: 'Terms of service', onTap: () => context.push(AppRoutes.legalPath('terms'))),
            _MenuTile(icon: Icons.info_outline, label: 'About us', onTap: () => context.push(AppRoutes.legalPath('about'))),
          ]),
          const SizedBox(height: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: OutlinedButton.icon(
              onPressed: () => _confirmLogout(context, ref),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.error),
                minimumSize: const Size.fromHeight(50),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Log out'),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value, required this.icon, required this.onTap});
  final String label;
  final int value;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: Column(
              children: [
                Icon(icon, color: AppColors.primary),
                const SizedBox(height: AppSpacing.xs),
                Text('$value', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                Text(label, style: theme.textTheme.labelSmall),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MenuGroup extends StatelessWidget {
  const _MenuGroup({required this.title, required this.tiles});
  final String title;
  final List<Widget> tiles;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppColors.textMuted)),
          const SizedBox(height: AppSpacing.xs),
          Card(child: Column(children: tiles)),
        ],
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
      onTap: onTap,
    );
  }
}
