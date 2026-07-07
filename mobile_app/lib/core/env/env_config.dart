import 'package:flutter/foundation.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';



import '../constants/env_keys.dart';

import '../flavor/app_flavor.dart';



abstract final class EnvConfig {

  static var _isLoaded = false;



  static Future<void> load() async {

    final fileName = switch (AppFlavorConfig.current) {

      AppFlavor.dev => '.env.dev',

      AppFlavor.prod => '.env.prod',

    };

    await dotenv.load(fileName: 'assets/env/$fileName');

    _isLoaded = true;

  }



  static String get appEnv =>

      _isLoaded ? dotenv.get(EnvKeys.appEnv, fallback: 'dev') : AppFlavorConfig.name;



  static String get baseUrl {
    const fromDefine = String.fromEnvironment('BASE_URL');
    if (fromDefine.isNotEmpty) {
      return fromDefine;
    }

    return _isLoaded
        ? dotenv.get(EnvKeys.baseUrl, fallback: 'http://127.0.0.1:3005')
        : 'http://127.0.0.1:3005';
  }



  static bool get shouldLogNetwork {

    final value =

        _isLoaded ? dotenv.get(EnvKeys.logNetwork, fallback: 'true') : 'true';

    return value.toLowerCase() == 'true';

  }



  @visibleForTesting

  static void resetForTest() {

    _isLoaded = false;

  }

}

