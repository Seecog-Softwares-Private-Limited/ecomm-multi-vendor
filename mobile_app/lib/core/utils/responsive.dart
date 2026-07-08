import 'package:flutter/widgets.dart';

/// Device-size breakpoints (logical pixels, based on width).
enum DeviceType { mobile, tablet, desktop }

abstract final class Breakpoints {
  const Breakpoints._();

  static const double tablet = 600;
  static const double desktop = 1024;
}

/// Responsive helpers exposed as extensions on [BuildContext] so widgets can
/// adapt to screen size without boilerplate.
extension ResponsiveContext on BuildContext {
  Size get screenSize => MediaQuery.sizeOf(this);
  double get screenWidth => screenSize.width;
  double get screenHeight => screenSize.height;

  DeviceType get deviceType {
    final width = screenWidth;
    if (width >= Breakpoints.desktop) return DeviceType.desktop;
    if (width >= Breakpoints.tablet) return DeviceType.tablet;
    return DeviceType.mobile;
  }

  bool get isMobile => deviceType == DeviceType.mobile;
  bool get isTablet => deviceType == DeviceType.tablet;
  bool get isDesktop => deviceType == DeviceType.desktop;

  /// Picks a value based on the current device type, falling back to smaller
  /// breakpoints when a larger one isn't supplied.
  T responsive<T>({required T mobile, T? tablet, T? desktop}) {
    switch (deviceType) {
      case DeviceType.desktop:
        return desktop ?? tablet ?? mobile;
      case DeviceType.tablet:
        return tablet ?? mobile;
      case DeviceType.mobile:
        return mobile;
    }
  }

  /// Number of columns for a product grid based on available width.
  int get gridColumns => responsive(mobile: 2, tablet: 3, desktop: 4);
}
