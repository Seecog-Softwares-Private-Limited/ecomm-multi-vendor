import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../core/error/failure.dart';
import '../data/auth_remote_data_source.dart';
import '../data/auth_repository_impl.dart';
import '../domain/entities/app_user.dart';
import '../domain/repositories/auth_repository.dart';

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>(
  (ref) => AuthRemoteDataSource(ref.read(dioClientProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepositoryImpl(ref.read(authRemoteDataSourceProvider), ref.read(secureStorageProvider)),
);

/// Immutable auth state exposed to the UI.
class AuthState {
  const AuthState({this.user, this.stats});

  final AppUser? user;
  final ProfileStats? stats;

  bool get isAuthenticated => user != null;

  AuthState copyWith({AppUser? user, ProfileStats? stats}) =>
      AuthState(user: user ?? this.user, stats: stats ?? this.stats);

  static const AuthState guest = AuthState();
}

/// Holds the current session. `build` bootstraps from the persisted token.
class AuthController extends AsyncNotifier<AuthState> {
  AuthRepository get _repo => ref.read(authRepositoryProvider);

  @override
  Future<AuthState> build() async {
    try {
      final session = await _repo.currentSession();
      if (session == null) return AuthState.guest;
      return AuthState(user: session.user, stats: session.stats);
    } catch (_) {
      // Bootstrap must never hang the splash. If the session can't be resolved
      // (e.g. the server is unreachable), start as a guest.
      return AuthState.guest;
    }
  }

  Future<void> refresh() async {
    final session = await _repo.currentSession();
    state = AsyncData(
      session == null ? AuthState.guest : AuthState(user: session.user, stats: session.stats),
    );
  }

  /// Runs an auth action, updates global state on success, and returns a
  /// [Failure] on error (null = success) so the calling form can show it.
  Future<Failure?> _run(Future<AuthSession> Function() action) async {
    try {
      final session = await action();
      state = AsyncData(AuthState(user: session.user, stats: session.stats));
      return null;
    } catch (error) {
      return Failure.from(error);
    }
  }

  Future<Failure?> login(String email, String password) =>
      _run(() => _repo.login(email: email.trim(), password: password));

  Future<Failure?> verifyOtp(String phone, String code) =>
      _run(() => _repo.verifyOtp(phone: phone, code: code));

  Future<Failure?> updateProfile({String? firstName, String? lastName, String? phone}) async {
    try {
      await _repo.updateProfile(firstName: firstName, lastName: lastName, phone: phone);
      await refresh();
      return null;
    } catch (error) {
      return Failure.from(error);
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AsyncData(AuthState.guest);
  }
}

final authControllerProvider =
    AsyncNotifierProvider<AuthController, AuthState>(AuthController.new);

/// Convenience: is the user authenticated right now (false while loading).
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authControllerProvider).value?.isAuthenticated ?? false;
});
