import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/core/network/connectivity_service.dart';
import 'package:mobile_app/features/products/data/datasources/products_local_data_source.dart';
import 'package:mobile_app/features/products/data/datasources/products_remote_data_source.dart';
import 'package:mobile_app/features/products/data/models/product_model.dart';
import 'package:mobile_app/features/products/data/repositories/products_repository_impl.dart';

class _MockRemoteDataSource extends Mock implements ProductsRemoteDataSource {}

class _MockLocalDataSource extends Mock implements ProductsLocalDataSource {}

class _MockConnectivityService extends Mock implements ConnectivityService {}

void main() {
  late _MockRemoteDataSource remote;
  late _MockLocalDataSource local;
  late _MockConnectivityService connectivity;
  late ProductsRepositoryImpl repository;

  const sampleProducts = [
    ProductModel(
      id: '1',
      title: 'Cached Product',
      price: 999,
      stock: 4,
      imageUrl: '',
    ),
  ];

  setUp(() {
    remote = _MockRemoteDataSource();
    local = _MockLocalDataSource();
    connectivity = _MockConnectivityService();
    repository = ProductsRepositoryImpl(
      remoteDataSource: remote,
      localDataSource: local,
      connectivityService: connectivity,
    );
  });

  test('fetches remote products and caches them when online', () async {
    when(() => connectivity.isOnline).thenAnswer((_) async => true);
    when(
      () => remote.fetchProducts(page: any(named: 'page'), limit: any(named: 'limit')),
    ).thenAnswer((_) async => sampleProducts);
    when(() => local.saveProducts(any())).thenAnswer((_) async {});

    final snapshot = await repository.fetchProducts();

    expect(snapshot.products, hasLength(1));
    expect(snapshot.products.first.title, 'Cached Product');
    expect(snapshot.isFromCache, isFalse);
    expect(snapshot.isOffline, isFalse);
    verify(() => local.saveProducts(sampleProducts)).called(1);
  });

  test('returns cached products when offline', () async {
    when(() => connectivity.isOnline).thenAnswer((_) async => false);
    when(() => local.readProducts()).thenAnswer((_) async => sampleProducts);

    final snapshot = await repository.fetchProducts();

    expect(snapshot.products, hasLength(1));
    expect(snapshot.isFromCache, isTrue);
    expect(snapshot.isOffline, isTrue);
    verifyNever(
      () => remote.fetchProducts(page: any(named: 'page'), limit: any(named: 'limit')),
    );
  });

  test('falls back to cache when remote request fails', () async {
    when(() => connectivity.isOnline).thenAnswer((_) async => true);
    when(
      () => remote.fetchProducts(page: any(named: 'page'), limit: any(named: 'limit')),
    ).thenThrow(DioException(requestOptions: RequestOptions(path: '/products')));
    when(() => local.readProducts()).thenAnswer((_) async => sampleProducts);

    final snapshot = await repository.fetchProducts();

    expect(snapshot.products, hasLength(1));
    expect(snapshot.isFromCache, isTrue);
    expect(snapshot.isOffline, isFalse);
  });

  test('returns fallback products when online with no cache and empty remote', () async {
    when(() => connectivity.isOnline).thenAnswer((_) async => true);
    when(
      () => remote.fetchProducts(page: any(named: 'page'), limit: any(named: 'limit')),
    ).thenAnswer((_) async => const <ProductModel>[]);
    when(() => local.readProducts()).thenAnswer((_) async => null);

    final snapshot = await repository.fetchProducts(page: 1, limit: 2);

    expect(snapshot.products, hasLength(2));
    expect(snapshot.products.first.title, 'Sample Product 1');
    expect(snapshot.isFromCache, isFalse);
    expect(snapshot.isOffline, isFalse);
  });
}
