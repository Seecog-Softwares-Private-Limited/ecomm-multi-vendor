/**
 * Shared parse/serialize helpers for Admin Coupon CRUD.
 * Does not duplicate discount calculation — that stays in pricing.ts.
 */

export type CouponDiscountType = "PERCENT" | "FIXED";

export type ParsedCouponInput = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  validFrom: Date;
  validTo: Date;
  maxUses: number | null;
  /** Null = unlimited redemptions per customer. */
  maxUsesPerUser: number | null;
  isActive: boolean;
};

export type CouponParseFailure = {
  ok: false;
  message: string;
  fields?: Record<string, string>;
};

export type CouponParseSuccess = {
  ok: true;
  data: ParsedCouponInput;
};

export function normalizeCouponCode(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase();
}

function parseDiscountType(raw: unknown): CouponDiscountType | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toUpperCase();
  if (t === "PERCENT") return "PERCENT";
  if (t === "FIXED") return "FIXED";
  return null;
}

function parseDiscountValue(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseDate(raw: unknown): Date | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const d = new Date(raw.trim());
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function parsePositiveIntOrNull(
  raw: unknown,
  fieldLabel: string
): { ok: true; value: number | null } | { ok: false; message: string } {
  const blankMsg = `${fieldLabel} must be a positive integer, or leave blank for unlimited`;
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: null };
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const n = Math.trunc(raw);
    if (n <= 0) return { ok: false, message: blankMsg };
    return { ok: true, value: n };
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return { ok: true, value: null };
    if (!/^\d+$/.test(t)) {
      return { ok: false, message: blankMsg };
    }
    const n = parseInt(t, 10);
    if (n <= 0) return { ok: false, message: blankMsg };
    return { ok: true, value: n };
  }
  return { ok: false, message: blankMsg };
}

function parseStatusActive(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  if (typeof raw === "boolean") return raw;
  const s = String(raw).trim().toLowerCase();
  if (s === "inactive" || s === "disabled" || s === "false" || s === "0") return false;
  return true;
}

export function parseCouponBody(body: unknown): CouponParseSuccess | CouponParseFailure {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Body must be an object" };
  }
  const o = body as Record<string, unknown>;

  const code = normalizeCouponCode(o.code);
  if (!code) {
    return { ok: false, message: "Validation failed", fields: { code: "Coupon code is required" } };
  }
  if (code.length > 50) {
    return { ok: false, message: "Validation failed", fields: { code: "Coupon code must be at most 50 characters" } };
  }

  const discountType = parseDiscountType(o.discountType);
  if (!discountType) {
    return {
      ok: false,
      message: "Validation failed",
      fields: { discountType: "Discount type must be PERCENT or FIXED" },
    };
  }

  const discountValue = parseDiscountValue(o.discountValue);
  if (discountValue == null) {
    return {
      ok: false,
      message: "Validation failed",
      fields: { discountValue: "Discount value is required" },
    };
  }
  if (discountType === "PERCENT") {
    if (discountValue <= 0 || discountValue > 100) {
      return {
        ok: false,
        message: "Validation failed",
        fields: { discountValue: "Percentage must be greater than 0 and at most 100" },
      };
    }
  } else if (discountValue <= 0) {
    return {
      ok: false,
      message: "Validation failed",
      fields: { discountValue: "Fixed discount must be greater than 0" },
    };
  }

  const validFrom = parseDate(o.validFrom);
  const validTo = parseDate(o.validTo);
  if (!validFrom) {
    return { ok: false, message: "Validation failed", fields: { validFrom: "Valid from date is required" } };
  }
  if (!validTo) {
    return { ok: false, message: "Validation failed", fields: { validTo: "Valid to date is required" } };
  }
  if (validTo.getTime() < validFrom.getTime()) {
    return {
      ok: false,
      message: "Validation failed",
      fields: { validTo: "Valid to must be on or after valid from" },
    };
  }

  const maxUsesParsed = parsePositiveIntOrNull(o.maxUses, "Maximum uses");
  if (!maxUsesParsed.ok) {
    return { ok: false, message: "Validation failed", fields: { maxUses: maxUsesParsed.message } };
  }

  const maxUsesPerUserParsed = parsePositiveIntOrNull(o.maxUsesPerUser, "Maximum uses per user");
  if (!maxUsesPerUserParsed.ok) {
    return {
      ok: false,
      message: "Validation failed",
      fields: { maxUsesPerUser: maxUsesPerUserParsed.message },
    };
  }

  if (
    maxUsesParsed.value != null &&
    maxUsesPerUserParsed.value != null &&
    maxUsesPerUserParsed.value > maxUsesParsed.value
  ) {
    return {
      ok: false,
      message: "Validation failed",
      fields: {
        maxUsesPerUser: "Maximum uses per user cannot be greater than Maximum uses",
      },
    };
  }

  return {
    ok: true,
    data: {
      code,
      discountType,
      discountValue,
      validFrom,
      validTo,
      maxUses: maxUsesParsed.value,
      maxUsesPerUser: maxUsesPerUserParsed.value,
      isActive: parseStatusActive(o.status),
    },
  };
}

export type CouponListStatus = "Active" | "Scheduled" | "Expired" | "Exhausted" | "Inactive";

export function computeCouponStatus(row: {
  deletedAt: Date | null;
  validFrom: Date;
  validTo: Date;
  maxUses: number | null;
  usedCount: number | null;
  now?: Date;
}): CouponListStatus {
  if (row.deletedAt != null) return "Inactive";
  const now = row.now ?? new Date();
  if (row.validFrom.getTime() > now.getTime()) return "Scheduled";
  if (row.validTo.getTime() < now.getTime()) return "Expired";
  if (row.maxUses != null && (row.usedCount ?? 0) >= row.maxUses) return "Exhausted";
  return "Active";
}

export function serializeCoupon(row: {
  id: string;
  code: string;
  discountType: string;
  discountValue: { toString(): string } | number;
  validFrom: Date;
  validTo: Date;
  maxUses: number | null;
  maxUsesPerUser?: number | null;
  usedCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) {
  const discountValue = Number(row.discountValue);
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType === "PERCENT" ? "PERCENT" : "FIXED",
    discountValue,
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo.toISOString(),
    maxUses: row.maxUses,
    maxUsesPerUser: row.maxUsesPerUser ?? null,
    usedCount: row.usedCount ?? 0,
    status: row.deletedAt == null ? "Active" : "Inactive",
    lifecycleStatus: computeCouponStatus(row),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  };
}
