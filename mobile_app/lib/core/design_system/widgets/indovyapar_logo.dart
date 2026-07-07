import 'package:flutter/material.dart';

import '../tokens/app_colors.dart';
import '../tokens/app_typography.dart';

enum IndovyaparLogoVariant { defaultStyle, light }

class IndovyaparLogo extends StatelessWidget {
  const IndovyaparLogo({
    super.key,
    this.fontSize = 28,
    this.variant = IndovyaparLogoVariant.defaultStyle,
  });

  final double fontSize;
  final IndovyaparLogoVariant variant;

  @override
  Widget build(BuildContext context) {
    final green = variant == IndovyaparLogoVariant.light
        ? AppColors.brandGreenLight
        : AppColors.brandGreenMid;
    final style = AppTypography.logo(fontSize: fontSize, light: false);

    return RichText(
      text: TextSpan(
        style: style,
        children: [
          TextSpan(
            text: 'Indo',
            style: style.copyWith(color: AppColors.primaryDark),
          ),
          TextSpan(
            text: 'vyapar',
            style: style.copyWith(color: green),
          ),
        ],
      ),
    );
  }
}

class IndovyaparTagline extends StatelessWidget {
  const IndovyaparTagline({
    super.key,
    this.color = AppColors.textMuted,
    this.light = false,
  });

  final Color color;
  final bool light;

  @override
  Widget build(BuildContext context) {
    return Text(
      "INDIA'S MARKETPLACE",
      style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: light ? Colors.white.withValues(alpha: 0.8) : color,
            letterSpacing: 2,
          ),
    );
  }
}
