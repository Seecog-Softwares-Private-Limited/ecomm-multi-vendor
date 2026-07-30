import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/support_repository.dart';
import '../domain/faq_item.dart';
import '../domain/support_ticket.dart';
import '../domain/support_ticket_message.dart';

final supportRepositoryProvider = Provider<SupportRepository>(
  (ref) => SupportRepository(ref.read(dioClientProvider)),
);

/// All FAQs from GET /api/faqs (public API; app gates via auth route).
final faqsProvider = FutureProvider.autoDispose<List<FaqItem>>((ref) {
  return ref.read(supportRepositoryProvider).listFaqs();
});

final faqSearchQueryProvider = NotifierProvider<_StringQuery, String>(_StringQuery.new);
final faqCategoryFilterProvider = NotifierProvider<_FaqCategoryFilter, String>(_FaqCategoryFilter.new);

class _StringQuery extends Notifier<String> {
  @override
  String build() => '';

  void update(String value) => state = value;
}

class _FaqCategoryFilter extends Notifier<String> {
  @override
  String build() => FaqCategories.all;

  void update(String value) => state = value;
}

final filteredFaqsProvider = Provider.autoDispose<AsyncValue<List<FaqItem>>>((ref) {
  final faqsAsync = ref.watch(faqsProvider);
  final query = ref.watch(faqSearchQueryProvider).trim().toLowerCase();
  final category = ref.watch(faqCategoryFilterProvider);

  return faqsAsync.whenData((faqs) {
    var list = faqs;
    if (category != FaqCategories.all) {
      list = list.where((f) => f.category == category).toList(growable: false);
    }
    if (query.isNotEmpty) {
      list = list
          .where(
            (f) =>
                f.question.toLowerCase().contains(query) ||
                f.answer.toLowerCase().contains(query) ||
                f.category.toLowerCase().contains(query),
          )
          .toList(growable: false);
    }
    return list;
  });
});

class SupportController extends AsyncNotifier<List<SupportTicket>> {
  @override
  Future<List<SupportTicket>> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const [];
    return ref.read(supportRepositoryProvider).listTickets();
  }

  Future<void> refresh() async {
    final authed = ref.read(isAuthenticatedProvider);
    if (!authed) {
      state = const AsyncData([]);
      return;
    }
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(supportRepositoryProvider).listTickets(),
    );
  }

  Future<SupportTicket> create({required String subject, String? orderId}) async {
    final ticket = await ref.read(supportRepositoryProvider).createTicket(
          subject: subject,
          orderId: orderId,
        );
    await refresh();
    return ticket;
  }
}

final supportControllerProvider =
    AsyncNotifierProvider<SupportController, List<SupportTicket>>(SupportController.new);

final ticketsSearchQueryProvider = NotifierProvider<_StringQuery, String>(_StringQuery.new);
final ticketsStatusFilterProvider = NotifierProvider<_TicketsStatusFilter, String>(_TicketsStatusFilter.new);

class _TicketsStatusFilter extends Notifier<String> {
  @override
  String build() => 'all';

  void update(String value) => state = value;
}

final filteredTicketsProvider = Provider.autoDispose<AsyncValue<List<SupportTicket>>>((ref) {
  final ticketsAsync = ref.watch(supportControllerProvider);
  final query = ref.watch(ticketsSearchQueryProvider).trim().toLowerCase();
  final status = ref.watch(ticketsStatusFilterProvider);

  return ticketsAsync.whenData((tickets) {
    var list = tickets;
    if (status.toUpperCase() != 'ALL') {
      list = list.where((t) => t.status.toUpperCase() == status.toUpperCase()).toList(growable: false);
    }
    if (query.isNotEmpty) {
      list = list.where((t) {
        final short = t.shortId.toLowerCase();
        final id = t.id.toLowerCase();
        final subject = t.subject.toLowerCase();
        return subject.contains(query) ||
            short.contains(query) ||
            id.contains(query) ||
            (t.orderId?.toLowerCase().contains(query) ?? false);
      }).toList(growable: false);
    }
    // Newest first (API already orders by createdAt desc; keep stable).
    final sorted = [...list]..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sorted;
  });
});

/// Help Center home search across FAQs + tickets (client-side).
final helpCenterSearchQueryProvider = NotifierProvider<_StringQuery, String>(_StringQuery.new);

final supportTicketDetailProvider =
    FutureProvider.autoDispose.family<SupportTicket, String>((ref, id) {
  return ref.read(supportRepositoryProvider).getTicket(id);
});

class TicketMessagesController extends AsyncNotifier<List<SupportTicketMessage>> {
  TicketMessagesController(this.ticketId);

  final String ticketId;

  @override
  Future<List<SupportTicketMessage>> build() {
    return ref.read(supportRepositoryProvider).listMessages(ticketId);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(supportRepositoryProvider).listMessages(ticketId),
    );
  }

  Future<void> reply(String message) async {
    final trimmed = message.trim();
    if (trimmed.isEmpty) return;

    final previous = state.value ?? const <SupportTicketMessage>[];
    final optimistic = SupportTicketMessage(
      id: 'optimistic-${DateTime.now().microsecondsSinceEpoch}',
      author: 'CUSTOMER',
      body: trimmed,
      createdAt: DateTime.now(),
      authorName: 'You',
      isOptimistic: true,
    );
    state = AsyncData([...previous, optimistic]);

    try {
      final messages = await ref.read(supportRepositoryProvider).reply(
            ticketId: ticketId,
            message: trimmed,
          );
      state = AsyncData(messages);
      ref.invalidate(supportTicketDetailProvider(ticketId));
      await ref.read(supportControllerProvider.notifier).refresh();
    } catch (_) {
      state = AsyncData(previous);
      rethrow;
    }
  }
}

final ticketMessagesControllerProvider = AsyncNotifierProvider.autoDispose
    .family<TicketMessagesController, List<SupportTicketMessage>, String>(
  TicketMessagesController.new,
);
