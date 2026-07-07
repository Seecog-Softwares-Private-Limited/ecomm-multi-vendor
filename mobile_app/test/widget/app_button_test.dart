import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/design_system/widgets/app_button.dart';

void main() {
  testWidgets('renders label and triggers callback', (tester) async {
    var tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AppButton(
            label: 'Continue',
            onPressed: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Continue'), findsOneWidget);

    await tester.tap(find.byType(FilledButton));
    await tester.pump();

    expect(tapped, isTrue);
  });

  testWidgets('shows loading indicator when isLoading is true', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppButton(
            label: 'Submit',
            isLoading: true,
            onPressed: null,
          ),
        ),
      ),
    );

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Submit'), findsNothing);
  });

  testWidgets('expands to full width when expanded is true', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: AppButton(
              label: 'Wide',
              expanded: true,
              onPressed: () {},
            ),
          ),
        ),
      ),
    );

    final sizedBox = tester.widget<SizedBox>(
      find.ancestor(
        of: find.text('Wide'),
        matching: find.byType(SizedBox),
      ),
    );

    expect(sizedBox.width, double.infinity);
  });
}
