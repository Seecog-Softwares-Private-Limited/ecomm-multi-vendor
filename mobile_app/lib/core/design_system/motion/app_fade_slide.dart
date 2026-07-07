import 'package:flutter/material.dart';

import '../tokens/app_motion.dart';

class AppFadeSlideItem extends StatefulWidget {
  const AppFadeSlideItem({
    required this.index,
    required this.child,
    this.animate = true,
    super.key,
  });

  final int index;
  final Widget child;
  final bool animate;

  @override
  State<AppFadeSlideItem> createState() => _AppFadeSlideItemState();
}

class _AppFadeSlideItemState extends State<AppFadeSlideItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: AppMotion.medium,
    );
    final curve = CurvedAnimation(
      parent: _controller,
      curve: AppMotion.standardCurve,
    );
    _fade = Tween<double>(begin: 0, end: 1).animate(curve);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(curve);

    final delay = Duration(milliseconds: 35 * widget.index);
    Future<void>.delayed(delay, () {
      if (mounted) {
        _controller.forward();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.animate) {
      return RepaintBoundary(child: widget.child);
    }

    return RepaintBoundary(
      child: FadeTransition(
        opacity: _fade,
        child: SlideTransition(position: _slide, child: widget.child),
      ),
    );
  }
}
