-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (x86_64)
--
-- Host: 127.0.0.1    Database: markethub
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
use markethub;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '9d467318-c2c2-11f0-a514-f5199abbdb16:1-11416,
bbb87c08-d251-11f0-a94d-c87b0ed70aab:1-234';

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('09f9772f-ebac-4443-8a94-1e633749ecfd','925df2a14bd59b0552d7e3bc51f47a7d1e0715b7ecfe18e63ad38a98fbac0290','2026-03-04 04:56:50.958','20260228000000_seller_status_reason_and_dynamic_kyc',NULL,NULL,'2026-03-04 04:56:50.745',1),('0d0b46ce-8456-4b66-b0f5-cdd3283e5b9e','8fbc4f3686d30db0b1c6ec5b3d308ca5de1012582c1ac8f225fa0e29b8d2ebbf','2026-03-04 04:56:22.304','20260226000000_add_seller_profile_extras',NULL,NULL,'2026-03-04 04:56:21.886',1),('2bba90e2-c3e7-4a65-8eb5-633d5bedc2ae','738879e01fcc66d85377196e066137a23720469941979edc0db880d303dfb5a9','2026-02-25 13:55:06.986','20260225135503_init',NULL,NULL,'2026-02-25 13:55:03.741',1),('3faaaff2-6053-4880-8f9a-6a77dc56e207','080638f5b0de6a596d899cc2becca819ec99eaf3b8e09dfb29f80176941ecb5b','2026-03-04 04:56:50.493','20260226101509_add_seller_profile_extras',NULL,NULL,'2026-03-04 04:56:50.492',1),('67fb3f93-c94f-435a-b8b6-20ff62d236a3','1606f26550ac4c40216dd4291a38e009bebb4e6f4dbebe2fbfe6dc0c606c85b3','2026-03-04 04:56:50.744','20260227120000_add_vendor_email_verification',NULL,NULL,'2026-03-04 04:56:50.495',1),('761d3a45-af5e-4674-a41f-16410f1a8c0d','29a3d40c6d487b32d8086249401da355ff9d9f9f3e906eb95e458c53037abf20','2026-03-04 10:16:48.590','20260226120000_add_seller_password_reset',NULL,NULL,'2026-03-04 10:16:48.397',1),('8e05e54e-1057-46f5-93fe-146bcdf82b7a','e126f1e0f3c487304c4a6b2cd68e7a0a4a2e13a8c03f490b9ae5777fd292c973','2026-03-04 04:56:22.402','20260226100000_add_vendor_support_tickets',NULL,NULL,'2026-03-04 04:56:22.305',1),('b9e853f8-b9e1-42f9-b347-4364fcd3bba7','ad7ddbac0af70d660a18305ec7bb7049e8cbba968d4cf49443a5337a1f80306c','2026-03-04 11:59:14.661','20260304000000_add_admin_phone',NULL,NULL,'2026-03-04 11:59:14.524',1),('d9dca4cc-5614-478e-b6c0-4696bcc5ba31','8fbc4f3686d30db0b1c6ec5b3d308ca5de1012582c1ac8f225fa0e29b8d2ebbf',NULL,'20260226101509_add_seller_profile_extras','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260226101509_add_seller_profile_extras\n\nDatabase error code: 1060\n\nDatabase error:\nDuplicate column name \'profile_extras\'\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260226101509_add_seller_profile_extras\"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name=\"20260226101509_add_seller_profile_extras\"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226','2026-03-04 04:56:45.741','2026-03-04 04:56:22.404',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('HOME','OFFICE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HOME',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_user_id_idx` (`user_id`),
  KEY `addresses_user_id_is_default_idx` (`user_id`,`is_default`),
  KEY `addresses_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_key` (`email`),
  KEY `admins_email_idx` (`email`),
  KEY `admins_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES ('1dda9e89-71c5-4ae6-aa8a-82db42be9d61','admin@seecogsoftwares.com','$2b$12$ZeCoC8WcsR.dHDLfeEFLweGPA8IH5M3Xk8J8w8EgtDCDUKHYcFJPa','Sonam Agarwal','2026-03-04 09:05:15.855','2026-03-04 12:11:16.864',NULL,'7348820668'),('bc1dd935-1d94-44f3-9daf-eee3ea10e00c','admin@example.com','$2b$12$z6hjyWxGJWvRxofkTR/pRevICEFRZ5V1VYbd2Qtzot.TYI5/1ordO','Admin Demo','2026-03-08 03:28:32.201','2026-03-08 03:28:32.201',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ifsc_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_accounts_seller_id_idx` (`seller_id`),
  KEY `bank_accounts_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `bank_accounts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES ('a083b4f1-e304-4c3f-a63b-0db8c35fb71a','5fd91462-9d67-48af-b455-bf0a961dd757','HDFC Bank','Pankaj','121212121212','11111111111',1,'2026-03-04 08:37:36.815','2026-03-04 08:37:36.815',NULL),('d92b0b16-86a7-46c8-9e68-fa4f911c4a1d','3a242478-a9a5-4674-97df-da617d58c785','HDFC Bank','Pankaj','111111111111','11111111111',1,'2026-03-08 03:05:41.478','2026-03-08 03:07:00.471',NULL);
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `variant_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_user_id_product_id_variant_key_key` (`user_id`,`product_id`,`variant_key`),
  KEY `cart_items_user_id_idx` (`user_id`),
  KEY `cart_items_product_id_idx` (`product_id`),
  KEY `cart_items_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `cart_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_key` (`slug`),
  KEY `categories_slug_idx` (`slug`),
  KEY `categories_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('19dfc1dd-0709-48a9-b384-845c7519903c','fashion','Fashion',0,'2026-02-25 16:09:04.210','2026-02-25 16:09:04.210',NULL),('26a946d0-a894-47a5-a925-4354aeed1fa8','home','Home & Kitchen',0,'2026-02-25 16:09:04.221','2026-02-25 16:09:04.221',NULL),('c4bd5d3b-0564-470d-9707-a788d84d6a65','books','Books',0,'2026-02-25 16:09:04.227','2026-02-25 16:09:04.227',NULL),('eacae3d0-0f93-42ee-af14-8ff7ca9738c2','electronics','Electronics',0,'2026-02-25 16:09:04.157','2026-02-25 16:09:04.157',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_document_requirements`
--

DROP TABLE IF EXISTS `category_document_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_document_requirements` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_document_requirements_category_id_idx` (`category_id`),
  KEY `category_document_requirements_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `category_document_requirements_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_document_requirements`
--

LOCK TABLES `category_document_requirements` WRITE;
/*!40000 ALTER TABLE `category_document_requirements` DISABLE KEYS */;
/*!40000 ALTER TABLE `category_document_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `valid_from` datetime(3) NOT NULL,
  `valid_to` datetime(3) NOT NULL,
  `max_uses` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_key` (`code`),
  KEY `coupons_code_idx` (`code`),
  KEY `coupons_valid_from_valid_to_idx` (`valid_from`,`valid_to`),
  KEY `coupons_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kyc_documents`
--

DROP TABLE IF EXISTS `kyc_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kyc_documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('PAN','GST_CERTIFICATE','ADDRESS_PROOF') COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kyc_documents_seller_id_document_type_key` (`seller_id`,`document_type`),
  KEY `kyc_documents_seller_id_idx` (`seller_id`),
  KEY `kyc_documents_status_idx` (`status`),
  KEY `kyc_documents_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `kyc_documents_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kyc_documents`
--

LOCK TABLES `kyc_documents` WRITE;
/*!40000 ALTER TABLE `kyc_documents` DISABLE KEYS */;
INSERT INTO `kyc_documents` VALUES ('1edc9638-4477-4aac-9074-6a53cba2a184','5fd91462-9d67-48af-b455-bf0a961dd757','GST_CERTIFICATE',NULL,'http://localhost:3000/uploads/kyc/kyc-GST_CERTIFICATE-90a4bfd5-971a-4606-b3f6-53264cb7ae6c.pdf','APPROVED','2026-03-04 08:12:30.399','2026-03-04 09:34:32.644',NULL),('2a0dc3ed-a207-4b7c-ba20-47095a1282c3','5fd91462-9d67-48af-b455-bf0a961dd757','PAN',NULL,'http://localhost:3000/uploads/kyc/kyc-PAN-7063e33d-8197-40cc-a284-988c71eeddb6.pdf','APPROVED','2026-03-04 08:12:26.274','2026-03-04 09:34:32.644',NULL),('3e681c2f-eb84-45f6-a942-528c0d8dfb8c','3a242478-a9a5-4674-97df-da617d58c785','GST_CERTIFICATE',NULL,'http://localhost:3004/uploads/kyc/kyc-GST_CERTIFICATE-294c3486-3113-4b0c-a4bc-4b60e6467569.pdf','APPROVED','2026-03-08 03:06:04.364','2026-03-08 03:33:06.155',NULL),('69f76a0a-01a8-445c-abce-9b679d821119','3a242478-a9a5-4674-97df-da617d58c785','ADDRESS_PROOF',NULL,'http://localhost:3004/uploads/kyc/kyc-ADDRESS_PROOF-904cff3c-2c37-472c-a228-db4ddb48136d.pdf','APPROVED','2026-03-08 03:06:26.353','2026-03-08 03:33:06.155',NULL),('8ed5243b-5472-4c0f-b8b9-41637199b262','5fd91462-9d67-48af-b455-bf0a961dd757','ADDRESS_PROOF',NULL,'http://localhost:3000/uploads/kyc/kyc-ADDRESS_PROOF-5ff28341-9b17-4b3e-b564-f6d4c6eade3c.pdf','APPROVED','2026-03-04 08:13:00.297','2026-03-04 09:34:32.644',NULL),('b8dfff32-2a40-4ff7-ab87-a8fb358a8c94','3a242478-a9a5-4674-97df-da617d58c785','PAN',NULL,'http://localhost:3004/uploads/kyc/kyc-PAN-f6b1be36-521c-478c-bf9e-5b80d2c3d924.pdf','APPROVED','2026-03-08 03:06:01.753','2026-03-08 03:33:06.155',NULL);
/*!40000 ALTER TABLE `kyc_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SYSTEM','ORDER','SELLER','PAYMENT','RETURN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_idx` (`user_id`),
  KEY `notifications_seller_id_idx` (`seller_id`),
  KEY `notifications_admin_id_idx` (`admin_id`),
  KEY `notifications_read_idx` (`read`),
  KEY `notifications_created_at_idx` (`created_at`),
  KEY `notifications_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `notifications_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notifications_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('NEW','ACCEPTED','REJECTED','SHIPPED','DELIVERED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `variant_snapshot` json DEFAULT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commission_percent` decimal(5,2) DEFAULT NULL,
  `commission_amount` decimal(12,2) DEFAULT NULL,
  `net_payable` decimal(12,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_idx` (`order_id`),
  KEY `order_items_product_id_idx` (`product_id`),
  KEY `order_items_seller_id_idx` (`seller_id`),
  KEY `order_items_status_idx` (`status`),
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_items_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_events`
--

DROP TABLE IF EXISTS `order_status_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PLACED','PAYMENT_CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occurred_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `order_status_events_order_id_idx` (`order_id`),
  KEY `order_status_events_order_id_occurred_at_idx` (`order_id`,`occurred_at`),
  CONSTRAINT `order_status_events_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_events`
--

LOCK TABLES `order_status_events` WRITE;
/*!40000 ALTER TABLE `order_status_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_status_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coupon_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PLACED','PAYMENT_CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLACED',
  `total_amount` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `shipping_amount` decimal(12,2) DEFAULT '0.00',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_idx` (`user_id`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_created_at_idx` (`created_at`),
  KEY `orders_shipping_address_id_fkey` (`shipping_address_id`),
  KEY `orders_coupon_id_fkey` (`coupon_id`),
  CONSTRAINT `orders_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` enum('PREPAID','COD','WALLET','CARD','UPI','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `amount` decimal(12,2) NOT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_order_id_idx` (`order_id`),
  KEY `payments_status_idx` (`status`),
  KEY `payments_transaction_id_idx` (`transaction_id`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payouts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `status` enum('PENDING','PAID','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paid_at` datetime(3) DEFAULT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orders_count` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payouts_seller_id_idx` (`seller_id`),
  KEY `payouts_status_idx` (`status`),
  KEY `payouts_paid_at_idx` (`paid_at`),
  CONSTRAINT `payouts_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payouts`
--

LOCK TABLES `payouts` WRITE;
/*!40000 ALTER TABLE `payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_idx` (`product_id`),
  KEY `product_images_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES ('10baacfd-b693-4b3e-b649-caf932ce8f41','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/3b2f70f4-f78e-49cc-b3cc-7405e20245ee.jpg',0,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('20b47bd6-3f4e-4199-a9a3-b78b0cf07985','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/10dd24f4-65f4-45b3-b81a-9dcf7a9201af.jpg',1,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('2a94b99c-c4a4-4eb3-8f6e-367ba78587d4','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/458a8071-3137-4aad-aa22-c848213a0906.jpg',2,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('75542c70-7bee-4e31-852c-ee600d37ba29','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/a6963633-75f7-4117-8581-c1acbac4a9ce.jpg',1,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('a002b1ba-529e-4a26-82d8-7e60ca3a176a','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/edd4bc28-0201-46e7-a297-0a2de3a0b7d3.jpg',3,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('ad8c6adf-5e84-402d-a5e2-b1a63f491fd9','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/602c2238-7600-4703-b621-3037eda060be.jpg',0,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('fa14adae-16f0-42f0-811b-b7d2c5780220','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/184fd72b-47f6-42c8-ac39-7020a9a97db8.jpg',2,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_questions`
--

DROP TABLE IF EXISTS `product_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_questions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `asked_by_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answered_by_seller_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `helpful_count` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_questions_product_id_idx` (`product_id`),
  KEY `product_questions_asked_by_user_id_idx` (`asked_by_user_id`),
  KEY `product_questions_answered_by_seller_id_idx` (`answered_by_seller_id`),
  KEY `product_questions_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `product_questions_answered_by_seller_id_fkey` FOREIGN KEY (`answered_by_seller_id`) REFERENCES `sellers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_questions_asked_by_user_id_fkey` FOREIGN KEY (`asked_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_questions_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_questions`
--

LOCK TABLES `product_questions` WRITE;
/*!40000 ALTER TABLE `product_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_specifications`
--

DROP TABLE IF EXISTS `product_specifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_specifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_specifications_product_id_idx` (`product_id`),
  KEY `product_specifications_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `product_specifications_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_specifications`
--

LOCK TABLES `product_specifications` WRITE;
/*!40000 ALTER TABLE `product_specifications` DISABLE KEYS */;
INSERT INTO `product_specifications` VALUES ('18fbdf4d-1378-4b55-9cbb-3cb386b5a06a','aa1adbc0-fa20-49d8-b864-c841e37e2530','Brand','IBELL','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('383917dd-ea2e-4c73-b61d-06881e2303a6','e0ac112e-92c8-4092-b4d4-736361013797','Voltage','230 Volts','2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('3ea2fa02-ab61-4d30-bf6f-2ac95423960d','8779e4c6-0d78-4ac0-8466-00001ca9b8b6','Special Feature','Non Stick Coating','2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('3f26f2a7-8286-4854-80b1-fa4b22bee8b3','8779e4c6-0d78-4ac0-8466-00001ca9b8b6','Colour','Silver','2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('4fb04566-2e47-442e-a7e4-631fb9d9b669','aa1adbc0-fa20-49d8-b864-c841e37e2530','Style','Electric Trap','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('5b4c1310-2422-4071-9ca2-148b8a36331b','aa1adbc0-fa20-49d8-b864-c841e37e2530','Size','Medium','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('5fee10c8-bc74-4389-b490-b82fa9b38bb6','6526baae-1557-4521-8013-36c369ca416b','sss','23','2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('655a04b4-8776-42cc-9c5a-d93e2b9ffd5f','6526baae-1557-4521-8013-36c369ca416b','ddd','12','2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('bba20358-e72c-41b9-8deb-57660e339b29','aa1adbc0-fa20-49d8-b864-c841e37e2530','Colour','102IK','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL);
/*!40000 ALTER TABLE `product_specifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `values` json NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variations_product_id_idx` (`product_id`),
  KEY `product_variations_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `product_variations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mrp` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `gst_percent` decimal(5,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `return_policy` enum('DAYS_7','DAYS_15','DAYS_30','NO_RETURN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DAYS_7',
  `status` enum('DRAFT','PENDING_APPROVAL','ACTIVE','REJECTED','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `avg_rating` decimal(3,2) DEFAULT NULL,
  `review_count` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_seller_id_sku_key` (`seller_id`,`sku`),
  KEY `products_seller_id_idx` (`seller_id`),
  KEY `products_category_id_idx` (`category_id`),
  KEY `products_sub_category_id_idx` (`sub_category_id`),
  KEY `products_status_idx` (`status`),
  KEY `products_created_at_idx` (`created_at`),
  KEY `products_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('6526baae-1557-4521-8013-36c369ca416b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Product 1','Product 1','sjd3',2000.00,3000.00,18.00,16,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('8779e4c6-0d78-4ac0-8466-00001ca9b8b6','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Prestige PRM 5.0 Roti Maker with Power Indicator, 900 Watts curved granite plate','This versatile Prestige roti maker is designed to make your kitchen experience effortless and efficient. Featuring a durable stainless steel body with a premium granite non-stick coating, this electric roti maker ensures your rotis cook evenly without sticking, making cleanup a breeze. The adjustable temperature control knob allows you to customise the heat according to your preference, ensuring perfectly cooked rotis every time. With its unique curved surface design, this multi-purpose appliance can create fluffy, soft rotis with ease. The easy-flip mechanism and ergonomic handle make operation simple and safe, whilst the power indicators keep you informed of the cooking status. Operating at 900 watts, this roti maker heats up quickly and maintains consistent temperature throughout the cooking process. The 25-centimetre cooking surface provides ample space for making rotis of various sizes. Whether you\'re preparing breakfast, lunch, or dinner, this electric roti maker streamlines your cooking routine, delivering restaurant-quality results in the comfort of your home. Its compact design makes it perfect for modern kitchens where space is at a premium.','sku-111',2900.00,3299.00,18.00,22,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('aa1adbc0-fa20-49d8-b864-c841e37e2530','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','9c451e0d-bccf-4e1a-8d81-943e8691155e','iBELL 102IK Insect Killer Machine with Aluminium Body, 20W Bug Zapper, Fly Catcher for Home Restaurant & Offices, UV Bulbs, Insect Control (Grey)','iBELL Fast Action, Ultra Effective Insect Killer for Domestic or Professional Use.High efficiently killing insects and flies Prevent unsightly and unhygienic flying insects from invading your workplace.The ultra violet light attracts the insects into the electrified grids where they are instantly killed.Flying insect killer machine with 20W bug zapper to get rid of all those annoying and disease-causing insects and flies that ruin your home, office, and kitchen. Easy to install and use With no chemical attractants or harmful chemicals.','sku-123',12000.00,13000.00,18.00,25,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('e0ac112e-92c8-4092-b4d4-736361013797','3a242478-a9a5-4674-97df-da617d58c785','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','9c451e0d-bccf-4e1a-8d81-943e8691155e','Kent Atta and Bread Maker for Home, Fully Automatic With 19 Pre-set Menu, 550w 16010 (Steel Grey)','A convenient and hygienic way to prepare dough for puris and rotis/ chapattis and fresh bread for your snack time.\nThis electric dough maker has one-touch operation and detachable components make mixing and kneading easy.\nYou can use any kind of flour for preparing fresh and healthy bread.\nNot only plain and simple bread, but various ingredients can also be added to personalise flavours.\nKENT Bread Maker comes with 19 programme menus, so you can prepare different types of chapatti and puri atta, cake, jam, pizza dough, sticky rice, etc.\nThis silver grey machine has an amazing 550W power.\nIncludes Atta bread maker, dough pan (1 No.), measuring spoon (1 No.), measuring cup (1 No.), kneading panel remover (1 No.), user manual.','sddsdss',18000.00,12000.00,18.00,100,'DAYS_7','ACTIVE',NULL,0,'2026-03-08 03:40:17.766','2026-03-08 03:40:45.598',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_items`
--

DROP TABLE IF EXISTS `return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `return_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `refund_amount` decimal(12,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `return_items_return_id_order_item_id_key` (`return_id`,`order_item_id`),
  KEY `return_items_return_id_idx` (`return_id`),
  KEY `return_items_order_item_id_idx` (`order_item_id`),
  CONSTRAINT `return_items_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `return_items_return_id_fkey` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_items`
--

LOCK TABLES `return_items` WRITE;
/*!40000 ALTER TABLE `return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returns` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `returns_order_id_idx` (`order_id`),
  KEY `returns_seller_id_idx` (`seller_id`),
  KEY `returns_status_idx` (`status`),
  KEY `returns_created_at_idx` (`created_at`),
  KEY `returns_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `returns_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `returns_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_user_id_product_id_key` (`user_id`,`product_id`),
  KEY `reviews_product_id_idx` (`product_id`),
  KEY `reviews_user_id_idx` (`user_id`),
  KEY `reviews_created_at_idx` (`created_at`),
  KEY `reviews_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING_VERIFICATION','DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED','ON_HOLD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `profile_extras` text COLLATE utf8mb4_unicode_ci,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime(3) DEFAULT NULL,
  `status_reason` text COLLATE utf8mb4_unicode_ci,
  `primary_category_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sellers_email_key` (`email`),
  KEY `sellers_email_idx` (`email`),
  KEY `sellers_status_idx` (`status`),
  KEY `sellers_deleted_at_idx` (`deleted_at`),
  KEY `sellers_primary_category_id_idx` (`primary_category_id`),
  CONSTRAINT `sellers_primary_category_id_fkey` FOREIGN KEY (`primary_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES ('3a242478-a9a5-4674-97df-da617d58c785','pankajkumaragarwal40@gmail.com','$2b$12$2m4/8H26YmVx8gBfcKinouFoxj.dtRYi4CsLTc9yohNPcd/PfZama','Seecog Softwares Private Limited','Pankaj Kumar Agarwal','+917348820668',NULL,'APPROVED','2026-03-08 03:04:47.755','2026-03-08 03:33:06.155',NULL,'{\"legalName\":\"Seecog Softwares Private Limited\",\"businessType\":\"company\",\"pan\":\"atypa7475j\",\"gstin\":\"\",\"gstNotApplicable\":true,\"addressLine1\":\"\",\"addressLine2\":\"\",\"city\":\"\",\"state\":\"\",\"pincode\":\"\",\"pickupPincode\":\"\",\"storeLogo\":\"\",\"storeDescription\":\"\"}',1,'216fc3547777d5817f52ed7a7e5ef029b85e67393ee433bc91bb628e36ebf880','2026-03-11 03:04:47.754',NULL,'eacae3d0-0f93-42ee-af14-8ff7ca9738c2',NULL,NULL),('581b18b4-89a5-4007-87fd-16012dc032d4','vendor@example.com','$2b$12$TUV07SmBVho.I2M/C0IHw./EhSz0Qo1zJ66A2nYttqzpXO.WfpnoW','Tech Store India','Vendor Demo',NULL,NULL,'DRAFT','2026-02-25 15:50:38.502','2026-03-08 03:28:32.250',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),('5fd91462-9d67-48af-b455-bf0a961dd757','pankaj.7613@gmail.com','$2b$12$JGRLnPzVlIchPXEnZbf9cOZ5qkeNGhNlkU0GLyo3wXZNz46VzBp.a','Abc store','Pankaj Kumar Agarwal','7348820668',NULL,'APPROVED','2026-03-04 05:00:10.719','2026-03-05 04:34:38.964',NULL,'{\"legalName\":\"Seecog Softwares Private Limited\",\"businessType\":\"company\",\"pan\":\"atypa7475j\",\"gstin\":\"121212121212121\",\"gstNotApplicable\":false,\"addressLine1\":\"\",\"addressLine2\":\"\",\"city\":\"\",\"state\":\"\",\"pincode\":\"\",\"pickupPincode\":\"\",\"storeLogo\":\"\",\"storeDescription\":\"\"}',1,'4197a4316cb2a1d6a01fc0acd15050ad10284c146f9393a42096a640558c1479','2026-03-07 05:00:10.718',NULL,'eacae3d0-0f93-42ee-af14-8ff7ca9738c2','11e5ab933775728ea6a98010783afce7a09168d842535eca64d793cc518c733d','2026-03-05 05:34:38.963'),('71ca2871-bb4b-4072-978e-ac92703411b2','pankaj.76132@gmail.com','$2b$12$FlmrOou40zx/w7ljW7a6s.1tcYXM16bX0XdjH8Ts6R5cePTPSlcOu','Abc Tech','Pankaj Kumar Agarwal','7348820668',NULL,'APPROVED','2026-03-04 07:31:13.459','2026-03-04 09:06:19.067',NULL,NULL,1,'ae83fbd0f845637b2cde1c3371d55a67845384d41dbc5145dba8c05a1ea8310f','2026-03-07 07:31:13.457',NULL,NULL,NULL,NULL),('9a2c4432-71c7-4015-9945-0855d1f90d09','pankaj.76131@gmail.com','$2b$12$aO854sT5614cGnWk2oJjgu2kfkmAbvxHlpYaVx0aEOuML8hik6Awy','abc tech','Pankaj Kumar Agarwal','+917348820668',NULL,'PENDING_VERIFICATION','2026-03-04 07:30:36.977','2026-03-04 07:30:36.977',NULL,NULL,0,'d6421048112f11444d1414b366e7d332c0a602ed84270145f03d72e889959b1a','2026-03-07 07:30:36.974',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settlements`
--

DROP TABLE IF EXISTS `settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlements` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `revenue` decimal(14,2) NOT NULL,
  `commission_amount` decimal(14,2) NOT NULL,
  `payout_amount` decimal(14,2) NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settlements_seller_id_period_start_period_end_key` (`seller_id`,`period_start`,`period_end`),
  KEY `settlements_seller_id_idx` (`seller_id`),
  KEY `settlements_status_idx` (`status`),
  KEY `settlements_period_start_period_end_idx` (`period_start`,`period_end`),
  CONSTRAINT `settlements_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlements`
--

LOCK TABLES `settlements` WRITE;
/*!40000 ALTER TABLE `settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_categories_category_id_slug_key` (`category_id`,`slug`),
  KEY `sub_categories_category_id_idx` (`category_id`),
  KEY `sub_categories_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `sub_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_categories`
--

LOCK TABLES `sub_categories` WRITE;
/*!40000 ALTER TABLE `sub_categories` DISABLE KEYS */;
INSERT INTO `sub_categories` VALUES ('0ea63777-46b0-44c6-ad91-8eb41a654176','c4bd5d3b-0564-470d-9707-a788d84d6a65','nonfiction','Non-Fiction',0,'2026-02-25 16:09:04.233','2026-02-25 16:09:04.233',NULL),('2ee2dedb-1121-4d04-aea1-c3065629a333','19dfc1dd-0709-48a9-b384-845c7519903c','womens','Women\'s Clothing',0,'2026-02-25 16:09:04.215','2026-02-25 16:09:04.215',NULL),('41c6538f-780f-4ef2-8f17-dbc0e33ef8b4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','laptops','Laptops',0,'2026-02-25 16:09:04.204','2026-02-25 16:09:04.204',NULL),('8bd3fdf5-9b6c-455c-a58f-929b2c873cef','26a946d0-a894-47a5-a925-4354aeed1fa8','decor','Home Decor',0,'2026-02-25 16:09:04.225','2026-02-25 16:09:04.225',NULL),('9c451e0d-bccf-4e1a-8d81-943e8691155e','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','accessories','Accessories',0,'2026-02-25 16:09:04.208','2026-02-25 16:09:04.208',NULL),('a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','19dfc1dd-0709-48a9-b384-845c7519903c','kids','Kids Wear',0,'2026-02-25 16:09:04.218','2026-02-25 16:09:04.218',NULL),('aed4b433-375b-4768-9210-0756bf5cb08c','c4bd5d3b-0564-470d-9707-a788d84d6a65','education','Educational',0,'2026-02-25 16:09:04.235','2026-02-25 16:09:04.235',NULL),('bbbe7171-839d-4959-b5bf-88d5aff789f2','c4bd5d3b-0564-470d-9707-a788d84d6a65','fiction','Fiction',0,'2026-02-25 16:09:04.231','2026-02-25 16:09:04.231',NULL),('cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','19dfc1dd-0709-48a9-b384-845c7519903c','mens','Men\'s Clothing',0,'2026-02-25 16:09:04.211','2026-02-25 16:09:04.211',NULL),('d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','mobiles','Mobile Phones',0,'2026-02-25 16:09:04.173','2026-02-25 16:09:04.173',NULL),('e08f7a95-1741-445d-9bc8-3ad727192b2c','26a946d0-a894-47a5-a925-4354aeed1fa8','kitchen','Kitchen',0,'2026-02-25 16:09:04.222','2026-02-25 16:09:04.222',NULL),('fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','26a946d0-a894-47a5-a925-4354aeed1fa8','furniture','Furniture',0,'2026-02-25 16:09:04.224','2026-02-25 16:09:04.224',NULL);
/*!40000 ALTER TABLE `sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `last_update_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `support_tickets_user_id_idx` (`user_id`),
  KEY `support_tickets_order_id_idx` (`order_id`),
  KEY `support_tickets_status_idx` (`status`),
  KEY `support_tickets_created_at_idx` (`created_at`),
  KEY `support_tickets_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `support_tickets_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_documents`
--

DROP TABLE IF EXISTS `vendor_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_documents_seller_id_document_name_key` (`seller_id`,`document_name`),
  KEY `vendor_documents_seller_id_idx` (`seller_id`),
  KEY `vendor_documents_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `vendor_documents_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_documents`
--

LOCK TABLES `vendor_documents` WRITE;
/*!40000 ALTER TABLE `vendor_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendor_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_support_tickets`
--

DROP TABLE IF EXISTS `vendor_support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_support_tickets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_support_tickets_seller_id_idx` (`seller_id`),
  KEY `vendor_support_tickets_status_idx` (`status`),
  KEY `vendor_support_tickets_created_at_idx` (`created_at`),
  KEY `vendor_support_tickets_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `vendor_support_tickets_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_support_tickets`
--

LOCK TABLES `vendor_support_tickets` WRITE;
/*!40000 ALTER TABLE `vendor_support_tickets` DISABLE KEYS */;
INSERT INTO `vendor_support_tickets` VALUES ('984c91fd-b07f-4055-b4bf-dd969e5ace68','3a242478-a9a5-4674-97df-da617d58c785','sdsdds','general','sddsdsdsds','OPEN','2026-03-08 03:41:07.663','2026-03-08 03:41:07.663',NULL);
/*!40000 ALTER TABLE `vendor_support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_items_user_id_product_id_key` (`user_id`,`product_id`),
  KEY `wishlist_items_user_id_idx` (`user_id`),
  KEY `wishlist_items_product_id_idx` (`product_id`),
  KEY `wishlist_items_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `wishlist_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wishlist_items_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-08  9:34:00
