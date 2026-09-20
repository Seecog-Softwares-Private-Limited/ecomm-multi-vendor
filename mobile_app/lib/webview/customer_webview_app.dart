import 'package:flutter/material.dart';

import 'customer_webview_screen.dart';
import 'webview_url_policy.dart';

/// Minimal Material shell whose only child is the Customer Website WebView.
class CustomerWebViewApp extends StatelessWidget {
  const CustomerWebViewApp({
    super.key,
    this.initialUrl = WebViewUrlPolicy.productionUrl,
  });

  final String initialUrl;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Indovyapar',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1B7A43)),
        useMaterial3: true,
      ),
      home: CustomerWebViewScreen(initialUrl: initialUrl),
    );
  }
}
