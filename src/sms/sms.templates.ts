/**
 * SMS copy for IndoVyapar platform events (English + Hindi in one message for GSM delivery).
 */

export type SmsTemplateKey =
  | "customer_registration_admin"
  | "customer_order_admin"
  | "vendor_registration_admin"
  | "vendor_approval_vendor"
  | "vendor_add_product_admin"
  | "vendor_order_accept_admin"
  | "product_approval_vendor"
  | "payment_settlement_vendor"
  | "payment_received_vendor"
  | "customer_otp";

export type TemplateVars = Record<string, string | number | undefined>;

function pick(vars: TemplateVars, key: string, fallback = ""): string {
  const v = vars[key];
  return v === undefined || v === null ? fallback : String(v).trim();
}

function rupee(amount: string | number | undefined): string {
  if (amount === undefined || amount === "") return "";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const BUILDERS: Record<SmsTemplateKey, (v: TemplateVars) => string> = {
  customer_registration_admin: (v) => {
    const name = pick(v, "name", "Customer");
    const phone = pick(v, "phone");
    return `IndoVyapar: New customer registered — ${name}${phone ? ` (${phone})` : ""}. EN: Check admin panel. HI: नया ग्राहक पंजीकृत — ${name}.`;
  },

  customer_order_admin: (v) => {
    const orderId = pick(v, "orderId", "—");
    const amount = rupee(v.amount);
    return `IndoVyapar: New order #${orderId.slice(0, 8)}${amount ? ` ${amount}` : ""}. EN: Review in admin. HI: नया ऑर्डर — एडमिन पैनल देखें.`;
  },

  vendor_registration_admin: (v) => {
    const business = pick(v, "businessName", "Vendor");
    return `IndoVyapar: New vendor signup — ${business}. EN: KYC pending in admin. HI: नया विक्रेता पंजीकरण — ${business}.`;
  },

  vendor_approval_vendor: (v) => {
    const name = pick(v, "name", "Vendor");
    return `IndoVyapar: Hi ${name}, your vendor account is approved! Start selling now. HI: आपका विक्रेता खाता स्वीकृत है — अब बेचना शुरू करें.`;
  },

  vendor_add_product_admin: (v) => {
    const product = pick(v, "productName", "Product");
    const vendor = pick(v, "vendorName", "Vendor");
    return `IndoVyapar: ${vendor} added product "${product}" (pending approval). HI: नया उत्पाद अनुमोदन के लिए.`;
  },

  vendor_order_accept_admin: (v) => {
    const orderId = pick(v, "orderId", "—");
    const vendor = pick(v, "vendorName", "Vendor");
    return `IndoVyapar: ${vendor} accepted order #${orderId.slice(0, 8)}. HI: विक्रेता ने ऑर्डर स्वीकार किया.`;
  },

  product_approval_vendor: (v) => {
    const product = pick(v, "productName", "Your product");
    return `IndoVyapar: "${product}" is approved and live on the marketplace. HI: आपका उत्पाद लाइव है.`;
  },

  payment_settlement_vendor: (v) => {
    const amount = rupee(v.amount);
    const period = pick(v, "period", "");
    return `IndoVyapar: Settlement${period ? ` (${period})` : ""}${amount ? ` ${amount}` : ""} is being processed. HI: भुगतान निपटान प्रक्रिया में.`;
  },

  payment_received_vendor: (v) => {
    const amount = rupee(v.amount);
    return `IndoVyapar: Payment received${amount ? ` ${amount}` : ""} in your vendor wallet. HI: भुगतान प्राप्त हुआ.`;
  },

  customer_otp: (v) => {
    const otp = pick(v, "otp");
    const mins = pick(v, "minutes", "5");
    return `IndoVyapar OTP: ${otp}. Valid ${mins} min. Do not share. HI: आपका OTP ${otp} है — ${mins} मिनट मान्य.`;
  },
};

export function buildSmsMessage(key: SmsTemplateKey, vars: TemplateVars = {}): string {
  return BUILDERS[key](vars).replace(/\s+/g, " ").trim().slice(0, 480);
}
