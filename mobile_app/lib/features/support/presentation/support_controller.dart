import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/network/api_endpoints.dart';
import '../../auth/presentation/auth_controller.dart';
import '../domain/support_ticket.dart';

class SupportRepository {
  SupportRepository(this._ref);
  final Ref _ref;

  Future<List<SupportTicket>> list() async {
    final data = await _ref.read(dioClientProvider).get(ApiEndpoints.supportTickets);
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['tickets'] as List?) ?? const [];
    return list
        .whereType<Map>()
        .map((e) => SupportTicket.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  Future<SupportTicket> create({required String subject, String? orderId}) async {
    final data = await _ref.read(dioClientProvider).post(
      ApiEndpoints.supportTickets,
      data: {'subject': subject, 'orderId': ?orderId},
    );
    final map = Map<String, dynamic>.from(data as Map);
    return SupportTicket.fromJson(Map<String, dynamic>.from(map['ticket'] as Map));
  }
}

final supportRepositoryProvider = Provider<SupportRepository>(SupportRepository.new);

class SupportController extends AsyncNotifier<List<SupportTicket>> {
  @override
  Future<List<SupportTicket>> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const [];
    return ref.read(supportRepositoryProvider).list();
  }

  Future<void> refresh() async {
    state = AsyncData(await ref.read(supportRepositoryProvider).list());
  }

  Future<SupportTicket> create({required String subject, String? orderId}) async {
    final ticket = await ref.read(supportRepositoryProvider).create(subject: subject, orderId: orderId);
    await refresh();
    return ticket;
  }
}

final supportControllerProvider =
    AsyncNotifierProvider<SupportController, List<SupportTicket>>(SupportController.new);
