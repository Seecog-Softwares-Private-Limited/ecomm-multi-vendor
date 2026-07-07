import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';

void main() {
  testWidgets('renders app title', (WidgetTester tester) async {
    await tester.pumpWidget(const MobileApp());
    expect(find.text('Ecomm Multi Vendor'), findsOneWidget);
  });
}
