import 'package:flutter/material.dart';

import '../motion/app_shimmer.dart';
import '../tokens/app_motion.dart';

class AppLoadingIndicator extends StatefulWidget {
  const AppLoadingIndicator({super.key, this.label, this.color});

  final String? label;
  final Color? color;

  @override
  State<AppLoadingIndicator> createState() => _AppLoadingIndicatorState();
}

class _AppLoadingIndicatorState extends State<AppLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.85, end: 1).animate(
      CurvedAnimation(parent: _pulseController, curve: AppMotion.standardCurve),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ScaleTransition(
          scale: _pulse,
          child: CircularProgressIndicator(color: widget.color),
        ),
        if (widget.label != null) ...[
          const SizedBox(height: 12),
          Text(
            widget.label!,
            style: widget.color == null
                ? null
                : TextStyle(color: widget.color),
          ),
        ],
      ],
    );
  }
}

class AppSkeletonBox extends StatelessWidget {
  const AppSkeletonBox({
    super.key,
    this.height = 16,
    this.width = double.infinity,
  });

  final double height;
  final double width;

  @override
  Widget build(BuildContext context) {
    return AppShimmerBox(height: height, width: width);
  }
}

class AppSkeletonList extends StatelessWidget {
  const AppSkeletonList({super.key, this.itemCount = 6});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemBuilder: (_, _) => const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSkeletonBox(height: 18, width: 180),
          SizedBox(height: 8),
          AppSkeletonBox(height: 14),
          SizedBox(height: 8),
          AppSkeletonBox(height: 14, width: 120),
        ],
      ),
      separatorBuilder: (_, _) => const SizedBox(height: 16),
      itemCount: itemCount,
    );
  }
}
