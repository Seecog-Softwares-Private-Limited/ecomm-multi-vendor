// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cart_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CartProduct {

 String get id; String get name; String? get slug;@JsonKey(name: 'sellingPrice') double get sellingPrice; double get mrp; double? get gstPercent; int get stock; String get status; String? get imageUrl; bool get listingPaused;
/// Create a copy of CartProduct
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CartProductCopyWith<CartProduct> get copyWith => _$CartProductCopyWithImpl<CartProduct>(this as CartProduct, _$identity);

  /// Serializes this CartProduct to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CartProduct&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.sellingPrice, sellingPrice) || other.sellingPrice == sellingPrice)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.gstPercent, gstPercent) || other.gstPercent == gstPercent)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.status, status) || other.status == status)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.listingPaused, listingPaused) || other.listingPaused == listingPaused));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,sellingPrice,mrp,gstPercent,stock,status,imageUrl,listingPaused);

@override
String toString() {
  return 'CartProduct(id: $id, name: $name, slug: $slug, sellingPrice: $sellingPrice, mrp: $mrp, gstPercent: $gstPercent, stock: $stock, status: $status, imageUrl: $imageUrl, listingPaused: $listingPaused)';
}


}

/// @nodoc
abstract mixin class $CartProductCopyWith<$Res>  {
  factory $CartProductCopyWith(CartProduct value, $Res Function(CartProduct) _then) = _$CartProductCopyWithImpl;
@useResult
$Res call({
 String id, String name, String? slug,@JsonKey(name: 'sellingPrice') double sellingPrice, double mrp, double? gstPercent, int stock, String status, String? imageUrl, bool listingPaused
});




}
/// @nodoc
class _$CartProductCopyWithImpl<$Res>
    implements $CartProductCopyWith<$Res> {
  _$CartProductCopyWithImpl(this._self, this._then);

  final CartProduct _self;
  final $Res Function(CartProduct) _then;

/// Create a copy of CartProduct
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = freezed,Object? sellingPrice = null,Object? mrp = null,Object? gstPercent = freezed,Object? stock = null,Object? status = null,Object? imageUrl = freezed,Object? listingPaused = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,sellingPrice: null == sellingPrice ? _self.sellingPrice : sellingPrice // ignore: cast_nullable_to_non_nullable
as double,mrp: null == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double,gstPercent: freezed == gstPercent ? _self.gstPercent : gstPercent // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,listingPaused: null == listingPaused ? _self.listingPaused : listingPaused // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [CartProduct].
extension CartProductPatterns on CartProduct {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CartProduct value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CartProduct() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CartProduct value)  $default,){
final _that = this;
switch (_that) {
case _CartProduct():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CartProduct value)?  $default,){
final _that = this;
switch (_that) {
case _CartProduct() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String? slug, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  double? gstPercent,  int stock,  String status,  String? imageUrl,  bool listingPaused)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CartProduct() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.sellingPrice,_that.mrp,_that.gstPercent,_that.stock,_that.status,_that.imageUrl,_that.listingPaused);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String? slug, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  double? gstPercent,  int stock,  String status,  String? imageUrl,  bool listingPaused)  $default,) {final _that = this;
switch (_that) {
case _CartProduct():
return $default(_that.id,_that.name,_that.slug,_that.sellingPrice,_that.mrp,_that.gstPercent,_that.stock,_that.status,_that.imageUrl,_that.listingPaused);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String? slug, @JsonKey(name: 'sellingPrice')  double sellingPrice,  double mrp,  double? gstPercent,  int stock,  String status,  String? imageUrl,  bool listingPaused)?  $default,) {final _that = this;
switch (_that) {
case _CartProduct() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.sellingPrice,_that.mrp,_that.gstPercent,_that.stock,_that.status,_that.imageUrl,_that.listingPaused);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CartProduct extends CartProduct {
  const _CartProduct({required this.id, required this.name, this.slug, @JsonKey(name: 'sellingPrice') required this.sellingPrice, required this.mrp, this.gstPercent, this.stock = 0, this.status = 'ACTIVE', this.imageUrl, this.listingPaused = false}): super._();
  factory _CartProduct.fromJson(Map<String, dynamic> json) => _$CartProductFromJson(json);

@override final  String id;
@override final  String name;
@override final  String? slug;
@override@JsonKey(name: 'sellingPrice') final  double sellingPrice;
@override final  double mrp;
@override final  double? gstPercent;
@override@JsonKey() final  int stock;
@override@JsonKey() final  String status;
@override final  String? imageUrl;
@override@JsonKey() final  bool listingPaused;

/// Create a copy of CartProduct
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CartProductCopyWith<_CartProduct> get copyWith => __$CartProductCopyWithImpl<_CartProduct>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CartProductToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CartProduct&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.sellingPrice, sellingPrice) || other.sellingPrice == sellingPrice)&&(identical(other.mrp, mrp) || other.mrp == mrp)&&(identical(other.gstPercent, gstPercent) || other.gstPercent == gstPercent)&&(identical(other.stock, stock) || other.stock == stock)&&(identical(other.status, status) || other.status == status)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.listingPaused, listingPaused) || other.listingPaused == listingPaused));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,sellingPrice,mrp,gstPercent,stock,status,imageUrl,listingPaused);

@override
String toString() {
  return 'CartProduct(id: $id, name: $name, slug: $slug, sellingPrice: $sellingPrice, mrp: $mrp, gstPercent: $gstPercent, stock: $stock, status: $status, imageUrl: $imageUrl, listingPaused: $listingPaused)';
}


}

/// @nodoc
abstract mixin class _$CartProductCopyWith<$Res> implements $CartProductCopyWith<$Res> {
  factory _$CartProductCopyWith(_CartProduct value, $Res Function(_CartProduct) _then) = __$CartProductCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String? slug,@JsonKey(name: 'sellingPrice') double sellingPrice, double mrp, double? gstPercent, int stock, String status, String? imageUrl, bool listingPaused
});




}
/// @nodoc
class __$CartProductCopyWithImpl<$Res>
    implements _$CartProductCopyWith<$Res> {
  __$CartProductCopyWithImpl(this._self, this._then);

  final _CartProduct _self;
  final $Res Function(_CartProduct) _then;

/// Create a copy of CartProduct
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = freezed,Object? sellingPrice = null,Object? mrp = null,Object? gstPercent = freezed,Object? stock = null,Object? status = null,Object? imageUrl = freezed,Object? listingPaused = null,}) {
  return _then(_CartProduct(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,sellingPrice: null == sellingPrice ? _self.sellingPrice : sellingPrice // ignore: cast_nullable_to_non_nullable
as double,mrp: null == mrp ? _self.mrp : mrp // ignore: cast_nullable_to_non_nullable
as double,gstPercent: freezed == gstPercent ? _self.gstPercent : gstPercent // ignore: cast_nullable_to_non_nullable
as double?,stock: null == stock ? _self.stock : stock // ignore: cast_nullable_to_non_nullable
as int,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,listingPaused: null == listingPaused ? _self.listingPaused : listingPaused // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$CartItem {

 String get id; String get productId; int get quantity; String? get variantKey; CartProduct get product;
/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CartItemCopyWith<CartItem> get copyWith => _$CartItemCopyWithImpl<CartItem>(this as CartItem, _$identity);

  /// Serializes this CartItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CartItem&&(identical(other.id, id) || other.id == id)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.variantKey, variantKey) || other.variantKey == variantKey)&&(identical(other.product, product) || other.product == product));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,productId,quantity,variantKey,product);

@override
String toString() {
  return 'CartItem(id: $id, productId: $productId, quantity: $quantity, variantKey: $variantKey, product: $product)';
}


}

/// @nodoc
abstract mixin class $CartItemCopyWith<$Res>  {
  factory $CartItemCopyWith(CartItem value, $Res Function(CartItem) _then) = _$CartItemCopyWithImpl;
@useResult
$Res call({
 String id, String productId, int quantity, String? variantKey, CartProduct product
});


$CartProductCopyWith<$Res> get product;

}
/// @nodoc
class _$CartItemCopyWithImpl<$Res>
    implements $CartItemCopyWith<$Res> {
  _$CartItemCopyWithImpl(this._self, this._then);

  final CartItem _self;
  final $Res Function(CartItem) _then;

/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? productId = null,Object? quantity = null,Object? variantKey = freezed,Object? product = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,variantKey: freezed == variantKey ? _self.variantKey : variantKey // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as CartProduct,
  ));
}
/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CartProductCopyWith<$Res> get product {
  
  return $CartProductCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}
}


/// Adds pattern-matching-related methods to [CartItem].
extension CartItemPatterns on CartItem {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CartItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CartItem() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CartItem value)  $default,){
final _that = this;
switch (_that) {
case _CartItem():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CartItem value)?  $default,){
final _that = this;
switch (_that) {
case _CartItem() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String productId,  int quantity,  String? variantKey,  CartProduct product)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CartItem() when $default != null:
return $default(_that.id,_that.productId,_that.quantity,_that.variantKey,_that.product);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String productId,  int quantity,  String? variantKey,  CartProduct product)  $default,) {final _that = this;
switch (_that) {
case _CartItem():
return $default(_that.id,_that.productId,_that.quantity,_that.variantKey,_that.product);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String productId,  int quantity,  String? variantKey,  CartProduct product)?  $default,) {final _that = this;
switch (_that) {
case _CartItem() when $default != null:
return $default(_that.id,_that.productId,_that.quantity,_that.variantKey,_that.product);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CartItem extends CartItem {
  const _CartItem({required this.id, required this.productId, this.quantity = 1, this.variantKey, required this.product}): super._();
  factory _CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);

@override final  String id;
@override final  String productId;
@override@JsonKey() final  int quantity;
@override final  String? variantKey;
@override final  CartProduct product;

/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CartItemCopyWith<_CartItem> get copyWith => __$CartItemCopyWithImpl<_CartItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CartItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CartItem&&(identical(other.id, id) || other.id == id)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.variantKey, variantKey) || other.variantKey == variantKey)&&(identical(other.product, product) || other.product == product));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,productId,quantity,variantKey,product);

@override
String toString() {
  return 'CartItem(id: $id, productId: $productId, quantity: $quantity, variantKey: $variantKey, product: $product)';
}


}

/// @nodoc
abstract mixin class _$CartItemCopyWith<$Res> implements $CartItemCopyWith<$Res> {
  factory _$CartItemCopyWith(_CartItem value, $Res Function(_CartItem) _then) = __$CartItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String productId, int quantity, String? variantKey, CartProduct product
});


@override $CartProductCopyWith<$Res> get product;

}
/// @nodoc
class __$CartItemCopyWithImpl<$Res>
    implements _$CartItemCopyWith<$Res> {
  __$CartItemCopyWithImpl(this._self, this._then);

  final _CartItem _self;
  final $Res Function(_CartItem) _then;

/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? productId = null,Object? quantity = null,Object? variantKey = freezed,Object? product = null,}) {
  return _then(_CartItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,variantKey: freezed == variantKey ? _self.variantKey : variantKey // ignore: cast_nullable_to_non_nullable
as String?,product: null == product ? _self.product : product // ignore: cast_nullable_to_non_nullable
as CartProduct,
  ));
}

/// Create a copy of CartItem
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$CartProductCopyWith<$Res> get product {
  
  return $CartProductCopyWith<$Res>(_self.product, (value) {
    return _then(_self.copyWith(product: value));
  });
}
}

// dart format on
