import 'package:flutter/material.dart';

import 'webview/customer_webview_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CustomerWebViewApp());
}
