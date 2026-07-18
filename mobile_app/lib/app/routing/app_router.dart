import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/di/providers.dart';
import '../../features/addresses/presentation/pages/addresses_page.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/pages/edit_profile_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/pages/otp_login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/catalog/presentation/pages/categories_page.dart';
import '../../features/catalog/presentation/pages/category_products_page.dart';
import '../../features/catalog/presentation/pages/product_detail_page.dart';
import '../../features/home/presentation/pages/app_shell_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/home/presentation/pages/legal_page.dart';
import '../../features/home/presentation/pages/profile_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/orders/presentation/pages/checkout_page.dart';
import '../../features/orders/presentation/pages/order_detail_page.dart';
import '../../features/orders/presentation/pages/order_success_page.dart';
import '../../features/orders/presentation/pages/orders_page.dart';
import '../../features/search/presentation/pages/search_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/support/presentation/pages/support_page.dart';
import '../../features/profile/presentation/pages/complete_profile_page.dart';
import '../../features/wishlist/presentation/pages/wishlist_page.dart';
import 'app_routes.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// Routes that a guest is allowed to visit.
const _publicRoutes = <String>{
  AppRoutes.splash,
  AppRoutes.onboarding,
  AppRoutes.login,
  AppRoutes.register,
  AppRoutes.otpLogin,
  AppRoutes.forgotPassword,
};

/// Bridges Riverpod auth changes into a [Listenable] GoRouter can refresh on,
/// and centralizes the redirect logic.
class _AuthRouterNotifier extends ChangeNotifier {
  _AuthRouterNotifier(this._ref) {
    _ref.listen(authControllerProvider, (_, _) => notifyListeners());
  }

  final Ref _ref;

  String? redirect(BuildContext context, GoRouterState state) {
    final auth = _ref.read(authControllerProvider);
    final location = state.matchedLocation;

    if (auth.isLoading || !auth.hasValue) {
      return location == AppRoutes.splash ? null : AppRoutes.splash;
    }

    final authenticated = auth.value?.isAuthenticated ?? false;
    final needsProfile = auth.value?.user?.needsProfileCompletion ?? false;
    final onboardingDone = _ref.read(preferencesProvider).onboardingComplete;

    if (location == AppRoutes.splash) {
      if (authenticated) {
        return needsProfile ? AppRoutes.completeProfile : AppRoutes.home;
      }
      return onboardingDone ? AppRoutes.login : AppRoutes.onboarding;
    }

    if (authenticated && needsProfile && location != AppRoutes.completeProfile) {
      return AppRoutes.completeProfile;
    }
    if (authenticated && !needsProfile && location == AppRoutes.completeProfile) {
      return AppRoutes.home;
    }

    final isPublic = _publicRoutes.contains(location);
    if (!authenticated && !isPublic) return AppRoutes.login;
    if (authenticated && isPublic && location != AppRoutes.splash) return AppRoutes.home;
    return null;
  }
}

Page<void> _fade(Widget child, GoRouterState state) => CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionsBuilder: (_, animation, _, page) =>
          FadeTransition(opacity: animation, child: page),
    );

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = _AuthRouterNotifier(ref);
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (_, _) => const SplashPage()),
      GoRoute(path: AppRoutes.onboarding, builder: (_, _) => const OnboardingPage()),
      GoRoute(path: AppRoutes.login, builder: (_, _) => const LoginPage()),
      GoRoute(path: AppRoutes.register, builder: (_, _) => const RegisterPage()),
      GoRoute(path: AppRoutes.otpLogin, builder: (_, _) => const OtpLoginPage()),
      GoRoute(path: AppRoutes.forgotPassword, builder: (_, _) => const ForgotPasswordPage()),
      GoRoute(path: AppRoutes.completeProfile, builder: (_, _) => const CompleteProfilePage()),

      // Primary tabbed shell.
      StatefulShellRoute.indexedStack(
        builder: (_, _, navigationShell) => AppShellPage(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellNavigatorKey,
            routes: [GoRoute(path: AppRoutes.home, pageBuilder: (_, s) => _fade(const HomePage(), s))],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.categories, pageBuilder: (_, s) => _fade(const CategoriesPage(), s))],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.wishlist, pageBuilder: (_, s) => _fade(const WishlistPage(), s))],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.cart, pageBuilder: (_, s) => _fade(const CartPage(), s))],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.account, pageBuilder: (_, s) => _fade(const ProfilePage(), s))],
          ),
        ],
      ),

      // Catalog (pushed on top of the shell, full screen).
      GoRoute(path: AppRoutes.search, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const SearchPage()),
      GoRoute(
        path: '${AppRoutes.category}/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => CategoryProductsPage(
          slug: state.pathParameters['id']!,
          initialSubSlug: state.uri.queryParameters['sub'],
        ),
      ),
      GoRoute(
        path: '${AppRoutes.product}/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => ProductDetailPage(idOrSlug: state.pathParameters['id']!),
      ),

      // Commerce.
      GoRoute(path: AppRoutes.checkout, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const CheckoutPage()),
      GoRoute(
        path: AppRoutes.orderSuccess,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) {
          final extra = (state.extra as Map?) ?? const {};
          return OrderSuccessPage(
            orderId: extra['orderId'] as String? ?? '',
            total: (extra['total'] as num?)?.toDouble() ?? 0,
            paymentPending: extra['paymentPending'] as bool? ?? false,
          );
        },
      ),

      // Orders.
      GoRoute(path: AppRoutes.orders, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const OrdersPage()),
      GoRoute(
        path: '${AppRoutes.orders}/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => OrderDetailPage(orderId: state.pathParameters['id']!),
      ),

      // Account area.
      GoRoute(path: AppRoutes.editProfile, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const EditProfilePage()),
      GoRoute(path: AppRoutes.addresses, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const AddressesPage()),
      GoRoute(path: AppRoutes.notifications, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const NotificationsPage()),
      GoRoute(
        path: AppRoutes.support,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => SupportPage(orderId: state.uri.queryParameters['orderId']),
      ),
      GoRoute(path: AppRoutes.settings, parentNavigatorKey: _rootNavigatorKey, builder: (_, _) => const SettingsPage()),
      GoRoute(
        path: '${AppRoutes.legal}/:slug',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => LegalPage(slug: state.pathParameters['slug']!),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Route not found: ${state.uri}')),
    ),
  );
});
