import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../core/utils/image_url.dart';
import '../../../catalog/domain/entities/product.dart';

part 'wishlist_item.freezed.dart';
part 'wishlist_item.g.dart';

@freezed
abstract class WishlistProduct with _$WishlistProduct {
  const WishlistProduct._();

  const factory WishlistProduct({
    required String id,
    required String name,
    @JsonKey(name: 'sellingPrice') required double sellingPrice,
    required double mrp,
    @Default(0) int stock,
    @Default('ACTIVE') String status,
    double? avgRating,
    String? imageUrl,
    @Default(false) bool listingPaused,
  }) = _WishlistProduct;

  factory WishlistProduct.fromJson(Map<String, dynamic> json) => _$WishlistProductFromJson(json);

  String? get image => resolveImageUrl(imageUrl);
  bool get inStock => stock > 0 && status == 'ACTIVE' && !listingPaused;
  bool get hasDiscount => mrp > sellingPrice;

  Product toListItem() => Product(
        id: id,
        name: name,
        price: sellingPrice,
        oldPrice: hasDiscount ? mrp : null,
        rating: avgRating ?? 0,
        slug: id,
        imageUrl: imageUrl,
      );
}

@freezed
abstract class WishlistItem with _$WishlistItem {
  const factory WishlistItem({
    required String id,
    required String productId,
    String? variantKey,
    required WishlistProduct product,
  }) = _WishlistItem;

  factory WishlistItem.fromJson(Map<String, dynamic> json) => _$WishlistItemFromJson(json);
}
