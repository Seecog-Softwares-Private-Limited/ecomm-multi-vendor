import 'package:flutter/widgets.dart';
import 'package:mobile_app/core/design_system/tokens/app_typography.dart';
import 'package:mobile_app/core/di/service_locator.dart';
import 'package:mobile_app/core/env/env_config.dart';
import 'package:mobile_app/core/storage/hive_database.dart';

Future<void> bootstrapTestEnvironment({bool initializeHive = false}) async {
  AppTypography.useSystemFonts = true;
  WidgetsFlutterBinding.ensureInitialized();
  if (initializeHive) {
    await HiveDatabase.init();
  }
  await EnvConfig.load();
  setupServiceLocator();
}
