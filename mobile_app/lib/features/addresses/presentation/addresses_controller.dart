import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/addresses_repository.dart';
import '../domain/entities/address.dart';

final addressesRepositoryProvider = Provider<AddressesRepository>(
  (ref) => AddressesRepositoryImpl(ref.read(dioClientProvider)),
);

class AddressesController extends AsyncNotifier<List<Address>> {
  AddressesRepository get _repo => ref.read(addressesRepositoryProvider);

  @override
  Future<List<Address>> build() async {
    final authed = ref.watch(isAuthenticatedProvider);
    if (!authed) return const [];
    return _repo.getAll();
  }

  Future<void> refresh() async {
    state = AsyncData(await _repo.getAll());
  }

  Future<Address> create(Map<String, dynamic> body) async {
    final address = await _repo.create(body);
    await refresh();
    return address;
  }

  Future<Address> updateAddress(String id, Map<String, dynamic> body) async {
    final address = await _repo.update(id, body);
    await refresh();
    return address;
  }

  Future<void> delete(String id) async {
    await _repo.delete(id);
    await refresh();
  }
}

final addressesControllerProvider =
    AsyncNotifierProvider<AddressesController, List<Address>>(AddressesController.new);

/// The default address (or the first one, or null).
final defaultAddressProvider = Provider<Address?>((ref) {
  final list = ref.watch(addressesControllerProvider).value ?? const [];
  if (list.isEmpty) return null;
  return list.firstWhere((a) => a.isDefault, orElse: () => list.first);
});
