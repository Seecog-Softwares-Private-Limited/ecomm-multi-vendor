import 'dart:developer' as developer;

import 'package:flutter/foundation.dart';

/// Lightweight logging wrapper. No-ops in release builds to keep logs clean.
abstract final class AppLogger {
  const AppLogger._();

  static void debug(String message, {String name = 'IndoVyapar'}) {
    if (kDebugMode) developer.log(message, name: name);
  }

  static void error(String message, {Object? error, StackTrace? stackTrace}) {
    if (kDebugMode) {
      developer.log(message, name: 'IndoVyapar', error: error, stackTrace: stackTrace);
    }
  }
}
