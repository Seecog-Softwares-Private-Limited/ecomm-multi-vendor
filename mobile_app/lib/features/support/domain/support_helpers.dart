import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// UI presentation for support ticket status codes from the backend.
({String label, Color color, IconData icon}) supportStatusPresentation(String status) {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return (label: 'Open', color: AppColors.info, icon: Icons.mark_email_unread_outlined);
    case 'IN_PROGRESS':
      return (label: 'In progress', color: AppColors.warning, icon: Icons.hourglass_top_outlined);
    case 'RESOLVED':
      return (label: 'Resolved', color: AppColors.success, icon: Icons.check_circle_outline);
    case 'CLOSED':
      return (label: 'Closed', color: AppColors.textMuted, icon: Icons.lock_outline);
    default:
      return (label: status, color: AppColors.textMuted, icon: Icons.info_outline);
  }
}

const kSupportStatusFilters = <String>['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

String supportStatusFilterLabel(String status) => switch (status.toUpperCase()) {
      'ALL' => 'All',
      'OPEN' => 'Open',
      'IN_PROGRESS' => 'In progress',
      'RESOLVED' => 'Resolved',
      'CLOSED' => 'Closed',
      _ => status,
    };

bool supportTicketAllowsReply(String status) => status.toUpperCase() != 'CLOSED';

String shortOrderLabel(String? orderId) {
  if (orderId == null || orderId.isEmpty) return '';
  final slice = orderId.substring(0, orderId.length.clamp(0, 8)).toUpperCase();
  return '#$slice';
}
