import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/design_system/motion/app_page_transitions.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';
import '../../features/home/presentation/pages/activity_page.dart';
import '../../features/home/presentation/pages/app_shell_page.dart';
import '../../features/home/presentation/pages/dashboard_page.dart';
import '../../features/home/presentation/pages/orders_page.dart';
import '../../features/home/presentation/pages/profile_page.dart';
import '../../features/products/domain/entities/product.dart';
import '../../features/products/presentation/pages/product_detail_page.dart';
import '../../features/products/presentation/pages/products_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../navigation/app_routes.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = ValueNotifier<int>(0);
  ref.listen(
    authControllerProvider.select((state) => state.status),
    (_, _) => refreshNotifier.value++,
  );
  ref.onDispose(refreshNotifier.dispose);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final authStatus = ref.read(authControllerProvider).status;
      final location = state.uri.toString();
      final isAuthRoute = location == AppRoutes.login ||
          location == AppRoutes.register ||
          location == AppRoutes.forgotPassword;
      final isSplash = location == AppRoutes.splash;
      final isProtectedRoute = location.startsWith(AppRoutes.appShell);
      final isAuthenticated = authStatus == AuthStatus.authenticated;
      final isChecking = authStatus == AuthStatus.checking;

      if (isChecking && !isSplash) {
        return AppRoutes.splash;
      }
      if (!isAuthenticated && isProtectedRoute) {
        return AppRoutes.login;
      }
      if (isAuthenticated && (isAuthRoute || isSplash)) {
        return AppRoutes.dashboard;
      }
      if (!isAuthenticated && isSplash) {
        return AppRoutes.login;
      }
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        pageBuilder: (context, state) => AppPageTransitions.fade(
          key: state.pageKey,
          child: const SplashPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        pageBuilder: (context, state) => AppPageTransitions.slideFromBottom(
          key: state.pageKey,
          child: const LoginPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        pageBuilder: (context, state) => AppPageTransitions.slideFromRight(
          key: state.pageKey,
          child: const RegisterPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgotPassword',
        pageBuilder: (context, state) => AppPageTransitions.slideFromRight(
          key: state.pageKey,
          child: const ForgotPasswordPage(),
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShellPage(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.dashboard,
                name: 'dashboard',
                pageBuilder: (context, state) => AppPageTransitions.fade(
                  key: state.pageKey,
                  child: const DashboardPage(),
                ),
                routes: [
                  GoRoute(
                    path: 'products',
                    name: 'products',
                    pageBuilder: (context, state) => AppPageTransitions.slideFromRight(
                      key: state.pageKey,
                      child: const ProductsPage(),
                    ),
                    routes: [
                      GoRoute(
                        path: 'detail',
                        name: 'productDetail',
                        pageBuilder: (context, state) {
                          final product = state.extra as Product?;
                          return AppPageTransitions.slideFromRight(
                            key: state.pageKey,
                            child: ProductDetailPage(
                              product: product ??
                                  const Product(
                                    id: 'unknown',
                                    title: 'Product',
                                    price: 0,
                                    stock: 0,
                                    imageUrl: '',
                                  ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.activity,
                name: 'activity',
                pageBuilder: (context, state) => AppPageTransitions.fade(
                  key: state.pageKey,
                  child: const ActivityPage(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.orders,
                name: 'orders',
                pageBuilder: (context, state) => AppPageTransitions.fade(
                  key: state.pageKey,
                  child: const OrdersPage(),
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                name: 'profile',
                pageBuilder: (context, state) => AppPageTransitions.fade(
                  key: state.pageKey,
                  child: const ProfilePage(),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
