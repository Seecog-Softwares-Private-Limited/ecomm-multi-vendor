import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/design_system/widgets/app_offline_banner.dart';

void main() {
  testWidgets('hides when online with fresh data', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppOfflineBanner(isOffline: false, isFromCache: false),
        ),
      ),
    );

    expect(find.byType(MaterialBanner), findsNothing);
    expect(find.byType(SizedBox), findsWidgets);
  });

  testWidgets('shows offline cache message when offline', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppOfflineBanner(isOffline: true, isFromCache: true),
        ),
      ),
    );

    expect(
      find.text('You are offline. Showing cached products.'),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.cloud_off), findsOneWidget);
  });

  testWidgets('shows recovery message when cache used while online', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppOfflineBanner(isOffline: false, isFromCache: true),
        ),
      ),
    );

    expect(
      find.text('Showing cached products while the network recovers.'),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.cloud_download_outlined), findsOneWidget);
  });
}
