import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'app_routes.dart';

/// Bottom-nav branch indices (must match [app_router.dart] branch order).
abstract final class ShellBranch {
  static const int home = 0;
  static const int categories = 1;
  static const int wishlist = 2;
  static const int cart = 3;
  static const int account = 4;
}

/// Remembers the previous shell tab when switching via bottom navigation or
/// in-tab shortcuts so Cart/Wishlist back can restore the originating tab.
class ShellBranchHistory extends Notifier<int?> {
  @override
  int? build() => null;

  void record(int branchIndex) => state = branchIndex;

  void clear() => state = null;
}

final shellBranchHistoryProvider =
    NotifierProvider<ShellBranchHistory, int?>(ShellBranchHistory.new);

/// Navigation helpers for shell tabs vs root-stack overlays.
abstract final class ShellNavigation {
  static const _shellTabPaths = {
    AppRoutes.home,
    AppRoutes.categories,
    AppRoutes.wishlist,
    AppRoutes.cart,
    AppRoutes.account,
  };

  static bool isShellTabLocation(String location) =>
      _shellTabPaths.contains(location.split('?').first);

  static bool isOverlayRoute(String location) {
    final path = location.split('?').first;
    return path == AppRoutes.cartOverlay || path == AppRoutes.wishlistOverlay;
  }

  /// Switch shell tab after recording the current branch for back navigation.
  static void goToTab(BuildContext context, WidgetRef ref, int branchIndex) {
    final shell = StatefulNavigationShell.maybeOf(context);
    if (shell == null) return;
    if (branchIndex != shell.currentIndex) {
      ref.read(shellBranchHistoryProvider.notifier).record(shell.currentIndex);
    }
    shell.goBranch(branchIndex);
  }

  /// Open cart — push overlay when on a root route, otherwise switch shell tab.
  static void openCart(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    if (isShellTabLocation(location)) {
      goToTab(context, ref, ShellBranch.cart);
    } else {
      context.push(AppRoutes.cartOverlay);
    }
  }

  /// Open wishlist — push overlay when on a root route, otherwise switch shell tab.
  static void openWishlist(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    if (isShellTabLocation(location)) {
      goToTab(context, ref, ShellBranch.wishlist);
    } else {
      context.push(AppRoutes.wishlistOverlay);
    }
  }

  /// Whether Cart/Wishlist should show a back affordance.
  static bool showBackButton(BuildContext context, WidgetRef ref) {
    if (context.canPop()) return true;
    if (isOverlayRoute(GoRouterState.of(context).matchedLocation)) return true;
    final previous = ref.watch(shellBranchHistoryProvider);
    final shell = StatefulNavigationShell.maybeOf(context);
    return shell != null && previous != null && previous != shell.currentIndex;
  }

  /// Handles AppBar leading and Android system back for Cart/Wishlist.
  static void handleBack(BuildContext context, WidgetRef ref) {
    if (context.canPop()) {
      context.pop();
      return;
    }

    final shell = StatefulNavigationShell.maybeOf(context);
    final previous = ref.read(shellBranchHistoryProvider);
    if (shell != null && previous != null && previous != shell.currentIndex) {
      shell.goBranch(previous);
      ref.read(shellBranchHistoryProvider.notifier).clear();
      return;
    }

    shell?.goBranch(ShellBranch.home);
  }

  /// Empty-state / fallback when there is no meaningful previous destination.
  static void continueShopping(BuildContext context, WidgetRef ref) {
    handleBack(context, ref);
  }
}

/// Wraps Cart/Wishlist with [PopScope] and optional AppBar back button.
class ShellTabBackScope extends ConsumerWidget {
  const ShellTabBackScope({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopScope(
      canPop: context.canPop(),
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) ShellNavigation.handleBack(context, ref);
      },
      child: child,
    );
  }
}

/// AppBar leading that respects shell tab history and navigation stack.
class ShellTabBackButton extends ConsumerWidget {
  const ShellTabBackButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (!ShellNavigation.showBackButton(context, ref)) {
      return const SizedBox.shrink();
    }
    return BackButton(onPressed: () => ShellNavigation.handleBack(context, ref));
  }
}
