import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/flavor/app_flavor.dart';

void main() {
  test('AppFlavorConfig.name matches current flavor', () {
    expect(AppFlavorConfig.name, isIn(['dev', 'prod']));
  });
}
