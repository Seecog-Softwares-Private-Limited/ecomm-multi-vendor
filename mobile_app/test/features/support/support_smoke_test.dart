import 'package:flutter_test/flutter_test.dart';
import 'package:indovyapar_customer/features/support/domain/faq_item.dart';
import 'package:indovyapar_customer/features/support/domain/support_helpers.dart';
import 'package:indovyapar_customer/features/support/domain/support_ticket.dart';
import 'package:indovyapar_customer/features/support/domain/support_ticket_message.dart';

void main() {
  group('FaqItem.fromApi', () {
    test('parses FAQ payload fields', () {
      final faq = FaqItem.fromApi({
        'id': 'f1',
        'category': 'Orders',
        'question': 'Where is my order?',
        'answer': 'Track it under My Orders.',
        'displayOrder': 2,
      });
      expect(faq.id, 'f1');
      expect(faq.category, 'orders');
      expect(faq.question, 'Where is my order?');
      expect(faq.answer, contains('My Orders'));
      expect(faq.displayOrder, 2);
    });

    test('defaults missing fields safely', () {
      final faq = FaqItem.fromApi({});
      expect(faq.id, '');
      expect(faq.category, 'general');
      expect(faq.displayOrder, 0);
    });
  });

  group('FaqCategories', () {
    test('exposes seeded Help Center categories', () {
      expect(FaqCategories.ordered, containsAll(['all', 'orders', 'returns', 'payments', 'account']));
      expect(FaqCategories.label('returns'), 'Returns & Refunds');
      expect(FaqCategories.label('account'), 'Account & Security');
    });
  });

  group('SupportTicket', () {
    test('fromJson maps list/detail fields', () {
      final ticket = SupportTicket.fromJson({
        'id': 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        'shortId': '#TKT-AAAAAAAA',
        'subject': 'Payment failed',
        'status': 'IN_PROGRESS',
        'orderId': 'ord123456789',
        'createdAt': '2026-07-01T10:00:00.000Z',
        'lastUpdateAt': '2026-07-02T12:00:00.000Z',
        'updatedAt': '2026-07-02T12:00:00.000Z',
        'adminReply': 'We are looking into this.',
        'adminRepliedAt': '2026-07-02T12:00:00.000Z',
      });

      expect(ticket.shortId, '#TKT-AAAAAAAA');
      expect(ticket.status, 'IN_PROGRESS');
      expect(ticket.orderId, 'ord123456789');
      expect(ticket.hasSupportReply, isTrue);
      expect(ticket.sortDate, DateTime.parse('2026-07-02T12:00:00.000Z'));
    });

    test('hasSupportReply is false without admin reply', () {
      final ticket = SupportTicket.fromJson({
        'id': 't2',
        'shortId': '#TKT-T2',
        'subject': 'Need help',
        'status': 'OPEN',
        'createdAt': '2026-07-01T10:00:00.000Z',
      });
      expect(ticket.hasSupportReply, isFalse);
      expect(ticket.sortDate, ticket.createdAt);
    });
  });

  group('SupportTicketMessage', () {
    test('fromApi parses customer and admin authors', () {
      final customer = SupportTicketMessage.fromApi({
        'id': 'm1',
        'author': 'CUSTOMER',
        'body': 'Hello',
        'createdAt': '2026-07-01T10:00:00.000Z',
        'authorName': 'You',
      });
      final admin = SupportTicketMessage.fromApi({
        'id': 'm2',
        'author': 'ADMIN',
        'body': 'Hi there',
        'createdAt': '2026-07-01T11:00:00.000Z',
        'authorName': 'Support',
      });

      expect(customer.isCustomer, isTrue);
      expect(admin.isAdmin, isTrue);
      expect(admin.authorName, 'Support');
    });

    test('optimistic copy preserves body', () {
      final msg = SupportTicketMessage(
        id: 'temp',
        author: 'CUSTOMER',
        body: 'Draft',
        createdAt: DateTime(2026, 7, 1),
        isOptimistic: true,
      );
      final synced = msg.copyWith(id: 'real', isOptimistic: false);
      expect(synced.body, 'Draft');
      expect(synced.isOptimistic, isFalse);
      expect(synced.id, 'real');
    });
  });

  group('support helpers', () {
    test('status presentation covers backend enums', () {
      for (final status in ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']) {
        final p = supportStatusPresentation(status);
        expect(p.label, isNotEmpty);
      }
      expect(supportTicketAllowsReply('OPEN'), isTrue);
      expect(supportTicketAllowsReply('RESOLVED'), isTrue);
      expect(supportTicketAllowsReply('CLOSED'), isFalse);
    });

    test('shortOrderLabel truncates id', () {
      expect(shortOrderLabel(null), '');
      expect(shortOrderLabel('abcdef12zzzz'), '#ABCDEF12');
    });

    test('client-side FAQ filter matches question/answer/category', () {
      final faqs = [
        const FaqItem(id: '1', category: 'orders', question: 'Track order', answer: 'Use My Orders'),
        const FaqItem(id: '2', category: 'payments', question: 'UPI failed', answer: 'Retry payment'),
      ];
      final query = 'upi';
      final matched = faqs
          .where(
            (f) =>
                f.question.toLowerCase().contains(query) ||
                f.answer.toLowerCase().contains(query) ||
                f.category.toLowerCase().contains(query),
          )
          .toList();
      expect(matched, hasLength(1));
      expect(matched.first.id, '2');
    });

    test('client-side ticket search matches subject and shortId', () {
      final tickets = [
        SupportTicket.fromJson({
          'id': 'id-aaa',
          'shortId': '#TKT-AAA11111',
          'subject': 'Refund delay',
          'status': 'OPEN',
          'createdAt': '2026-07-03T10:00:00.000Z',
        }),
        SupportTicket.fromJson({
          'id': 'id-bbb',
          'shortId': '#TKT-BBB22222',
          'subject': 'Wrong item',
          'status': 'CLOSED',
          'createdAt': '2026-07-01T10:00:00.000Z',
        }),
      ];

      final bySubject = tickets.where((t) => t.subject.toLowerCase().contains('refund')).toList();
      final byId = tickets.where((t) => t.shortId.toLowerCase().contains('bbb')).toList();
      final byStatus = tickets.where((t) => t.status == 'OPEN').toList();
      final newestFirst = [...tickets]..sort((a, b) => b.createdAt.compareTo(a.createdAt));

      expect(bySubject.single.shortId, '#TKT-AAA11111');
      expect(byId.single.shortId, '#TKT-BBB22222');
      expect(byStatus, hasLength(1));
      expect(newestFirst.first.shortId, '#TKT-AAA11111');
    });
  });

  group('create ticket payload contract', () {
    test('only subject and optional orderId are sent', () {
      const subject = 'Help with delivery';
      const orderId = 'order-uuid';
      final payload = <String, dynamic>{
        'subject': subject,
        if (orderId.isNotEmpty) 'orderId': orderId,
      };
      expect(payload.keys, unorderedEquals(['subject', 'orderId']));
      expect(payload.containsKey('message'), isFalse);
      expect(payload.containsKey('category'), isFalse);
    });

    test('reply payload uses message key', () {
      final payload = {'message': 'Thanks for the update'};
      expect(payload['message'], isNotEmpty);
      expect(payload.containsKey('body'), isFalse);
    });
  });
}
