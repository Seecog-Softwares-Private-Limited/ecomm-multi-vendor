import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/routing/app_routes.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../error/failure.dart';

/// Centralized ACCOUNT_INCOMPLETE handling — other 403s are ignored.
Future<bool> navigateIfAccountIncomplete(
  WidgetRef ref,
  BuildContext context,
  Object error,
) async {
  final failure = Failure.from(error);
  if (!failure.isAccountIncomplete) return false;
  await ref.read(authControllerProvider.notifier).refresh();
  if (context.mounted) {
    context.go(AppRoutes.completeProfile);
  }
  return true;
}
