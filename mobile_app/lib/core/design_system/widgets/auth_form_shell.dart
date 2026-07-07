import 'package:flutter/material.dart';

import '../tokens/app_brand.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_spacing.dart';
import 'indovyapar_logo.dart';

class AuthFormShell extends StatelessWidget {
  const AuthFormShell({
    required this.child,
    super.key,
    this.subtitle = 'Sign in to your Indovyapar account to continue',
    this.title = 'Welcome back',
  });

  final Widget child;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final showBrandPanel = constraints.maxWidth >= 1024;
          if (!showBrandPanel) {
            return _MobileAuthLayout(
              title: title,
              subtitle: subtitle,
              child: child,
            );
          }

          return Row(
            children: [
              Expanded(flex: 48, child: _BrandPanel()),
              Expanded(
                flex: 52,
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: _AuthCard(
                        title: title,
                        subtitle: subtitle,
                        child: child,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _MobileAuthLayout extends StatelessWidget {
  const _MobileAuthLayout({
    required this.child,
    required this.title,
    required this.subtitle,
  });

  final Widget child;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            children: [
              const IndovyaparLogo(fontSize: 26),
              const SizedBox(height: AppSpacing.sm),
              const IndovyaparTagline(),
              const SizedBox(height: AppSpacing.xl),
              _AuthCard(title: title, subtitle: subtitle, child: child),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: AppBrand.loginGradient),
      child: Stack(
        children: [
          Positioned(
            top: -60,
            right: -60,
            child: _circle(200),
          ),
          Positioned(
            bottom: -40,
            left: -40,
            child: _circle(160, opacity: 0.05),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const IndovyaparLogo(
                  fontSize: 28,
                  variant: IndovyaparLogoVariant.light,
                ),
                const SizedBox(height: AppSpacing.sm),
                const IndovyaparTagline(light: true),
                const Spacer(),
                Text(
                  'Shop from lakhs of products. Trusted by millions. Fast delivery.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.95),
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                ),
                const SizedBox(height: AppSpacing.lg),
                _feature(Icons.shopping_bag_outlined, 'Wide range of products'),
                const SizedBox(height: AppSpacing.sm),
                _feature(Icons.verified_user_outlined, 'Secure checkout'),
                const SizedBox(height: AppSpacing.sm),
                _feature(Icons.local_shipping_outlined, 'Fast & free delivery'),
                const Spacer(),
                Text(
                  '© Indovyapar',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _circle(double size, {double opacity = 0.1}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: opacity),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _feature(IconData icon, String text) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white.withValues(alpha: 0.9), size: 20),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.95),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthCard extends StatelessWidget {
  const _AuthCard({
    required this.child,
    required this.title,
    required this.subtitle,
  });

  final Widget child;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A64748B),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.lg),
            child,
          ],
        ),
      ),
    );
  }
}
