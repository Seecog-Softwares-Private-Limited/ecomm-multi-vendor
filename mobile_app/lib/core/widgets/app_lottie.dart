import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

/// Thin wrapper around [Lottie] with a graceful fallback when an animation
/// asset is missing, so screens never break if a JSON isn't bundled yet.
class AppLottie extends StatelessWidget {
  const AppLottie({
    required this.asset,
    this.width,
    this.height,
    this.repeat = true,
    this.fallback,
    super.key,
  });

  final String asset;
  final double? width;
  final double? height;
  final bool repeat;
  final Widget? fallback;

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      asset,
      width: width,
      height: height,
      repeat: repeat,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) =>
          fallback ?? SizedBox(width: width, height: height),
    );
  }
}
