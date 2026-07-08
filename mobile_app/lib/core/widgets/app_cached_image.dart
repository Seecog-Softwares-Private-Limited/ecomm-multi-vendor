import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Network image with a shimmer-free placeholder, error fallback and rounded
/// corners. Handles null/empty URLs gracefully.
class AppCachedImage extends StatelessWidget {
  const AppCachedImage({
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.fallbackLabel,
    super.key,
  });

  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final String? fallbackLabel;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.zero;
    final url = imageUrl?.trim() ?? '';

    final Widget child = url.isEmpty
        ? _fallback()
        : CachedNetworkImage(
            imageUrl: url,
            width: width,
            height: height,
            fit: fit,
            placeholder: (context, _) => _placeholder(),
            errorWidget: (context, _, _) => _fallback(),
          );

    return ClipRRect(borderRadius: radius, child: child);
  }

  Widget _placeholder() => Container(
        width: width,
        height: height,
        color: AppColors.surfaceVariant,
        alignment: Alignment.center,
        child: const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
        ),
      );

  Widget _fallback() {
    final label = (fallbackLabel ?? '').trim();
    return Container(
      width: width,
      height: height,
      color: AppColors.surfaceVariant,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(8),
      child: label.isEmpty
          ? const Icon(Icons.image_not_supported_outlined, color: AppColors.textMuted)
          : Text(
              label.characters.take(2).toString().toUpperCase(),
              style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w700),
            ),
    );
  }
}
