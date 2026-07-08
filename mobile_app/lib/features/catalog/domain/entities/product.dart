import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../core/utils/image_url.dart';

part 'product.freezed.dart';
part 'product.g.dart';

/// Compact product used in listings, grids and carousels.
@freezed
abstract class Product with _$Product {
  const Product._();

  const factory Product({
    required String id,
    required String name,
    required double price,
    double? oldPrice,
    @Default(0) double rating,
    @Default(0) int reviews,
    required String slug,
    String? imageUrl,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);

  String? get image => resolveImageUrl(imageUrl);

  bool get hasDiscount => oldPrice != null && oldPrice! > price;

  int get discountPercent =>
      hasDiscount ? (((oldPrice! - price) / oldPrice!) * 100).round() : 0;
}

@freezed
abstract class SpecItem with _$SpecItem {
  const factory SpecItem({required String label, required String value}) = _SpecItem;
  factory SpecItem.fromJson(Map<String, dynamic> json) => _$SpecItemFromJson(json);
}

@freezed
abstract class VariationItem with _$VariationItem {
  const factory VariationItem({
    required String name,
    @Default(<String>[]) List<String> values,
  }) = _VariationItem;
  factory VariationItem.fromJson(Map<String, dynamic> json) => _$VariationItemFromJson(json);
}

@freezed
abstract class SkuVariant with _$SkuVariant {
  const SkuVariant._();

  const factory SkuVariant({
    required String id,
    String? color,
    String? size,
    required double price,
    required int stock,
    String? sku,
    String? image,
    @Default(<String>[]) List<String> images,
  }) = _SkuVariant;

  factory SkuVariant.fromJson(Map<String, dynamic> json) => _$SkuVariantFromJson(json);

  bool get inStock => stock > 0;

  String get label => [color, size].where((e) => e != null && e.isNotEmpty).join(' · ');
}

/// Full product detail for the PDP.
@freezed
abstract class ProductDetail with _$ProductDetail {
  const ProductDetail._();

  const factory ProductDetail({
    required String id,
    required String sellerId,
    required String name,
    required String slug,
    String? description,
    required double price,
    required double mrp,
    required int stock,
    double? avgRating,
    @Default(0) int reviewCount,
    @Default(<String>[]) List<String> images,
    @Default(<SpecItem>[]) List<SpecItem> specifications,
    @Default(<VariationItem>[]) List<VariationItem> variations,
    @Default(<SkuVariant>[]) List<SkuVariant> skuVariants,
  }) = _ProductDetail;

  factory ProductDetail.fromJson(Map<String, dynamic> json) => _$ProductDetailFromJson(json);

  List<String> get resolvedImages =>
      images.map(resolveImageUrl).whereType<String>().toList(growable: false);

  bool get inStock => stock > 0;

  bool get hasDiscount => mrp > price;

  int get discountPercent => hasDiscount ? (((mrp - price) / mrp) * 100).round() : 0;

  /// Lightweight [Product] projection (e.g. for cart/wishlist mapping).
  Product toListItem() => Product(
        id: id,
        name: name,
        price: price,
        oldPrice: hasDiscount ? mrp : null,
        rating: avgRating ?? 0,
        reviews: reviewCount,
        slug: slug,
        imageUrl: images.isNotEmpty ? images.first : null,
      );
}

@freezed
abstract class Review with _$Review {
  const factory Review({
    required String id,
    required String user,
    @Default(0) int rating,
    required String date,
    String? comment,
    @Default(false) bool verified,
    @Default(0) int helpful,
  }) = _Review;

  factory Review.fromJson(Map<String, dynamic> json) => _$ReviewFromJson(json);
}
