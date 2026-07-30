import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../core/utils/image_url.dart';

part 'cart_item.freezed.dart';
part 'cart_item.g.dart';

@freezed
abstract class CartProduct with _$CartProduct {
  const CartProduct._();

  const factory CartProduct({
    required String id,
    required String name,
    String? slug,
    @JsonKey(name: 'sellingPrice') required double sellingPrice,
    required double mrp,
    double? gstPercent,
    @Default(0) int stock,
    @Default('ACTIVE') String status,
    String? imageUrl,
    @Default(false) bool listingPaused,
    String? sellerName,
  }) = _CartProduct;

  factory CartProduct.fromJson(Map<String, dynamic> json) => _$CartProductFromJson(json);

  String? get image => resolveImageUrl(imageUrl);
  bool get inStock => stock > 0 && status == 'ACTIVE' && !listingPaused;
  bool get hasDiscount => mrp > sellingPrice;
}

@freezed
abstract class CartItem with _$CartItem {
  const CartItem._();

  const factory CartItem({
    required String id,
    required String productId,
    @Default(1) int quantity,
    String? variantKey,
    required CartProduct product,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);

  double get lineTotal => product.sellingPrice * quantity;
  double get lineMrpTotal => product.mrp * quantity;
  double get lineSavings {
    final diff = product.mrp - product.sellingPrice;
    return (diff > 0 ? diff : 0.0) * quantity;
  }
}
