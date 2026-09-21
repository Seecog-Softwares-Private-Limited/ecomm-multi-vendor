import 'package:flutter/foundation.dart';

/// TEMPORARY debug-only helpers for Google OAuth Auth Tab diagnostics.
///
/// All messages are prefixed with [GOOGLE_OAUTH_DEBUG].
/// Never log secrets, tokens, cookies, state values, or Google continuation params.
class GoogleOAuthDebug {
  GoogleOAuthDebug._();

  static var _seq = 0;

  /// Allocates GOOGLE_OAUTH_001, GOOGLE_OAUTH_002, …
  static String nextRequestId() {
    _seq += 1;
    return 'GOOGLE_OAUTH_${_seq.toString().padLeft(3, '0')}';
  }

  /// Safe URI summary: host, path, query *names* only (no values).
  static String uriSummary(Uri? uri) {
    if (uri == null) return 'host= path= queryKeys=[]';
    final keys = uri.queryParameters.keys.toList()..sort();
    return 'host=${uri.host} path=${uri.path} queryKeys=$keys';
  }

  static void log(
    String event, {
    String? requestId,
    Uri? uri,
    bool? inflightBefore,
    bool? inflightAfter,
    String? extra,
  }) {
    if (!kDebugMode) return;
    final ts = DateTime.now().toIso8601String();
    final buf = StringBuffer('[GOOGLE_OAUTH_DEBUG] ts=$ts event=$event');
    if (requestId != null) buf.write(' requestId=$requestId');
    if (uri != null) buf.write(' ${uriSummary(uri)}');
    if (inflightBefore != null) buf.write(' inflightBefore=$inflightBefore');
    if (inflightAfter != null) buf.write(' inflightAfter=$inflightAfter');
    if (extra != null && extra.isNotEmpty) buf.write(' $extra');
    debugPrint(buf.toString());
  }
}
