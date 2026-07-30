import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/core/theme/app_adaptive_colors.dart';
import 'package:indovyapar_customer/core/theme/app_theme.dart';
import 'package:indovyapar_customer/features/support/domain/faq_item.dart';
import 'package:indovyapar_customer/features/support/domain/support_ticket.dart';
import 'package:indovyapar_customer/features/support/domain/support_ticket_message.dart';
import 'package:indovyapar_customer/features/support/presentation/widgets/chat_bubble.dart';
import 'package:indovyapar_customer/features/support/presentation/widgets/faq_expandable_card.dart';
import 'package:indovyapar_customer/features/support/presentation/widgets/support_empty_state.dart';
import 'package:indovyapar_customer/features/support/presentation/widgets/ticket_card.dart';

Widget _wrap(Widget child) {
  return MaterialApp(
    theme: AppTheme.light.copyWith(extensions: const [AppAdaptiveColors.light]),
    home: Scaffold(body: child),
  );
}

void main() {
  testWidgets('FaqExpandableCard expands answer on tap', (tester) async {
    await tester.pumpWidget(
      _wrap(
        const FaqExpandableCard(
          faq: FaqItem(
            id: '1',
            category: 'orders',
            question: 'How do I track my order?',
            answer: 'Open My Orders and tap the order.',
          ),
        ),
      ),
    );

    expect(find.text('How do I track my order?'), findsOneWidget);
    expect(find.text('Orders'), findsOneWidget);

    await tester.tap(find.byType(FaqExpandableCard));
    await tester.pumpAndSettle();

    expect(find.textContaining('Open My Orders'), findsOneWidget);

    // Collapse again — card remains interactive.
    await tester.tap(find.byType(FaqExpandableCard));
    await tester.pumpAndSettle();
    expect(find.text('How do I track my order?'), findsOneWidget);
  });

  testWidgets('TicketCard renders id, subject, status', (tester) async {
    final ticket = SupportTicket.fromJson({
      'id': 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      'shortId': '#TKT-AAAAAAAA',
      'subject': 'Need refund help',
      'status': 'OPEN',
      'orderId': 'ordabcdef12',
      'createdAt': '2026-07-01T10:00:00.000Z',
      'adminReply': 'Looking into it',
      'adminRepliedAt': '2026-07-02T10:00:00.000Z',
    });

    await tester.pumpWidget(_wrap(TicketCard(ticket: ticket)));

    expect(find.text('#TKT-AAAAAAAA'), findsOneWidget);
    expect(find.text('Need refund help'), findsOneWidget);
    expect(find.text('Open'), findsOneWidget);
    expect(find.text('Reply'), findsOneWidget);
    expect(find.textContaining('Order #'), findsOneWidget);
  });

  testWidgets('ChatBubble distinguishes customer vs support', (tester) async {
    await tester.pumpWidget(
      _wrap(
        Column(
          children: [
            ChatBubble(
              message: SupportTicketMessage(
                id: '1',
                author: 'CUSTOMER',
                body: 'I need help',
                createdAt: DateTime(2026, 7, 1, 10),
                authorName: 'You',
              ),
            ),
            ChatBubble(
              message: SupportTicketMessage(
                id: '2',
                author: 'ADMIN',
                body: 'We can help',
                createdAt: DateTime(2026, 7, 1, 11),
                authorName: 'Support',
              ),
            ),
          ],
        ),
      ),
    );

    expect(find.text('I need help'), findsOneWidget);
    expect(find.text('We can help'), findsOneWidget);
    expect(find.text('You'), findsOneWidget);
    expect(find.text('Support'), findsOneWidget);
  });

  testWidgets('SupportEmptyState shows no-tickets copy', (tester) async {
    await tester.pumpWidget(
      _wrap(const SupportEmptyState(kind: SupportEmptyKind.tickets)),
    );
    expect(find.text('No support tickets yet'), findsOneWidget);
    expect(find.text('Continue Shopping'), findsOneWidget);
  });
}
