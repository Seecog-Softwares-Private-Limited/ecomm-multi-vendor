import 'package:flutter/material.dart';

import '../tokens/app_motion.dart';
import 'app_haptics.dart';

class AppPressable extends StatefulWidget {
  const AppPressable({
    required this.child,
    super.key,
    this.onPressed,
    this.enableHaptics = true,
    this.pressedScale = 0.97,
  });

  final Widget child;
  final VoidCallback? onPressed;
  final bool enableHaptics;
  final double pressedScale;

  @override
  State<AppPressable> createState() => _AppPressableState();
}

class _AppPressableState extends State<AppPressable> {
  var _isPressed = false;

  void _setPressed(bool value) {
    if (_isPressed == value) {
      return;
    }
    setState(() => _isPressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: enabled ? (_) => _setPressed(true) : null,
      onTapUp: enabled
          ? (_) {
              _setPressed(false);
              if (widget.enableHaptics) {
                AppHaptics.lightImpact();
              }
              widget.onPressed?.call();
            }
          : null,
      onTapCancel: enabled ? () => _setPressed(false) : null,
      child: AnimatedScale(
        scale: _isPressed ? widget.pressedScale : 1,
        duration: AppMotion.fast,
        curve: AppMotion.standardCurve,
        child: widget.child,
      ),
    );
  }
}
