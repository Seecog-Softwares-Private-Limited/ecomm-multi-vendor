import 'package:flutter/foundation.dart';

enum AppFlavor { dev, prod }

abstract final class AppFlavorConfig {
  static AppFlavor get current {
    const raw = String.fromEnvironment('APP_FLAVOR', defaultValue: '');
    return switch (raw) {
      'prod' => AppFlavor.prod,
      'dev' => AppFlavor.dev,
      _ => kReleaseMode ? AppFlavor.prod : AppFlavor.dev,
    };
  }

  static String get name => switch (current) {
        AppFlavor.dev => 'dev',
        AppFlavor.prod => 'prod',
      };

  static bool get isDev => current == AppFlavor.dev;

  static bool get isProd => current == AppFlavor.prod;
}
