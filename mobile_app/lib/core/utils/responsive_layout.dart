import 'package:flutter/material.dart';

import '../constants/app_constants.dart';

enum DeviceType { phone, tablet, desktop }

extension DeviceTypeX on BuildContext {
  DeviceType get deviceType {
    final width = MediaQuery.sizeOf(this).width;
    if (width < AppConstants.phoneBreakpoint) {
      return DeviceType.phone;
    }
    if (width < AppConstants.tabletBreakpoint) {
      return DeviceType.tablet;
    }
    return DeviceType.desktop;
  }
}
