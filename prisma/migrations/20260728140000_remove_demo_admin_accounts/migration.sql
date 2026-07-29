-- Remove seeded demo admin accounts (admin@example.com, superadmin@example.com).
-- Audit logs and linked rows cascade via FK on admin_id.

DELETE FROM `admins`
WHERE `email` IN ('admin@example.com', 'superadmin@example.com');
