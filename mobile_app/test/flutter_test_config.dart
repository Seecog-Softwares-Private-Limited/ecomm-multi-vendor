import 'dart:async';

import 'package:mobile_app/core/design_system/tokens/app_typography.dart';

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  AppTypography.useSystemFonts = true;
  await testMain();
}
