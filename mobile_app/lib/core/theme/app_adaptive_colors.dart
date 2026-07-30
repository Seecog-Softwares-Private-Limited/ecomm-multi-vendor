import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Brightness-aware neutral colors registered as a [ThemeExtension].
///
/// Use via [BuildContext.adaptiveColors] instead of static light-only
/// [AppColors.textPrimary] / [AppColors.background] in widgets.
@immutable
class AppAdaptiveColors extends ThemeExtension<AppAdaptiveColors> {
  const AppAdaptiveColors({
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.background,
    required this.surface,
    required this.surfaceVariant,
    required this.border,
    required this.primarySurface,
    required this.shadow,
    required this.shimmerBase,
    required this.shimmerHighlight,
  });

  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color background;
  final Color surface;
  final Color surfaceVariant;
  final Color border;
  final Color primarySurface;
  final Color shadow;
  final Color shimmerBase;
  final Color shimmerHighlight;

  static const light = AppAdaptiveColors(
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    textMuted: AppColors.textMuted,
    background: AppColors.background,
    surface: AppColors.surface,
    surfaceVariant: AppColors.surfaceVariant,
    border: AppColors.border,
    primarySurface: AppColors.primarySurface,
    shadow: Color(0x0A0F172A),
    shimmerBase: Color(0xFFE8EEF3),
    shimmerHighlight: Color(0xFFF6F8FA),
  );

  static const dark = AppAdaptiveColors(
    textPrimary: AppColors.textPrimaryDark,
    textSecondary: AppColors.textSecondaryDark,
    textMuted: AppColors.textMutedDark,
    background: AppColors.backgroundDark,
    surface: AppColors.surfaceDark,
    surfaceVariant: AppColors.surfaceVariantDark,
    border: AppColors.borderDark,
    primarySurface: AppColors.primarySurfaceDark,
    shadow: Color(0x66000000),
    shimmerBase: Color(0xFF1F272C),
    shimmerHighlight: Color(0xFF2C363C),
  );

  @override
  AppAdaptiveColors copyWith({
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? background,
    Color? surface,
    Color? surfaceVariant,
    Color? border,
    Color? primarySurface,
    Color? shadow,
    Color? shimmerBase,
    Color? shimmerHighlight,
  }) {
    return AppAdaptiveColors(
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceVariant: surfaceVariant ?? this.surfaceVariant,
      border: border ?? this.border,
      primarySurface: primarySurface ?? this.primarySurface,
      shadow: shadow ?? this.shadow,
      shimmerBase: shimmerBase ?? this.shimmerBase,
      shimmerHighlight: shimmerHighlight ?? this.shimmerHighlight,
    );
  }

  @override
  AppAdaptiveColors lerp(AppAdaptiveColors? other, double t) {
    if (other == null) return this;
    return AppAdaptiveColors(
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceVariant: Color.lerp(surfaceVariant, other.surfaceVariant, t)!,
      border: Color.lerp(border, other.border, t)!,
      primarySurface: Color.lerp(primarySurface, other.primarySurface, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
      shimmerBase: Color.lerp(shimmerBase, other.shimmerBase, t)!,
      shimmerHighlight: Color.lerp(shimmerHighlight, other.shimmerHighlight, t)!,
    );
  }
}

extension AppAdaptiveColorsContext on BuildContext {
  AppAdaptiveColors get adaptiveColors =>
      Theme.of(this).extension<AppAdaptiveColors>() ?? AppAdaptiveColors.light;
}
