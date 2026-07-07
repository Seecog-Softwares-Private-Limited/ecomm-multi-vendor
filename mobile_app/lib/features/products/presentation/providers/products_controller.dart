import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/service_locator.dart';
import '../../../../core/utils/error_message.dart';
import '../../domain/entities/product.dart';
import '../../domain/usecases/get_products_usecase.dart';

const _pageSize = 20;

class ProductsState {
  const ProductsState({
    this.items = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.page = 1,
    this.hasMore = true,
    this.isFromCache = false,
    this.isOffline = false,
  });

  final List<Product> items;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final int page;
  final bool hasMore;
  final bool isFromCache;
  final bool isOffline;

  ProductsState copyWith({
    List<Product>? items,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    int? page,
    bool? hasMore,
    bool? isFromCache,
    bool? isOffline,
    bool clearError = false,
    bool clearItems = false,
  }) {
    return ProductsState(
      items: clearItems ? const [] : (items ?? this.items),
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isFromCache: isFromCache ?? this.isFromCache,
      isOffline: isOffline ?? this.isOffline,
    );
  }
}

class ProductsController extends StateNotifier<ProductsState> {
  ProductsController(this._getProductsUseCase) : super(const ProductsState()) {
    loadInitial();
  }

  final GetProductsUseCase _getProductsUseCase;
  Future<void>? _pendingInitialLoad;
  Future<void>? _pendingLoadMore;

  Future<void> loadInitial() {
    _pendingLoadMore = null;
    return _pendingInitialLoad ??= _loadInitial();
  }

  Future<void> _loadInitial() async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      clearItems: true,
      page: 1,
      hasMore: true,
      isFromCache: false,
      isOffline: false,
    );
    try {
      final snapshot = await _getProductsUseCase(page: 1, limit: _pageSize);
      state = state.copyWith(
        items: snapshot.products,
        isLoading: false,
        page: 1,
        hasMore: snapshot.products.length >= _pageSize,
        isFromCache: snapshot.isFromCache,
        isOffline: snapshot.isOffline,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: formatAppError(error),
      );
    } finally {
      _pendingInitialLoad = null;
    }
  }

  Future<void> loadMore() {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) {
      return Future<void>.value();
    }
    return _pendingLoadMore ??= _loadMore();
  }

  Future<void> _loadMore() async {
    final nextPage = state.page + 1;
    state = state.copyWith(isLoadingMore: true, clearError: true);

    try {
      final snapshot = await _getProductsUseCase(page: nextPage, limit: _pageSize);
      final newItems = snapshot.products;
      state = state.copyWith(
        items: [...state.items, ...newItems],
        isLoadingMore: false,
        page: nextPage,
        hasMore: newItems.length >= _pageSize,
        isFromCache: snapshot.isFromCache,
        isOffline: snapshot.isOffline,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: formatAppError(error),
      );
    } finally {
      _pendingLoadMore = null;
    }
  }
}

final productsControllerProvider =
    StateNotifierProvider.autoDispose<ProductsController, ProductsState>((ref) {
      return ProductsController(sl<GetProductsUseCase>());
    });
