import 'package:flutter/material.dart';

import '../theme/app_adaptive_colors.dart';
import '../theme/app_spacing.dart';

/// Lightweight shimmer placeholder for premium loading skeletons.
class ShimmerBox extends StatefulWidget {
  const ShimmerBox({
    this.width,
    this.height,
    this.borderRadius = AppRadius.md,
    super.key,
  });

  final double? width;
  final double? height;
  final double borderRadius;

  @override
  State<ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<ShimmerBox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final adaptive = context.adaptiveColors;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(-1 + _controller.value * 2, 0),
              end: Alignment(1 + _controller.value * 2, 0),
              colors: [
                adaptive.shimmerBase,
                adaptive.shimmerHighlight,
                adaptive.shimmerBase,
              ],
              stops: const [0.1, 0.5, 0.9],
            ),
          ),
        );
      },
    );
  }
}
