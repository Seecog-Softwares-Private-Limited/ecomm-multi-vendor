import 'package:flutter/material.dart';

/// Central color palette for the IndoVyapar customer app.
///
/// The brand is built around a trustworthy commerce green with a warm amber
/// accent used for calls-to-action, prices and deal badges.
abstract final class AppColors {
  const AppColors._();

  // Brand
  static const Color primary = Color(0xFF1B7A43);
  static const Color primaryDark = Color(0xFF135C32);
  static const Color primaryLight = Color(0xFF3FA76A);
  static const Color primarySurface = Color(0xFFE7F4EC);

  static const Color accent = Color(0xFFFFB300);
  static const Color accentDark = Color(0xFFF08C00);

  // Neutrals (light)
  static const Color background = Color(0xFFF6F8FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  static const Color border = Color(0xFFE2E8F0);

  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);

  // Neutrals (dark)
  static const Color backgroundDark = Color(0xFF0F1417);
  static const Color surfaceDark = Color(0xFF161C20);
  static const Color surfaceVariantDark = Color(0xFF1F272C);
  static const Color borderDark = Color(0xFF2C363C);

  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFFB4C0CC);
  static const Color textMutedDark = Color(0xFF7A8894);

  // Semantic
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFDC2626);
  static const Color info = Color(0xFF2563EB);

  static const Color rating = Color(0xFFFFA41C);

  // Gradients
  static const List<Color> brandGradient = [primary, primaryLight];
}
