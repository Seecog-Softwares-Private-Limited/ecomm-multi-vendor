/** First day of the current calendar month in local time (YYYY-MM-DD). */
export function getStartOfCurrentMonthIsoDate(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Human label for the current month, e.g. "May 2026". */
export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
