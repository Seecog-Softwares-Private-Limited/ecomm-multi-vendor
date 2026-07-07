import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../motion/app_shimmer.dart';

class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius = BorderRadius.zero,
    this.fallbackLabel,
    super.key,
  });

  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius borderRadius;
  final String? fallbackLabel;

  @override
  Widget build(BuildContext context) {
    final resolvedWidth = width ?? height ?? 48;
    final resolvedHeight = height ?? width ?? 48;

    if (imageUrl.isEmpty) {
      return _ImagePlaceholder(
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: borderRadius,
        label: fallbackLabel,
      );
    }

    final devicePixelRatio = MediaQuery.devicePixelRatioOf(context);
    final memCacheWidth = (resolvedWidth * devicePixelRatio).round();

    return ClipRRect(
      borderRadius: borderRadius,
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        width: resolvedWidth,
        height: resolvedHeight,
        fit: fit,
        memCacheWidth: memCacheWidth,
        placeholder: (context, url) => AppShimmer(
          child: _ImagePlaceholder(
            width: resolvedWidth,
            height: resolvedHeight,
            borderRadius: borderRadius,
          ),
        ),
        errorWidget: (context, url, error) => _ImagePlaceholder(
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: borderRadius,
          label: fallbackLabel,
        ),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder({
    required this.width,
    required this.height,
    required this.borderRadius,
    this.label,
  });

  final double width;
  final double height;
  final BorderRadius borderRadius;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final displayLabel = label?.isNotEmpty == true
        ? label![0].toUpperCase()
        : null;

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: borderRadius,
      ),
      alignment: Alignment.center,
      child: displayLabel == null
          ? Icon(Icons.image_outlined, color: colorScheme.onSurfaceVariant)
          : Text(
              displayLabel,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
            ),
    );
  }
}
