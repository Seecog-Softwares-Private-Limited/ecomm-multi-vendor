import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';

class _Banner {
  const _Banner({
    required this.title,
    required this.subtitle,
    required this.cta,
    required this.colors,
    required this.icon,
  });
  final String title;
  final String subtitle;
  final String cta;
  final List<Color> colors;
  final IconData icon;
}

/// Auto-advancing promotional banner slider.
class BannerCarousel extends StatefulWidget {
  const BannerCarousel({required this.onTap, super.key});

  final VoidCallback onTap;

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  Timer? _timer;
  int _index = 0;

  static const List<_Banner> _banners = [
    _Banner(
      title: 'Mega Savings Days',
      subtitle: 'Up to 60% off across categories',
      cta: 'Shop deals',
      colors: [Color(0xFF135C32), Color(0xFF3FA76A)],
      icon: Icons.local_fire_department,
    ),
    _Banner(
      title: 'New Arrivals',
      subtitle: 'Fresh styles added every week',
      cta: 'Explore now',
      colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
      icon: Icons.auto_awesome,
    ),
    _Banner(
      title: 'Free Delivery',
      subtitle: 'On orders above ₹500',
      cta: 'Start shopping',
      colors: [Color(0xFFB45309), Color(0xFFF59E0B)],
      icon: Icons.local_shipping,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!_controller.hasClients) return;
      final next = (_index + 1) % _banners.length;
      _controller.animateToPage(next, duration: const Duration(milliseconds: 450), curve: Curves.easeOut);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        SizedBox(
          height: 150,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _index = i),
            itemCount: _banners.length,
            itemBuilder: (context, i) {
              final banner = _banners[i];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
                child: GestureDetector(
                  onTap: widget.onTap,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: banner.colors),
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                    ),
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                banner.title,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                banner.subtitle,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white.withValues(alpha: 0.9),
                                ),
                              ),
                              const SizedBox(height: AppSpacing.md),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(AppRadius.pill),
                                ),
                                child: Text(
                                  banner.cta,
                                  style: theme.textTheme.labelMedium?.copyWith(
                                    color: banner.colors.last,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(banner.icon, size: 64, color: Colors.white.withValues(alpha: 0.85)),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < _banners.length; i++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: i == _index ? 20 : 7,
                height: 7,
                decoration: BoxDecoration(
                  color: i == _index ? AppColors.primary : AppColors.border,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
