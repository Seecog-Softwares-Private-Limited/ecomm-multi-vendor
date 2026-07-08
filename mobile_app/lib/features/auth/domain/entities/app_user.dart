import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../../core/utils/image_url.dart';

part 'app_user.freezed.dart';
part 'app_user.g.dart';

/// Authenticated customer.
@freezed
abstract class AppUser with _$AppUser {
  const AppUser._();

  const factory AppUser({
    required String id,
    required String email,
    String? firstName,
    String? lastName,
    String? phone,
    @Default('CUSTOMER') String role,
    String? avatarUrl,
  }) = _AppUser;

  factory AppUser.fromJson(Map<String, dynamic> json) => _$AppUserFromJson(json);

  String get displayName {
    final name = [firstName, lastName].where((e) => e != null && e.trim().isNotEmpty).join(' ');
    if (name.trim().isNotEmpty) return name;
    return email.split('@').first;
  }

  String get initials {
    final source = displayName.trim();
    if (source.isEmpty) return '?';
    final parts = source.split(RegExp(r'\s+'));
    String head(String s) => s.isEmpty ? '' : s[0].toUpperCase();
    if (parts.length == 1) return head(parts.first);
    return head(parts.first) + head(parts.last);
  }

  String? get resolvedAvatarUrl => resolveImageUrl(avatarUrl);
}

/// Profile counters returned alongside the customer session.
@freezed
abstract class ProfileStats with _$ProfileStats {
  const factory ProfileStats({
    @Default(0) int orderCount,
    @Default(0) int wishlistCount,
    @Default(0) int addressCount,
  }) = _ProfileStats;

  factory ProfileStats.fromJson(Map<String, dynamic> json) => _$ProfileStatsFromJson(json);
}
