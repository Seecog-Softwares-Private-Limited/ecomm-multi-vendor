import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/faq_item.dart';
import '../domain/support_ticket.dart';
import '../domain/support_ticket_message.dart';

/// Customer support & FAQ API client. Consumes existing backend routes only.
class SupportRepository {
  SupportRepository(this._dio);

  final DioClient _dio;

  Future<List<FaqItem>> listFaqs() async {
    final data = await _dio.get(ApiEndpoints.faqs);
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['faqs'] as List?) ?? const [];
    final faqs = list
        .whereType<Map>()
        .map((e) => FaqItem.fromApi(Map<String, dynamic>.from(e)))
        .toList();
    faqs.sort((a, b) {
      final byOrder = a.displayOrder.compareTo(b.displayOrder);
      if (byOrder != 0) return byOrder;
      return a.question.compareTo(b.question);
    });
    return List.unmodifiable(faqs);
  }

  Future<List<SupportTicket>> listTickets({String? status}) async {
    final query = <String, dynamic>{};
    if (status != null && status.isNotEmpty && status.toUpperCase() != 'ALL') {
      query['status'] = status.toUpperCase();
    }
    final data = await _dio.get(
      ApiEndpoints.supportTickets,
      query: query.isEmpty ? null : query,
    );
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['tickets'] as List?) ?? const [];
    final tickets = list
        .whereType<Map>()
        .map((e) => SupportTicket.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    tickets.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return List.unmodifiable(tickets);
  }

  Future<SupportTicket> getTicket(String id) async {
    final data = await _dio.get(ApiEndpoints.supportTicket(id));
    final map = Map<String, dynamic>.from(data as Map);
    return SupportTicket.fromJson(Map<String, dynamic>.from(map['ticket'] as Map));
  }

  Future<SupportTicket> createTicket({required String subject, String? orderId}) async {
    final data = await _dio.post(
      ApiEndpoints.supportTickets,
      data: {
        'subject': subject,
        if (orderId != null && orderId.isNotEmpty) 'orderId': orderId,
      },
    );
    final map = Map<String, dynamic>.from(data as Map);
    return SupportTicket.fromJson(Map<String, dynamic>.from(map['ticket'] as Map));
  }

  Future<List<SupportTicketMessage>> listMessages(String ticketId) async {
    final data = await _dio.get(ApiEndpoints.supportTicketMessages(ticketId));
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['messages'] as List?) ?? const [];
    final messages = list
        .whereType<Map>()
        .map((e) => SupportTicketMessage.fromApi(Map<String, dynamic>.from(e)))
        .toList();
    messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return List.unmodifiable(messages);
  }

  Future<List<SupportTicketMessage>> reply({
    required String ticketId,
    required String message,
  }) async {
    final data = await _dio.post(
      ApiEndpoints.supportTicketReply(ticketId),
      data: {'message': message},
    );
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['messages'] as List?) ?? const [];
    final messages = list
        .whereType<Map>()
        .map((e) => SupportTicketMessage.fromApi(Map<String, dynamic>.from(e)))
        .toList();
    messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    return List.unmodifiable(messages);
  }
}
