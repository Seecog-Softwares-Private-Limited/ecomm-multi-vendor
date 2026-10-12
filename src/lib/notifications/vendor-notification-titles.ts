/**
 * Client-safe title constants for vendor notification toasts / UI matching.
 * Keep server notify helpers in separate modules — do not import nodemailer/prisma here.
 */

export const SELLER_PRODUCT_APPROVED_NOTIFICATION_TITLE = "Product approved";

export const SELLER_PRODUCT_REJECTED_NOTIFICATION_TITLE = "Product rejected";

export const SELLER_ACCOUNT_APPROVED_NOTIFICATION_TITLE = "Vendor account approved";

export const SELLER_NEW_ORDER_NOTIFICATION_TITLE_PREFIX = "New order #";

export const SELLER_ORDER_CANCELLED_NOTIFICATION_TITLE_PREFIX = "Order cancelled #";
