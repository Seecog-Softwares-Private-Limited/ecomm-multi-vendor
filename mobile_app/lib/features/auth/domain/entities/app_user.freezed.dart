// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_user.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AppUser {

 String get id; String get email; String? get firstName; String? get lastName; String? get phone; String get role; String? get avatarUrl; String? get oauthProvider; bool get profileCompleted; bool get needsProfileCompletion;/// Backend source of truth for auth onboarding (defaults true when absent for legacy payloads).
 bool get authOnboardingComplete; bool get needsAuthOnboarding; bool get phoneVerified; bool get emailVerified;
/// Create a copy of AppUser
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AppUserCopyWith<AppUser> get copyWith => _$AppUserCopyWithImpl<AppUser>(this as AppUser, _$identity);

  /// Serializes this AppUser to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AppUser&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.role, role) || other.role == role)&&(identical(other.avatarUrl, avatarUrl) || other.avatarUrl == avatarUrl)&&(identical(other.oauthProvider, oauthProvider) || other.oauthProvider == oauthProvider)&&(identical(other.profileCompleted, profileCompleted) || other.profileCompleted == profileCompleted)&&(identical(other.needsProfileCompletion, needsProfileCompletion) || other.needsProfileCompletion == needsProfileCompletion)&&(identical(other.authOnboardingComplete, authOnboardingComplete) || other.authOnboardingComplete == authOnboardingComplete)&&(identical(other.needsAuthOnboarding, needsAuthOnboarding) || other.needsAuthOnboarding == needsAuthOnboarding)&&(identical(other.phoneVerified, phoneVerified) || other.phoneVerified == phoneVerified)&&(identical(other.emailVerified, emailVerified) || other.emailVerified == emailVerified));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,firstName,lastName,phone,role,avatarUrl,oauthProvider,profileCompleted,needsProfileCompletion,authOnboardingComplete,needsAuthOnboarding,phoneVerified,emailVerified);

@override
String toString() {
  return 'AppUser(id: $id, email: $email, firstName: $firstName, lastName: $lastName, phone: $phone, role: $role, avatarUrl: $avatarUrl, oauthProvider: $oauthProvider, profileCompleted: $profileCompleted, needsProfileCompletion: $needsProfileCompletion, authOnboardingComplete: $authOnboardingComplete, needsAuthOnboarding: $needsAuthOnboarding, phoneVerified: $phoneVerified, emailVerified: $emailVerified)';
}


}

/// @nodoc
abstract mixin class $AppUserCopyWith<$Res>  {
  factory $AppUserCopyWith(AppUser value, $Res Function(AppUser) _then) = _$AppUserCopyWithImpl;
@useResult
$Res call({
 String id, String email, String? firstName, String? lastName, String? phone, String role, String? avatarUrl, String? oauthProvider, bool profileCompleted, bool needsProfileCompletion, bool authOnboardingComplete, bool needsAuthOnboarding, bool phoneVerified, bool emailVerified
});




}
/// @nodoc
class _$AppUserCopyWithImpl<$Res>
    implements $AppUserCopyWith<$Res> {
  _$AppUserCopyWithImpl(this._self, this._then);

  final AppUser _self;
  final $Res Function(AppUser) _then;

/// Create a copy of AppUser
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? email = null,Object? firstName = freezed,Object? lastName = freezed,Object? phone = freezed,Object? role = null,Object? avatarUrl = freezed,Object? oauthProvider = freezed,Object? profileCompleted = null,Object? needsProfileCompletion = null,Object? authOnboardingComplete = null,Object? needsAuthOnboarding = null,Object? phoneVerified = null,Object? emailVerified = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,avatarUrl: freezed == avatarUrl ? _self.avatarUrl : avatarUrl // ignore: cast_nullable_to_non_nullable
as String?,oauthProvider: freezed == oauthProvider ? _self.oauthProvider : oauthProvider // ignore: cast_nullable_to_non_nullable
as String?,profileCompleted: null == profileCompleted ? _self.profileCompleted : profileCompleted // ignore: cast_nullable_to_non_nullable
as bool,needsProfileCompletion: null == needsProfileCompletion ? _self.needsProfileCompletion : needsProfileCompletion // ignore: cast_nullable_to_non_nullable
as bool,authOnboardingComplete: null == authOnboardingComplete ? _self.authOnboardingComplete : authOnboardingComplete // ignore: cast_nullable_to_non_nullable
as bool,needsAuthOnboarding: null == needsAuthOnboarding ? _self.needsAuthOnboarding : needsAuthOnboarding // ignore: cast_nullable_to_non_nullable
as bool,phoneVerified: null == phoneVerified ? _self.phoneVerified : phoneVerified // ignore: cast_nullable_to_non_nullable
as bool,emailVerified: null == emailVerified ? _self.emailVerified : emailVerified // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [AppUser].
extension AppUserPatterns on AppUser {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AppUser value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AppUser() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AppUser value)  $default,){
final _that = this;
switch (_that) {
case _AppUser():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AppUser value)?  $default,){
final _that = this;
switch (_that) {
case _AppUser() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String email,  String? firstName,  String? lastName,  String? phone,  String role,  String? avatarUrl,  String? oauthProvider,  bool profileCompleted,  bool needsProfileCompletion,  bool authOnboardingComplete,  bool needsAuthOnboarding,  bool phoneVerified,  bool emailVerified)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AppUser() when $default != null:
return $default(_that.id,_that.email,_that.firstName,_that.lastName,_that.phone,_that.role,_that.avatarUrl,_that.oauthProvider,_that.profileCompleted,_that.needsProfileCompletion,_that.authOnboardingComplete,_that.needsAuthOnboarding,_that.phoneVerified,_that.emailVerified);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String email,  String? firstName,  String? lastName,  String? phone,  String role,  String? avatarUrl,  String? oauthProvider,  bool profileCompleted,  bool needsProfileCompletion,  bool authOnboardingComplete,  bool needsAuthOnboarding,  bool phoneVerified,  bool emailVerified)  $default,) {final _that = this;
switch (_that) {
case _AppUser():
return $default(_that.id,_that.email,_that.firstName,_that.lastName,_that.phone,_that.role,_that.avatarUrl,_that.oauthProvider,_that.profileCompleted,_that.needsProfileCompletion,_that.authOnboardingComplete,_that.needsAuthOnboarding,_that.phoneVerified,_that.emailVerified);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String email,  String? firstName,  String? lastName,  String? phone,  String role,  String? avatarUrl,  String? oauthProvider,  bool profileCompleted,  bool needsProfileCompletion,  bool authOnboardingComplete,  bool needsAuthOnboarding,  bool phoneVerified,  bool emailVerified)?  $default,) {final _that = this;
switch (_that) {
case _AppUser() when $default != null:
return $default(_that.id,_that.email,_that.firstName,_that.lastName,_that.phone,_that.role,_that.avatarUrl,_that.oauthProvider,_that.profileCompleted,_that.needsProfileCompletion,_that.authOnboardingComplete,_that.needsAuthOnboarding,_that.phoneVerified,_that.emailVerified);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AppUser extends AppUser {
  const _AppUser({required this.id, required this.email, this.firstName, this.lastName, this.phone, this.role = 'CUSTOMER', this.avatarUrl, this.oauthProvider, this.profileCompleted = false, this.needsProfileCompletion = false, this.authOnboardingComplete = true, this.needsAuthOnboarding = false, this.phoneVerified = false, this.emailVerified = false}): super._();
  factory _AppUser.fromJson(Map<String, dynamic> json) => _$AppUserFromJson(json);

@override final  String id;
@override final  String email;
@override final  String? firstName;
@override final  String? lastName;
@override final  String? phone;
@override@JsonKey() final  String role;
@override final  String? avatarUrl;
@override final  String? oauthProvider;
@override@JsonKey() final  bool profileCompleted;
@override@JsonKey() final  bool needsProfileCompletion;
/// Backend source of truth for auth onboarding (defaults true when absent for legacy payloads).
@override@JsonKey() final  bool authOnboardingComplete;
@override@JsonKey() final  bool needsAuthOnboarding;
@override@JsonKey() final  bool phoneVerified;
@override@JsonKey() final  bool emailVerified;

/// Create a copy of AppUser
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AppUserCopyWith<_AppUser> get copyWith => __$AppUserCopyWithImpl<_AppUser>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AppUserToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AppUser&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.role, role) || other.role == role)&&(identical(other.avatarUrl, avatarUrl) || other.avatarUrl == avatarUrl)&&(identical(other.oauthProvider, oauthProvider) || other.oauthProvider == oauthProvider)&&(identical(other.profileCompleted, profileCompleted) || other.profileCompleted == profileCompleted)&&(identical(other.needsProfileCompletion, needsProfileCompletion) || other.needsProfileCompletion == needsProfileCompletion)&&(identical(other.authOnboardingComplete, authOnboardingComplete) || other.authOnboardingComplete == authOnboardingComplete)&&(identical(other.needsAuthOnboarding, needsAuthOnboarding) || other.needsAuthOnboarding == needsAuthOnboarding)&&(identical(other.phoneVerified, phoneVerified) || other.phoneVerified == phoneVerified)&&(identical(other.emailVerified, emailVerified) || other.emailVerified == emailVerified));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,firstName,lastName,phone,role,avatarUrl,oauthProvider,profileCompleted,needsProfileCompletion,authOnboardingComplete,needsAuthOnboarding,phoneVerified,emailVerified);

@override
String toString() {
  return 'AppUser(id: $id, email: $email, firstName: $firstName, lastName: $lastName, phone: $phone, role: $role, avatarUrl: $avatarUrl, oauthProvider: $oauthProvider, profileCompleted: $profileCompleted, needsProfileCompletion: $needsProfileCompletion, authOnboardingComplete: $authOnboardingComplete, needsAuthOnboarding: $needsAuthOnboarding, phoneVerified: $phoneVerified, emailVerified: $emailVerified)';
}


}

/// @nodoc
abstract mixin class _$AppUserCopyWith<$Res> implements $AppUserCopyWith<$Res> {
  factory _$AppUserCopyWith(_AppUser value, $Res Function(_AppUser) _then) = __$AppUserCopyWithImpl;
@override @useResult
$Res call({
 String id, String email, String? firstName, String? lastName, String? phone, String role, String? avatarUrl, String? oauthProvider, bool profileCompleted, bool needsProfileCompletion, bool authOnboardingComplete, bool needsAuthOnboarding, bool phoneVerified, bool emailVerified
});




}
/// @nodoc
class __$AppUserCopyWithImpl<$Res>
    implements _$AppUserCopyWith<$Res> {
  __$AppUserCopyWithImpl(this._self, this._then);

  final _AppUser _self;
  final $Res Function(_AppUser) _then;

/// Create a copy of AppUser
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? email = null,Object? firstName = freezed,Object? lastName = freezed,Object? phone = freezed,Object? role = null,Object? avatarUrl = freezed,Object? oauthProvider = freezed,Object? profileCompleted = null,Object? needsProfileCompletion = null,Object? authOnboardingComplete = null,Object? needsAuthOnboarding = null,Object? phoneVerified = null,Object? emailVerified = null,}) {
  return _then(_AppUser(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,phone: freezed == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String?,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,avatarUrl: freezed == avatarUrl ? _self.avatarUrl : avatarUrl // ignore: cast_nullable_to_non_nullable
as String?,oauthProvider: freezed == oauthProvider ? _self.oauthProvider : oauthProvider // ignore: cast_nullable_to_non_nullable
as String?,profileCompleted: null == profileCompleted ? _self.profileCompleted : profileCompleted // ignore: cast_nullable_to_non_nullable
as bool,needsProfileCompletion: null == needsProfileCompletion ? _self.needsProfileCompletion : needsProfileCompletion // ignore: cast_nullable_to_non_nullable
as bool,authOnboardingComplete: null == authOnboardingComplete ? _self.authOnboardingComplete : authOnboardingComplete // ignore: cast_nullable_to_non_nullable
as bool,needsAuthOnboarding: null == needsAuthOnboarding ? _self.needsAuthOnboarding : needsAuthOnboarding // ignore: cast_nullable_to_non_nullable
as bool,phoneVerified: null == phoneVerified ? _self.phoneVerified : phoneVerified // ignore: cast_nullable_to_non_nullable
as bool,emailVerified: null == emailVerified ? _self.emailVerified : emailVerified // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$ProfileStats {

 int get orderCount; int get wishlistCount; int get addressCount;
/// Create a copy of ProfileStats
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProfileStatsCopyWith<ProfileStats> get copyWith => _$ProfileStatsCopyWithImpl<ProfileStats>(this as ProfileStats, _$identity);

  /// Serializes this ProfileStats to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ProfileStats&&(identical(other.orderCount, orderCount) || other.orderCount == orderCount)&&(identical(other.wishlistCount, wishlistCount) || other.wishlistCount == wishlistCount)&&(identical(other.addressCount, addressCount) || other.addressCount == addressCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,orderCount,wishlistCount,addressCount);

@override
String toString() {
  return 'ProfileStats(orderCount: $orderCount, wishlistCount: $wishlistCount, addressCount: $addressCount)';
}


}

/// @nodoc
abstract mixin class $ProfileStatsCopyWith<$Res>  {
  factory $ProfileStatsCopyWith(ProfileStats value, $Res Function(ProfileStats) _then) = _$ProfileStatsCopyWithImpl;
@useResult
$Res call({
 int orderCount, int wishlistCount, int addressCount
});




}
/// @nodoc
class _$ProfileStatsCopyWithImpl<$Res>
    implements $ProfileStatsCopyWith<$Res> {
  _$ProfileStatsCopyWithImpl(this._self, this._then);

  final ProfileStats _self;
  final $Res Function(ProfileStats) _then;

/// Create a copy of ProfileStats
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? orderCount = null,Object? wishlistCount = null,Object? addressCount = null,}) {
  return _then(_self.copyWith(
orderCount: null == orderCount ? _self.orderCount : orderCount // ignore: cast_nullable_to_non_nullable
as int,wishlistCount: null == wishlistCount ? _self.wishlistCount : wishlistCount // ignore: cast_nullable_to_non_nullable
as int,addressCount: null == addressCount ? _self.addressCount : addressCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [ProfileStats].
extension ProfileStatsPatterns on ProfileStats {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ProfileStats value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ProfileStats() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ProfileStats value)  $default,){
final _that = this;
switch (_that) {
case _ProfileStats():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ProfileStats value)?  $default,){
final _that = this;
switch (_that) {
case _ProfileStats() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int orderCount,  int wishlistCount,  int addressCount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ProfileStats() when $default != null:
return $default(_that.orderCount,_that.wishlistCount,_that.addressCount);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int orderCount,  int wishlistCount,  int addressCount)  $default,) {final _that = this;
switch (_that) {
case _ProfileStats():
return $default(_that.orderCount,_that.wishlistCount,_that.addressCount);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int orderCount,  int wishlistCount,  int addressCount)?  $default,) {final _that = this;
switch (_that) {
case _ProfileStats() when $default != null:
return $default(_that.orderCount,_that.wishlistCount,_that.addressCount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ProfileStats implements ProfileStats {
  const _ProfileStats({this.orderCount = 0, this.wishlistCount = 0, this.addressCount = 0});
  factory _ProfileStats.fromJson(Map<String, dynamic> json) => _$ProfileStatsFromJson(json);

@override@JsonKey() final  int orderCount;
@override@JsonKey() final  int wishlistCount;
@override@JsonKey() final  int addressCount;

/// Create a copy of ProfileStats
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProfileStatsCopyWith<_ProfileStats> get copyWith => __$ProfileStatsCopyWithImpl<_ProfileStats>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ProfileStatsToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ProfileStats&&(identical(other.orderCount, orderCount) || other.orderCount == orderCount)&&(identical(other.wishlistCount, wishlistCount) || other.wishlistCount == wishlistCount)&&(identical(other.addressCount, addressCount) || other.addressCount == addressCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,orderCount,wishlistCount,addressCount);

@override
String toString() {
  return 'ProfileStats(orderCount: $orderCount, wishlistCount: $wishlistCount, addressCount: $addressCount)';
}


}

/// @nodoc
abstract mixin class _$ProfileStatsCopyWith<$Res> implements $ProfileStatsCopyWith<$Res> {
  factory _$ProfileStatsCopyWith(_ProfileStats value, $Res Function(_ProfileStats) _then) = __$ProfileStatsCopyWithImpl;
@override @useResult
$Res call({
 int orderCount, int wishlistCount, int addressCount
});




}
/// @nodoc
class __$ProfileStatsCopyWithImpl<$Res>
    implements _$ProfileStatsCopyWith<$Res> {
  __$ProfileStatsCopyWithImpl(this._self, this._then);

  final _ProfileStats _self;
  final $Res Function(_ProfileStats) _then;

/// Create a copy of ProfileStats
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? orderCount = null,Object? wishlistCount = null,Object? addressCount = null,}) {
  return _then(_ProfileStats(
orderCount: null == orderCount ? _self.orderCount : orderCount // ignore: cast_nullable_to_non_nullable
as int,wishlistCount: null == wishlistCount ? _self.wishlistCount : wishlistCount // ignore: cast_nullable_to_non_nullable
as int,addressCount: null == addressCount ? _self.addressCount : addressCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
