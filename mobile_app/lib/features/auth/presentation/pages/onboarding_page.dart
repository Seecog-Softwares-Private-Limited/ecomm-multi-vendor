import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routing/app_routes.dart';
import '../../../../core/di/providers.dart';
import '../../../../core/theme/app_adaptive_colors.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_button.dart';

class _Slide {
  const _Slide({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;
}

/// First-run onboarding carousel. Marks onboarding complete and moves to login.
class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});

  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  final PageController _controller = PageController();
  int _index = 0;

  static const List<_Slide> _slides = [
    _Slide(
      icon: Icons.storefront_outlined,
      title: 'Shop from local sellers',
      subtitle: 'Thousands of products from trusted businesses, delivered to your door.',
    ),
    _Slide(
      icon: Icons.local_offer_outlined,
      title: 'Best deals every day',
      subtitle: 'Flash sales, exclusive offers and prices you will love.',
    ),
    _Slide(
      icon: Icons.local_shipping_outlined,
      title: 'Fast, tracked delivery',
      subtitle: 'Track every order in real time, right from placement to your doorstep.',
    ),
  ];

  bool get _isLast => _index == _slides.length - 1;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await ref.read(preferencesProvider).setOnboardingComplete(true);
    if (mounted) context.go(AppRoutes.login);
  }

  void _next() {
    if (_isLast) {
      _finish();
    } else {
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _finish,
                child: const Text('Skip'),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _index = i),
                itemCount: _slides.length,
                itemBuilder: (context, i) {
                  final slide = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            color: context.adaptiveColors.primarySurface,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(slide.icon, size: 76, color: AppColors.primary),
                        ),
                        const SizedBox(height: AppSpacing.xxxl),
                        Text(slide.title, style: theme.textTheme.headlineSmall, textAlign: TextAlign.center),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          slide.subtitle,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: context.adaptiveColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < _slides.length; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: i == _index ? 22 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: i == _index ? AppColors.primary : context.adaptiveColors.border,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: AppButton(
                label: _isLast ? 'Get started' : 'Next',
                icon: _isLast ? Icons.check : Icons.arrow_forward,
                onPressed: _next,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
