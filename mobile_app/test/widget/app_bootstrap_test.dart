import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/app/app.dart';
import '../helpers/test_app_bootstrap.dart';

void main() {
  testWidgets('renders app bootstrap screen', (tester) async {
    await bootstrapTestEnvironment();
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pump();

    expect(find.byType(App), findsOneWidget);
  });
}
