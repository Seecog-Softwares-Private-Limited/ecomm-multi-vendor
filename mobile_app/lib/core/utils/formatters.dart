/// Formatting helpers for currency and dates.
abstract final class Formatters {
  const Formatters._();

  /// Formats a number as Indian rupees with `\u20B9` and Indian digit grouping
  /// (e.g. 1234567 -> "\u20B912,34,567").
  static String rupees(num amount) {
    final isNegative = amount < 0;
    final whole = amount.abs().round().toString();
    final buffer = StringBuffer();
    var count = 0;
    for (var i = whole.length - 1; i >= 0; i--) {
      buffer.write(whole[i]);
      count++;
      if (i == 0) break;
      if (count == 3 || (count > 3 && (count - 3).isEven)) buffer.write(',');
    }
    final grouped = buffer.toString().split('').reversed.join();
    return '${isNegative ? '-' : ''}\u20B9$grouped';
  }

  static String dayMonthYear(DateTime date) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  static String relativeTime(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return dayMonthYear(date);
  }
}
