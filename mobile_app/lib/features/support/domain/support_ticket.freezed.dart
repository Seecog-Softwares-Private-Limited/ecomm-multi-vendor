// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'support_ticket.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SupportTicket {

 String get id; String get shortId; String get subject; String get status; String? get orderId; DateTime get createdAt; DateTime? get lastUpdateAt; DateTime? get updatedAt; String? get adminReply; DateTime? get adminRepliedAt;
/// Create a copy of SupportTicket
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SupportTicketCopyWith<SupportTicket> get copyWith => _$SupportTicketCopyWithImpl<SupportTicket>(this as SupportTicket, _$identity);

  /// Serializes this SupportTicket to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SupportTicket&&(identical(other.id, id) || other.id == id)&&(identical(other.shortId, shortId) || other.shortId == shortId)&&(identical(other.subject, subject) || other.subject == subject)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderId, orderId) || other.orderId == orderId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.lastUpdateAt, lastUpdateAt) || other.lastUpdateAt == lastUpdateAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.adminReply, adminReply) || other.adminReply == adminReply)&&(identical(other.adminRepliedAt, adminRepliedAt) || other.adminRepliedAt == adminRepliedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,shortId,subject,status,orderId,createdAt,lastUpdateAt,updatedAt,adminReply,adminRepliedAt);

@override
String toString() {
  return 'SupportTicket(id: $id, shortId: $shortId, subject: $subject, status: $status, orderId: $orderId, createdAt: $createdAt, lastUpdateAt: $lastUpdateAt, updatedAt: $updatedAt, adminReply: $adminReply, adminRepliedAt: $adminRepliedAt)';
}


}

/// @nodoc
abstract mixin class $SupportTicketCopyWith<$Res>  {
  factory $SupportTicketCopyWith(SupportTicket value, $Res Function(SupportTicket) _then) = _$SupportTicketCopyWithImpl;
@useResult
$Res call({
 String id, String shortId, String subject, String status, String? orderId, DateTime createdAt, DateTime? lastUpdateAt, DateTime? updatedAt, String? adminReply, DateTime? adminRepliedAt
});




}
/// @nodoc
class _$SupportTicketCopyWithImpl<$Res>
    implements $SupportTicketCopyWith<$Res> {
  _$SupportTicketCopyWithImpl(this._self, this._then);

  final SupportTicket _self;
  final $Res Function(SupportTicket) _then;

/// Create a copy of SupportTicket
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? shortId = null,Object? subject = null,Object? status = null,Object? orderId = freezed,Object? createdAt = null,Object? lastUpdateAt = freezed,Object? updatedAt = freezed,Object? adminReply = freezed,Object? adminRepliedAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,shortId: null == shortId ? _self.shortId : shortId // ignore: cast_nullable_to_non_nullable
as String,subject: null == subject ? _self.subject : subject // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderId: freezed == orderId ? _self.orderId : orderId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,lastUpdateAt: freezed == lastUpdateAt ? _self.lastUpdateAt : lastUpdateAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,adminReply: freezed == adminReply ? _self.adminReply : adminReply // ignore: cast_nullable_to_non_nullable
as String?,adminRepliedAt: freezed == adminRepliedAt ? _self.adminRepliedAt : adminRepliedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [SupportTicket].
extension SupportTicketPatterns on SupportTicket {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SupportTicket value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SupportTicket() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SupportTicket value)  $default,){
final _that = this;
switch (_that) {
case _SupportTicket():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SupportTicket value)?  $default,){
final _that = this;
switch (_that) {
case _SupportTicket() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String shortId,  String subject,  String status,  String? orderId,  DateTime createdAt,  DateTime? lastUpdateAt,  DateTime? updatedAt,  String? adminReply,  DateTime? adminRepliedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SupportTicket() when $default != null:
return $default(_that.id,_that.shortId,_that.subject,_that.status,_that.orderId,_that.createdAt,_that.lastUpdateAt,_that.updatedAt,_that.adminReply,_that.adminRepliedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String shortId,  String subject,  String status,  String? orderId,  DateTime createdAt,  DateTime? lastUpdateAt,  DateTime? updatedAt,  String? adminReply,  DateTime? adminRepliedAt)  $default,) {final _that = this;
switch (_that) {
case _SupportTicket():
return $default(_that.id,_that.shortId,_that.subject,_that.status,_that.orderId,_that.createdAt,_that.lastUpdateAt,_that.updatedAt,_that.adminReply,_that.adminRepliedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String shortId,  String subject,  String status,  String? orderId,  DateTime createdAt,  DateTime? lastUpdateAt,  DateTime? updatedAt,  String? adminReply,  DateTime? adminRepliedAt)?  $default,) {final _that = this;
switch (_that) {
case _SupportTicket() when $default != null:
return $default(_that.id,_that.shortId,_that.subject,_that.status,_that.orderId,_that.createdAt,_that.lastUpdateAt,_that.updatedAt,_that.adminReply,_that.adminRepliedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SupportTicket extends SupportTicket {
  const _SupportTicket({required this.id, this.shortId = '', required this.subject, this.status = 'OPEN', this.orderId, required this.createdAt, this.lastUpdateAt, this.updatedAt, this.adminReply, this.adminRepliedAt}): super._();
  factory _SupportTicket.fromJson(Map<String, dynamic> json) => _$SupportTicketFromJson(json);

@override final  String id;
@override@JsonKey() final  String shortId;
@override final  String subject;
@override@JsonKey() final  String status;
@override final  String? orderId;
@override final  DateTime createdAt;
@override final  DateTime? lastUpdateAt;
@override final  DateTime? updatedAt;
@override final  String? adminReply;
@override final  DateTime? adminRepliedAt;

/// Create a copy of SupportTicket
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SupportTicketCopyWith<_SupportTicket> get copyWith => __$SupportTicketCopyWithImpl<_SupportTicket>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SupportTicketToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SupportTicket&&(identical(other.id, id) || other.id == id)&&(identical(other.shortId, shortId) || other.shortId == shortId)&&(identical(other.subject, subject) || other.subject == subject)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderId, orderId) || other.orderId == orderId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.lastUpdateAt, lastUpdateAt) || other.lastUpdateAt == lastUpdateAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.adminReply, adminReply) || other.adminReply == adminReply)&&(identical(other.adminRepliedAt, adminRepliedAt) || other.adminRepliedAt == adminRepliedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,shortId,subject,status,orderId,createdAt,lastUpdateAt,updatedAt,adminReply,adminRepliedAt);

@override
String toString() {
  return 'SupportTicket(id: $id, shortId: $shortId, subject: $subject, status: $status, orderId: $orderId, createdAt: $createdAt, lastUpdateAt: $lastUpdateAt, updatedAt: $updatedAt, adminReply: $adminReply, adminRepliedAt: $adminRepliedAt)';
}


}

/// @nodoc
abstract mixin class _$SupportTicketCopyWith<$Res> implements $SupportTicketCopyWith<$Res> {
  factory _$SupportTicketCopyWith(_SupportTicket value, $Res Function(_SupportTicket) _then) = __$SupportTicketCopyWithImpl;
@override @useResult
$Res call({
 String id, String shortId, String subject, String status, String? orderId, DateTime createdAt, DateTime? lastUpdateAt, DateTime? updatedAt, String? adminReply, DateTime? adminRepliedAt
});




}
/// @nodoc
class __$SupportTicketCopyWithImpl<$Res>
    implements _$SupportTicketCopyWith<$Res> {
  __$SupportTicketCopyWithImpl(this._self, this._then);

  final _SupportTicket _self;
  final $Res Function(_SupportTicket) _then;

/// Create a copy of SupportTicket
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? shortId = null,Object? subject = null,Object? status = null,Object? orderId = freezed,Object? createdAt = null,Object? lastUpdateAt = freezed,Object? updatedAt = freezed,Object? adminReply = freezed,Object? adminRepliedAt = freezed,}) {
  return _then(_SupportTicket(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,shortId: null == shortId ? _self.shortId : shortId // ignore: cast_nullable_to_non_nullable
as String,subject: null == subject ? _self.subject : subject // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderId: freezed == orderId ? _self.orderId : orderId // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,lastUpdateAt: freezed == lastUpdateAt ? _self.lastUpdateAt : lastUpdateAt // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,adminReply: freezed == adminReply ? _self.adminReply : adminReply // ignore: cast_nullable_to_non_nullable
as String?,adminRepliedAt: freezed == adminRepliedAt ? _self.adminRepliedAt : adminRepliedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
