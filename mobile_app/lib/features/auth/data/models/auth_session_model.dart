import '../../domain/entities/auth_session.dart';

class AuthSessionModel {
  const AuthSessionModel({
    required this.accessToken,
    required this.userId,
    required this.email,
  });

  final String accessToken;
  final String userId;
  final String email;

  factory AuthSessionModel.fromMap(Map<String, dynamic> map) {
    return AuthSessionModel(
      accessToken: map['accessToken'] as String,
      userId: map['userId'] as String,
      email: map['email'] as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'accessToken': accessToken,
      'userId': userId,
      'email': email,
    };
  }

  AuthSession toEntity() {
    return AuthSession(accessToken: accessToken, userId: userId, email: email);
  }
}
