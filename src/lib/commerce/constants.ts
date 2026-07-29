/** Checkout session lifetime (30 minutes). */
export const CHECKOUT_SESSION_TTL_MS = 30 * 60 * 1000;

/** Stock reservations expire with the checkout session unless extended for payment. */
export const STOCK_RESERVATION_TTL_MS = CHECKOUT_SESSION_TTL_MS;

/** Grace window for completing online payment after order placement (24 hours). */
export const PENDING_PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Max quantity per cart / checkout line. */
export const MAX_LINE_QUANTITY = 99;
