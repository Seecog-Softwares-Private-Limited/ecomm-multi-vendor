import { ulid } from "ulid";

/** Generate a sortable, unique commerce ID (ULID). */
export function generateCommerceId(): string {
  return ulid();
}
