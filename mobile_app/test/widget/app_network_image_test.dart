import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/design_system/widgets/app_network_image.dart';

void main() {
  testWidgets('shows placeholder when image url is empty', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppNetworkImage(
            imageUrl: '',
            width: 48,
            height: 48,
            fallbackLabel: 'Headphones',
          ),
        ),
      ),
    );

    expect(find.text('H'), findsOneWidget);
    expect(find.byIcon(Icons.image_outlined), findsNothing);
  });

  testWidgets('shows icon placeholder when url and label are empty', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppNetworkImage(
            imageUrl: '',
            width: 48,
            height: 48,
          ),
        ),
      ),
    );

    expect(find.byIcon(Icons.image_outlined), findsOneWidget);
  });
}
