import 'package:flutter/material.dart';

import 'help_center_page.dart';

/// Back-compat entry used by older imports; delegates to [HelpCenterPage].
class SupportPage extends StatelessWidget {
  const SupportPage({this.orderId, super.key});

  final String? orderId;

  @override
  Widget build(BuildContext context) => HelpCenterPage(orderId: orderId);
}
