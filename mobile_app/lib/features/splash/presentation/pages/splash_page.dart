import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/design_system/tokens/app_brand.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/widgets/app_loading.dart';
import '../../../../core/design_system/widgets/indovyapar_logo.dart';
import '../../../../core/utils/responsive_layout.dart';
import '../providers/splash_provider.dart';

class SplashPage extends ConsumerWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final message = ref.watch(splashProvider);
    final horizontalPadding = switch (context.deviceType) {
      DeviceType.phone => 24.0,
      DeviceType.tablet => 48.0,
      DeviceType.desktop => 72.0,
    };

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AppBrand.loginGradient),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const IndovyaparLogo(
                    fontSize: 34,
                    variant: IndovyaparLogoVariant.light,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  const IndovyaparTagline(light: true),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    message,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  const AppLoadingIndicator(
                    label: 'Preparing your session...',
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
