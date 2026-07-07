import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/navigation/app_routes.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_spacing.dart';
import 'app_button.dart';

class IndovyaparMoreMenu extends StatelessWidget {
  const IndovyaparMoreMenu({
    required this.isLoggedIn,
    required this.onClose,
    super.key,
    this.onLogout,
  });

  final bool isLoggedIn;
  final VoidCallback onClose;
  final VoidCallback? onLogout;

  @override
  Widget build(BuildContext context) {
    final quickLinks = isLoggedIn
        ? const [
            _QuickLink(Icons.receipt_long_outlined, 'Orders', AppRoutes.orders),
            _QuickLink(Icons.favorite_border, 'Wishlist', AppRoutes.dashboard),
            _QuickLink(Icons.person_outline, 'My Profile', AppRoutes.profile),
            _QuickLink(Icons.support_agent_outlined, 'Support', AppRoutes.dashboard),
          ]
        : const <_QuickLink>[];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: Colors.white.withValues(alpha: 0.7)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2E0F172A),
            blurRadius: 50,
            offset: Offset(0, -20),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.borderStrong,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              if (quickLinks.isNotEmpty) ...[
                Text(
                  'QUICK LINKS',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: AppSpacing.md),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: AppSpacing.sm,
                  crossAxisSpacing: AppSpacing.sm,
                  childAspectRatio: 2.6,
                  children: quickLinks.map((link) {
                    return _QuickLinkTile(
                      link: link,
                      onTap: () {
                        onClose();
                        context.go(link.route);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: AppSpacing.md),
                const Divider(color: AppColors.border),
                const SizedBox(height: AppSpacing.md),
              ],
              if (isLoggedIn)
                AppButton(
                  label: 'Logout',
                  expanded: true,
                  variant: AppButtonVariant.outline,
                  onPressed: onLogout,
                )
              else
                AppButton(
                  label: 'Login',
                  expanded: true,
                  leading: const Icon(Icons.login, color: Colors.white, size: 20),
                  onPressed: () {
                    onClose();
                    context.go(AppRoutes.login);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickLink {
  const _QuickLink(this.icon, this.label, this.route);

  final IconData icon;
  final String label;
  final String route;
}

class _QuickLinkTile extends StatelessWidget {
  const _QuickLinkTile({required this.link, required this.onTap});

  final _QuickLink link;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: Row(
            children: [
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFFFF5EF), Color(0xFFFFE4CC)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Icon(link.icon, color: AppColors.primary, size: 20),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  link.label,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 14),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
