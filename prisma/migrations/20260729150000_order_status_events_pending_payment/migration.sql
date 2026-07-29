-- Align order_status_events.status enum with orders.status (includes PENDING_PAYMENT)

ALTER TABLE `order_status_events`
  MODIFY COLUMN `status` ENUM(
    'PENDING_PAYMENT',
    'PLACED',
    'PAYMENT_CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
  ) NOT NULL;
