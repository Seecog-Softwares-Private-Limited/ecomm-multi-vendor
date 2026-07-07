import 'package:dio/dio.dart';

import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../../../core/utils/error_message.dart';
import '../datasources/auth_local_data_source.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

  @override
  Future<void> forgotPassword({required String email}) async {
    try {
      await remoteDataSource.forgotPassword(email: email);
    } on DioException catch (error) {
      throw Exception(formatAppError(error));
    }
  }

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    try {
      final session = await remoteDataSource.login(
        email: email,
        password: password,
      );
      await localDataSource.persistSession(session);
      return session.toEntity();
    } on DioException catch (error) {
      throw Exception(formatAppError(error));
    }
  }

  @override
  Future<void> logout() {
    return localDataSource.clearSession();
  }

  @override
  Future<AuthSession> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final session = await remoteDataSource.register(
        name: name,
        email: email,
        password: password,
      );
      await localDataSource.persistSession(session);
      return session.toEntity();
    } on DioException catch (error) {
      throw Exception(formatAppError(error));
    }
  }

  @override
  Future<AuthSession?> restoreSession() async {
    final session = await localDataSource.readSession();
    return session?.toEntity();
  }
}
