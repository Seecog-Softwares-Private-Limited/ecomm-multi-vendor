import '../../../core/network/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/entities/address.dart';

abstract interface class AddressesRepository {
  Future<List<Address>> getAll();
  Future<Address> create(Map<String, dynamic> body);
  Future<Address> update(String id, Map<String, dynamic> body);
  Future<void> delete(String id);
}

class AddressesRepositoryImpl implements AddressesRepository {
  AddressesRepositoryImpl(this._client);

  final DioClient _client;

  @override
  Future<List<Address>> getAll() async {
    final data = await _client.get(ApiEndpoints.addresses);
    final map = Map<String, dynamic>.from(data as Map);
    final list = (map['addresses'] as List?) ?? const [];
    return list
        .whereType<Map>()
        .map((e) => Address.fromJson(Map<String, dynamic>.from(e)))
        .toList(growable: false);
  }

  @override
  Future<Address> create(Map<String, dynamic> body) async {
    final data = await _client.post(ApiEndpoints.addresses, data: body);
    final map = Map<String, dynamic>.from(data as Map);
    return Address.fromJson(Map<String, dynamic>.from(map['address'] as Map));
  }

  @override
  Future<Address> update(String id, Map<String, dynamic> body) async {
    final data = await _client.patch(ApiEndpoints.address(id), data: body);
    final map = Map<String, dynamic>.from(data as Map);
    return Address.fromJson(Map<String, dynamic>.from(map['address'] as Map));
  }

  @override
  Future<void> delete(String id) => _client.delete(ApiEndpoints.address(id));
}
