import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile_app/features/products/domain/entities/product.dart';
import 'package:mobile_app/features/products/domain/entities/products_snapshot.dart';
import 'package:mobile_app/features/products/domain/usecases/get_products_usecase.dart';
import 'package:mobile_app/features/products/presentation/providers/products_controller.dart';

class _MockGetProductsUseCase extends Mock implements GetProductsUseCase {}

void main() {
  late _MockGetProductsUseCase getProductsUseCase;

  final pageOneProducts = List.generate(
    20,
    (index) => Product(
      id: 'p$index',
      title: 'Product $index',
      price: 100,
      stock: 5,
      imageUrl: '',
    ),
  );

  const pageTwoProducts = [
    Product(
      id: 'p20',
      title: 'Product 20',
      price: 100,
      stock: 5,
      imageUrl: '',
    ),
  ];

  setUp(() {
    getProductsUseCase = _MockGetProductsUseCase();
  });

  test('loadMore appends next page when more data exists', () async {
    when(
      () => getProductsUseCase(page: 1, limit: any(named: 'limit')),
    ).thenAnswer(
      (_) async => ProductsSnapshot(products: pageOneProducts),
    );
    when(
      () => getProductsUseCase(page: 2, limit: any(named: 'limit')),
    ).thenAnswer(
      (_) async => const ProductsSnapshot(products: pageTwoProducts),
    );

    final controller = ProductsController(getProductsUseCase);
    await Future<void>.delayed(Duration.zero);

    expect(controller.state.items, hasLength(20));
    expect(controller.state.hasMore, isTrue);

    await controller.loadMore();

    expect(controller.state.items, hasLength(21));
    expect(controller.state.page, 2);
    expect(controller.state.hasMore, isFalse);
    expect(controller.state.isLoadingMore, isFalse);
  });

  test('loadMore is ignored while initial load is in progress', () async {
    when(
      () => getProductsUseCase(page: any(named: 'page'), limit: any(named: 'limit')),
    ).thenAnswer((_) async {
      await Future<void>.delayed(const Duration(milliseconds: 50));
      return ProductsSnapshot(products: pageOneProducts);
    });

    final controller = ProductsController(getProductsUseCase);
    await controller.loadMore();

    verify(
      () => getProductsUseCase(page: 1, limit: any(named: 'limit')),
    ).called(1);
    verifyNever(
      () => getProductsUseCase(page: 2, limit: any(named: 'limit')),
    );
  });
}
