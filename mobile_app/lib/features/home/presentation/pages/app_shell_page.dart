import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/design_system/motion/app_haptics.dart';
import '../../../../core/design_system/widgets/app_button.dart';
import '../../../../core/design_system/widgets/indovyapar_bottom_nav.dart';
import '../../../../core/design_system/widgets/indovyapar_more_menu.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../../../auth/presentation/providers/auth_controller.dart';

class AppShellPage extends ConsumerWidget {
  const AppShellPage({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPhone = context.deviceType == DeviceType.phone;
    final isAuthenticated = ref.watch(authControllerProvider).status == AuthStatus.authenticated;
    final shellIndex = navigationShell.currentIndex;

    if (isPhone) {
      return Scaffold(
        body: navigationShell,
        bottomNavigationBar: IndovyaparBottomNav(
          activeKey: _activeNavKey(shellIndex),
          showOrders: isAuthenticated,
          onHomeTap: () => _goBranch(navigationShell, 0),
          onCategoriesTap: () => _goBranch(navigationShell, 1),
          onOrdersTap: () => _goBranch(navigationShell, 2),
          onCartTap: () => _openCartSheet(context),
          onMoreTap: () => _openMoreMenu(context, ref, isAuthenticated),
        ),
      );
    }

    return Scaffold(
      appBar: const AppBrandAppBar(),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: shellIndex.clamp(0, 3),
            onDestinationSelected: (index) => _goBranch(navigationShell, index),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.home_outlined),
                label: Text('Home'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.grid_view_outlined),
                label: Text('Categories'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.receipt_long_outlined),
                label: Text('Orders'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.person_outline),
                label: Text('Profile'),
              ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: navigationShell),
        ],
      ),
    );
  }

  static IndovyaparNavKey _activeNavKey(int shellIndex) {
    return switch (shellIndex) {
      0 => IndovyaparNavKey.home,
      1 => IndovyaparNavKey.categories,
      2 => IndovyaparNavKey.orders,
      _ => IndovyaparNavKey.more,
    };
  }

  static void _goBranch(StatefulNavigationShell shell, int index) {
    if (index != shell.currentIndex) {
      AppHaptics.selection();
    }
    shell.goBranch(index);
  }

  static void _openCartSheet(BuildContext context) {
    AppHaptics.selection();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const _CartSheet(),
    );
  }

  static void _openMoreMenu(BuildContext context, WidgetRef ref, bool isAuthenticated) {
    AppHaptics.selection();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => IndovyaparMoreMenu(
        isLoggedIn: isAuthenticated,
        onClose: () => Navigator.of(context).pop(),
        onLogout: isAuthenticated
            ? () async {
                Navigator.of(context).pop();
                await ref.read(authControllerProvider.notifier).logout();
              }
            : null,
      ),
    );
  }
}

class _CartSheet extends StatelessWidget {
  const _CartSheet();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.98),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 24),
              const Icon(Icons.shopping_cart_outlined, size: 48, color: Color(0xFFEA580C)),
              const SizedBox(height: 16),
              Text('Your cart is empty', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text(
                'Add products to your cart to checkout.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              AppButton(
                label: 'Continue shopping',
                expanded: true,
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
