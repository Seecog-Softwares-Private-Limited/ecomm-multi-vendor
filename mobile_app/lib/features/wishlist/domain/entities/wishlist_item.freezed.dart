// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'wishlist_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$WishlistProduct {

 String get id; String get name;@JsonKey(name: 'sellingPrice') double get sellingPrice; double get mrp; int get stock; String get status; double? get avgRating; int get reviewCount; String? get sellerName; int get discountPercent; String? get imageUrl; bool get listingPaused;
/// Create a copy of WishlistProduct
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WishlistProductCopyWith<WishlistProduct> get copyWith => _$WishlistProductCopyWithImpl<WishlistProduct>(this as WishlistProduct, _$identity);

  /// Serializes this WishlistProduct to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WishlistProduct&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.sellingPrice, sellingPrice) || other.sellingPrice == sellingPrice)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.status, status) || other.status == status)&&(identical(other.avgRating, avgRating) || other.avgRating == avgRating)&&(identical(other.reviewCount, reviewCount) || other.reviewCount == reviewCount)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.discountPercent, discountPercent) || other.discountPercent == discountPercent)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.listingPaused, listingPaused) || other.listingPaused == listingPaused));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,sellingPrice,mrp,stock,status,avgRating,reviewCount,sellerName,discountPercent,imageUrl,listingPaused);

@override
String toString() {
  return 'WishlistProduct(id: $id, name: $name, sellingPrice: $sellingPrice, mrp: $mrp, stock: $stock, status: $status, avgRating: $avgRating, reviewCount: $reviewCount, sellerName: $sellerName, discountPercent: $discountPercent, imageUrl: $imageUrl, listingPaused: $listingPaused)';
}


}

/// @nodoc
abstract mixin class $WishlistProductCopyWith<$Res>  {
  factory $WishlistProductCopyWith(WishlistProduct value, $Res Function(WishlistProduct) _then) = _$WishlistProductCopyWithImpl;
@useResult
$Res call({
 String id, String name,@JsonKey(name: 'sellingPrice') double sellingPrice, double mrp, int stock, String status, double? avgRating, int reviewCount, String? sellerName, int discountPercent, String? imageUrl, bool listingPaused
});




}
/// @nodoc
class _$WishlistProductCopyWithImpl<$Res>
    implements $WishlistProductCopyWith<$Res> {
  _$WishlistProductCopyWithImpl(this._self, this._then);

  final WishlistProduct _self;
  final $Res Function(WishlistProduct) _then;

/// Create a copy of WishlistProduct
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? sellingPrice = null,Object? mrp = null,Object? stock = null,Object? status = null,Object? avgRating = freezed,Object? reviewCount = null,Object? sellerName = freezed,Object? discountPercent = null,Object? imageUrl = freezed,Object? listingPaused = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sellingPrice: null == sellingPrice ? _self.sellingPrice : sellingPrice // ignore: cast_nullable_to_non_nullable
as double,mrp: null == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,avgRating: freezed == avgRating ? _self.avgRating : avgRating // ignore: cast_nullable_to_non_nullable
as double?,reviewCount: null == reviewCount ? _self.reviewCount : reviewCount // ignore: cast_nullable_to_non_nullable
as int,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
as String?,discountPercent: null == discountPercent ? _self.discountPercent : discountPercent // ignore: cast_nullable_to_non_nullable
as int,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,listingPaused: null == listingPaused ? _self.listingPaused : listingPaused // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [WishlistProduct].
extension WishlistProductPatterns on WishlistProduct {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WishlistProduct value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WishlistProduct() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WishlistProduct value)  $default,){
final _that = this;
switch (_that) {
case _WishlistProduct():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WishlistProduct value)?  $default,){
final _that = this;
switch (_that) {
case _WishlistProduct() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  int stock,  String status,  double? avgRating,  int reviewCount,  String? sellerName,  int discountPercent,  String? imageUrl,  bool listingPaused)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WishlistProduct() when $default != null:
return $default(_that.id,_that.name,_that.sellingPrice,_that.mrp,_that.stock,_that.status,_that.avgRating,_that.reviewCount,_that.sellerName,_that.discountPercent,_that.imageUrl,_that.listingPaused);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  int stock,  String status,  double? avgRating,  int reviewCount,  String? sellerName,  int discountPercent,  String? imageUrl,  bool listingPaused)  $default,) {final _that = this;
switch (_that) {
case _WishlistProduct():
return $default(_that.id,_that.name,_that.sellingPrice,_that.mrp,_that.stock,_that.status,_that.avgRating,_that.reviewCount,_that.sellerName,_that.discountPercent,_that.imageUrl,_that.listingPaused);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  int stock,  String status,  double? avgRating,  int reviewCount,  String? sellerName,  int discountPercent,  String? imageUrl,  bool listingPaused)?  $default,) {final _that = this;
switch (_that) {
case _WishlistProduct() when $default != null:
return $default(_that.id,_that.name,_that.sellingPrice,_that.mrp,_that.stock,_that.status,_that.avgRating,_that.reviewCount,_that.sellerName,_that.discountPercent,_that.imageUrl,_that.listingPaused);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _WishlistProduct extends WishlistProduct {
  const _WishlistProduct({required this.id, required this.name, @JsonKey(name: 'sellingPrice') required this.sellingPrice, required this.mrp, this.stock = 0, this.status = 'ACTIVE', this.avgRating, this.reviewCount = 0, this.sellerName, this.discountPercent = 0, this.imageUrl, this.listingPaused = false}): super._();
  factory _WishlistProduct.fromJson(Map<String, dynamic> json) => _$WishlistProductFromJson(json);

@override final  String id;
@override final  String name;
@override@JsonKey(name: 'sellingPrice') final  double sellingPrice;
@override final  double mrp;
@override@JsonKey() final  int stock;
@override@JsonKey() final  String status;
@override final  double? avgRating;
@override@JsonKey() final  int reviewCount;
@override final  String? sellerName;
@override@JsonKey() final  int discountPercent;
@override final  String? imageUrl;
@override@JsonKey() final  bool listingPaused;

/// Create a copy of WishlistProduct
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WishlistProductCopyWith<_WishlistProduct> get copyWith => __$WishlistProductCopyWithImpl<_WishlistProduct>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$WishlistProductToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _WishlistProduct&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.sellingPrice, sellingPrice) || other.sellingPrice == sellingPrice)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.status, status) || other.status == status)&&(identical(other.avgRating, avgRating) || other.avgRating == avgRating)&&(identical(other.reviewCount, reviewCount) || other.reviewCount == reviewCount)&&(identical(other.sellerName, sellerName) || other.sellerName == sellerName)&&(identical(other.discountPercent, discountPercent) || other.discountPercent == discountPercent)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.listingPaused, listingPaused) || other.listingPaused == listingPaused));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,sellingPrice,mrp,stock,status,avgRating,reviewCount,sellerName,discountPercent,imageUrl,listingPaused);

@override
String toString() {
  return 'WishlistProduct(id: $id, name: $name, sellingPrice: $sellingPrice, mrp: $mrp, stock: $stock, status: $status, avgRating: $avgRating, reviewCount: $reviewCount, sellerName: $sellerName, discountPercent: $discountPercent, imageUrl: $imageUrl, listingPaused: $listingPaused)';
}


}

/// @nodoc
abstract mixin class _$WishlistProductCopyWith<$Res> implements $WishlistProductCopyWith<$Res> {
  factory _$WishlistProductCopyWith(_WishlistProduct value, $Res Function(_WishlistProduct) _then) = __$WishlistProductCopyWithImpl;
@override @useResult
$Res call({
 String id, String name,@JsonKey(name: 'sellingPrice') double sellingPrice, double mrp, int stock, String status, double? avgRating, int reviewCount, String? sellerName, int discountPercent, String? imageUrl, bool listingPaused
});




}
/// @nodoc
class __$WishlistProductCopyWithImpl<$Res>
    implements _$WishlistProductCopyWith<$Res> {
  __$WishlistProductCopyWithImpl(this._self, this._then);

  final _WishlistProduct _self;
  final $Res Function(_WishlistProduct) _then;

/// Create a copy of WishlistProduct
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? sellingPrice = null,Object? mrp = null,Object? stock = null,Object? status = null,Object? avgRating = freezed,Object? reviewCount = null,Object? sellerName = freezed,Object? discountPercent = null,Object? imageUrl = freezed,Object? listingPaused = null,}) {
  return _then(_WishlistProduct(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sellingPrice: null == sellingPrice ? _self.sellingPrice : sellingPrice // ignore: cast_nullable_to_non_nullable
as double,mrp: null == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,avgRating: freezed == avgRating ? _self.avgRating : avgRating // ignore: cast_nullable_to_non_nullable
as double?,reviewCount: null == reviewCount ? _self.reviewCount : reviewCount // ignore: cast_nullable_to_non_nullable
as int,sellerName: freezed == sellerName ? _self.sellerName : sellerName // ignore: cast_nullable_to_non_nullable
as String?,discountPercent: null == discountPercent ? _self.discountPercent : discountPercent // ignore: cast_nullable_to_non_nullable
as int,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,listingPaused: null == listingPaused ? _self.listingPaused : listingPaused // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$WishlistItem {

 String get id; String get productId; String? get variantKey; WishlistProduct get product;
/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WishlistItemCopyWith<WishlistItem> get copyWith => _$WishlistItemCopyWithImpl<WishlistItem>(this as WishlistItem, _$identity);

  /// Serializes this WishlistItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WishlistItem&&(identical(other.id, id) || other.id == id)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.variantKey, variantKey) || other.variantKey == variantKey)&&(identical(other.product, product) || other.product == product));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,productId,variantKey,product);

@override
String toString() {
  return 'WishlistItem(id: $id, productId: $productId, variantKey: $variantKey, product: $product)';
}


}

/// @nodoc
abstract mixin class $WishlistItemCopyWith<$Res>  {
  factory $WishlistItemCopyWith(WishlistItem value, $Res Function(WishlistItem) _then) = _$WishlistItemCopyWithImpl;
@useResult
$Res call({
 String id, String productId, String? variantKey, WishlistProduct product
});


$WishlistProductCopyWith<$Res> get product;

}
/// @nodoc
class _$WishlistItemCopyWithImpl<$Res>
    implements $WishlistItemCopyWith<$Res> {
  _$WishlistItemCopyWithImpl(this._self, this._then);

  final WishlistItem _self;
  final $Res Function(WishlistItem) _then;

/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? productId = null,Object? variantKey = freezed,Object? product = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,variantKey: freezed == variantKey ? _self.variantKey : variantKey // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as WishlistProduct,
  ));
}
/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$WishlistProductCopyWith<$Res> get product {
  
  return $WishlistProductCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}
}


/// Adds pattern-matching-related methods to [WishlistItem].
extension WishlistItemPatterns on WishlistItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WishlistItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WishlistItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WishlistItem value)  $default,){
final _that = this;
switch (_that) {
case _WishlistItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WishlistItem value)?  $default,){
final _that = this;
switch (_that) {
case _WishlistItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String productId,  String? variantKey,  WishlistProduct product)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WishlistItem() when $default != null:
return $default(_that.id,_that.productId,_that.variantKey,_that.product);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String productId,  String? variantKey,  WishlistProduct product)  $default,) {final _that = this;
switch (_that) {
case _WishlistItem():
return $default(_that.id,_that.productId,_that.variantKey,_that.product);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String productId,  String? variantKey,  WishlistProduct product)?  $default,) {final _that = this;
switch (_that) {
case _WishlistItem() when $default != null:
return $default(_that.id,_that.productId,_that.variantKey,_that.product);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _WishlistItem implements WishlistItem {
  const _WishlistItem({required this.id, required this.productId, this.variantKey, required this.product});
  factory _WishlistItem.fromJson(Map<String, dynamic> json) => _$WishlistItemFromJson(json);

@override final  String id;
@override final  String productId;
@override final  String? variantKey;
@override final  WishlistProduct product;

/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WishlistItemCopyWith<_WishlistItem> get copyWith => __$WishlistItemCopyWithImpl<_WishlistItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$WishlistItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _WishlistItem&&(identical(other.id, id) || other.id == id)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.variantKey, variantKey) || other.variantKey == variantKey)&&(identical(other.product, product) || other.product == product));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,productId,variantKey,product);

@override
String toString() {
  return 'WishlistItem(id: $id, productId: $productId, variantKey: $variantKey, product: $product)';
}


}

/// @nodoc
abstract mixin class _$WishlistItemCopyWith<$Res> implements $WishlistItemCopyWith<$Res> {
  factory _$WishlistItemCopyWith(_WishlistItem value, $Res Function(_WishlistItem) _then) = __$WishlistItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String productId, String? variantKey, WishlistProduct product
});


@override $WishlistProductCopyWith<$Res> get product;

}
/// @nodoc
class __$WishlistItemCopyWithImpl<$Res>
    implements _$WishlistItemCopyWith<$Res> {
  __$WishlistItemCopyWithImpl(this._self, this._then);

  final _WishlistItem _self;
  final $Res Function(_WishlistItem) _then;

/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? productId = null,Object? variantKey = freezed,Object? product = null,}) {
  return _then(_WishlistItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,variantKey: freezed == variantKey ? _self.variantKey : variantKey // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as WishlistProduct,
  ));
}

/// Create a copy of WishlistItem
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$WishlistProductCopyWith<$Res> get product {
  
  return $WishlistProductCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}
}

// dart format on
