import '../config/env_config.dart';

/// Resolves a possibly-relative image path from the API (e.g. `/uploads/x.jpg`)
/// into an absolute URL against the configured base URL. Returns null for
/// empty/blank input.
String? resolveImageUrl(String? raw) {
  final url = raw?.trim() ?? '';
  if (url.isEmpty) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  final base = EnvConfig.baseUrl.replaceAll(RegExp(r'/$'), '');
  return '$base${url.startsWith('/') ? '' : '/'}$url';
}
