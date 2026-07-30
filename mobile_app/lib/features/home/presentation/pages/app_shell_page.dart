import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/shell_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../cart/presentation/cart_controller.dart';
import '../../../wishlist/presentation/wishlist_controller.dart';

/// Bottom-navigation shell hosting the five primary tabs. Uses GoRouter's
/// [StatefulNavigationShell] so each tab keeps its own navigation state.
class AppShellPage extends ConsumerWidget {
  const AppShellPage({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);
    final wishlistCount = ref.watch(wishlistedIdsProvider).length;

    void onTabSelected(int index) {
      if (index != navigationShell.currentIndex) {
        ref.read(shellBranchHistoryProvider.notifier).record(navigationShell.currentIndex);
      }
      navigationShell.goBranch(
        index,
        initialLocation: index == navigationShell.currentIndex,
      );
    }

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: onTabSelected,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view),
            label: 'Categories',
          ),
          NavigationDestination(
            icon: _Badged(count: wishlistCount, child: const Icon(Icons.favorite_border)),
            selectedIcon: _Badged(count: wishlistCount, child: const Icon(Icons.favorite)),
            label: 'Wishlist',
          ),
          NavigationDestination(
            icon: _Badged(count: cartCount, child: const Icon(Icons.shopping_cart_outlined)),
            selectedIcon: _Badged(count: cartCount, child: const Icon(Icons.shopping_cart)),
            label: 'Cart',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}

class _Badged extends StatelessWidget {
  const _Badged({required this.count, required this.child});
  final int count;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return child;
    return Badge(
      label: Text(count > 99 ? '99+' : '$count'),
      backgroundColor: AppColors.accentDark,
      child: child,
    );
  }
}
