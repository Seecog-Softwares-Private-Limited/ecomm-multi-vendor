-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: markethub
-- ------------------------------------------------------
-- Server version	8.0.44

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
--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('HOME','OFFICE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HOME',
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `line1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `line2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `addresses` VALUES ('2d8105a8-ee87-48eb-ad99-5ff5ecef0c22','3be318d9-b976-44c4-9e5d-906e8fbe3474','HOME','lakshya','Site No. 26, Prestige Cube Building, Laskar, Hosur Rd, Adugodi, Koramangala, Bengaluru,','site no. 26','bengluru','Karnataka','560001','7231090321',0,'2026-03-11 08:05:50.656','2026-03-11 08:21:39.011',NULL),('b732e1dc-bb05-42ea-b0ac-fac66237d846','3be318d9-b976-44c4-9e5d-906e8fbe3474','HOME','akshat agrawallll','gupta dairy','teen batti circle , ak','jhalawar','rajasthan','326033','85038386546',1,'2026-03-11 08:12:46.604','2026-03-11 08:21:51.718','2026-03-11 08:21:51.718');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `admins` VALUES ('1dda9e89-71c5-4ae6-aa8a-82db42be9d61','admin@seecogsoftwares.com','$2b$12$ZeCoC8WcsR.dHDLfeEFLweGPA8IH5M3Xk8J8w8EgtDCDUKHYcFJPa','Sonam Agarwal','2026-03-04 09:05:15.855','2026-03-04 12:11:16.864',NULL,'7348820668'),('bc1dd935-1d94-44f3-9daf-eee3ea10e00c','admin@example.com','$2b$12$VHVcwMh3.gKNNLmUYbdEruKRvxhh3IJe3TXUjm8UaDgEnqDBTLlAu','Admin Demo','2026-03-08 03:28:32.201','2026-03-11 11:33:49.356',NULL,'+917014850817');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ifsc_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `variant_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `cart_items` VALUES ('03ffd241-9a46-4b71-a957-f42a073714c1','3be318d9-b976-44c4-9e5d-906e8fbe3474','59635436-7d8f-4fe3-8d78-9669b706db7d',1,NULL,'2026-03-11 07:40:36.339','2026-03-11 07:44:39.255','2026-03-11 07:44:39.255'),('045ac5a1-4b9c-4d38-b3c6-c5bd8e6dae71','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 09:13:26.287','2026-03-11 09:13:55.477','2026-03-11 09:13:55.477'),('39028c9a-a372-4a6e-90a4-a8eb7f7cb192','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 09:19:25.247','2026-03-11 09:19:50.519','2026-03-11 09:19:50.519'),('40ef8b9f-73fc-4dac-9f9a-c8fab681a671','3be318d9-b976-44c4-9e5d-906e8fbe3474','17e8fe22-839e-4e4f-836d-60aec62c96bf',1,NULL,'2026-03-11 10:58:02.024','2026-03-11 10:58:02.024',NULL),('4c8cac25-14b7-45c6-a54a-4cfec14e4838','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 09:12:18.166','2026-03-11 09:12:41.594','2026-03-11 09:12:41.594'),('5768dd54-b162-4959-85ea-ffcecdb332df','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 09:20:59.324','2026-03-11 09:21:16.312','2026-03-11 09:21:16.312'),('58f6cf19-4706-436b-bd5a-b3fd579dc0ac','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 10:17:29.648','2026-03-11 10:17:43.402','2026-03-11 10:17:43.402'),('5f4577c1-a90c-4c41-8861-5ba67c1ff0bf','3be318d9-b976-44c4-9e5d-906e8fbe3474','dad513a9-627b-49d6-8430-ff66b9da845d',2,NULL,'2026-03-11 07:44:27.066','2026-03-11 09:07:50.667','2026-03-11 09:07:50.667'),('6396798f-14ec-4c8d-ac1e-14035376d6e6','3be318d9-b976-44c4-9e5d-906e8fbe3474','17e8fe22-839e-4e4f-836d-60aec62c96bf',2,NULL,'2026-03-11 10:46:13.722','2026-03-11 10:48:48.274','2026-03-11 10:48:48.274'),('9a43a5a3-9633-4bd1-ae3c-fbc7ebc7f58b','3be318d9-b976-44c4-9e5d-906e8fbe3474','13aa68e5-e969-42ec-9aa1-9a98fdfd3cbd',1,NULL,'2026-03-11 10:45:57.607','2026-03-11 10:48:48.219','2026-03-11 10:48:48.219'),('a31463f8-8b9f-4924-a6d0-400e05938915','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 10:27:28.411','2026-03-11 10:27:56.059','2026-03-11 10:27:56.059'),('b85ca5fb-935b-47dc-94ce-f4b2666a7803','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 10:23:27.580','2026-03-11 10:23:34.881','2026-03-11 10:23:34.881'),('bfb72664-ad34-4dea-be9e-5e4fbb25803b','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 10:24:30.763','2026-03-11 10:24:39.852','2026-03-11 10:24:39.852'),('ce1d50eb-715e-4b86-90e9-014e7b988db1','3be318d9-b976-44c4-9e5d-906e8fbe3474','dad513a9-627b-49d6-8430-ff66b9da845d',1,NULL,'2026-03-11 09:12:30.081','2026-03-11 09:12:41.602','2026-03-11 09:12:41.602'),('e87b4f26-47ba-411a-811f-53c3319eb28a','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',1,NULL,'2026-03-11 09:54:12.482','2026-03-11 10:08:51.860','2026-03-11 10:08:51.860'),('fd13376e-1052-4f21-9bc6-e975d9a6dfd2','3be318d9-b976-44c4-9e5d-906e8fbe3474','5c3a3310-2c75-45b4-9545-a7aec14ce288',2,NULL,'2026-03-11 07:08:22.998','2026-03-11 09:07:50.489','2026-03-11 09:07:50.489'),('fde8ee83-3257-4e49-a62a-1e9ee61b2150','3be318d9-b976-44c4-9e5d-906e8fbe3474','634cf241-a952-4042-9f91-cbe704a6a410',2,NULL,'2026-03-11 07:45:06.521','2026-03-11 09:07:50.684','2026-03-11 09:07:50.684');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `categories` VALUES ('19dfc1dd-0709-48a9-b384-845c7519903c','fashion','Fashion',0,'2026-02-25 16:09:04.210','2026-02-25 16:09:04.210',NULL),('26a946d0-a894-47a5-a925-4354aeed1fa8','home','Home & Kitchen',0,'2026-02-25 16:09:04.221','2026-02-25 16:09:04.221',NULL),('7fbbd549-c469-41b7-864e-3e2a51135cd9','beauty','Beauty',0,'2026-03-08 10:29:41.971','2026-03-08 10:29:41.971',NULL),('93de6aef-503a-429d-b659-ea086abe1ec3','sports','Sports',0,'2026-03-08 10:06:53.433','2026-03-08 10:06:53.433',NULL),('c4bd5d3b-0564-470d-9707-a788d84d6a65','books','Books',0,'2026-02-25 16:09:04.227','2026-02-25 16:09:04.227',NULL),('eacae3d0-0f93-42ee-af14-8ff7ca9738c2','electronics','Electronics',0,'2026-02-25 16:09:04.157','2026-02-25 16:09:04.157',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_document_requirements`
--

DROP TABLE IF EXISTS `category_document_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_document_requirements` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('PAN','GST_CERTIFICATE','ADDRESS_PROOF') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SYSTEM','ORDER','SELLER','PAYMENT','RETURN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('NEW','ACCEPTED','REJECTED','SHIPPED','DELIVERED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `variant_snapshot` json DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `order_items` VALUES ('141dd641-ae5d-4bec-a1cb-f71f8f4fd75a','8007c1dc-8f72-4e07-b6cd-ce766cce2cf6','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 10:27:56.046','2026-03-11 10:27:56.046'),('1ada484e-20ba-4da3-b62c-45851301b0e2','474777ce-6632-40bf-b811-f1dd81f9f11a','13aa68e5-e969-42ec-9aa1-9a98fdfd3cbd','581b18b4-89a5-4007-87fd-16012dc032d4',1,140194.00,140194.00,'NEW','null','MB-XIA-08',NULL,NULL,NULL,'2026-03-11 10:48:48.079','2026-03-11 10:48:48.079'),('290513b0-6d88-4046-b965-4f4a4189afef','b8d22118-604d-4967-89c6-ea3ca22e7e56','634cf241-a952-4042-9f91-cbe704a6a410','581b18b4-89a5-4007-87fd-16012dc032d4',2,87219.00,174438.00,'NEW','null','MB-SAM-08',NULL,NULL,NULL,'2026-03-11 09:07:50.341','2026-03-11 09:07:50.341'),('3ddbbcfe-131f-4b36-bb98-4f3ed8d12086','b11631e4-89fc-4e16-9cc1-3d523f935b1f','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 09:12:41.576','2026-03-11 09:12:41.576'),('501d0e79-3d26-460d-8093-f23fadf10a32','b11631e4-89fc-4e16-9cc1-3d523f935b1f','dad513a9-627b-49d6-8430-ff66b9da845d','581b18b4-89a5-4007-87fd-16012dc032d4',1,46313.00,46313.00,'NEW','null','MB-ITEL-10',NULL,NULL,NULL,'2026-03-11 09:12:41.583','2026-03-11 09:12:41.583'),('65097f81-ce6e-4b9b-bfe0-72f7c7643fa1','890704a4-1967-4435-b045-f564d9ea4ddc','17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4',1,103353.00,103353.00,'NEW','null','MB-MOTO-01',NULL,NULL,NULL,'2026-03-11 11:10:37.231','2026-03-11 11:10:37.231'),('7652dbca-d380-4841-b150-4ce6cde5ce2a','b8d22118-604d-4967-89c6-ea3ca22e7e56','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',2,78521.00,157042.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 09:07:50.312','2026-03-11 09:07:50.312'),('91058054-df58-41d0-9dc8-a18aa30080cf','52940cc0-4fa8-44dd-b9c4-7c83daa891ec','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 09:13:55.463','2026-03-11 09:13:55.463'),('9ad3ecf9-c81b-477e-be53-b3b04aa14703','4214e79c-edb3-4adc-b745-4d55f273657c','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 10:08:51.843','2026-03-11 10:08:51.843'),('a99ea62e-b401-4d8b-acae-38d571c56c3c','b8d22118-604d-4967-89c6-ea3ca22e7e56','dad513a9-627b-49d6-8430-ff66b9da845d','581b18b4-89a5-4007-87fd-16012dc032d4',2,46313.00,92626.00,'NEW','null','MB-ITEL-10',NULL,NULL,NULL,'2026-03-11 09:07:50.335','2026-03-11 09:07:50.335'),('bbf82913-1c57-473f-b7a1-5cf1ee7927f0','b39c5873-a07f-46c1-a0d2-fea24a90ce25','17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4',1,103353.00,103353.00,'NEW','null','MB-MOTO-01',NULL,NULL,NULL,'2026-03-11 11:26:54.498','2026-03-11 11:26:54.498'),('c3c0421b-30b5-467e-892d-dcadf603cd91','964db550-073c-4d12-ae9f-28e69d8c2ec9','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 09:19:50.470','2026-03-11 09:19:50.470'),('c8a8d1f1-0100-451d-b670-d18bd967bdca','2fde1768-8945-4d31-af07-6a0b59332297','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 09:21:16.305','2026-03-11 09:21:16.305'),('ca258b11-3979-4b16-b600-425256296e35','d0841451-b93b-4e40-aae8-1f8807f8f1ea','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 10:17:43.378','2026-03-11 10:17:43.378'),('cbe9df0d-1a24-4ccb-96db-892947420f5f','38bdf9a9-3522-471a-826d-591c57f0ebdd','17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4',1,103353.00,103353.00,'NEW','null','MB-MOTO-01',NULL,NULL,NULL,'2026-03-11 10:58:41.357','2026-03-11 10:58:41.357'),('efd4c65f-0cd8-439f-95f9-4299975761a8','a1b74d43-ebc5-48fc-89b3-138ff01d48c4','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 10:23:34.859','2026-03-11 10:23:34.859'),('f11ef3b0-ffdd-42a6-912a-58fd0fd22daa','474777ce-6632-40bf-b811-f1dd81f9f11a','17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4',2,103353.00,206706.00,'NEW','null','MB-MOTO-01',NULL,NULL,NULL,'2026-03-11 10:48:48.138','2026-03-11 10:48:48.138'),('f4389297-b29e-44df-912e-2d64679f6df9','89317a83-cfe5-4d6d-b045-2dc22286c515','17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4',1,103353.00,103353.00,'NEW','null','MB-MOTO-01',NULL,NULL,NULL,'2026-03-11 11:07:50.841','2026-03-11 11:07:50.841'),('fda5a702-de73-48be-bc29-4fcfa8fa181d','a735211e-dfd7-4e51-84e0-d38317aa7420','5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4',1,78521.00,78521.00,'NEW','null','MB-OPPO-01',NULL,NULL,NULL,'2026-03-11 10:24:39.833','2026-03-11 10:24:39.833');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_events`
--

DROP TABLE IF EXISTS `order_status_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_events` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PLACED','PAYMENT_CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `order_status_events` VALUES ('0dc28d4a-9b73-4f5b-812a-5b937e179886','a735211e-dfd7-4e51-84e0-d38317aa7420','PLACED','Order placed','2026-03-11 10:24:39.825'),('11d0ce7d-8849-4d8e-a4fc-134a62872267','b8d22118-604d-4967-89c6-ea3ca22e7e56','PLACED','Order placed','2026-03-11 09:07:50.292'),('395694e2-1e22-47c1-bc38-bfa93ff7131e','964db550-073c-4d12-ae9f-28e69d8c2ec9','PLACED','Order placed','2026-03-11 09:19:50.323'),('40fd76b3-3311-465e-b2c8-7008f22f4dea','4214e79c-edb3-4adc-b745-4d55f273657c','PLACED','Order placed','2026-03-11 10:08:51.834'),('4be40af6-6acc-4a1d-8b06-b910c71c0fd9','b11631e4-89fc-4e16-9cc1-3d523f935b1f','PLACED','Order placed','2026-03-11 09:12:41.570'),('5051dfa5-6e82-43b3-8826-fdb7613a2e63','52940cc0-4fa8-44dd-b9c4-7c83daa891ec','PLACED','Order placed','2026-03-11 09:13:55.457'),('5283924b-8eee-46b1-af5e-ff98ecc42c6b','2fde1768-8945-4d31-af07-6a0b59332297','PLACED','Order placed','2026-03-11 09:21:16.295'),('6aa8c89f-b4a4-4008-a380-6fb4c8beb197','38bdf9a9-3522-471a-826d-591c57f0ebdd','PLACED','Order placed','2026-03-11 10:58:41.347'),('7c1b57d3-6e2d-4aaf-b1b6-ec0dc1e7166e','8007c1dc-8f72-4e07-b6cd-ce766cce2cf6','PLACED','Order placed','2026-03-11 10:27:56.039'),('7f552213-19a1-4387-b81c-19fd33a6b822','8007c1dc-8f72-4e07-b6cd-ce766cce2cf6','PAYMENT_CONFIRMED','Payment received via Razorpay','2026-03-11 10:28:51.912'),('84a57098-a8ce-4a92-bb6a-fbf632d9f8bf','890704a4-1967-4435-b045-f564d9ea4ddc','PLACED','Order placed','2026-03-11 11:10:37.222'),('8c262b5a-8514-4b65-9116-21097ffcf06c','89317a83-cfe5-4d6d-b045-2dc22286c515','PLACED','Order placed','2026-03-11 11:07:50.715'),('94a902ce-f4c0-44b2-b78e-bc03f2461fe9','d0841451-b93b-4e40-aae8-1f8807f8f1ea','PLACED','Order placed','2026-03-11 10:17:43.367'),('9774eb45-7c26-4a01-9188-4700a247fd96','474777ce-6632-40bf-b811-f1dd81f9f11a','PLACED','Order placed','2026-03-11 10:48:48.054'),('c4c61849-9fb5-44a4-8226-7e3bf299b46a','a1b74d43-ebc5-48fc-89b3-138ff01d48c4','PLACED','Order placed','2026-03-11 10:23:34.844'),('e24a46cd-f086-484f-ac50-7892b3d65e11','b39c5873-a07f-46c1-a0d2-fea24a90ce25','PLACED','Order placed','2026-03-11 11:26:54.450');
/*!40000 ALTER TABLE `order_status_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `coupon_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PLACED','PAYMENT_CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLACED',
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
INSERT INTO `orders` VALUES ('2fde1768-8945-4d31-af07-6a0b59332297','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 09:21:16.286','2026-03-11 09:21:16.286'),('38bdf9a9-3522-471a-826d-591c57f0ebdd','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',113688.30,0.00,10335.30,0.00,'2026-03-11 10:58:41.332','2026-03-11 10:58:41.332'),('4214e79c-edb3-4adc-b745-4d55f273657c','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 10:08:51.821','2026-03-11 10:08:51.821'),('474777ce-6632-40bf-b811-f1dd81f9f11a','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',381590.00,0.00,34690.00,0.00,'2026-03-11 10:48:48.024','2026-03-11 10:48:48.024'),('52940cc0-4fa8-44dd-b9c4-7c83daa891ec','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 09:13:55.446','2026-03-11 09:13:55.446'),('8007c1dc-8f72-4e07-b6cd-ce766cce2cf6','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 10:27:56.024','2026-03-11 10:27:56.024'),('890704a4-1967-4435-b045-f564d9ea4ddc','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',113688.30,0.00,10335.30,0.00,'2026-03-11 11:10:37.211','2026-03-11 11:10:37.211'),('89317a83-cfe5-4d6d-b045-2dc22286c515','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',113688.30,0.00,10335.30,0.00,'2026-03-11 11:07:50.474','2026-03-11 11:07:50.474'),('964db550-073c-4d12-ae9f-28e69d8c2ec9','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 09:19:50.214','2026-03-11 09:19:50.214'),('a1b74d43-ebc5-48fc-89b3-138ff01d48c4','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 10:23:34.827','2026-03-11 10:23:34.827'),('a735211e-dfd7-4e51-84e0-d38317aa7420','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 10:24:39.815','2026-03-11 10:24:39.815'),('b11631e4-89fc-4e16-9cc1-3d523f935b1f','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',137317.40,0.00,12483.40,0.00,'2026-03-11 09:12:41.563','2026-03-11 09:12:41.563'),('b39c5873-a07f-46c1-a0d2-fea24a90ce25','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',113688.30,0.00,10335.30,0.00,'2026-03-11 11:26:54.419','2026-03-11 11:26:54.419'),('b8d22118-604d-4967-89c6-ea3ca22e7e56','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',466516.60,0.00,42410.60,0.00,'2026-03-11 09:07:50.147','2026-03-11 09:07:50.147'),('d0841451-b93b-4e40-aae8-1f8807f8f1ea','3be318d9-b976-44c4-9e5d-906e8fbe3474','2d8105a8-ee87-48eb-ad99-5ff5ecef0c22',NULL,'PLACED',86373.10,0.00,7852.10,0.00,'2026-03-11 10:17:43.346','2026-03-11 10:17:43.346');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` enum('PREPAID','COD','WALLET','CARD','UPI','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `amount` decimal(12,2) NOT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `payments` VALUES ('24e2fa39-6573-44f1-a7c8-d212e8cb3cf6','4214e79c-edb3-4adc-b745-4d55f273657c','UPI','PENDING',86373.10,NULL,NULL,'2026-03-11 10:08:51.854','2026-03-11 10:08:51.854'),('2f242c70-d01a-4cf1-81e0-dd14de0efe9a','2fde1768-8945-4d31-af07-6a0b59332297','UPI','PENDING',86373.10,NULL,NULL,'2026-03-11 09:21:16.310','2026-03-11 09:21:16.310'),('417f423a-4abc-4c2d-a0de-5524490c6078','52940cc0-4fa8-44dd-b9c4-7c83daa891ec','CARD','PENDING',86373.10,NULL,NULL,'2026-03-11 09:13:55.471','2026-03-11 09:13:55.471'),('433620c4-6b88-42d2-8ec1-208d13630c19','89317a83-cfe5-4d6d-b045-2dc22286c515','UPI','PENDING',113688.30,NULL,NULL,'2026-03-11 11:07:51.023','2026-03-11 11:07:51.023'),('4e193c08-a0e0-41b3-8c76-c08529aa86ee','b8d22118-604d-4967-89c6-ea3ca22e7e56','CARD','PENDING',466516.60,NULL,NULL,'2026-03-11 09:07:50.354','2026-03-11 09:07:50.354'),('5b2898d0-1b2a-4b7b-8141-2fdd5cf91e49','b11631e4-89fc-4e16-9cc1-3d523f935b1f','COD','PENDING',137317.40,NULL,NULL,'2026-03-11 09:12:41.586','2026-03-11 09:12:41.586'),('6dc27e68-0708-4921-bd62-6b5e27d0d3e3','a735211e-dfd7-4e51-84e0-d38317aa7420','UPI','PENDING',86373.10,NULL,NULL,'2026-03-11 10:24:39.845','2026-03-11 10:24:39.845'),('798fc160-5cc0-4070-871a-c1770c6d2e9f','d0841451-b93b-4e40-aae8-1f8807f8f1ea','UPI','PENDING',86373.10,NULL,NULL,'2026-03-11 10:17:43.396','2026-03-11 10:17:43.396'),('a639435d-3f88-43ef-96de-b031c4af955f','b39c5873-a07f-46c1-a0d2-fea24a90ce25','UPI','PENDING',113688.30,NULL,NULL,'2026-03-11 11:26:54.612','2026-03-11 11:26:54.612'),('a6ef80e1-ced1-461d-b4ce-57041cc69d89','8007c1dc-8f72-4e07-b6cd-ce766cce2cf6','UPI','PAID',86373.10,'pay_SPsyFbxQDT09QI','2026-03-11 10:28:51.907','2026-03-11 10:27:56.053','2026-03-11 10:28:51.907'),('b0841c72-873b-44bf-8a6b-f862e410b83d','474777ce-6632-40bf-b811-f1dd81f9f11a','UPI','PENDING',381590.00,NULL,NULL,'2026-03-11 10:48:48.176','2026-03-11 10:48:48.176'),('ce20021f-e560-4578-9f9a-7ab418201dd7','38bdf9a9-3522-471a-826d-591c57f0ebdd','UPI','PENDING',113688.30,NULL,NULL,'2026-03-11 10:58:41.365','2026-03-11 10:58:41.365'),('ea9f4763-d534-4e1c-a87c-1984c0910d2d','964db550-073c-4d12-ae9f-28e69d8c2ec9','CARD','PENDING',86373.10,NULL,NULL,'2026-03-11 09:19:50.501','2026-03-11 09:19:50.501'),('f32b74ed-cb79-4da1-8a3e-15105b08013f','a1b74d43-ebc5-48fc-89b3-138ff01d48c4','UPI','PENDING',86373.10,NULL,NULL,'2026-03-11 10:23:34.870','2026-03-11 10:23:34.870'),('f692f756-9b41-421c-a292-2ae480f8d54d','890704a4-1967-4435-b045-f564d9ea4ddc','UPI','PENDING',113688.30,NULL,NULL,'2026-03-11 11:10:37.239','2026-03-11 11:10:37.239');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payouts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `status` enum('PENDING','PAID','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paid_at` datetime(3) DEFAULT NULL,
  `reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `product_images` VALUES ('004029ec-4d6a-48f5-b4f2-797e00dedfbe','e3b6d736-cab8-4bd5-9a21-a08d8630fec3','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.915','2026-03-08 10:38:53.390',NULL),('00992b6e-7f3d-4307-bccb-7544207bcbd9','be0c0393-c211-43f3-a305-3333ec3bac05','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400',0,'2026-03-08 10:38:53.625','2026-03-08 10:38:53.625',NULL),('00a6fc82-9b2e-44a2-a670-12b19ca845b1','17e8fe22-839e-4e4f-836d-60aec62c96bf','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:51.000','2026-03-08 10:38:53.433',NULL),('00ce8091-ad66-4072-8f36-a2478bcd323c','28e12a3e-4136-4ff7-989d-d06721f2542d','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.863','2026-03-08 10:38:53.353',NULL),('00d70b68-e32e-4690-8484-3451c7b329ea','3d82fe69-2a6f-4827-9308-458edbcf9b9d','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',0,'2026-03-08 10:06:53.785','2026-03-08 10:38:53.645',NULL),('01120275-d2e4-4a65-914f-e9fb108b3741','0b269961-f5c0-4ee7-acbe-b91a0c1ee4b2','https://images.unsplash.com/photo-1631214524026-ab64e1f8f0b2?w=400',0,'2026-03-08 10:29:42.604','2026-03-08 10:38:53.583',NULL),('024bb92d-5f89-4c3a-bd62-3fd560860698','93410c74-666b-49c4-8efc-17ad46897d9e','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:51.009','2026-03-08 10:38:53.437',NULL),('02962512-0424-423e-afe4-a10e9a758b38','9035c942-c864-4b93-bac6-64a7ca1df030','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',0,'2026-03-08 10:38:53.607','2026-03-08 10:38:53.607',NULL),('04293dc0-2fdd-4010-9717-6b61c0649783','086acad8-e2a9-4b17-adf1-62805322a116','https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',0,'2026-03-08 10:01:50.341','2026-03-08 10:38:53.457',NULL),('057dbfca-0413-421d-b857-5a980eb2d771','eab9896c-6eec-491a-87e6-0acc9d733c79','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:51.011','2026-03-08 10:38:53.439',NULL),('05a2ee99-4df7-41d3-9ca9-6c3f5b1d585c','99c65f07-023b-466d-b65a-0f9f3d181bb5','https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',0,'2026-03-08 10:01:50.351','2026-03-08 10:38:53.465',NULL),('0699c627-ead1-4cfc-8c0e-caedb0ce8861','4ba6400d-605f-46f4-baf5-a6408628bd7f','https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',0,'2026-03-08 10:38:53.622','2026-03-08 10:38:53.622',NULL),('070f791a-84a5-4032-af33-fdf9f9c953cf','096a7276-690c-4a46-aaa9-5077e76ad338','https://images.unsplash.com/photo-1558769132-cb1aea913033?w=400',0,'2026-03-08 10:29:42.502','2026-03-08 10:38:53.554',NULL),('071ac20a-0e7f-49a4-b19c-730b70128c4f','bdac69cf-ad22-46e1-a4b3-29dc28865738','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:51.014','2026-03-08 10:38:53.442',NULL),('088b1ef7-14e9-40d2-a4cb-1eec8b6fcae2','634cf241-a952-4042-9f91-cbe704a6a410','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.813','2026-03-08 10:38:53.308',NULL),('08b6aef7-f47c-46a8-a594-d36d90b32637','1a2e893f-7468-42f3-9714-026de9c66467','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',0,'2026-03-08 10:29:42.498','2026-03-08 10:38:53.550',NULL),('08edc0b8-a65b-41e6-b374-acb59a9eb002','8ec3b72e-2d12-468d-8d95-3afff4bb82fe','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400',0,'2026-03-08 10:38:53.618','2026-03-08 10:38:53.618',NULL),('093a8416-52c5-47ec-84cc-5e0c6cdd2e72','80eb2e63-b9ca-4139-823c-67c4a4513a46','https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',0,'2026-03-08 10:06:53.795','2026-03-08 10:38:53.654',NULL),('0a106843-4352-4d15-ac28-bf12adf095f8','27527d4c-37b6-4d55-8739-61d14d47f6a2','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',0,'2026-03-08 10:29:42.476','2026-03-08 10:38:53.530',NULL),('0a16ecd7-f012-4acf-ade3-dc145674169b','0e4bf847-6be1-447f-9fac-667e534ccf5c','https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',0,'2026-03-08 10:38:53.602','2026-03-08 10:38:53.602',NULL),('0a4092b7-de9b-4ee5-9780-201b78c869b5','374f328f-0638-46d8-a7bd-aa3dbe2ab1c6','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.859','2026-03-08 10:38:53.344',NULL),('0a79bd26-3b5d-431a-bc5c-5088dfa7e844','f1ecbe44-3226-4381-8820-b8428a98cd5b','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.791','2026-03-08 10:38:53.294',NULL),('0c67bc1b-4d29-4bf4-a0e1-8c18c0e4f3a1','bdd3dd15-5504-48e9-909e-81f095b3cd1f','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',0,'2026-03-08 10:29:42.483','2026-03-08 10:38:53.536',NULL),('0d378887-eaa1-4489-9f98-2fd61b6d6074','f654eeab-550d-45d9-ba34-8c914d16e58e','https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',0,'2026-03-08 10:06:53.790','2026-03-08 10:38:53.650',NULL),('0d6a4747-acfb-494a-9918-9107ea0088be','69850e43-3d7e-4bf4-b915-309f07d0c492','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400',0,'2026-03-08 10:38:53.631','2026-03-08 10:38:53.631',NULL),('0e8e18a1-4380-42fc-8505-ac8a01c9912a','df43d77a-3126-47a0-8650-fa67bab48bc2','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.937','2026-03-08 10:38:53.398',NULL),('0ee9cff5-4207-48b6-86eb-20e40b412750','e5abd3d1-9ec8-409d-a743-d3c40c9eb4fe','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.952','2026-03-08 10:38:53.407',NULL),('0f93a41b-60ee-410e-b68c-13b971ed5507','949a280c-62e3-42d8-acbf-0496cbcec450','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:51.013','2026-03-08 10:38:53.440',NULL),('0ff1ea08-af70-4547-b4c1-e8c3914a5398','98d8763a-f71f-43c6-b756-83f7dc6f5e27','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',0,'2026-03-08 10:29:42.595','2026-03-08 10:38:53.578',NULL),('10baacfd-b693-4b3e-b649-caf932ce8f41','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/3b2f70f4-f78e-49cc-b3cc-7405e20245ee.jpg',0,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('11c137e1-afdf-4ad3-90d8-4f01b8771afa','08500d3c-ffd0-4a23-a973-0218c13019a7','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',0,'2026-03-08 10:29:42.491','2026-03-08 10:38:53.543',NULL),('121673a2-adfa-4d70-b0bd-77320f2dedf1','49532104-542b-4800-9ff9-6fe9721c51a7','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.970','2026-03-08 10:38:53.416',NULL),('16b24ca0-9bcc-4bc3-8a5c-373f3202434f','dae21dd5-514d-4883-8636-cd60272578c7','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.982','2026-03-08 10:38:53.422',NULL),('176aa74e-1441-418b-846e-ed3562b599dc','48862bb2-a9ef-4573-a09c-79956af184d1','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',0,'2026-03-08 10:38:53.612','2026-03-08 10:38:53.612',NULL),('18ef46cb-b054-4813-ac2e-bedcdc4b5e4d','9e3b5511-400c-4e3f-8c1e-da7c2427a2a7','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.968','2026-03-08 10:38:53.414',NULL),('1a3a47bd-b25b-41af-a003-4270996065db','1a883f97-88ba-4116-8614-bfaaef268d50','https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',0,'2026-03-08 10:01:50.360','2026-03-08 10:38:53.496',NULL),('1ccbb62c-36ec-4b74-a30a-6464712eb71a','8b691490-45c9-4c99-8e38-ae76b442c4f7','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',0,'2026-03-08 10:01:50.350','2026-03-08 10:38:53.464',NULL),('1ee397e8-fd62-4cd3-a41a-879d0e14257c','081cb10a-aeee-4334-bd85-3edce5e0f891','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',0,'2026-03-08 10:29:42.507','2026-03-08 10:38:53.559',NULL),('1fa7a71e-767f-4f54-ab4c-07180d15438d','9a69d831-07fc-44d4-9772-67c75381b050','https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400',0,'2026-03-08 10:38:53.597','2026-03-08 10:38:53.597',NULL),('20b47bd6-3f4e-4199-a9a3-b78b0cf07985','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/10dd24f4-65f4-45b3-b81a-9dcf7a9201af.jpg',1,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('21badd83-9031-4fc9-b132-0a645ff06d90','4e789e54-2a5b-494e-9f00-382965199b9c','https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',0,'2026-03-08 10:06:53.803','2026-03-08 10:38:53.662',NULL),('22ec455b-b12b-48ec-8934-70b92dfc8a18','f0ebf931-7076-4a7d-b4fc-1411ad0a3d94','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.887','2026-03-08 10:38:53.373',NULL),('27a631a0-f490-405f-9303-f05f4aadc2ab','08be0ff3-4680-4dc8-879a-b598e6022a4f','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',0,'2026-03-08 10:29:42.493','2026-03-08 10:38:53.545',NULL),('29b85d0e-c2b4-4a03-ae3e-a596c7e2b4e7','9505cd0c-d29d-4084-8061-e8eb2fc18ba7','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.927','2026-03-08 10:38:53.394',NULL),('2a94b99c-c4a4-4eb3-8f6e-367ba78587d4','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/458a8071-3137-4aad-aa22-c848213a0906.jpg',2,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('2ad87769-740b-4038-bf06-6a6fbded0324','e0711991-c085-416f-9c9c-1b9b9ee1de6e','https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',0,'2026-03-08 10:29:42.560','2026-03-08 10:38:53.571',NULL),('2c329c88-a0f6-4876-9350-9e2f27508b5f','ed842f32-6f83-4864-a1d6-69d7363c1bb1','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',0,'2026-03-08 10:38:53.605','2026-03-08 10:38:53.605',NULL),('2c9d6b45-f589-4a5d-a0e5-276c8ac0f861','0424aac2-f7e2-468c-a632-25a90148c923','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',0,'2026-03-08 10:29:42.473','2026-03-08 10:38:53.527',NULL),('2d0e7d7c-a92c-4341-8a4b-7e096574a0d5','ccefa856-e9ba-433f-9039-3c8d5ee74bfe','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.849','2026-03-08 10:38:53.338',NULL),('2e6257b5-4c3f-4b7d-a536-6d25a4d94516','8c25ebe8-ca78-4612-938f-48abcb1695b5','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',0,'2026-03-08 10:38:53.616','2026-03-08 10:38:53.616',NULL),('329ab66b-3a4a-4304-a577-baba3b13df00','56736578-f143-4ac7-8fde-62bce3c635a3','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.947','2026-03-08 10:38:53.404',NULL),('32ab1586-d130-494c-9d50-2a871165683f','26e107c4-809a-426c-b951-97bdf462b053','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.959','2026-03-08 10:38:53.409',NULL),('35560c49-e8c8-4a49-918e-c3fc93640f37','e0b1b885-536a-494b-9520-63f0e89caa68','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:51.016','2026-03-08 10:38:53.443',NULL),('35beae6f-8526-4a67-8a45-5cd5ad8c8467','efe9efa9-42fe-4627-99b7-7813be87ebc2','https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',0,'2026-03-08 10:38:53.626','2026-03-08 10:38:53.626',NULL),('3a2178fe-9100-4096-9f03-ff80f0928ee0','4905034e-d3bb-473d-b9e0-ab2ee1f95c12','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.909','2026-03-08 10:38:53.382',NULL),('3d544bc3-b4d8-412c-a9eb-39c945ac85a1','fc75bdfc-cd75-469a-abb0-cd16396f0b50','https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',0,'2026-03-08 10:29:42.495','2026-03-08 10:38:53.547',NULL),('3efa8001-2f71-4f35-9f9e-c5afa4cd5dd8','23bae52e-05ba-4b72-96fe-3a76db06378c','https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',0,'2026-03-08 10:01:50.339','2026-03-08 10:38:53.456',NULL),('4129059d-b7c6-40f9-a783-0ffaca11b219','452e23e4-c5c3-464d-895a-60f3b4bc5889','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',0,'2026-03-08 10:01:50.363','2026-03-08 10:38:53.507',NULL),('413bfc8b-ab6e-4b3e-92d5-7586589bb98c','09b119dd-c74f-43f4-857e-ed2e7e57f7b4','https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400',0,'2026-03-08 10:29:42.516','2026-03-08 10:38:53.564',NULL),('4295c5be-a4a3-4347-ae05-5ecdd53839be','17b1a65e-1ebe-40d8-aa59-8b19f84783be','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.617','2026-03-08 10:38:53.266',NULL),('42af06e5-d4e4-40ed-9d65-9b5e5cf40d39','b58e58f0-802d-44fb-8564-812b824c564d','https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',0,'2026-03-08 10:01:50.348','2026-03-08 10:38:53.462',NULL),('42cd87cb-c0bd-42fa-a6f8-84d080d3335e','c937ca29-21d1-4a89-b6a5-ecb0511ce1bc','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:51.007','2026-03-08 10:38:53.436',NULL),('4517b622-1e9e-4577-9d22-605e625d4ea7','a3983110-678d-40c5-b4ad-245c97eab52c','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.993','2026-03-08 10:38:53.428',NULL),('46567613-f5d8-42e6-813d-77ac48528aa0','e9a0ac02-565d-4e65-939c-2c0cfb1b6a17','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',0,'2026-03-08 10:06:53.798','2026-03-08 10:38:53.657',NULL),('49871827-e6ba-4d3d-ae3b-da90682bd9e2','eae95954-9deb-4129-80df-06c00273421a','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',0,'2026-03-08 10:38:53.628','2026-03-08 10:38:53.628',NULL),('4a4c5467-45dd-4ffc-8156-3dbe0d6e43d0','00036c99-6734-4def-9631-a63b1d0bac3c','https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',0,'2026-03-08 10:29:42.505','2026-03-08 10:38:53.556',NULL),('4c52a797-c8d2-4526-b62c-83e3923876e8','a1bf76b4-2667-480c-a3ff-2e33b6387c2b','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.638','2026-03-08 10:38:53.270',NULL),('4d2ce645-cffb-4eca-82bb-c19f6399da7f','7f4f6b25-c771-4641-bdec-f2741ebac281','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400',0,'2026-03-08 10:38:53.609','2026-03-08 10:38:53.609',NULL),('4d3fe498-fc7e-4520-a2d7-6613909de3d3','d0a20864-4648-420c-969c-1295a168e213','https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400',0,'2026-03-08 10:38:53.624','2026-03-08 10:38:53.624',NULL),('4de4758b-ca61-4813-bd9b-13b6fcd97544','b8269fcf-0216-407c-b6c3-e787785daa51','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.950','2026-03-08 10:38:53.405',NULL),('4e9f1fbb-bb66-4854-bedd-c41856a16626','f3484048-ea96-4596-88d0-c23d9c574453','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',0,'2026-03-08 10:06:53.802','2026-03-08 10:38:53.660',NULL),('4ecc5f90-c975-4acb-94dd-db94f85d1f51','02f6950b-5eeb-4b90-ac4b-7d4f5c7740ac','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.940','2026-03-08 10:38:53.400',NULL),('50d3ca84-3345-44a2-832d-1a2443de4d1d','84cdb80c-8b20-4257-846f-97abc3fc46a0','https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',0,'2026-03-08 10:29:42.608','2026-03-08 10:38:53.584',NULL),('510b0a65-246a-450f-b563-f62c8c3948aa','ca09fdf0-bc4e-4697-9936-58fa7d794ea2','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:51.017','2026-03-08 10:38:53.445',NULL),('5235d65e-edcd-4016-91e6-f9e1a90bcc9b','9dfff9a5-f004-4c20-a1ad-17b1c2bd81f1','https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400',0,'2026-03-08 10:38:53.615','2026-03-08 10:38:53.615',NULL),('5237a794-806e-43ae-838c-b2237fb6ccca','9d9ca9f1-7b93-4455-a5bd-aede9f07b55b','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',0,'2026-03-08 10:38:53.593','2026-03-08 10:38:53.593',NULL),('52812249-80c6-4ef2-82d9-b66714e6972f','c4ebf6a7-b732-4292-bdba-ccf1ef9751ce','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',0,'2026-03-08 10:29:42.513','2026-03-08 10:38:53.563',NULL),('52987722-a950-4f88-87b2-a1ba2a18e001','60cc7b0f-2522-45ab-ab3b-7b7ea31a636d','https://images.unsplash.com/photo-1558769132-cb1aea913033?w=400',0,'2026-03-08 10:29:42.478','2026-03-08 10:38:53.532',NULL),('54028a2e-9063-4b49-b1e6-a7779df79854','c0c9e263-4406-432d-a132-af3d5a0cd820','https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',0,'2026-03-08 10:29:42.488','2026-03-08 10:38:53.541',NULL),('549ff662-f3c3-44d1-bfb9-7a29532bacca','67246e66-c661-40d8-94a8-4b78d6e1af55','https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',0,'2026-03-08 10:29:42.471','2026-03-08 10:38:53.524',NULL),('5543c32b-03dc-41d8-8b13-bafccb24339a','1612a5b4-a923-4696-82ad-97e40d9456d4','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',0,'2026-03-08 10:06:53.800','2026-03-08 10:38:53.659',NULL),('56a41d7a-5431-4e6b-a91f-cf6323325b7f','8768eb8d-f68a-482b-855f-8292f6ed468c','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',0,'2026-03-08 10:29:42.581','2026-03-08 10:38:53.575',NULL),('56c082f8-7d41-406a-a9b3-6d831f23dfaa','2d3587a0-edec-4f57-8c1d-2257d175def7','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',0,'2026-03-08 10:29:42.520','2026-03-08 10:38:53.566',NULL),('57838f80-b2fc-4b8c-8073-cda5f39ddb41','6c9219ca-de40-46d2-a875-1bd785792713','https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',0,'2026-03-08 10:01:50.358','2026-03-08 10:38:53.490',NULL),('592cec9c-61ea-4575-8731-1f19999ec955','8e3ca85e-c6f3-49f8-b1d5-10e045a8eee9','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400',0,'2026-03-08 10:06:53.823','2026-03-08 10:38:53.679',NULL),('5ab8e34c-5eae-461a-aa58-0376fe452523','c3d0b114-4e17-4da5-a79d-79431fcfc873','https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',0,'2026-03-08 10:06:53.788','2026-03-08 10:38:53.647',NULL),('5e3d5227-e2ec-4373-a87a-957add2798af','18ea854e-349e-4930-b345-8e2ffa2d64a4','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.965','2026-03-08 10:38:53.413',NULL),('5eea2bc7-cb0d-4ad5-bfdc-191142678c51','e7e37351-8f3e-4694-b5f9-32d2bca27ff4','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.543','2026-03-08 10:38:53.256',NULL),('5fca6b49-49a9-47a9-9032-0eda86491e0f','529af813-fb85-4ece-a039-5482ccdbc5d0','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',0,'2026-03-08 10:29:42.590','2026-03-08 10:38:53.576',NULL),('6046dfde-46d1-468f-a72a-d43c2479e567','39c8eb12-0247-4453-a741-dd1e8b76bdb7','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.806','2026-03-08 10:38:53.302',NULL),('61fe4617-711c-4810-8e9a-b29b2e5322b1','dad513a9-627b-49d6-8430-ff66b9da845d','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.998','2026-03-08 10:38:53.432',NULL),('62aeff82-fd6e-4520-bbc3-1a081449b0f2','007c0e19-b58b-403b-8ae4-b7c77b9ca920','https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400',0,'2026-03-08 10:38:53.600','2026-03-08 10:38:53.600',NULL),('62bc353d-399b-412c-9e08-bd3e3862177a','a1b8d6bb-b0a5-4aeb-8071-220fede8749f','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',0,'2026-03-08 10:29:42.601','2026-03-08 10:38:53.582',NULL),('66585655-61fc-49ea-b760-a17b7020b4a8','baa5091c-c1fc-456e-8d33-2d80f32144c9','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',0,'2026-03-08 10:38:53.638','2026-03-08 10:38:53.638',NULL),('6692d85e-73f4-4dce-a49a-8471a4bcd438','abd78268-a75b-441e-ab89-0ce198e418d6','https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',0,'2026-03-08 10:06:53.822','2026-03-08 10:38:53.677',NULL),('67ae6e63-8fca-4a5f-8ed9-bd032685f202','e8ee6860-2286-41ff-ba0c-20a9b714ed86','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.833','2026-03-08 10:38:53.327',NULL),('69eeb6a6-373c-4c23-9ff8-c439bbf91244','21a70a81-0382-4acc-a76f-ce545ab576c8','https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',0,'2026-03-08 10:29:42.612','2026-03-08 10:38:53.586',NULL),('6a67f6c9-e3a1-48ec-94bf-b8886202fc28','4132650e-8478-4747-b359-0930ebb4cfc7','https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400',0,'2026-03-08 10:38:53.619','2026-03-08 10:38:53.619',NULL),('6cd615ad-dcff-4ffa-b6cc-8a85b770b65b','14ac183b-4f3a-4599-aa0c-fddbcd40f2df','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',0,'2026-03-08 10:06:53.816','2026-03-08 10:38:53.671',NULL),('6dc263b6-d6c7-4cf5-83cd-c20243853d14','f70742e4-6e0c-4318-aa13-7f720a6ff491','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.977','2026-03-08 10:38:53.419',NULL),('6e0e138a-0787-4631-a2c2-a0f6c6fa50f3','255a21ca-db0b-4a54-9119-b3d0dd4b65d7','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',0,'2026-03-08 10:38:53.629','2026-03-08 10:38:53.629',NULL),('6e7d83d2-517d-4fb8-93c0-3a286be2676d','520f1e2e-1684-411d-bc5a-c25a0e32bb78','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',0,'2026-03-08 10:01:50.353','2026-03-08 10:38:53.469',NULL),('701a02c6-4113-4cfc-819f-27bbdab4b8e1','26ddf42e-dabc-4a01-8c4c-ede7ff753790','https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',0,'2026-03-08 10:01:50.354','2026-03-08 10:38:53.474',NULL),('70e003a4-9796-4667-8566-2d1379cd825c','873d4bc5-7b22-48ef-8537-472d0891dda2','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.996','2026-03-08 10:38:53.430',NULL),('73290a6c-c20b-43da-9c5d-e137e77a4e9d','d5630967-ff9c-4126-8d7d-27081cfbf7fa','https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',0,'2026-03-08 10:29:42.554','2026-03-08 10:38:53.569',NULL),('73d57a64-bf42-48b6-9e50-a9d748c5f31d','3f0dd0b1-da1d-433f-9886-4bb9bf92f470','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',0,'2026-03-08 10:38:53.621','2026-03-08 10:38:53.621',NULL),('75542c70-7bee-4e31-852c-ee600d37ba29','e0ac112e-92c8-4092-b4d4-736361013797','http://localhost:3005/uploads/a6963633-75f7-4117-8581-c1acbac4a9ce.jpg',1,'2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('76a3a950-4647-4b33-8702-df944977352c','c5899cb3-307e-4e91-a50c-312988327526','https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',0,'2026-03-08 10:01:50.334','2026-03-08 10:38:53.453',NULL),('791fc324-d693-4636-8a32-4431e10cea37','87af924a-eaf5-4e60-9c17-0b0a0b1b8bfc','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.725','2026-03-08 10:38:53.280',NULL),('7b08d34b-8e8e-47c5-a80c-8c3c9b3aaa05','f1ea1353-e8e5-43d2-8993-28c8d3765aaf','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.989','2026-03-08 10:38:53.427',NULL),('7d494fd6-a861-4f6a-b135-a638263dc45a','212dda19-cd70-410b-b7a4-08179bb72afc','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.919','2026-03-08 10:38:53.393',NULL),('7e45d05c-66c6-449e-ad7f-d0a8a8b4b1f7','27ca58e6-2cff-427b-8d10-a335c5298d50','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.581','2026-03-08 10:38:53.261',NULL),('7e47a825-2286-4725-8eb3-4ed25b089e0e','e4261c69-b259-40f8-b8e4-54ff53a43ddb','https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',0,'2026-03-08 10:01:50.318','2026-03-08 10:38:53.448',NULL),('8176da53-c198-4d14-a233-60225553260e','e18b5933-8c3d-4c7d-a5a9-eb9adb286bad','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.795','2026-03-08 10:38:53.297',NULL),('82b1ede4-b4c9-4098-8120-c9c48e4185d6','c8cddf84-b0b2-49c0-83f4-42ae6f1e9a8c','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.875','2026-03-08 10:38:53.366',NULL),('83319218-e311-4e7a-a23d-b14d92e06055','1aa344c6-60ee-46c1-854d-9aa00386f434','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400',0,'2026-03-08 10:06:53.805','2026-03-08 10:38:53.663',NULL),('838e1e99-88a5-478e-9f7a-73d32d2fb4ac','05b92e3d-0a14-45d1-a19e-f6ab045aa3b2','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.934','2026-03-08 10:38:53.397',NULL),('86058ed9-2e3b-4ce1-9cb0-e7db230d2d11','7fd3355f-ee0f-4fea-a4ca-f87e95d54175','https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',0,'2026-03-08 10:06:53.814','2026-03-08 10:38:53.669',NULL),('8977cb7f-4d4c-448d-b7a1-e0210a0f5aad','59635436-7d8f-4fe3-8d78-9669b706db7d','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.845','2026-03-08 10:38:53.335',NULL),('89828be5-7875-4a8f-967a-85389f3d8c63','2bb29b59-5224-4cd0-9c5b-870470c9601c','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.987','2026-03-08 10:38:53.425',NULL),('8be366a9-689d-4c3d-ac40-f905fbc93a5e','bf38eccf-bf56-426a-b62f-e83ce8a7bc00','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',0,'2026-03-08 10:29:42.510','2026-03-08 10:38:53.561',NULL),('8c24d5a5-6c42-4f7f-921a-b5583d07b5f9','e5f1fc08-af6c-4cb5-b0f9-c61ef5bb66f3','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',0,'2026-03-08 10:06:53.817','2026-03-08 10:38:53.672',NULL),('8c873131-cca3-4237-8f78-8475c2a90383','25a30227-e0c0-4561-84dc-c7541173945f','https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',0,'2026-03-08 10:01:50.361','2026-03-08 10:38:53.501',NULL),('8e30ed16-7a75-42b5-8a4b-b32570a54376','13a41f01-5007-4b0c-b630-4bf8c3e0fa12','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',0,'2026-03-08 10:29:42.485','2026-03-08 10:38:53.539',NULL),('904ad96f-3000-47a9-8b08-d49dc8dc692c','7c7ea138-d694-488f-a7ca-4830889f35ca','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.930','2026-03-08 10:38:53.395',NULL),('909ff2f5-50df-4340-9d00-4fe465caa0a3','7d1f392a-1234-49f7-9934-f0b583873ad8','https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',0,'2026-03-08 10:38:53.595','2026-03-08 10:38:53.595',NULL),('979df5f5-e4ba-4f8b-a7ce-34d3791a243c','3621a254-99c0-422b-bea1-1111e844db76','https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400',0,'2026-03-08 07:52:50.880','2026-03-08 10:38:53.370',NULL),('97cd8a5d-eb7a-4807-a154-85dc730b4f77','a5791b9f-92a5-42ae-af37-2e4df8292fce','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',0,'2026-03-08 10:29:42.466','2026-03-08 10:38:53.513',NULL),('9ada7ec7-8877-48df-93f1-c06887955c21','77740ae7-aa47-4184-81a3-6e0df70a1a5a','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.766','2026-03-08 10:38:53.287',NULL),('9dd96985-490f-488d-a09d-e3db71ba09bb','4e000b41-80bc-4b96-b995-5e54b555c7aa','https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400',0,'2026-03-08 10:38:53.641','2026-03-08 10:38:53.641',NULL),('9e29bc0c-fda0-4380-af39-82a8ed805a7b','89d0fcc0-60b5-4007-8526-3cb7d85db7d1','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.903','2026-03-08 10:38:53.379',NULL),('9f019f30-7d7b-42f1-b3d6-1d4c8b294141','969693cb-e3d9-4cbc-87e3-30d830da1d89','https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',0,'2026-03-08 10:01:50.336','2026-03-08 10:38:53.454',NULL),('9f566287-eaf7-4e32-9aee-09e6bd2fe747','5c3a3310-2c75-45b4-9545-a7aec14ce288','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.906','2026-03-08 10:38:53.381',NULL),('a002b1ba-529e-4a26-82d8-7e60ca3a176a','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/edd4bc28-0201-46e7-a297-0a2de3a0b7d3.jpg',3,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('a00e0182-6714-495b-a959-2dc0e399f605','d83b851d-1d71-4671-a802-f17c68e397e3','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',0,'2026-03-08 10:01:50.321','2026-03-08 10:38:53.449',NULL),('a12a7581-d02b-4857-9a32-34659507a721','dc959de8-c414-4fe7-b95a-23f974fc2222','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.841','2026-03-08 10:38:53.332',NULL),('a8f59c49-c8a6-4385-960e-42a6a3cb229e','e23fb5b8-4efe-4081-ab0e-a29ae087306c','https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400',0,'2026-03-08 10:06:53.812','2026-03-08 10:38:53.668',NULL),('ab6170f9-2558-4d7a-871d-575fd22a19e3','a8d00860-6548-4247-a742-c6eda0692b40','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',0,'2026-03-08 10:06:53.820','2026-03-08 10:38:53.676',NULL),('ac6f6865-c27a-44a3-9e2c-baca7fd722c3','f8d598ea-a08f-4cf7-ab44-b7ea4a4bd25a','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.955','2026-03-08 10:38:53.408',NULL),('ad628594-033d-4f4c-a322-f42aad5c1696','2dc0b93b-671d-4d20-b48a-60c370890bef','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',0,'2026-03-08 10:38:53.633','2026-03-08 10:38:53.633',NULL),('ad8c6adf-5e84-402d-a5e2-b1a63f491fd9','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/602c2238-7600-4703-b621-3037eda060be.jpg',0,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('adb1e3ce-bdd7-4a64-9f62-2311ba4f14e3','99fbc379-584a-4868-a0e6-985dcaa105cd','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.810','2026-03-08 10:38:53.305',NULL),('b039a998-a0f8-4cc6-8943-de1a7c0d64fa','eb867fc5-a2ac-49ee-a8ce-43ba2a75bf3f','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.891','2026-03-08 10:38:53.375',NULL),('b4610c9b-4710-486b-bee1-dc50887af718','e68892e8-982d-4727-a37f-902bbfda37a2','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.854','2026-03-08 10:38:53.341',NULL),('b54295d2-f576-45e9-8b8a-75d0b4d2c490','98c8b300-168c-41ac-b85a-53d1551ee226','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.980','2026-03-08 10:38:53.421',NULL),('b5a62ed9-cdb8-4b92-845a-883868f23699','4f51c429-e983-469c-8849-44d7a0f2246b','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',0,'2026-03-08 10:06:53.781','2026-03-08 10:38:53.643',NULL),('b828dd2f-7409-4ea7-93e8-1a33d616d60f','dbca3cdb-1209-49db-a8e3-1da6f155da70','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.899','2026-03-08 10:38:53.377',NULL),('ba45f52a-1deb-48ce-b9d1-ff1160913a7e','28d133ac-5400-47a9-b453-8e4989de21d9','https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400',0,'2026-03-08 10:38:53.637','2026-03-08 10:38:53.637',NULL),('ba52989e-69ea-4403-a9ce-a5f9d09daabf','a585ee7b-9dd1-4489-ac5c-a0849b81f766','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.798','2026-03-08 10:38:53.300',NULL),('ba562ebf-146a-47d9-baf6-5508183bb6de','26b9e391-5123-463a-ae6c-a3c15126a5f3','https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',0,'2026-03-08 10:29:42.464','2026-03-08 10:38:53.510',NULL),('ba991ec9-f0c8-4c85-a53a-0f727fd0bcd1','47a65476-e58e-4bda-b230-dbf688c3d4c5','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.913','2026-03-08 10:38:53.387',NULL),('be4ae097-dc77-4057-9b07-e1dc3aac14a9','b15f6414-256c-4149-b2a1-b64b666629a4','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:51.003','2026-03-08 10:38:53.434',NULL),('bf5d9b07-f6c9-4173-b91b-ef41e1883156','06bdc568-70f1-47a2-b624-bec0543b5dc8','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.721','2026-03-08 10:38:53.277',NULL),('bf6a8ff1-7ed3-437f-a1f2-678bc38a5933','efd52231-8b99-4db1-aebf-4268142e7e74','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.866','2026-03-08 10:38:53.358',NULL),('c24bb054-1b71-490e-b368-ea96d3c2abcb','baad24c0-9427-49b7-ac99-c8f884c60b33','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',0,'2026-03-08 10:29:42.469','2026-03-08 10:38:53.520',NULL),('c43b86af-4dc0-427d-b5cf-8dba55932982','d7c4bdf1-12d3-4a10-8743-518ea7771c8b','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.882','2026-03-08 10:38:53.371',NULL),('c6a21c82-7fc3-400b-a0ee-1ea85600c07f','468754d1-7496-4ea1-844d-990e8bfb22a4','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.821','2026-03-08 10:38:53.314',NULL),('c6f6306c-2e35-4db0-b4f6-308679d4a2ed','9fc234e5-cde1-4c3f-bac4-8c6963e0bfcb','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.944','2026-03-08 10:38:53.401',NULL),('c701fa15-1bb7-45e2-bd73-e993977f7de8','8dd579f2-9060-4ef9-b884-d6591c85f9a5','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',0,'2026-03-08 07:52:50.963','2026-03-08 10:38:53.411',NULL),('c7725c9d-963b-429a-9359-465b75b0516d','055c1280-39e3-47c7-8040-b962569c74bd','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',0,'2026-03-08 10:01:50.346','2026-03-08 10:38:53.461',NULL),('c7bfaef5-bef4-4c74-a591-7b7a315831cb','3cdbbaa3-9d3b-4455-a51e-514f8f2d00a3','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',0,'2026-03-08 10:38:53.613','2026-03-08 10:38:53.613',NULL),('c7e80e38-4eb8-4467-aadd-51a5996b0c26','2ea0ccfc-8794-434b-a8af-debd426ddcfc','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:51.019','2026-03-08 10:38:53.446',NULL),('c9f96ed7-529a-4c39-b342-15be7814baa3','61394340-1429-442c-be5d-109309e6ebe4','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.974','2026-03-08 10:38:53.418',NULL),('cb2c6140-8720-49e2-820d-1fb4f5551b18','13aa68e5-e969-42ec-9aa1-9a98fdfd3cbd','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400',0,'2026-03-08 07:52:50.894','2026-03-08 10:38:53.376',NULL),('cefd65d4-f47e-485f-b92e-25420b437e62','94d14d81-6a8e-490b-b38c-6c6108edd8fa','https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',0,'2026-03-08 10:01:50.356','2026-03-08 10:38:53.481',NULL),('d29f6b16-1ba2-4345-8fe3-14c932b43985','0c80521f-6690-41f1-8539-991b3f313ad3','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.775','2026-03-08 10:38:53.289',NULL),('d2afee89-5d6d-43d9-9aa9-2ff72d41c6bb','f23c4442-2425-48ce-abc4-bcdf9bceea64','https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',0,'2026-03-08 10:29:42.480','2026-03-08 10:38:53.534',NULL),('d3ecfa71-3e47-482d-9811-c7c8cebe117d','c1aedbe1-d5c5-49c0-a255-166d0d181667','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.788','2026-03-08 10:38:53.292',NULL),('d4425dcb-e2e0-4fd2-968f-9392581ee1af','4647f51f-3927-40bc-89a7-cd69478c88e2','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',0,'2026-03-08 10:38:53.635','2026-03-08 10:38:53.635',NULL),('d4fb324b-973d-44e4-af88-13047149819a','c3f86e56-7e76-4555-8f8e-3bac5f7e241a','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',0,'2026-03-08 10:38:53.610','2026-03-08 10:38:53.610',NULL),('d57dfd4d-d86d-47ff-84f8-840ff2e886f2','13c7e23f-546d-4ab0-a361-3b6826808c44','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400',0,'2026-03-08 10:06:53.789','2026-03-08 10:38:53.648',NULL),('d973937a-7d12-4da5-94de-2f6f73aa433a','377ea638-a878-40ee-b9b6-40c535d3587d','https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',0,'2026-03-08 10:01:50.325','2026-03-08 10:38:53.451',NULL),('da96f240-d5a6-49a5-a343-85e96185dfe7','6fd304f5-e668-4104-9b05-8ab0b13bb1a9','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.824','2026-03-08 10:38:53.317',NULL),('db7c1424-e0d6-45c2-85e0-555cb1ec57df','15eebbda-42dd-4221-9f39-22e852202758','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',0,'2026-03-08 10:06:53.818','2026-03-08 10:38:53.674',NULL),('df199bad-2420-44d7-bd66-026a189b170d','962d36c6-dfd0-4a32-9325-11575549485f','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',0,'2026-03-08 10:06:53.792','2026-03-08 10:38:53.651',NULL),('dfb3ab31-7257-409e-895e-384af5a4cc46','7010c4aa-5cd6-47e1-8422-c9c872fa6196','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',0,'2026-03-08 07:52:50.877','2026-03-08 10:38:53.368',NULL),('dfcfbf2b-2eb4-44db-adb6-bb09c219469a','dff592f5-6df4-4cbb-85d6-a8c1300a4a13','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',0,'2026-03-08 10:06:53.783','2026-03-08 10:38:53.644',NULL),('e1cbc082-c543-4e9d-bd09-f3db5e9784cc','5b2a2c52-7a4d-4812-958a-b54c32eda127','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',0,'2026-03-08 10:29:42.571','2026-03-08 10:38:53.572',NULL),('e25a08f1-97a4-41ee-b2cb-e34f274822ca','7f0fe06a-a133-4b2a-ac3f-3577a3c35fb7','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',0,'2026-03-08 10:29:42.577','2026-03-08 10:38:53.573',NULL),('e6193546-0432-4d02-a47c-a94cd9f3de0f','5a9f72be-ccd7-4cc8-a80c-8785317379eb','https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400',0,'2026-03-08 10:29:42.598','2026-03-08 10:38:53.580',NULL),('e85b6759-2e90-4656-b7bb-44f2a2767aa0','0d7d33a5-3e4f-49f7-b950-34126d030a61','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.460','2026-03-08 10:38:53.252',NULL),('ea99b187-086a-493a-b895-0c6a58249d7f','4055dd3d-fe94-4fe6-8528-6b059a055f21','https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',0,'2026-03-08 10:01:50.343','2026-03-08 10:38:53.459',NULL),('eb15730c-0f8d-477b-b34f-7a98e5bb6250','5dceaffd-69fa-41bc-9ef6-eb1678244057','https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400',0,'2026-03-08 07:52:50.984','2026-03-08 10:38:53.424',NULL),('ec395965-d0ce-42b1-8f52-5b9053eb94b6','33c65658-ab74-4df0-b74b-40b4a3e07446','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',0,'2026-03-08 07:52:50.872','2026-03-08 10:38:53.363',NULL),('ed34786b-954f-466e-a72f-b3a2005687e2','24115dea-fdd4-414f-8262-23f7029a5e36','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',0,'2026-03-08 10:38:53.632','2026-03-08 10:38:53.632',NULL),('ee3a9a26-bb9e-46bc-8fd4-48eda2fed980','9431cf2c-5d5e-480a-a716-17feaca49459','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',0,'2026-03-08 10:01:50.328','2026-03-08 10:38:53.452',NULL),('ef161de9-21ef-4e4b-90d3-fb0b1c7c711f','f7948c80-9e47-4eca-bbda-1cbf7452fad4','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',0,'2026-03-08 07:52:50.690','2026-03-08 10:38:53.274',NULL),('f1530239-88b0-4e60-8324-e56f5ead2612','9cfcd985-167e-47ae-b606-081926e8ae0f','https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400',0,'2026-03-08 10:06:53.794','2026-03-08 10:38:53.653',NULL),('f26b50ff-288f-4c31-b0b3-18a4a9ba510a','648c11ee-5662-4225-9387-753490727f81','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',0,'2026-03-08 10:29:42.500','2026-03-08 10:38:53.552',NULL),('f5e2e2f0-a230-4405-b3c4-19be7558be31','852b806d-088b-4b97-b154-2221ffc2fc3f','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',0,'2026-03-08 10:06:53.809','2026-03-08 10:38:53.666',NULL),('f653beb4-f44d-43d5-ada6-98471705815a','9babc286-c4e0-41e5-a7b3-b264dc2e6cae','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',0,'2026-03-08 10:06:53.797','2026-03-08 10:38:53.656',NULL),('f7831797-3291-4b06-8c4c-1339096825cd','7564a424-8a9a-4567-858c-df79a6c041e4','https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',0,'2026-03-08 10:06:53.808','2026-03-08 10:38:53.665',NULL),('f7989035-4a13-4dc9-8782-bd5fce2fa5a5','99e159d0-f019-4618-9360-efe394635f22','https://images.unsplash.com/photo-1631214524026-ab64e1f8f0b2?w=400',0,'2026-03-08 10:29:42.530','2026-03-08 10:38:53.567',NULL),('f99e8e62-3d5e-4ba9-85e4-3b1a92ed138a','3ac4698b-846d-4b0f-bd21-6cd253d1367c','https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',0,'2026-03-08 07:52:50.749','2026-03-08 10:38:53.284',NULL),('fa14adae-16f0-42f0-811b-b7d2c5780220','aa1adbc0-fa20-49d8-b864-c841e37e2530','http://localhost:3001/uploads/184fd72b-47f6-42c8-ac39-7020a9a97db8.jpg',2,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('fa31721e-b1d6-43a7-ac59-61d995935642','98971007-71b2-4082-97f0-76d2b9b4828e','https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400',0,'2026-03-08 10:38:53.640','2026-03-08 10:38:53.640',NULL),('fba47db0-c9ab-414e-926c-44006fb1bc9d','06e986f2-abf4-419a-b974-60abc677f892','https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400',0,'2026-03-08 07:52:50.838','2026-03-08 10:38:53.330',NULL),('fe3ef340-34dd-4a9b-9d00-a9e9fc3b22a0','6cba4119-c6d3-481c-b80a-c4c2e46c1345','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',0,'2026-03-08 07:52:50.869','2026-03-08 10:38:53.360',NULL);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_questions`
--

DROP TABLE IF EXISTS `product_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_questions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `asked_by_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answered_by_seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `product_specifications` VALUES ('04f9b370-c814-4998-ab09-781304ca5121','bc375279-0538-4856-8bc9-587464816e71','Brand','Apple','2026-03-08 07:49:17.961','2026-03-08 07:49:17.961',NULL),('05265088-24de-496a-aa0b-abc285363721','0c80521f-6690-41f1-8539-991b3f313ad3','Brand','Samsung','2026-03-08 07:52:50.774','2026-03-08 10:38:53.289',NULL),('065180ce-5c1e-48ff-842c-e482b1355353','b8269fcf-0216-407c-b6c3-e787785daa51','Brand','Vivo','2026-03-08 07:52:50.949','2026-03-08 10:38:53.405',NULL),('08e4c1c5-482a-48a1-abd2-59bc82bbce9b','efd52231-8b99-4db1-aebf-4268142e7e74','Brand','OnePlus','2026-03-08 07:52:50.865','2026-03-08 10:38:53.356',NULL),('0a01fdc7-1dca-4193-a86b-a0569048e7f3','1aa344c6-60ee-46c1-854d-9aa00386f434','Brand','Nivia','2026-03-08 10:06:53.804','2026-03-08 10:38:53.663',NULL),('0cb9a625-fe22-41e6-be31-471adf9d0c93','2ea0ccfc-8794-434b-a8af-debd426ddcfc','Brand','Motorola','2026-03-08 07:52:51.019','2026-03-08 10:38:53.446',NULL),('0ed7cb85-5d59-4c92-bb84-03343814d18b','c1aedbe1-d5c5-49c0-a255-166d0d181667','Brand','Samsung','2026-03-08 07:52:50.778','2026-03-08 10:38:53.291',NULL),('105778ae-3c79-4e46-8afc-ad2b53d1000b','d7c4bdf1-12d3-4a10-8743-518ea7771c8b','Brand','Xiaomi','2026-03-08 07:52:50.881','2026-03-08 10:38:53.371',NULL),('106b59bb-b198-419a-bee7-c87b2b531bc6','dff592f5-6df4-4cbb-85d6-a8c1300a4a13','Brand','Amazon Basics','2026-03-08 10:06:53.783','2026-03-08 10:38:53.644',NULL),('113d5f7f-ba93-4061-aecd-c635db7d62b7','09b119dd-c74f-43f4-857e-ed2e7e57f7b4','Brand','Himalaya','2026-03-08 10:29:42.515','2026-03-08 10:38:53.564',NULL),('12374911-503c-4ae0-8f02-4fd0e9fa9289','e68892e8-982d-4727-a37f-902bbfda37a2','Brand','OnePlus','2026-03-08 07:52:50.853','2026-03-08 10:38:53.340',NULL),('13535e97-93a4-48f9-a541-f1febcebb1c6','9431cf2c-5d5e-480a-a716-17feaca49459','Brand','Penguin Classics','2026-03-08 10:01:50.327','2026-03-08 10:38:53.451',NULL),('15431288-c130-4581-b2f0-0e8ce31e6147','eab9896c-6eec-491a-87e6-0acc9d733c79','Brand','Motorola','2026-03-08 07:52:51.011','2026-03-08 10:38:53.438',NULL),('17cfee42-4181-4b72-bb7d-d5e6abff4d09','25a30227-e0c0-4561-84dc-c7541173945f','Brand','Pocket Books','2026-03-08 10:01:50.361','2026-03-08 10:38:53.499',NULL),('18fbdf4d-1378-4b55-9cbb-3cb386b5a06a','aa1adbc0-fa20-49d8-b864-c841e37e2530','Brand','IBELL','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('1b003d8c-5659-4501-88ec-76cbd07fa2df','dbca3cdb-1209-49db-a8e3-1da6f155da70','Brand','Xiaomi','2026-03-08 07:52:50.898','2026-03-08 10:38:53.377',NULL),('203ece93-1e01-4426-a25f-d0fab208ebb0','06e986f2-abf4-419a-b974-60abc677f892','Brand','OnePlus','2026-03-08 07:52:50.837','2026-03-08 10:38:53.329',NULL),('22b42221-73e4-4b02-b7ce-bb7e7a248d75','f8d598ea-a08f-4cf7-ab44-b7ea4a4bd25a','Brand','Vivo','2026-03-08 07:52:50.954','2026-03-08 10:38:53.408',NULL),('22d3db16-c429-4cb9-b9ff-2c7fdc9071cb','08500d3c-ffd0-4a23-a973-0218c13019a7','Brand','Lilliput','2026-03-08 10:29:42.490','2026-03-08 10:38:53.542',NULL),('23e2948e-fc4c-401e-8636-42cd048f1d04','08be0ff3-4680-4dc8-879a-b598e6022a4f','Brand','Bata','2026-03-08 10:29:42.492','2026-03-08 10:38:53.544',NULL),('2464de24-b6b3-4bac-932f-ced7f0227d95','baad24c0-9427-49b7-ac99-c8f884c60b33','Brand','Peter England','2026-03-08 10:29:42.468','2026-03-08 10:38:53.517',NULL),('24796a6b-ae0a-417b-bfbb-ae6a9d80e439','17e8fe22-839e-4e4f-836d-60aec62c96bf','Brand','Motorola','2026-03-08 07:52:51.000','2026-03-08 10:38:53.433',NULL),('27ac9208-4fd6-4fba-889f-52dc9415a6b0','21a70a81-0382-4acc-a76f-ce545ab576c8','Brand','Biotique','2026-03-08 10:29:42.611','2026-03-08 10:38:53.585',NULL),('2a613a2f-7da0-4e07-9624-6b9857d9c8c5','0e4bf847-6be1-447f-9fac-667e534ccf5c','Brand','Bombay Dyeing','2026-03-08 10:38:53.601','2026-03-08 10:38:53.601',NULL),('2b73b24b-31a5-43f7-aebd-c36da17626bc','80eb2e63-b9ca-4139-823c-67c4a4513a46','Brand','Wildcraft','2026-03-08 10:06:53.795','2026-03-08 10:38:53.654',NULL),('2cb37a3d-18a5-4bf3-bef6-f6523189a75a','4e000b41-80bc-4b96-b995-5e54b555c7aa','Brand','Spacewood','2026-03-08 10:38:53.641','2026-03-08 10:38:53.641',NULL),('2e724713-c920-4086-8c10-303f3dc3ecc6','452e23e4-c5c3-464d-895a-60f3b4bc5889','Brand','NCERT','2026-03-08 10:01:50.362','2026-03-08 10:38:53.506',NULL),('30609055-bdd2-41c4-b9c9-2d709ade1ca1','007c0e19-b58b-403b-8ae4-b7c77b9ca920','Brand','Philips','2026-03-08 10:38:53.599','2026-03-08 10:38:53.599',NULL),('3158b597-d61c-4551-b387-a601e9edcfd3','8dd579f2-9060-4ef9-b884-d6591c85f9a5','Brand','Vivo','2026-03-08 07:52:50.962','2026-03-08 10:38:53.411',NULL),('3178535c-e05e-4dde-b82f-037979d433ea','520f1e2e-1684-411d-bc5a-c25a0e32bb78','Brand','Cambridge','2026-03-08 10:01:50.352','2026-03-08 10:38:53.468',NULL),('318eeb0a-0f01-49a1-8e11-7006e6cf0ced','529af813-fb85-4ece-a039-5482ccdbc5d0','Brand','Parachute','2026-03-08 10:29:42.584','2026-03-08 10:38:53.576',NULL),('322d6476-3a43-4574-aa54-e534295cd08b','13c7e23f-546d-4ab0-a361-3b6826808c44','Brand','Reebok','2026-03-08 10:06:53.788','2026-03-08 10:38:53.648',NULL),('3282cbfe-8ee6-441b-8e80-d3bced937ffa','3cdbbaa3-9d3b-4455-a51e-514f8f2d00a3','Brand','Nilkamal','2026-03-08 10:38:53.613','2026-03-08 10:38:53.613',NULL),('32a77511-203d-4303-8255-d352a4220c27','a1bf76b4-2667-480c-a3ff-2e33b6387c2b','Brand','Apple','2026-03-08 07:52:50.636','2026-03-08 10:38:53.269',NULL),('33e6d202-58f0-48c7-b2f9-9c53b28cce0e','bdac69cf-ad22-46e1-a4b3-29dc28865738','Brand','Motorola','2026-03-08 07:52:51.014','2026-03-08 10:38:53.441',NULL),('34d427d7-d2c2-4d0c-889a-682d40ff0dec','efe9efa9-42fe-4627-99b7-7813be87ebc2','Brand','Spacewood','2026-03-08 10:38:53.626','2026-03-08 10:38:53.626',NULL),('35cb0799-a768-461f-89a0-cd323c27141d','59635436-7d8f-4fe3-8d78-9669b706db7d','Brand','OnePlus','2026-03-08 07:52:50.845','2026-03-08 10:38:53.334',NULL),('38346c54-bf3a-4cd0-8014-09ad07f4e50b','096a7276-690c-4a46-aaa9-5077e76ad338','Brand','Manyavar','2026-03-08 10:29:42.502','2026-03-08 10:38:53.554',NULL),('383917dd-ea2e-4c73-b61d-06881e2303a6','e0ac112e-92c8-4092-b4d4-736361013797','Voltage','230 Volts','2026-03-08 03:40:17.766','2026-03-08 03:40:17.766',NULL),('39d41e4e-1e14-4c53-a082-c4f290b4b944','a585ee7b-9dd1-4489-ac5c-a0849b81f766','Brand','Samsung','2026-03-08 07:52:50.797','2026-03-08 10:38:53.299',NULL),('3b4e4274-650c-46cd-bc4b-5218643eb56c','e23fb5b8-4efe-4081-ab0e-a29ae087306c','Brand','Puma','2026-03-08 10:06:53.810','2026-03-08 10:38:53.667',NULL),('3b9e68bd-5974-409c-8980-d7566ae67da2','13a41f01-5007-4b0c-b630-4bf8c3e0fa12','Brand','H&M','2026-03-08 10:29:42.484','2026-03-08 10:38:53.538',NULL),('3c566996-fbeb-42a3-8b9c-79d0c1bcebe6','086acad8-e2a9-4b17-adf1-62805322a116','Brand','Farrar, Straus and Giroux','2026-03-08 10:01:50.340','2026-03-08 10:38:53.457',NULL),('3d59dd09-c18a-4992-afae-649f388c8032','1a2e893f-7468-42f3-9714-026de9c66467','Brand','Mothercare','2026-03-08 10:29:42.497','2026-03-08 10:38:53.549',NULL),('3ea2fa02-ab61-4d30-bf6f-2ac95423960d','8779e4c6-0d78-4ac0-8466-00001ca9b8b6','Special Feature','Non Stick Coating','2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('3ec224a2-68be-4124-a7c8-ff40f8f45c26','dad513a9-627b-49d6-8430-ff66b9da845d','Brand','Itel','2026-03-08 07:52:50.997','2026-03-08 10:38:53.431',NULL),('3f26f2a7-8286-4854-80b1-fa4b22bee8b3','8779e4c6-0d78-4ac0-8466-00001ca9b8b6','Colour','Silver','2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('409f9590-6520-4aff-81d7-96ecbacdd8b7','c937ca29-21d1-4a89-b6a5-ecb0511ce1bc','Brand','Motorola','2026-03-08 07:52:51.004','2026-03-08 10:38:53.435',NULL),('418eb3cc-fc4c-40cf-85dc-80c9226df9cc','be0c0393-c211-43f3-a305-3333ec3bac05','Brand','Nilkamal','2026-03-08 10:38:53.625','2026-03-08 10:38:53.625',NULL),('4400a500-bc93-4109-bfde-e2c0c5054b28','962d36c6-dfd0-4a32-9325-11575549485f','Brand','Vega','2026-03-08 10:06:53.791','2026-03-08 10:38:53.651',NULL),('448a2d8e-f7b6-456b-915e-c45b2c3b563e','99c65f07-023b-466d-b65a-0f9f3d181bb5','Brand','NCERT','2026-03-08 10:01:50.351','2026-03-08 10:38:53.465',NULL),('45887aca-9c14-40e5-a62e-31ac28c74add','87af924a-eaf5-4e60-9c17-0b0a0b1b8bfc','Brand','Apple','2026-03-08 07:52:50.724','2026-03-08 10:38:53.279',NULL),('45b59d37-28a1-4b07-9801-ae0a2e25766a','d0a20864-4648-420c-969c-1295a168e213','Brand','HomeTown','2026-03-08 10:38:53.623','2026-03-08 10:38:53.623',NULL),('487a225e-bf22-45d8-98e5-1335eeec77b3','13aa68e5-e969-42ec-9aa1-9a98fdfd3cbd','Brand','Xiaomi','2026-03-08 07:52:50.894','2026-03-08 10:38:53.376',NULL),('4b1dd042-1117-44a6-9233-06ab28e8cbe2','0d7d33a5-3e4f-49f7-b950-34126d030a61','Brand','Apple','2026-03-08 07:52:50.412','2026-03-08 10:38:53.249',NULL),('4c5b045a-655d-4dbe-abed-e2b8d737352e','f0ebf931-7076-4a7d-b4fc-1411ad0a3d94','Brand','Xiaomi','2026-03-08 07:52:50.884','2026-03-08 10:38:53.372',NULL),('4d734be2-eb19-4115-81ad-3ef0608e3e7e','df43d77a-3126-47a0-8650-fa67bab48bc2','Brand','Oppo','2026-03-08 07:52:50.936','2026-03-08 10:38:53.398',NULL),('4d8c350c-4b2a-4d7b-9ffd-f79e9090a4e0','39c8eb12-0247-4453-a741-dd1e8b76bdb7','Brand','Samsung','2026-03-08 07:52:50.805','2026-03-08 10:38:53.301',NULL),('4fb04566-2e47-442e-a7e4-631fb9d9b669','aa1adbc0-fa20-49d8-b864-c841e37e2530','Style','Electric Trap','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('5004e003-e06b-40d8-8230-e5b600ecffbd','bdd3dd15-5504-48e9-909e-81f095b3cd1f','Brand','Puma','2026-03-08 10:29:42.482','2026-03-08 10:38:53.536',NULL),('504780bb-2b25-4910-aac6-324a6938d479','b58e58f0-802d-44fb-8564-812b824c564d','Brand','NCERT','2026-03-08 10:01:50.347','2026-03-08 10:38:53.462',NULL),('51557ba4-2718-4edc-9b9b-a2eaf32b8be8','e0711991-c085-416f-9c9c-1b9b9ee1de6e','Brand','L\'Oreal','2026-03-08 10:29:42.559','2026-03-08 10:38:53.570',NULL),('53950ebd-98a9-46b5-9126-e5f53c3da38a','18ea854e-349e-4930-b345-8e2ffa2d64a4','Brand','Vivo','2026-03-08 07:52:50.965','2026-03-08 10:38:53.412',NULL),('55d56d8a-c759-45b2-9985-2f553b55170f','c3f86e56-7e76-4555-8f8e-3bac5f7e241a','Brand','Morphy Richards','2026-03-08 10:38:53.610','2026-03-08 10:38:53.610',NULL),('56034e9b-c5de-4deb-b98d-1929ad6bb9c6','e18b5933-8c3d-4c7d-a5a9-eb9adb286bad','Brand','Samsung','2026-03-08 07:52:50.794','2026-03-08 10:38:53.296',NULL),('57426654-38af-4527-9419-8226325c5b44','98d8763a-f71f-43c6-b756-83f7dc6f5e27','Brand','Dove','2026-03-08 10:29:42.594','2026-03-08 10:38:53.577',NULL),('582a88f0-510c-4be0-99b0-274f0e4f846c','28e12a3e-4136-4ff7-989d-d06721f2542d','Brand','OnePlus','2026-03-08 07:52:50.862','2026-03-08 10:38:53.349',NULL),('5916b697-4ad1-4086-bb21-3e2f06384cf7','255a21ca-db0b-4a54-9119-b3d0dd4b65d7','Brand','HomeTown','2026-03-08 10:38:53.629','2026-03-08 10:38:53.629',NULL),('5a99d146-6f48-4dca-871e-75192386c9d9','e4261c69-b259-40f8-b8e4-54ff53a43ddb','Brand','Scribner','2026-03-08 10:01:50.317','2026-03-08 10:38:53.447',NULL),('5b355287-5024-4552-beb0-daf31f5e925d','5a9f72be-ccd7-4cc8-a80c-8785317379eb','Brand','L\'Oreal','2026-03-08 10:29:42.597','2026-03-08 10:38:53.579',NULL),('5b4c1310-2422-4071-9ca2-148b8a36331b','aa1adbc0-fa20-49d8-b864-c841e37e2530','Size','Medium','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('5b52459f-12a6-452e-8df9-169f4e38197b','2d3587a0-edec-4f57-8c1d-2257d175def7','Brand','Olay','2026-03-08 10:29:42.519','2026-03-08 10:38:53.565',NULL),('5be09e8f-d681-492f-9974-fcccd6812baa','9cfcd985-167e-47ae-b606-081926e8ae0f','Brand','Wildcraft','2026-03-08 10:06:53.793','2026-03-08 10:38:53.652',NULL),('5cd47020-2305-42b3-95e2-996945886d3d','26e107c4-809a-426c-b951-97bdf462b053','Brand','Vivo','2026-03-08 07:52:50.958','2026-03-08 10:38:53.409',NULL),('5d0ab914-728b-4218-bb95-cd79ad3bfc8f','374f328f-0638-46d8-a7bd-aa3dbe2ab1c6','Brand','OnePlus','2026-03-08 07:52:50.857','2026-03-08 10:38:53.343',NULL),('5dbff0e9-e3b2-4437-b5f1-2512f019fff8','e0b1b885-536a-494b-9520-63f0e89caa68','Brand','Motorola','2026-03-08 07:52:51.015','2026-03-08 10:38:53.443',NULL),('5fee10c8-bc74-4389-b490-b82fa9b38bb6','6526baae-1557-4521-8013-36c369ca416b','sss','23','2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('6196006d-4a7c-48b3-bdc4-3a72659c400f','634cf241-a952-4042-9f91-cbe704a6a410','Brand','Samsung','2026-03-08 07:52:50.812','2026-03-08 10:38:53.307',NULL),('61cd7735-5479-42c5-be7b-907ff0e37287','4ba6400d-605f-46f4-baf5-a6408628bd7f','Brand','Spacewood','2026-03-08 10:38:53.622','2026-03-08 10:38:53.622',NULL),('62c336f3-7835-465c-83e6-d3b2c44c1974','6fd304f5-e668-4104-9b05-8ab0b13bb1a9','Brand','Samsung','2026-03-08 07:52:50.823','2026-03-08 10:38:53.316',NULL),('62ccac02-afd8-447c-bdd4-0b072934694e','c8cddf84-b0b2-49c0-83f4-42ae6f1e9a8c','Brand','Xiaomi','2026-03-08 07:52:50.874','2026-03-08 10:38:53.365',NULL),('64b51195-b82c-4141-a727-0113e52800c9','7fd3355f-ee0f-4fea-a4ca-f87e95d54175','Brand','Reebok','2026-03-08 10:06:53.814','2026-03-08 10:38:53.669',NULL),('64f2a9e1-217d-41cd-af20-3a01c17851c0','c5899cb3-307e-4e91-a50c-312988327526','Brand','HarperOne','2026-03-08 10:01:50.333','2026-03-08 10:38:53.453',NULL),('655a04b4-8776-42cc-9c5a-d93e2b9ffd5f','6526baae-1557-4521-8013-36c369ca416b','ddd','12','2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('663fa9b2-7ce9-42e2-84c2-ebf5bbe652ec','9035c942-c864-4b93-bac6-64a7ca1df030','Brand','Bamboo Tree','2026-03-08 10:38:53.606','2026-03-08 10:38:53.606',NULL),('668d4a78-3a61-44fc-a32b-1374e84f0d51','e5f1fc08-af6c-4cb5-b0f9-c61ef5bb66f3','Brand','Boldfit','2026-03-08 10:06:53.817','2026-03-08 10:38:53.672',NULL),('687b6037-e3e3-43d4-800a-5070d61e87a5','949a280c-62e3-42d8-acbf-0496cbcec450','Brand','Motorola','2026-03-08 07:52:51.012','2026-03-08 10:38:53.440',NULL),('69cba17a-6961-4a6d-93a6-8d7b417ece72','3d82fe69-2a6f-4827-9308-458edbcf9b9d','Brand','Boldfit','2026-03-08 10:06:53.785','2026-03-08 10:38:53.645',NULL),('6bf6299d-aff2-4df5-b3aa-9dbb21f5952e','873d4bc5-7b22-48ef-8537-472d0891dda2','Brand','Itel','2026-03-08 07:52:50.995','2026-03-08 10:38:53.429',NULL),('6efeab26-d8ec-426a-a8f6-3472c729f898','3ac4698b-846d-4b0f-bd21-6cd253d1367c','Brand','Apple','2026-03-08 07:52:50.739','2026-03-08 10:38:53.283',NULL),('702d0979-c8ff-48f1-9c9e-1d431c39c4bf','99e159d0-f019-4618-9360-efe394635f22','Brand','Maybelline','2026-03-08 10:29:42.530','2026-03-08 10:38:53.567',NULL),('732714c8-2829-4c13-a675-592a7c1a3eef','eb867fc5-a2ac-49ee-a8ce-43ba2a75bf3f','Brand','Xiaomi','2026-03-08 07:52:50.889','2026-03-08 10:38:53.374',NULL),('734989d0-46de-48a4-8418-223f0cf5a58c','7c7ea138-d694-488f-a7ca-4830889f35ca','Brand','Oppo','2026-03-08 07:52:50.930','2026-03-08 10:38:53.395',NULL),('77bbf188-fcf3-4db4-9f9e-cf71a38be9d1','468754d1-7496-4ea1-844d-990e8bfb22a4','Brand','Samsung','2026-03-08 07:52:50.816','2026-03-08 10:38:53.313',NULL),('78292f2f-31ba-4220-8d5b-1261eca55fc2','9a69d831-07fc-44d4-9772-67c75381b050','Brand','Bajaj','2026-03-08 10:38:53.597','2026-03-08 10:38:53.597',NULL),('7bff6aee-9570-42a2-9a3d-95ec0c6dfe04','3621a254-99c0-422b-bea1-1111e844db76','Brand','Xiaomi','2026-03-08 07:52:50.879','2026-03-08 10:38:53.369',NULL),('7c953c89-29ea-4769-acac-c3a79c64f423','23bae52e-05ba-4b72-96fe-3a76db06378c','Brand','Harper','2026-03-08 10:01:50.338','2026-03-08 10:38:53.456',NULL),('7d02244c-f454-42ea-a39e-7e2efc88fe62','d6bb18e6-16cb-4949-b115-8efae486c6cb','Brand','Itel','2026-03-08 07:49:18.001','2026-03-08 07:49:18.001',NULL),('7d3db6cd-6134-4102-aa44-eb74ebdaa77a','648c11ee-5662-4225-9387-753490727f81','Brand','US Polo Assn','2026-03-08 10:29:42.499','2026-03-08 10:38:53.551',NULL),('7d9c764a-7eb6-4e20-942a-a9706173a69e','852b806d-088b-4b97-b154-2221ffc2fc3f','Brand','Adidas','2026-03-08 10:06:53.809','2026-03-08 10:38:53.666',NULL),('7db0141d-5976-406f-bfe4-57ae82f379f6','28d133ac-5400-47a9-b453-8e4989de21d9','Brand','Bombay Dyeing','2026-03-08 10:38:53.636','2026-03-08 10:38:53.636',NULL),('7e89ac2f-b983-4769-95a7-29814f62a5f7','055c1280-39e3-47c7-8040-b962569c74bd','Brand','Grand Central','2026-03-08 10:01:50.345','2026-03-08 10:38:53.460',NULL),('7ef0763e-65f7-448f-b94c-7db6587d037f','98971007-71b2-4082-97f0-76d2b9b4828e','Brand','Ajanta','2026-03-08 10:38:53.639','2026-03-08 10:38:53.639',NULL),('80ce1860-7c44-4744-876d-87f00d5f45fc','4647f51f-3927-40bc-89a7-cd69478c88e2','Brand','Hometown','2026-03-08 10:38:53.634','2026-03-08 10:38:53.634',NULL),('828ce3e3-9beb-429b-b06c-cda498ffc0d9','27527d4c-37b6-4d55-8739-61d14d47f6a2','Brand','Biba','2026-03-08 10:29:42.475','2026-03-08 10:38:53.529',NULL),('83620ea7-ba77-4c16-9ec7-b92dc626304f','84cdb80c-8b20-4257-846f-97abc3fc46a0','Brand','MAC','2026-03-08 10:29:42.608','2026-03-08 10:38:53.584',NULL),('84d42b57-ce3e-4f82-b271-2634a9731001','c0c9e263-4406-432d-a132-af3d5a0cd820','Brand','Allen Solly','2026-03-08 10:29:42.488','2026-03-08 10:38:53.540',NULL),('8742c8a9-b4d6-47eb-987b-ff8a1998cada','98c8b300-168c-41ac-b85a-53d1551ee226','Brand','Itel','2026-03-08 07:52:50.980','2026-03-08 10:38:53.420',NULL),('87c7ad1a-e67a-4c76-90da-ec37795032de','dc959de8-c414-4fe7-b95a-23f974fc2222','Brand','OnePlus','2026-03-08 07:52:50.840','2026-03-08 10:38:53.332',NULL),('897cdb5b-be3e-41dc-852f-c5e048fb2b53','212dda19-cd70-410b-b7a4-08179bb72afc','Brand','Oppo','2026-03-08 07:52:50.917','2026-03-08 10:38:53.392',NULL),('89a99b2c-cd5d-42d4-8b7f-7b7b7275610f','4055dd3d-fe94-4fe6-8528-6b059a055f21','Brand','Harriman House','2026-03-08 10:01:50.343','2026-03-08 10:38:53.459',NULL),('89e5e717-4c04-4641-8c89-decd0facff9a','83ad4df3-3cfb-4a24-832d-f4bfb47eab1b','Brand','Motorola','2026-03-08 07:49:18.005','2026-03-08 07:49:18.005',NULL),('8b3fe5e2-edfc-49a9-909f-63b459622690','8e3ca85e-c6f3-49f8-b1d5-10e045a8eee9','Brand','Quechua','2026-03-08 10:06:53.822','2026-03-08 10:38:53.678',NULL),('8c97f822-9029-4766-abee-d09868b7c363','61394340-1429-442c-be5d-109309e6ebe4','Brand','Itel','2026-03-08 07:52:50.973','2026-03-08 10:38:53.417',NULL),('8da6d691-2568-46d9-839c-a05c4a1e1cd8','abd78268-a75b-441e-ab89-0ce198e418d6','Brand','SG','2026-03-08 10:06:53.821','2026-03-08 10:38:53.677',NULL),('8ebf3a18-6da8-4f81-8077-d112c31aff90','0424aac2-f7e2-468c-a632-25a90148c923','Brand','Monte Carlo','2026-03-08 10:29:42.473','2026-03-08 10:38:53.527',NULL),('8eddaedd-8177-4b2b-a2ac-c81fa9ee022c','2dc0b93b-671d-4d20-b48a-60c370890bef','Brand','Ikea','2026-03-08 10:38:53.633','2026-03-08 10:38:53.633',NULL),('904e3b74-c833-4685-97e9-99c101424e07','7f0fe06a-a133-4b2a-ac3f-3577a3c35fb7','Brand','Colorbar','2026-03-08 10:29:42.576','2026-03-08 10:38:53.573',NULL),('90e9c83e-7846-4747-a6d2-7479e44c2069','c4ebf6a7-b732-4292-bdba-ccf1ef9751ce','Brand','Neutrogena','2026-03-08 10:29:42.512','2026-03-08 10:38:53.562',NULL),('92bd8e5b-8c23-4730-90a6-6f97c6696220','27ca58e6-2cff-427b-8d10-a335c5298d50','Brand','Apple','2026-03-08 07:52:50.580','2026-03-08 10:38:53.259',NULL),('95758d37-55a2-41d4-bed4-895ca1a17ca5','33c65658-ab74-4df0-b74b-40b4a3e07446','Brand','Xiaomi','2026-03-08 07:52:50.871','2026-03-08 10:38:53.362',NULL),('95ca0c11-d05d-4580-b5f4-c037b786e7e6','17b1a65e-1ebe-40d8-aa59-8b19f84783be','Brand','Apple','2026-03-08 07:52:50.612','2026-03-08 10:38:53.265',NULL),('96a49c7f-3cfb-4c43-a801-c502ec7f9d14','47a65476-e58e-4bda-b230-dbf688c3d4c5','Brand','Oppo','2026-03-08 07:52:50.911','2026-03-08 10:38:53.386',NULL),('988f565b-f1e1-4d67-952e-12517d0de5f7','9fc234e5-cde1-4c3f-bac4-8c6963e0bfcb','Brand','Vivo','2026-03-08 07:52:50.942','2026-03-08 10:38:53.401',NULL),('98fcd0ab-045b-4f28-8768-e11cda2f7da7','9d9ca9f1-7b93-4455-a5bd-aede9f07b55b','Brand','Prestige','2026-03-08 10:38:53.591','2026-03-08 10:38:53.591',NULL),('9a6e3fc0-37b9-4794-9526-bd36797eecd9','02f6950b-5eeb-4b90-ac4b-7d4f5c7740ac','Brand','Oppo','2026-03-08 07:52:50.939','2026-03-08 10:38:53.399',NULL),('9b3bb6fa-31c3-4d43-802e-ee5499d8950f','0d07a400-e744-4089-b46b-1c82a24cbcbc','Brand','Samsung','2026-03-08 07:49:17.969','2026-03-08 07:49:17.969',NULL),('9dd48085-661c-4c45-a545-6d2be60e55a5','4905034e-d3bb-473d-b9e0-ab2ee1f95c12','Brand','Oppo','2026-03-08 07:52:50.909','2026-03-08 10:38:53.381',NULL),('9ee30c39-58d9-4060-a1a4-f4275ff7fc4a','26b9e391-5123-463a-ae6c-a3c15126a5f3','Brand','Levi\'s','2026-03-08 10:29:42.463','2026-03-08 10:38:53.509',NULL),('a1175049-1e6a-468b-9680-30921e16927b','a11e0275-13f5-4596-a33e-b10fe609ca93','Brand','Oppo','2026-03-08 07:49:17.991','2026-03-08 07:49:17.991',NULL),('a2a0fb4b-e051-47d4-a38f-7c9c9b9291ea','7f4f6b25-c771-4641-bdec-f2741ebac281','Brand','Hawkins','2026-03-08 10:38:53.608','2026-03-08 10:38:53.608',NULL),('a6fe00b1-b991-4c1f-8ae9-8c8cf37a5077','24115dea-fdd4-414f-8262-23f7029a5e36','Brand','HomeTown','2026-03-08 10:38:53.632','2026-03-08 10:38:53.632',NULL),('a78a699a-5d18-4827-8846-dc34cdd431eb','e7e37351-8f3e-4694-b5f9-32d2bca27ff4','Brand','Apple','2026-03-08 07:52:50.527','2026-03-08 10:38:53.255',NULL),('a7ab511d-631c-4b7e-a738-d4c04a8294cb','89d0fcc0-60b5-4007-8526-3cb7d85db7d1','Brand','Xiaomi','2026-03-08 07:52:50.901','2026-03-08 10:38:53.379',NULL),('ab3022ce-b338-4a79-a83c-dbddf24f15a4','99fbc379-584a-4868-a0e6-985dcaa105cd','Brand','Samsung','2026-03-08 07:52:50.809','2026-03-08 10:38:53.304',NULL),('ac161494-6a25-40e1-a73e-ba307a0a2739','5c3a3310-2c75-45b4-9545-a7aec14ce288','Brand','Oppo','2026-03-08 07:52:50.905','2026-03-08 10:38:53.380',NULL),('ade65995-bdb3-45b5-bcf4-0eda08fa3dfe','69850e43-3d7e-4bf4-b915-309f07d0c492','Brand','Jaipur Rugs','2026-03-08 10:38:53.630','2026-03-08 10:38:53.630',NULL),('ae7af958-d374-470e-bbef-f4598f7cbf22','06bdc568-70f1-47a2-b624-bec0543b5dc8','Brand','Apple','2026-03-08 07:52:50.719','2026-03-08 10:38:53.276',NULL),('ae800b7f-bbf5-459d-9a7b-79370121873d','081cb10a-aeee-4334-bd85-3edce5e0f891','Brand','Lakmé','2026-03-08 10:29:42.506','2026-03-08 10:38:53.558',NULL),('af2f65cb-721b-465a-9ce7-f88190237ab6','49532104-542b-4800-9ff9-6fe9721c51a7','Brand','Vivo','2026-03-08 07:52:50.969','2026-03-08 10:38:53.415',NULL),('b134b0e9-453d-4d59-9746-b9ab08c338b2','e3b6d736-cab8-4bd5-9a21-a08d8630fec3','Brand','Oppo','2026-03-08 07:52:50.914','2026-03-08 10:38:53.390',NULL),('b16e608b-5d51-4ffb-b645-e39ce3ab2006','77740ae7-aa47-4184-81a3-6e0df70a1a5a','Brand','Apple','2026-03-08 07:52:50.754','2026-03-08 10:38:53.286',NULL),('b19b9c63-b411-49eb-90c8-a0c18a88d8c5','1612a5b4-a923-4696-82ad-97e40d9456d4','Brand','SG','2026-03-08 10:06:53.799','2026-03-08 10:38:53.658',NULL),('b1a910db-5a33-40da-8c4e-de68c17a47a8','a1b8d6bb-b0a5-4aeb-8071-220fede8749f','Brand','Schwarzkopf','2026-03-08 10:29:42.600','2026-03-08 10:38:53.581',NULL),('b372e90f-9060-4df8-a1b9-ffdb02bf73bb','d5630967-ff9c-4126-8d7d-27081cfbf7fa','Brand','Lakmé','2026-03-08 10:29:42.532','2026-03-08 10:38:53.568',NULL),('b49156f9-ee1a-44e1-8a2f-524931126cae','f1ea1353-e8e5-43d2-8993-28c8d3765aaf','Brand','Itel','2026-03-08 07:52:50.989','2026-03-08 10:38:53.426',NULL),('b4b6e12c-b32e-476a-9440-5c5d83801172','ccefa856-e9ba-433f-9039-3c8d5ee74bfe','Brand','OnePlus','2026-03-08 07:52:50.848','2026-03-08 10:38:53.337',NULL),('b568af5e-6e58-4eec-9d71-c2b25c0c7b9b','b15f6414-256c-4149-b2a1-b64b666629a4','Brand','Motorola','2026-03-08 07:52:51.002','2026-03-08 10:38:53.434',NULL),('b5941ae8-3e97-493f-b39e-a1985ae3308f','6cba4119-c6d3-481c-b80a-c4c2e46c1345','Brand','OnePlus','2026-03-08 07:52:50.868','2026-03-08 10:38:53.359',NULL),('b6bcfaa3-58b1-474b-b776-f4462539db02','fc75bdfc-cd75-469a-abb0-cd16396f0b50','Brand','US Polo Assn','2026-03-08 10:29:42.494','2026-03-08 10:38:53.547',NULL),('b7e11154-bae2-4ada-b56b-26cf49810a2f','0b269961-f5c0-4ee7-acbe-b91a0c1ee4b2','Brand','The Body Shop','2026-03-08 10:29:42.603','2026-03-08 10:38:53.583',NULL),('ba565391-1d6e-4e60-bd88-42b6fb87f124','ca09fdf0-bc4e-4697-9936-58fa7d794ea2','Brand','Motorola','2026-03-08 07:52:51.017','2026-03-08 10:38:53.444',NULL),('ba8fc2b6-0363-48a6-98ff-088dfd8a056b','969693cb-e3d9-4cbc-87e3-30d830da1d89','Brand','Penguin','2026-03-08 10:01:50.336','2026-03-08 10:38:53.454',NULL),('baa8204b-4338-44af-8569-4b69a2fe161b','4132650e-8478-4747-b359-0930ebb4cfc7','Brand','Nilkamal','2026-03-08 10:38:53.619','2026-03-08 10:38:53.619',NULL),('bb693f6b-01e1-4978-8e50-f55e62235c40','f23c4442-2425-48ce-abc4-bcdf9bceea64','Brand','W','2026-03-08 10:29:42.480','2026-03-08 10:38:53.533',NULL),('bba20358-e72c-41b9-8deb-57660e339b29','aa1adbc0-fa20-49d8-b864-c841e37e2530','Colour','102IK','2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('bbc23663-aa7a-4701-84c3-66ddf8fbdbc3','f70742e4-6e0c-4318-aa13-7f720a6ff491','Brand','Itel','2026-03-08 07:52:50.977','2026-03-08 10:38:53.419',NULL),('bc8c7f8c-1c81-478c-bade-a872481bb0f0','00036c99-6734-4def-9631-a63b1d0bac3c','Brand','Fabindia','2026-03-08 10:29:42.504','2026-03-08 10:38:53.556',NULL),('bd0e02d4-a856-4df8-9266-a3596318c7f7','377ea638-a878-40ee-b9b6-40c535d3587d','Brand','Penguin','2026-03-08 10:01:50.324','2026-03-08 10:38:53.450',NULL),('c12a7c82-9cde-4742-8037-60a9b5c5a900','14ac183b-4f3a-4599-aa0c-fddbcd40f2df','Brand','Sparx','2026-03-08 10:06:53.815','2026-03-08 10:38:53.670',NULL),('c2606bc2-13db-4a01-8388-0e71adca09a7','f654eeab-550d-45d9-ba34-8c914d16e58e','Brand','Cockatoo','2026-03-08 10:06:53.790','2026-03-08 10:38:53.649',NULL),('c26cf738-ed9e-46c3-8d48-27f9bb9607d3','9babc286-c4e0-41e5-a7b3-b264dc2e6cae','Brand','Milton','2026-03-08 10:06:53.796','2026-03-08 10:38:53.655',NULL),('c33cbbd2-e2cd-441f-a25b-639a0edfd2bb','4e789e54-2a5b-494e-9f00-382965199b9c','Brand','Nivia','2026-03-08 10:06:53.803','2026-03-08 10:38:53.661',NULL),('c3e2da58-ff71-4c79-9af1-76d383b1db51','7564a424-8a9a-4567-858c-df79a6c041e4','Brand','Nike','2026-03-08 10:06:53.807','2026-03-08 10:38:53.664',NULL),('c77a6953-849c-403e-bc70-df3e558a7e87','26ddf42e-dabc-4a01-8c4c-ede7ff753790','Brand','MIT Press','2026-03-08 10:01:50.354','2026-03-08 10:38:53.473',NULL),('c822fd3e-710b-423f-8820-7e6a6ce45e1b','94d14d81-6a8e-490b-b38c-6c6108edd8fa','Brand','Bloomsbury','2026-03-08 10:01:50.355','2026-03-08 10:38:53.478',NULL),('c8aa41e9-6b06-4d09-9322-155e5462683d','e5abd3d1-9ec8-409d-a743-d3c40c9eb4fe','Brand','Vivo','2026-03-08 07:52:50.952','2026-03-08 10:38:53.406',NULL),('c8ad3142-f7d8-4722-854a-e273bc2fdbc2','f3484048-ea96-4596-88d0-c23d9c574453','Brand','Yonex','2026-03-08 10:06:53.801','2026-03-08 10:38:53.660',NULL),('c9cd639e-eb4d-48e3-8048-7af2cbf6fad6','bf38eccf-bf56-426a-b62f-e83ce8a7bc00','Brand','Minimalist','2026-03-08 10:29:42.510','2026-03-08 10:38:53.560',NULL),('cd8fc187-30f4-4e67-a35f-03acfe6e7a9f','8ec3b72e-2d12-468d-8d95-3afff4bb82fe','Brand','Wakefit','2026-03-08 10:38:53.618','2026-03-08 10:38:53.618',NULL),('cf2d1e8c-ed57-405a-a2ff-3add63ffd2c9','48862bb2-a9ef-4573-a09c-79956af184d1','Brand','Cello','2026-03-08 10:38:53.611','2026-03-08 10:38:53.611',NULL),('d12558e6-63b5-4c3d-8343-f58f7e3b2426','1a883f97-88ba-4116-8614-bfaaef268d50','Brand','Plata','2026-03-08 10:01:50.359','2026-03-08 10:38:53.494',NULL),('d14f227f-ebee-4c76-b29c-37ba509fd0af','60cc7b0f-2522-45ab-ab3b-7b7ea31a636d','Brand','Levi\'s','2026-03-08 10:29:42.477','2026-03-08 10:38:53.531',NULL),('d2b30a10-28ff-4d93-823e-4f33f0749347','ed842f32-6f83-4864-a1d6-69d7363c1bb1','Brand','Tupperware','2026-03-08 10:38:53.604','2026-03-08 10:38:53.604',NULL),('d32e119f-c2ab-4311-89f2-4a2b9d519520','9e3b5511-400c-4e3f-8c1e-da7c2427a2a7','Brand','Vivo','2026-03-08 07:52:50.967','2026-03-08 10:38:53.414',NULL),('d37d3865-025c-4de9-9669-ba5606ad1cca','eae95954-9deb-4129-80df-06c00273421a','Brand','Ikea','2026-03-08 10:38:53.627','2026-03-08 10:38:53.627',NULL),('d60d59ba-2d19-49a3-8cc1-5e4dff6ba8a5','d83b851d-1d71-4671-a802-f17c68e397e3','Brand','Harper Perennial','2026-03-08 10:01:50.320','2026-03-08 10:38:53.449',NULL),('d62bf53d-59e8-49f9-b519-9a98ef94ac72','8768eb8d-f68a-482b-855f-8292f6ed468c','Brand','Head & Shoulders','2026-03-08 10:29:42.580','2026-03-08 10:38:53.574',NULL),('da9ce963-42ff-4231-aefb-ee3dd2de52f8','5b2a2c52-7a4d-4812-958a-b54c32eda127','Brand','Maybelline','2026-03-08 10:29:42.568','2026-03-08 10:38:53.572',NULL),('dd620a07-60de-437e-b93d-4b03e70cc6a2','a3983110-678d-40c5-b4ad-245c97eab52c','Brand','Itel','2026-03-08 07:52:50.992','2026-03-08 10:38:53.428',NULL),('de1a513c-d176-4a91-99b2-fc21ba7d5ed7','a5791b9f-92a5-42ae-af37-2e4df8292fce','Brand','Wrangler','2026-03-08 10:29:42.465','2026-03-08 10:38:53.512',NULL),('ded25a85-3ff6-42bc-9f28-6ec90d759dc6','8b691490-45c9-4c99-8e38-ae76b442c4f7','Brand','NCERT','2026-03-08 10:01:50.350','2026-03-08 10:38:53.463',NULL),('dee6ea37-4569-4026-ad37-73d2095b79b5','5dceaffd-69fa-41bc-9ef6-eb1678244057','Brand','Itel','2026-03-08 07:52:50.984','2026-03-08 10:38:53.423',NULL),('df2ba168-3a80-4b8f-b1ae-f1a8114cac4c','8c25ebe8-ca78-4612-938f-48abcb1695b5','Brand','Spacewood','2026-03-08 10:38:53.616','2026-03-08 10:38:53.616',NULL),('e022bf8c-f884-45aa-bc6b-ce4c56591387','67246e66-c661-40d8-94a8-4b78d6e1af55','Brand','Nike','2026-03-08 10:29:42.471','2026-03-08 10:38:53.523',NULL),('e0fd19c4-b29a-454d-9834-a603ff98df59','dae21dd5-514d-4883-8636-cd60272578c7','Brand','Itel','2026-03-08 07:52:50.982','2026-03-08 10:38:53.422',NULL),('e25502d7-67ac-40ef-9069-c84d867117a4','44778d3a-7232-40ab-911f-097fe8606899','Brand','Vivo','2026-03-08 07:49:17.996','2026-03-08 07:49:17.996',NULL),('e33cd865-7f25-4ea8-8c02-a9102e32d658','9dfff9a5-f004-4c20-a1ad-17b1c2bd81f1','Brand','Green Soul','2026-03-08 10:38:53.615','2026-03-08 10:38:53.615',NULL),('e3ccfb4e-ab53-4df0-a8df-793ab3582a97','081c094b-d50e-4265-ad1f-7bcd01e2ccd6','Brand','OnePlus','2026-03-08 07:49:17.977','2026-03-08 07:49:17.977',NULL),('e9ac19ab-1e37-484d-8b9e-bbe263e16d4d','56736578-f143-4ac7-8fde-62bce3c635a3','Brand','Vivo','2026-03-08 07:52:50.946','2026-03-08 10:38:53.403',NULL),('ebadb974-23dd-4185-858e-d2f128a2982c','c3d0b114-4e17-4da5-a79d-79431fcfc873','Brand','Cockatoo','2026-03-08 10:06:53.786','2026-03-08 10:38:53.646',NULL),('ec60438e-784e-42ae-aa8f-70d6750abe21','baa5091c-c1fc-456e-8d33-2d80f32144c9','Brand','Ikea','2026-03-08 10:38:53.638','2026-03-08 10:38:53.638',NULL),('ed17c6a6-2649-4d1d-8716-239cbc2ce4a0','367f4aa1-ee79-49da-b396-a1a1e4aa9ab5','Brand','Xiaomi','2026-03-08 07:49:17.981','2026-03-08 07:49:17.981',NULL),('ed4c55fe-976e-40bd-9aef-602965656eba','a8d00860-6548-4247-a742-c6eda0692b40','Brand','Stag','2026-03-08 10:06:53.820','2026-03-08 10:38:53.675',NULL),('ed8956fe-aaac-48db-879f-42a7ffcf532a','4f51c429-e983-469c-8849-44d7a0f2246b','Brand','Nike','2026-03-08 10:06:53.781','2026-03-08 10:38:53.642',NULL),('ef562a7e-b9ff-4f02-8522-8c50dbe1a618','15eebbda-42dd-4221-9f39-22e852202758','Brand','Cockatoo','2026-03-08 10:06:53.818','2026-03-08 10:38:53.673',NULL),('f093cf69-c011-46b0-b6a3-50b82c32556f','6c9219ca-de40-46d2-a875-1bd785792713','Brand','Del Rey','2026-03-08 10:01:50.357','2026-03-08 10:38:53.487',NULL),('f371993f-5206-4685-bf3f-8b0635a6ccee','9505cd0c-d29d-4084-8061-e8eb2fc18ba7','Brand','Oppo','2026-03-08 07:52:50.924','2026-03-08 10:38:53.394',NULL),('f3adeb73-df02-4183-95bd-90563991a5ef','3f0dd0b1-da1d-433f-9886-4bb9bf92f470','Brand','Godrej Interio','2026-03-08 10:38:53.620','2026-03-08 10:38:53.620',NULL),('f4c88059-6a68-473f-93c2-70a695059908','05b92e3d-0a14-45d1-a19e-f6ab045aa3b2','Brand','Oppo','2026-03-08 07:52:50.932','2026-03-08 10:38:53.396',NULL),('f500b1d0-2e68-48fe-8b5c-8a9dc300a26c','e9a0ac02-565d-4e65-939c-2c0cfb1b6a17','Brand','Nivia','2026-03-08 10:06:53.798','2026-03-08 10:38:53.657',NULL),('f5a42284-fed2-430c-b502-6ba0b5f0fba4','f1ecbe44-3226-4381-8820-b8428a98cd5b','Brand','Samsung','2026-03-08 07:52:50.790','2026-03-08 10:38:53.294',NULL),('f7539c28-0f83-4252-a7e1-b2181bba54ad','93410c74-666b-49c4-8efc-17ad46897d9e','Brand','Motorola','2026-03-08 07:52:51.008','2026-03-08 10:38:53.437',NULL),('fa7aa6c4-03b0-4591-8bce-106ccf4ee7b1','7010c4aa-5cd6-47e1-8422-c9c872fa6196','Brand','Xiaomi','2026-03-08 07:52:50.877','2026-03-08 10:38:53.367',NULL),('fba66efd-bb7b-4e02-bde8-c001c2c9a3b0','f7948c80-9e47-4eca-bbda-1cbf7452fad4','Brand','Apple','2026-03-08 07:52:50.677','2026-03-08 10:38:53.273',NULL),('fe5ee652-fc75-4a32-beae-69f77c2435e8','7d1f392a-1234-49f7-9934-f0b583873ad8','Brand','Philips','2026-03-08 10:38:53.595','2026-03-08 10:38:53.595',NULL),('fec8b6c6-6671-4068-9ea3-e939bf552c82','e8ee6860-2286-41ff-ba0c-20a9b714ed86','Brand','OnePlus','2026-03-08 07:52:50.827','2026-03-08 10:38:53.326',NULL),('ff210c8f-5b90-4afc-afd7-ce0cdb9fee84','2bb29b59-5224-4cd0-9c5b-870470c9601c','Brand','Itel','2026-03-08 07:52:50.986','2026-03-08 10:38:53.425',NULL);
/*!40000 ALTER TABLE `product_specifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mrp` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `gst_percent` decimal(5,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `return_policy` enum('DAYS_7','DAYS_15','DAYS_30','NO_RETURN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DAYS_7',
  `status` enum('DRAFT','PENDING_APPROVAL','ACTIVE','REJECTED','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
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
INSERT INTO `products` VALUES ('00036c99-6734-4def-9631-a63b1d0bac3c','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Ethnic Set','Fashion: Kids Ethnic Set by Fabindia.','FA-KID-18',3782.00,3162.00,NULL,50,'DAYS_7','ACTIVE',4.00,366,'2026-03-08 10:29:42.503','2026-03-08 10:38:53.555',NULL),('007c0e19-b58b-403b-8ae4-b7c77b9ca920','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Air Fryer 4.5L','Home: Air Fryer 4.5L by Philips.','HM-KIT-04',8032.00,7561.00,NULL,50,'DAYS_7','ACTIVE',4.80,746,'2026-03-08 10:38:53.598','2026-03-08 10:38:53.598',NULL),('02f6950b-5eeb-4b90-ac4b-7d4f5c7740ac','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo K11x 128GB - Jade Black','Oppo smartphone.','MB-OPPO-10',77279.00,75210.00,NULL,50,'DAYS_7','ACTIVE',4.30,1865,'2026-03-08 07:52:50.938','2026-03-08 10:38:53.399',NULL),('0424aac2-f7e2-468c-a632-25a90148c923','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Winter Jacket','Fashion: Men\'s Winter Jacket by Monte Carlo.','FA-MEN-05',2208.00,1911.00,NULL,50,'DAYS_7','ACTIVE',4.50,255,'2026-03-08 10:29:42.472','2026-03-08 10:38:53.526',NULL),('055c1280-39e3-47c7-8040-b962569c74bd','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','Deep Work','Book: Deep Work by Grand Central.','BK-NON-10',513.00,368.00,NULL,50,'DAYS_7','ACTIVE',3.90,161,'2026-03-08 10:01:50.344','2026-03-08 10:38:53.460',NULL),('05b92e3d-0a14-45d1-a19e-f6ab045aa3b2','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo A78 5G 128GB - Glowing Black','Oppo smartphone.','MB-OPPO-08',131302.00,112610.00,NULL,50,'DAYS_7','ACTIVE',4.70,806,'2026-03-08 07:52:50.931','2026-03-08 10:38:53.396',NULL),('06bdc568-70f1-47a2-b624-bec0543b5dc8','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone SE 64GB - White','Apple smartphone.','MB-APP-07',53814.00,43357.00,NULL,50,'DAYS_7','ACTIVE',3.90,1805,'2026-03-08 07:52:50.691','2026-03-08 10:38:53.275',NULL),('06e986f2-abf4-419a-b974-60abc677f892','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus 12R 5G 256GB - Cool Blue','OnePlus smartphone.','MB-OP-02',114310.00,93383.00,NULL,50,'DAYS_7','ACTIVE',4.90,1569,'2026-03-08 07:52:50.834','2026-03-08 10:38:53.328',NULL),('081c094b-d50e-4265-ad1f-7bcd01e2ccd6','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus 12 5G 256GB - Silky Black','OnePlus smartphone.','MB-OP-12-256',64999.00,59999.00,NULL,50,'DAYS_7','ACTIVE',4.50,876,'2026-03-08 07:49:17.972','2026-03-08 07:49:17.972',NULL),('081cb10a-aeee-4334-bd85-3edce5e0f891','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Face Moisturizer SPF 30','Beauty: Face Moisturizer SPF 30 by Lakmé.','BE-SKI-01',1327.00,1030.00,NULL,50,'DAYS_7','ACTIVE',4.80,314,'2026-03-08 10:29:42.505','2026-03-08 10:38:53.557',NULL),('08500d3c-ffd0-4a23-a973-0218c13019a7','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Girls Frock','Fashion: Kids Girls Frock by Lilliput.','FA-KID-12',938.00,704.00,NULL,50,'DAYS_7','ACTIVE',4.90,344,'2026-03-08 10:29:42.489','2026-03-08 10:38:53.541',NULL),('086acad8-e2a9-4b17-adf1-62805322a116','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','Thinking, Fast and Slow','Book: Thinking, Fast and Slow by Farrar, Straus and Giroux.','BK-NON-08',478.00,339.00,NULL,50,'DAYS_7','ACTIVE',4.60,328,'2026-03-08 10:01:50.339','2026-03-08 10:38:53.456',NULL),('08be0ff3-4680-4dc8-879a-b598e6022a4f','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Sports Shoes','Fashion: Kids Sports Shoes by Bata.','FA-KID-13',1285.00,994.00,NULL,50,'DAYS_7','ACTIVE',3.90,472,'2026-03-08 10:29:42.491','2026-03-08 10:38:53.543',NULL),('096a7276-690c-4a46-aaa9-5077e76ad338','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s Saree Silk','Fashion: Women\'s Saree Silk by Manyavar.','FA-WOM-17',4113.00,3533.00,NULL,50,'DAYS_7','ACTIVE',3.80,252,'2026-03-08 10:29:42.501','2026-03-08 10:38:53.552',NULL),('09b119dd-c74f-43f4-857e-ed2e7e57f7b4','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Face Wash Oil Control','Beauty: Face Wash Oil Control by Himalaya.','BE-SKI-04',431.00,374.00,NULL,50,'DAYS_7','ACTIVE',4.90,293,'2026-03-08 10:29:42.514','2026-03-08 10:38:53.563',NULL),('0b269961-f5c0-4ee7-acbe-b91a0c1ee4b2','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Cleansing Balm 100ml','Beauty: Cleansing Balm 100ml by The Body Shop.','BE-SKI-16',1271.00,1025.00,NULL,50,'DAYS_7','ACTIVE',4.00,152,'2026-03-08 10:29:42.602','2026-03-08 10:38:53.582',NULL),('0c80521f-6690-41f1-8539-991b3f313ad3','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy S24 Ultra - Phantom Black','Samsung smartphone.','MB-SAM-01',134180.00,100689.00,NULL,50,'DAYS_7','ACTIVE',4.10,2761,'2026-03-08 07:52:50.772','2026-03-08 10:38:53.288',NULL),('0d07a400-e744-4089-b46b-1c82a24cbcbc','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy S24 Ultra - Phantom Black','Samsung smartphone.','MB-SAM-S24U-256',134999.00,124999.00,NULL,50,'DAYS_7','ACTIVE',4.60,1892,'2026-03-08 07:49:17.965','2026-03-08 07:49:17.965',NULL),('0d7d33a5-3e4f-49f7-b950-34126d030a61','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 15 Pro Max 256GB - Titanium Blue','Apple smartphone.','MB-APP-01',103508.00,88299.00,NULL,50,'DAYS_7','ACTIVE',4.60,2221,'2026-03-08 07:52:50.374','2026-03-08 10:38:53.242',NULL),('0e4bf847-6be1-447f-9fac-667e534ccf5c','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Stainless Steel Cutlery Set 24 Pcs','Home: Stainless Steel Cutlery Set 24 Pcs by Bombay Dyeing.','HM-KIT-05',7466.00,7104.00,NULL,50,'DAYS_7','ACTIVE',4.70,504,'2026-03-08 10:38:53.600','2026-03-08 10:38:53.600',NULL),('13a41f01-5007-4b0c-b630-4bf8c3e0fa12','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s Handbag Leather','Fashion: Women\'s Handbag Leather by H&M.','FA-WOM-10',4385.00,3311.00,NULL,50,'DAYS_7','ACTIVE',4.80,364,'2026-03-08 10:29:42.483','2026-03-08 10:38:53.537',NULL),('13aa68e5-e969-42ec-9aa1-9a98fdfd3cbd','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Redmi A2 32GB - Sea Green','Xiaomi smartphone.','MB-XIA-08',142364.00,140194.00,NULL,50,'DAYS_7','ACTIVE',4.30,2890,'2026-03-08 07:52:50.893','2026-03-08 10:38:53.375',NULL),('13c7e23f-546d-4ab0-a361-3b6826808c44','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Foam Roller 33cm','Sports: Foam Roller 33cm by Reebok.','SP-FIT-05',2338.00,1896.00,NULL,50,'DAYS_7','ACTIVE',4.90,393,'2026-03-08 10:06:53.788','2026-03-08 10:38:53.647',NULL),('14ac183b-4f3a-4599-aa0c-fddbcd40f2df','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Sports Sandals','Sports: Sports Sandals by Sparx.','SP-FOO-20',2309.00,1963.00,NULL,50,'DAYS_7','ACTIVE',4.60,666,'2026-03-08 10:06:53.815','2026-03-08 10:38:53.670',NULL),('15eebbda-42dd-4221-9f39-22e852202758','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Wrist Wraps Lifting','Sports: Wrist Wraps Lifting by Cockatoo.','SP-FIT-22',1976.00,1575.00,NULL,50,'DAYS_7','ACTIVE',4.30,183,'2026-03-08 10:06:53.817','2026-03-08 10:38:53.673',NULL),('1612a5b4-a923-4696-82ad-97e40d9456d4','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Cricket Bat English Willow','Sports: Cricket Bat English Willow by SG.','SP-TEA-12',2656.00,1862.00,NULL,50,'DAYS_7','ACTIVE',4.60,336,'2026-03-08 10:06:53.799','2026-03-08 10:38:53.658',NULL),('17b1a65e-1ebe-40d8-aa59-8b19f84783be','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 14 Plus 128GB - Blue','Apple smartphone.','MB-APP-04',117142.00,92615.00,NULL,50,'DAYS_7','ACTIVE',4.70,1256,'2026-03-08 07:52:50.583','2026-03-08 10:38:53.263',NULL),('17e8fe22-839e-4e4f-836d-60aec62c96bf','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Edge 50 Pro 256GB - Luxe Lavender','Motorola smartphone.','MB-MOTO-01',112890.00,103353.00,NULL,50,'DAYS_7','ACTIVE',4.90,2774,'2026-03-08 07:52:50.999','2026-03-08 10:38:53.432',NULL),('18ea854e-349e-4930-b345-8e2ffa2d64a4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo iQOO Z7 Pro 5G 256GB - Blue Lagoon','Vivo smartphone.','MB-VIVO-08',139670.00,139442.00,NULL,50,'DAYS_7','ACTIVE',4.00,855,'2026-03-08 07:52:50.963','2026-03-08 10:38:53.411',NULL),('1a2e893f-7468-42f3-9714-026de9c66467','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Winter Sweater','Fashion: Kids Winter Sweater by Mothercare.','FA-KID-15',1035.00,781.00,NULL,50,'DAYS_7','ACTIVE',4.80,197,'2026-03-08 10:29:42.496','2026-03-08 10:38:53.548',NULL),('1a883f97-88ba-4116-8614-bfaaef268d50','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','Rich Dad Poor Dad','Book: Rich Dad Poor Dad by Plata.','BK-NON-18',656.00,495.00,NULL,50,'DAYS_7','ACTIVE',4.70,513,'2026-03-08 10:01:50.359','2026-03-08 10:38:53.492',NULL),('1aa344c6-60ee-46c1-854d-9aa00386f434','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Volleyball Official','Sports: Volleyball Official by Nivia.','SP-TEA-15',1623.00,1368.00,NULL,50,'DAYS_7','ACTIVE',4.60,352,'2026-03-08 10:06:53.804','2026-03-08 10:38:53.662',NULL),('212dda19-cd70-410b-b7a4-08179bb72afc','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo A58 5G 128GB - Dazzling Green','Oppo smartphone.','MB-OPPO-05',141990.00,117458.00,NULL,50,'DAYS_7','ACTIVE',4.10,2824,'2026-03-08 07:52:50.916','2026-03-08 10:38:53.391',NULL),('21a70a81-0382-4acc-a76f-ce545ab576c8','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Face Pack Clay','Beauty: Face Pack Clay by Biotique.','BE-SKI-18',1080.00,980.00,NULL,50,'DAYS_7','ACTIVE',4.20,60,'2026-03-08 10:29:42.609','2026-03-08 10:38:53.585',NULL),('23bae52e-05ba-4b72-96fe-3a76db06378c','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','Sapiens','Book: Sapiens by Harper.','BK-NON-07',454.00,359.00,NULL,50,'DAYS_7','ACTIVE',4.40,342,'2026-03-08 10:01:50.337','2026-03-08 10:38:53.455',NULL),('24115dea-fdd4-414f-8262-23f7029a5e36','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Curtain Pair 2 Panels','Home: Curtain Pair 2 Panels by HomeTown.','HM-DEC-24',12667.00,12366.00,NULL,50,'DAYS_7','ACTIVE',4.00,190,'2026-03-08 10:38:53.631','2026-03-08 10:38:53.631',NULL),('255a21ca-db0b-4a54-9119-b3d0dd4b65d7','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Wall Art Canvas Set of 3','Home: Wall Art Canvas Set of 3 by HomeTown.','HM-DEC-22',11693.00,11422.00,NULL,50,'DAYS_7','ACTIVE',4.10,145,'2026-03-08 10:38:53.628','2026-03-08 10:38:53.628',NULL),('25a30227-e0c0-4561-84dc-c7541173945f','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','How to Win Friends and Influence People','Book: How to Win Friends and Influence People by Pocket Books.','BK-NON-19',901.00,718.00,NULL,50,'DAYS_7','ACTIVE',4.10,494,'2026-03-08 10:01:50.360','2026-03-08 10:38:53.497',NULL),('26b9e391-5123-463a-ae6c-a3c15126a5f3','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Casual T-Shirt Cotton','Fashion: Men\'s Casual T-Shirt Cotton by Levi\'s.','FA-MEN-01',534.00,400.00,NULL,50,'DAYS_7','ACTIVE',4.20,154,'2026-03-08 10:29:42.461','2026-03-08 10:38:53.508',NULL),('26ddf42e-dabc-4a01-8c4c-ede7ff753790','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','Introduction to Algorithms','Book: Introduction to Algorithms by MIT Press.','BK-EDU-15',222.00,160.00,NULL,50,'DAYS_7','ACTIVE',5.00,455,'2026-03-08 10:01:50.353','2026-03-08 10:38:53.470',NULL),('26e107c4-809a-426c-b951-97bdf462b053','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo Y36 4G 128GB - Vibrant Gold','Vivo smartphone.','MB-VIVO-06',103518.00,96076.00,NULL,50,'DAYS_7','ACTIVE',4.20,162,'2026-03-08 07:52:50.956','2026-03-08 10:38:53.408',NULL),('27527d4c-37b6-4d55-8739-61d14d47f6a2','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s Floral Summer Dress','Fashion: Women\'s Floral Summer Dress by Biba.','FA-WOM-06',2364.00,1863.00,NULL,50,'DAYS_7','ACTIVE',4.50,142,'2026-03-08 10:29:42.474','2026-03-08 10:38:53.528',NULL),('27ca58e6-2cff-427b-8d10-a335c5298d50','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 15 128GB - Black','Apple smartphone.','MB-APP-03',57066.00,46694.00,NULL,50,'DAYS_7','ACTIVE',4.70,660,'2026-03-08 07:52:50.576','2026-03-08 10:38:53.258',NULL),('28d133ac-5400-47a9-b453-8e4989de21d9','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Cushion Cover Set of 4','Home: Cushion Cover Set of 4 by Bombay Dyeing.','HM-DEC-27',9611.00,7056.00,NULL,50,'DAYS_7','ACTIVE',4.00,433,'2026-03-08 10:38:53.635','2026-03-08 10:38:53.635',NULL),('28e12a3e-4136-4ff7-989d-d06721f2542d','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus 10 Pro 5G 256GB - Volcanic Black','OnePlus smartphone.','MB-OP-08',26929.00,22110.00,NULL,50,'DAYS_7','ACTIVE',4.30,2909,'2026-03-08 07:52:50.861','2026-03-08 10:38:53.345',NULL),('2bb29b59-5224-4cd0-9c5b-870470c9601c','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel A70 32GB - Gradation Purple','Itel smartphone.','MB-ITEL-06',110655.00,101742.00,NULL,50,'DAYS_7','ACTIVE',4.90,2202,'2026-03-08 07:52:50.985','2026-03-08 10:38:53.424',NULL),('2d3587a0-edec-4f57-8c1d-2257d175def7','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Night Cream Anti-Aging','Beauty: Night Cream Anti-Aging by Olay.','BE-SKI-05',659.00,536.00,NULL,50,'DAYS_7','ACTIVE',4.00,245,'2026-03-08 10:29:42.518','2026-03-08 10:38:53.565',NULL),('2dc0b93b-671d-4d20-b48a-60c370890bef','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Vase Set Ceramic','Home: Vase Set Ceramic by Ikea.','HM-DEC-25',7067.00,6394.00,NULL,50,'DAYS_7','ACTIVE',4.40,346,'2026-03-08 10:38:53.632','2026-03-08 10:38:53.632',NULL),('2ea0ccfc-8794-434b-a8af-debd426ddcfc','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola E22 64GB - Mineral Gray','Motorola smartphone.','MB-MOTO-10',48469.00,48453.00,NULL,50,'DAYS_7','ACTIVE',4.60,2641,'2026-03-08 07:52:51.018','2026-03-08 10:38:53.445',NULL),('33c65658-ab74-4df0-b74b-40b4a3e07446','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi 14 5G 256GB - Black','Xiaomi smartphone.','MB-XIA-01',129028.00,126359.00,NULL,50,'DAYS_7','ACTIVE',4.20,681,'2026-03-08 07:52:50.870','2026-03-08 10:38:53.361',NULL),('3621a254-99c0-422b-bea1-1111e844db76','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Redmi Note 13 Pro+ 5G 256GB - Aurora Purple','Xiaomi smartphone.','MB-XIA-04',151046.00,146059.00,NULL,50,'DAYS_7','ACTIVE',4.20,1172,'2026-03-08 07:52:50.878','2026-03-08 10:38:53.368',NULL),('367f4aa1-ee79-49da-b396-a1a1e4aa9ab5','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi 14 5G 256GB - Black','Xiaomi smartphone.','MB-XIA-14-256',52999.00,49999.00,NULL,50,'DAYS_7','ACTIVE',4.40,654,'2026-03-08 07:49:17.978','2026-03-08 07:49:17.978',NULL),('374f328f-0638-46d8-a7bd-aa3dbe2ab1c6','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Nord CE 2 5G 128GB - Bahama Blue','OnePlus smartphone.','MB-OP-07',35390.00,27668.00,NULL,50,'DAYS_7','ACTIVE',4.80,218,'2026-03-08 07:52:50.856','2026-03-08 10:38:53.342',NULL),('377ea638-a878-40ee-b9b6-40c535d3587d','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','1984','Book: 1984 by Penguin.','BK-FIC-03',478.00,435.00,NULL,50,'DAYS_7','ACTIVE',4.90,162,'2026-03-08 10:01:50.323','2026-03-08 10:38:53.450',NULL),('39c8eb12-0247-4453-a741-dd1e8b76bdb7','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy M34 5G 128GB - Midnight Blue','Samsung smartphone.','MB-SAM-06',78988.00,77710.00,NULL,50,'DAYS_7','ACTIVE',4.10,446,'2026-03-08 07:52:50.801','2026-03-08 10:38:53.300',NULL),('3ac4698b-846d-4b0f-bd21-6cd253d1367c','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 14 Pro 256GB - Purple','Apple smartphone.','MB-APP-09',71683.00,55027.00,NULL,50,'DAYS_7','ACTIVE',4.00,2406,'2026-03-08 07:52:50.734','2026-03-08 10:38:53.281',NULL),('3cdbbaa3-9d3b-4455-a51e-514f8f2d00a3','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Wooden Study Table','Home: Wooden Study Table by Nilkamal.','HM-FUR-11',9654.00,7693.00,NULL,50,'DAYS_7','ACTIVE',4.30,110,'2026-03-08 10:38:53.612','2026-03-08 10:38:53.612',NULL),('3d82fe69-2a6f-4827-9308-458edbcf9b9d','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Dumbbells 5kg Pair','Sports: Dumbbells 5kg Pair by Boldfit.','SP-FIT-03',554.00,405.00,NULL,50,'DAYS_7','ACTIVE',3.90,706,'2026-03-08 10:06:53.784','2026-03-08 10:38:53.644',NULL),('3f0dd0b1-da1d-433f-9886-4bb9bf92f470','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Dining Table 6 Seater','Home: Dining Table 6 Seater by Godrej Interio.','HM-FUR-16',9796.00,9566.00,NULL,50,'DAYS_7','ACTIVE',4.70,228,'2026-03-08 10:38:53.620','2026-03-08 10:38:53.620',NULL),('4055dd3d-fe94-4fe6-8528-6b059a055f21','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','The Psychology of Money','Book: The Psychology of Money by Harriman House.','BK-NON-09',613.00,497.00,NULL,50,'DAYS_7','ACTIVE',4.70,450,'2026-03-08 10:01:50.342','2026-03-08 10:38:53.458',NULL),('4132650e-8478-4747-b359-0930ebb4cfc7','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Sofa Set 3+1+1','Home: Sofa Set 3+1+1 by Nilkamal.','HM-FUR-15',3078.00,2302.00,NULL,50,'DAYS_7','ACTIVE',3.70,724,'2026-03-08 10:38:53.618','2026-03-08 10:38:53.618',NULL),('44778d3a-7232-40ab-911f-097fe8606899','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo X100 Pro 256GB - Asteroid Black','Vivo smartphone.','MB-VIVO-X100-256',99999.00,89999.00,NULL,50,'DAYS_7','ACTIVE',4.60,876,'2026-03-08 07:49:17.993','2026-03-08 07:49:17.993',NULL),('452e23e4-c5c3-464d-895a-60f3b4bc5889','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','Biology Class 12','Book: Biology Class 12 by NCERT.','BK-EDU-20',515.00,418.00,NULL,50,'DAYS_7','ACTIVE',4.10,255,'2026-03-08 10:01:50.362','2026-03-08 10:38:53.502',NULL),('4647f51f-3927-40bc-89a7-cd69478c88e2','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Photo Frame Collage Set','Home: Photo Frame Collage Set by Hometown.','HM-DEC-26',14190.00,13195.00,NULL,50,'DAYS_7','ACTIVE',3.70,390,'2026-03-08 10:38:53.634','2026-03-08 10:38:53.634',NULL),('468754d1-7496-4ea1-844d-990e8bfb22a4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy S23 FE 256GB - Cream','Samsung smartphone.','MB-SAM-09',71360.00,60584.00,NULL,50,'DAYS_7','ACTIVE',3.90,123,'2026-03-08 07:52:50.814','2026-03-08 10:38:53.308',NULL),('47a65476-e58e-4bda-b230-dbf688c3d4c5','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 10 5G 256GB - Ice Blue','Oppo smartphone.','MB-OPPO-03',154335.00,141736.00,NULL,50,'DAYS_7','ACTIVE',3.90,797,'2026-03-08 07:52:50.910','2026-03-08 10:38:53.382',NULL),('48862bb2-a9ef-4573-a09c-79956af184d1','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Dinner Set Ceramic 24 Pcs','Home: Dinner Set Ceramic 24 Pcs by Cello.','HM-KIT-10',15441.00,14045.00,NULL,50,'DAYS_7','ACTIVE',4.20,569,'2026-03-08 10:38:53.611','2026-03-08 10:38:53.611',NULL),('4905034e-d3bb-473d-b9e0-ab2ee1f95c12','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 10 Pro+ 5G 256GB - Silky Gold','Oppo smartphone.','MB-OPPO-02',94590.00,81312.00,NULL,50,'DAYS_7','ACTIVE',4.80,2901,'2026-03-08 07:52:50.907','2026-03-08 10:38:53.381',NULL),('49532104-542b-4800-9ff9-6fe9721c51a7','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo Y100 5G 128GB - Pacific Blue','Vivo smartphone.','MB-VIVO-10',155807.00,134226.00,NULL,50,'DAYS_7','ACTIVE',4.70,2907,'2026-03-08 07:52:50.968','2026-03-08 10:38:53.415',NULL),('4ba6400d-605f-46f4-baf5-a6408628bd7f','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','TV Unit Wall Mount','Home: TV Unit Wall Mount by Spacewood.','HM-FUR-17',2141.00,1622.00,NULL,50,'DAYS_7','ACTIVE',4.60,521,'2026-03-08 10:38:53.621','2026-03-08 10:38:53.621',NULL),('4e000b41-80bc-4b96-b995-5e54b555c7aa','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Mirror Wall Mount 24 inch','Home: Mirror Wall Mount 24 inch by Spacewood.','HM-DEC-30',15347.00,14752.00,NULL,50,'DAYS_7','ACTIVE',4.90,478,'2026-03-08 10:38:53.640','2026-03-08 10:38:53.640',NULL),('4e789e54-2a5b-494e-9f00-382965199b9c','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Basketball Size 7','Sports: Basketball Size 7 by Nivia.','SP-TEA-14',2929.00,2749.00,NULL,50,'DAYS_7','ACTIVE',4.90,849,'2026-03-08 10:06:53.802','2026-03-08 10:38:53.661',NULL),('4f51c429-e983-469c-8849-44d7a0f2246b','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Yoga Mat Premium 6mm','Sports: Yoga Mat Premium 6mm by Nike.','SP-FIT-01',5101.00,3849.00,NULL,50,'DAYS_7','ACTIVE',5.00,98,'2026-03-08 10:06:53.778','2026-03-08 10:38:53.641',NULL),('520f1e2e-1684-411d-bc5a-c25a0e32bb78','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','English Grammar in Use','Book: English Grammar in Use by Cambridge.','BK-EDU-14',804.00,761.00,NULL,50,'DAYS_7','ACTIVE',4.70,474,'2026-03-08 10:01:50.352','2026-03-08 10:38:53.466',NULL),('529af813-fb85-4ece-a039-5482ccdbc5d0','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','78446d11-99aa-45e0-86a5-ff5919136748','Hair Oil Coconut','Beauty: Hair Oil Coconut by Parachute.','BE-HAI-12',1328.00,1259.00,NULL,50,'DAYS_7','ACTIVE',4.80,166,'2026-03-08 10:29:42.582','2026-03-08 10:38:53.575',NULL),('56736578-f143-4ac7-8fde-62bce3c635a3','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo X100 256GB - Starry Blue','Vivo smartphone.','MB-VIVO-02',145102.00,115338.00,NULL,50,'DAYS_7','ACTIVE',4.40,2750,'2026-03-08 07:52:50.945','2026-03-08 10:38:53.402',NULL),('59635436-7d8f-4fe3-8d78-9669b706db7d','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Nord 3 5G 256GB - Tempest Gray','OnePlus smartphone.','MB-OP-04',57882.00,48075.00,NULL,50,'DAYS_7','ACTIVE',4.60,3094,'2026-03-08 07:52:50.842','2026-03-08 10:38:53.333',NULL),('5a9f72be-ccd7-4cc8-a80c-8785317379eb','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','78446d11-99aa-45e0-86a5-ff5919136748','Hair Serum Argan','Beauty: Hair Serum Argan by L\'Oreal.','BE-HAI-14',741.00,616.00,NULL,50,'DAYS_7','ACTIVE',4.10,45,'2026-03-08 10:29:42.595','2026-03-08 10:38:53.578',NULL),('5b2a2c52-7a4d-4812-958a-b54c32eda127','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Mascara Volumizing','Beauty: Mascara Volumizing by Maybelline.','BE-MAK-09',771.00,588.00,NULL,50,'DAYS_7','ACTIVE',4.00,79,'2026-03-08 10:29:42.562','2026-03-08 10:38:53.571',NULL),('5c3a3310-2c75-45b4-9545-a7aec14ce288','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 11 Pro 5G 256GB - Pearl White','Oppo smartphone.','MB-OPPO-01',79901.00,78521.00,NULL,50,'DAYS_7','ACTIVE',4.80,3076,'2026-03-08 07:52:50.904','2026-03-08 10:38:53.379',NULL),('5dceaffd-69fa-41bc-9ef6-eb1678244057','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel P55 4G 64GB - Meadow Purple','Itel smartphone.','MB-ITEL-05',104324.00,78260.00,NULL,50,'DAYS_7','ACTIVE',4.10,1201,'2026-03-08 07:52:50.983','2026-03-08 10:38:53.423',NULL),('60cc7b0f-2522-45ab-ab3b-7b7ea31a636d','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s High Waist Jeans','Fashion: Women\'s High Waist Jeans by Levi\'s.','FA-WOM-07',3355.00,2587.00,NULL,50,'DAYS_7','ACTIVE',5.00,423,'2026-03-08 10:29:42.476','2026-03-08 10:38:53.530',NULL),('61394340-1429-442c-be5d-109309e6ebe4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel S23 Plus 128GB - Starry Black','Itel smartphone.','MB-ITEL-01',51737.00,49453.00,NULL,50,'DAYS_7','ACTIVE',4.20,907,'2026-03-08 07:52:50.971','2026-03-08 10:38:53.416',NULL),('634cf241-a952-4042-9f91-cbe704a6a410','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy A34 5G 128GB - Awesome Violet','Samsung smartphone.','MB-SAM-08',88739.00,87219.00,NULL,50,'DAYS_7','ACTIVE',3.80,2347,'2026-03-08 07:52:50.811','2026-03-08 10:38:53.306',NULL),('648c11ee-5662-4225-9387-753490727f81','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Polo Neck T-Shirt','Fashion: Men\'s Polo Neck T-Shirt by US Polo Assn.','FA-MEN-16',3846.00,2988.00,NULL,50,'DAYS_7','ACTIVE',4.00,309,'2026-03-08 10:29:42.499','2026-03-08 10:38:53.550',NULL),('6526baae-1557-4521-8013-36c369ca416b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Product 1','Product 1','sjd3',2000.00,3000.00,18.00,16,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-25 16:10:04.924','2026-02-25 16:10:04.924',NULL),('67246e66-c661-40d8-94a8-4b78d6e1af55','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Sports Shorts','Fashion: Men\'s Sports Shorts by Nike.','FA-MEN-04',2239.00,1589.00,NULL,50,'DAYS_7','ACTIVE',4.80,527,'2026-03-08 10:29:42.469','2026-03-08 10:38:53.521',NULL),('69850e43-3d7e-4bf4-b915-309f07d0c492','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Floor Rug 5x7 ft','Home: Floor Rug 5x7 ft by Jaipur Rugs.','HM-DEC-23',3467.00,3277.00,NULL,50,'DAYS_7','ACTIVE',4.70,151,'2026-03-08 10:38:53.630','2026-03-08 10:38:53.630',NULL),('6c9219ca-de40-46d2-a875-1bd785792713','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','The Hobbit','Book: The Hobbit by Del Rey.','BK-FIC-17',461.00,399.00,NULL,50,'DAYS_7','ACTIVE',4.70,452,'2026-03-08 10:01:50.356','2026-03-08 10:38:53.483',NULL),('6cba4119-c6d3-481c-b80a-c4c2e46c1345','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Pad Go 128GB - LTE','OnePlus smartphone.','MB-OP-10',151560.00,116396.00,NULL,50,'DAYS_7','ACTIVE',4.40,1593,'2026-03-08 07:52:50.867','2026-03-08 10:38:53.358',NULL),('6fd304f5-e668-4104-9b05-8ab0b13bb1a9','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy M14 5G 64GB - Berry Blue','Samsung smartphone.','MB-SAM-10',13411.00,10188.00,NULL,50,'DAYS_7','ACTIVE',4.60,2885,'2026-03-08 07:52:50.822','2026-03-08 10:38:53.314',NULL),('7010c4aa-5cd6-47e1-8422-c9c872fa6196','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi 14 Ultra 256GB - Black','Xiaomi smartphone.','MB-XIA-03',143025.00,133668.00,NULL,50,'DAYS_7','ACTIVE',3.80,1956,'2026-03-08 07:52:50.876','2026-03-08 10:38:53.366',NULL),('7564a424-8a9a-4567-858c-df79a6c041e4','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Running Shoes Men','Sports: Running Shoes Men by Nike.','SP-FOO-16',3723.00,2750.00,NULL,50,'DAYS_7','ACTIVE',4.10,545,'2026-03-08 10:06:53.805','2026-03-08 10:38:53.664',NULL),('77740ae7-aa47-4184-81a3-6e0df70a1a5a','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 12 64GB - Red','Apple smartphone.','MB-APP-10',131046.00,129310.00,NULL,50,'DAYS_7','ACTIVE',4.30,2580,'2026-03-08 07:52:50.751','2026-03-08 10:38:53.284',NULL),('7c7ea138-d694-488f-a7ca-4830889f35ca','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 8 T 5G 128GB - Midnight Black','Oppo smartphone.','MB-OPPO-07',152850.00,149566.00,NULL,50,'DAYS_7','ACTIVE',3.90,2006,'2026-03-08 07:52:50.928','2026-03-08 10:38:53.394',NULL),('7d1f392a-1234-49f7-9934-f0b583873ad8','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Electric Kettle 1.5L','Home: Electric Kettle 1.5L by Philips.','HM-KIT-02',10319.00,8912.00,NULL,50,'DAYS_7','ACTIVE',3.80,619,'2026-03-08 10:38:53.594','2026-03-08 10:38:53.594',NULL),('7f0fe06a-a133-4b2a-ac3f-3577a3c35fb7','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Blush Pink 5g','Beauty: Blush Pink 5g by Colorbar.','BE-MAK-10',1082.00,816.00,NULL,50,'DAYS_7','ACTIVE',3.90,437,'2026-03-08 10:29:42.572','2026-03-08 10:38:53.572',NULL),('7f4f6b25-c771-4641-bdec-f2741ebac281','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Pressure Cooker 5L','Home: Pressure Cooker 5L by Hawkins.','HM-KIT-08',9048.00,8398.00,NULL,50,'DAYS_7','ACTIVE',4.90,597,'2026-03-08 10:38:53.607','2026-03-08 10:38:53.607',NULL),('7fd3355f-ee0f-4fea-a4ca-f87e95d54175','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Walking Shoes Comfort','Sports: Walking Shoes Comfort by Reebok.','SP-FOO-19',4128.00,3780.00,NULL,50,'DAYS_7','ACTIVE',3.90,803,'2026-03-08 10:06:53.813','2026-03-08 10:38:53.668',NULL),('80eb2e63-b9ca-4139-823c-67c4a4513a46','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','339a3323-b2a7-4517-8efb-a4896b78f1fe','Trekking Backpack 40L','Sports: Trekking Backpack 40L by Wildcraft.','SP-OUT-09',1876.00,1773.00,NULL,50,'DAYS_7','ACTIVE',3.90,547,'2026-03-08 10:06:53.794','2026-03-08 10:38:53.653',NULL),('83ad4df3-3cfb-4a24-832d-f4bfb47eab1b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Edge 50 Pro 256GB - Luxe Lavender','Motorola smartphone.','MB-MOTO-E50-256',34999.00,29999.00,NULL,50,'DAYS_7','ACTIVE',4.40,567,'2026-03-08 07:49:18.003','2026-03-08 07:49:18.003',NULL),('84cdb80c-8b20-4257-846f-97abc3fc46a0','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Foundation Beige 30ml','Beauty: Foundation Beige 30ml by MAC.','BE-MAK-17',320.00,252.00,NULL,50,'DAYS_7','ACTIVE',4.60,409,'2026-03-08 10:29:42.606','2026-03-08 10:38:53.583',NULL),('852b806d-088b-4b97-b154-2221ffc2fc3f','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Running Shoes Women','Sports: Running Shoes Women by Adidas.','SP-FOO-17',3439.00,2779.00,NULL,50,'DAYS_7','ACTIVE',4.50,86,'2026-03-08 10:06:53.808','2026-03-08 10:38:53.665',NULL),('873d4bc5-7b22-48ef-8537-472d0891dda2','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel P40 32GB - Force Black','Itel smartphone.','MB-ITEL-09',138218.00,134322.00,NULL,50,'DAYS_7','ACTIVE',4.50,2517,'2026-03-08 07:52:50.994','2026-03-08 10:38:53.429',NULL),('8768eb8d-f68a-482b-855f-8292f6ed468c','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','78446d11-99aa-45e0-86a5-ff5919136748','Shampoo Anti-Dandruff','Beauty: Shampoo Anti-Dandruff by Head & Shoulders.','BE-HAI-11',861.00,721.00,NULL,50,'DAYS_7','ACTIVE',4.80,116,'2026-03-08 10:29:42.578','2026-03-08 10:38:53.574',NULL),('8779e4c6-0d78-4ac0-8466-00001ca9b8b6','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Prestige PRM 5.0 Roti Maker with Power Indicator, 900 Watts curved granite plate','This versatile Prestige roti maker is designed to make your kitchen experience effortless and efficient. Featuring a durable stainless steel body with a premium granite non-stick coating, this electric roti maker ensures your rotis cook evenly without sticking, making cleanup a breeze. The adjustable temperature control knob allows you to customise the heat according to your preference, ensuring perfectly cooked rotis every time. With its unique curved surface design, this multi-purpose appliance can create fluffy, soft rotis with ease. The easy-flip mechanism and ergonomic handle make operation simple and safe, whilst the power indicators keep you informed of the cooking status. Operating at 900 watts, this roti maker heats up quickly and maintains consistent temperature throughout the cooking process. The 25-centimetre cooking surface provides ample space for making rotis of various sizes. Whether you\'re preparing breakfast, lunch, or dinner, this electric roti maker streamlines your cooking routine, delivering restaurant-quality results in the comfort of your home. Its compact design makes it perfect for modern kitchens where space is at a premium.','sku-111',2900.00,3299.00,18.00,22,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-26 06:34:20.534','2026-02-26 06:34:20.534',NULL),('87af924a-eaf5-4e60-9c17-0b0a0b1b8bfc','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 15 Pro Max 512GB - Black','Apple smartphone.','MB-APP-08',143779.00,112913.00,NULL,50,'DAYS_7','ACTIVE',4.10,1857,'2026-03-08 07:52:50.722','2026-03-08 10:38:53.277',NULL),('89d0fcc0-60b5-4007-8526-3cb7d85db7d1','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Smart Band 8 - Black','Xiaomi smartphone.','MB-XIA-10',112977.00,92904.00,NULL,50,'DAYS_7','ACTIVE',4.10,1909,'2026-03-08 07:52:50.900','2026-03-08 10:38:53.378',NULL),('8b691490-45c9-4c99-8e38-ae76b442c4f7','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','Physics Class 12','Book: Physics Class 12 by NCERT.','BK-EDU-12',839.00,719.00,NULL,50,'DAYS_7','ACTIVE',4.90,499,'2026-03-08 10:01:50.349','2026-03-08 10:38:53.463',NULL),('8c25ebe8-ca78-4612-938f-48abcb1695b5','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Bookshelf 5 Tier','Home: Bookshelf 5 Tier by Spacewood.','HM-FUR-13',842.00,816.00,NULL,50,'DAYS_7','ACTIVE',4.70,96,'2026-03-08 10:38:53.615','2026-03-08 10:38:53.615',NULL),('8dd579f2-9060-4ef9-b884-d6591c85f9a5','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo Y56 5G 128GB - Agate Black','Vivo smartphone.','MB-VIVO-07',140849.00,120423.00,NULL,50,'DAYS_7','ACTIVE',3.90,984,'2026-03-08 07:52:50.960','2026-03-08 10:38:53.410',NULL),('8e3ca85e-c6f3-49f8-b1d5-10e045a8eee9','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Hiking Shoes Waterproof','Sports: Hiking Shoes Waterproof by Quechua.','SP-FOO-25',2523.00,2231.00,NULL,50,'DAYS_7','ACTIVE',4.80,81,'2026-03-08 10:06:53.822','2026-03-08 10:38:53.677',NULL),('8ec3b72e-2d12-468d-8d95-3afff4bb82fe','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Queen Size Bed with Storage','Home: Queen Size Bed with Storage by Wakefit.','HM-FUR-14',938.00,791.00,NULL,50,'DAYS_7','ACTIVE',4.60,534,'2026-03-08 10:38:53.617','2026-03-08 10:38:53.617',NULL),('9035c942-c864-4b93-bac6-64a7ca1df030','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Chopping Board Set of 3','Home: Chopping Board Set of 3 by Bamboo Tree.','HM-KIT-07',7917.00,5952.00,NULL,50,'DAYS_7','ACTIVE',4.00,330,'2026-03-08 10:38:53.606','2026-03-08 10:38:53.606',NULL),('93410c74-666b-49c4-8efc-17ad46897d9e','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola G84 5G 256GB - Midnight Blue','Motorola smartphone.','MB-MOTO-04',90020.00,85802.00,NULL,50,'DAYS_7','ACTIVE',4.00,859,'2026-03-08 07:52:51.007','2026-03-08 10:38:53.436',NULL),('9431cf2c-5d5e-480a-a716-17feaca49459','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','Pride and Prejudice','Book: Pride and Prejudice by Penguin Classics.','BK-FIC-04',936.00,821.00,NULL,50,'DAYS_7','ACTIVE',4.20,457,'2026-03-08 10:01:50.326','2026-03-08 10:38:53.451',NULL),('949a280c-62e3-42d8-acbf-0496cbcec450','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola G54 5G 128GB - Midnight Blue','Motorola smartphone.','MB-MOTO-06',118871.00,103419.00,NULL,50,'DAYS_7','ACTIVE',3.90,1192,'2026-03-08 07:52:51.011','2026-03-08 10:38:53.439',NULL),('94d14d81-6a8e-490b-b38c-6c6108edd8fa','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','Harry Potter and the Philosopher\'s Stone','Book: Harry Potter and the Philosopher\'s Stone by Bloomsbury.','BK-FIC-16',575.00,493.00,NULL,50,'DAYS_7','ACTIVE',4.00,136,'2026-03-08 10:01:50.355','2026-03-08 10:38:53.476',NULL),('9505cd0c-d29d-4084-8061-e8eb2fc18ba7','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo F23 Pro 5G 256GB - Cool Black','Oppo smartphone.','MB-OPPO-06',72707.00,61378.00,NULL,50,'DAYS_7','ACTIVE',3.90,2124,'2026-03-08 07:52:50.920','2026-03-08 10:38:53.393',NULL),('962d36c6-dfd0-4a32-9325-11575549485f','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','339a3323-b2a7-4517-8efb-a4896b78f1fe','Cycling Helmet','Sports: Cycling Helmet by Vega.','SP-OUT-07',4976.00,4645.00,NULL,50,'DAYS_7','ACTIVE',5.00,860,'2026-03-08 10:06:53.791','2026-03-08 10:38:53.650',NULL),('969693cb-e3d9-4cbc-87e3-30d830da1d89','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','0ea63777-46b0-44c6-ad91-8eb41a654176','Atomic Habits','Book: Atomic Habits by Penguin.','BK-NON-06',398.00,346.00,NULL,50,'DAYS_7','ACTIVE',4.30,53,'2026-03-08 10:01:50.334','2026-03-08 10:38:53.453',NULL),('98971007-71b2-4082-97f0-76d2b9b4828e','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Clock Wall Decorative','Home: Clock Wall Decorative by Ajanta.','HM-DEC-29',3694.00,2746.00,NULL,50,'DAYS_7','ACTIVE',4.50,324,'2026-03-08 10:38:53.639','2026-03-08 10:38:53.639',NULL),('98c8b300-168c-41ac-b85a-53d1551ee226','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel A60s 64GB - Shadow Black','Itel smartphone.','MB-ITEL-03',22527.00,17780.00,NULL,50,'DAYS_7','ACTIVE',4.50,621,'2026-03-08 07:52:50.978','2026-03-08 10:38:53.420',NULL),('98d8763a-f71f-43c6-b756-83f7dc6f5e27','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','78446d11-99aa-45e0-86a5-ff5919136748','Conditioner Smooth','Beauty: Conditioner Smooth by Dove.','BE-HAI-13',1555.00,1310.00,NULL,50,'DAYS_7','ACTIVE',4.40,257,'2026-03-08 10:29:42.592','2026-03-08 10:38:53.577',NULL),('99c65f07-023b-466d-b65a-0f9f3d181bb5','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','Chemistry Class 11','Book: Chemistry Class 11 by NCERT.','BK-EDU-13',583.00,410.00,NULL,50,'DAYS_7','ACTIVE',4.20,346,'2026-03-08 10:01:50.350','2026-03-08 10:38:53.464',NULL),('99e159d0-f019-4618-9360-efe394635f22','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Lipstick Matte Red','Beauty: Lipstick Matte Red by Maybelline.','BE-MAK-06',1198.00,1027.00,NULL,50,'DAYS_7','ACTIVE',4.60,344,'2026-03-08 10:29:42.529','2026-03-08 10:38:53.566',NULL),('99fbc379-584a-4868-a0e6-985dcaa105cd','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy F54 256GB - Stardust Silver','Samsung smartphone.','MB-SAM-07',61035.00,52610.00,NULL,50,'DAYS_7','ACTIVE',4.00,720,'2026-03-08 07:52:50.807','2026-03-08 10:38:53.303',NULL),('9a69d831-07fc-44d4-9772-67c75381b050','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Mixer Grinder 750W','Home: Mixer Grinder 750W by Bajaj.','HM-KIT-03',5692.00,4193.00,NULL,50,'DAYS_7','ACTIVE',3.80,392,'2026-03-08 10:38:53.596','2026-03-08 10:38:53.596',NULL),('9babc286-c4e0-41e5-a7b3-b264dc2e6cae','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','339a3323-b2a7-4517-8efb-a4896b78f1fe','Water Bottle 1L Insulated','Sports: Water Bottle 1L Insulated by Milton.','SP-OUT-10',3215.00,2276.00,NULL,50,'DAYS_7','ACTIVE',4.00,107,'2026-03-08 10:06:53.796','2026-03-08 10:38:53.655',NULL),('9cfcd985-167e-47ae-b606-081926e8ae0f','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','339a3323-b2a7-4517-8efb-a4896b78f1fe','Camping Tent 2 Person','Sports: Camping Tent 2 Person by Wildcraft.','SP-OUT-08',3485.00,2707.00,NULL,50,'DAYS_7','ACTIVE',3.90,567,'2026-03-08 10:06:53.792','2026-03-08 10:38:53.652',NULL),('9d9ca9f1-7b93-4455-a5bd-aede9f07b55b','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Non-Stick Cookware Set 5 Pcs','Home: Non-Stick Cookware Set 5 Pcs by Prestige.','HM-KIT-01',635.00,550.00,NULL,50,'DAYS_7','ACTIVE',4.10,59,'2026-03-08 10:38:53.586','2026-03-08 10:38:53.586',NULL),('9dfff9a5-f004-4c20-a1ad-17b1c2bd81f1','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Office Chair Ergonomic','Home: Office Chair Ergonomic by Green Soul.','HM-FUR-12',10890.00,10378.00,NULL,50,'DAYS_7','ACTIVE',4.40,723,'2026-03-08 10:38:53.614','2026-03-08 10:38:53.614',NULL),('9e3b5511-400c-4e3f-8c1e-da7c2427a2a7','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo iQOO Neo 7 5G 256GB - Interstellar Black','Vivo smartphone.','MB-VIVO-09',135985.00,110978.00,NULL,50,'DAYS_7','ACTIVE',4.50,2884,'2026-03-08 07:52:50.966','2026-03-08 10:38:53.413',NULL),('9fc234e5-cde1-4c3f-bac4-8c6963e0bfcb','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo X100 Pro 256GB - Asteroid Black','Vivo smartphone.','MB-VIVO-01',88675.00,68142.00,NULL,50,'DAYS_7','ACTIVE',4.60,1769,'2026-03-08 07:52:50.941','2026-03-08 10:38:53.400',NULL),('a11e0275-13f5-4596-a33e-b10fe609ca93','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 11 Pro 5G 256GB - Pearl White','Oppo smartphone.','MB-OPPO-R11P-256',44999.00,39999.00,NULL,50,'DAYS_7','ACTIVE',4.30,432,'2026-03-08 07:49:17.987','2026-03-08 07:49:17.987',NULL),('a1b8d6bb-b0a5-4aeb-8071-220fede8749f','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','78446d11-99aa-45e0-86a5-ff5919136748','Hair Mask Repair','Beauty: Hair Mask Repair by Schwarzkopf.','BE-HAI-15',1143.00,1073.00,NULL,50,'DAYS_7','ACTIVE',3.90,362,'2026-03-08 10:29:42.599','2026-03-08 10:38:53.580',NULL),('a1bf76b4-2667-480c-a3ff-2e33b6387c2b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 14 128GB - Midnight','Apple smartphone.','MB-APP-05',156557.00,149851.00,NULL,50,'DAYS_7','ACTIVE',3.90,295,'2026-03-08 07:52:50.634','2026-03-08 10:38:53.267',NULL),('a3983110-678d-40c5-b4ad-245c97eab52c','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel A58 32GB - Gradation Green','Itel smartphone.','MB-ITEL-08',113821.00,85949.00,NULL,50,'DAYS_7','ACTIVE',4.60,2909,'2026-03-08 07:52:50.991','2026-03-08 10:38:53.427',NULL),('a5791b9f-92a5-42ae-af37-2e4df8292fce','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Slim Fit Jeans Blue','Fashion: Men\'s Slim Fit Jeans Blue by Wrangler.','FA-MEN-02',3757.00,2925.00,NULL,50,'DAYS_7','ACTIVE',4.70,285,'2026-03-08 10:29:42.464','2026-03-08 10:38:53.511',NULL),('a585ee7b-9dd1-4489-ac5c-a0849b81f766','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy Z Flip 5 256GB - Lavender','Samsung smartphone.','MB-SAM-05',120978.00,93539.00,NULL,50,'DAYS_7','ACTIVE',4.70,1670,'2026-03-08 07:52:50.796','2026-03-08 10:38:53.298',NULL),('a8d00860-6548-4247-a742-c6eda0692b40','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Table Tennis Bat','Sports: Table Tennis Bat by Stag.','SP-TEA-23',4591.00,3270.00,NULL,50,'DAYS_7','ACTIVE',4.10,322,'2026-03-08 10:06:53.819','2026-03-08 10:38:53.674',NULL),('aa1adbc0-fa20-49d8-b864-c841e37e2530','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','9c451e0d-bccf-4e1a-8d81-943e8691155e','iBELL 102IK Insect Killer Machine with Aluminium Body, 20W Bug Zapper, Fly Catcher for Home Restaurant & Offices, UV Bulbs, Insect Control (Grey)','iBELL Fast Action, Ultra Effective Insect Killer for Domestic or Professional Use.High efficiently killing insects and flies Prevent unsightly and unhygienic flying insects from invading your workplace.The ultra violet light attracts the insects into the electrified grids where they are instantly killed.Flying insect killer machine with 20W bug zapper to get rid of all those annoying and disease-causing insects and flies that ruin your home, office, and kitchen. Easy to install and use With no chemical attractants or harmful chemicals.','sku-123',12000.00,13000.00,18.00,25,'DAYS_7','PENDING_APPROVAL',NULL,0,'2026-02-26 06:55:45.203','2026-02-26 06:55:45.203',NULL),('abd78268-a75b-441e-ab89-0ce198e418d6','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Cricket Ball Leather','Sports: Cricket Ball Leather by SG.','SP-TEA-24',2584.00,1858.00,NULL,50,'DAYS_7','ACTIVE',3.90,250,'2026-03-08 10:06:53.820','2026-03-08 10:38:53.676',NULL),('b15f6414-256c-4149-b2a1-b64b666629a4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Edge 40 Neo 5G 256GB - Soothing Sea','Motorola smartphone.','MB-MOTO-02',21920.00,20187.00,NULL,50,'DAYS_7','ACTIVE',4.40,1182,'2026-03-08 07:52:51.001','2026-03-08 10:38:53.433',NULL),('b58e58f0-802d-44fb-8564-812b824c564d','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','aed4b433-375b-4768-9210-0756bf5cb08c','Mathematics Class 10','Book: Mathematics Class 10 by NCERT.','BK-EDU-11',899.00,659.00,NULL,50,'DAYS_7','ACTIVE',3.90,417,'2026-03-08 10:01:50.347','2026-03-08 10:38:53.461',NULL),('b8269fcf-0216-407c-b6c3-e787785daa51','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo V29 Pro 5G 256GB - Himalayan Blue','Vivo smartphone.','MB-VIVO-03',142392.00,115069.00,NULL,50,'DAYS_7','ACTIVE',4.10,433,'2026-03-08 07:52:50.947','2026-03-08 10:38:53.404',NULL),('baa5091c-c1fc-456e-8d33-2d80f32144c9','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Artificial Plant Pot','Home: Artificial Plant Pot by Ikea.','HM-DEC-28',1600.00,1531.00,NULL,50,'DAYS_7','ACTIVE',4.40,541,'2026-03-08 10:38:53.637','2026-03-08 10:38:53.637',NULL),('baad24c0-9427-49b7-ac99-c8f884c60b33','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','Men\'s Formal Shirt White','Fashion: Men\'s Formal Shirt White by Peter England.','FA-MEN-03',1392.00,1053.00,NULL,50,'DAYS_7','ACTIVE',4.70,455,'2026-03-08 10:29:42.467','2026-03-08 10:38:53.514',NULL),('bc375279-0538-4856-8bc9-587464816e71','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 15 Pro Max 256GB - Titanium Blue','Apple smartphone.','MB-APP-15PM-256',159900.00,154900.00,NULL,50,'DAYS_7','ACTIVE',4.70,2341,'2026-03-08 07:49:17.942','2026-03-08 07:49:17.942',NULL),('bdac69cf-ad22-46e1-a4b3-29dc28865738','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola G34 5G 128GB - Ocean Green','Motorola smartphone.','MB-MOTO-07',116029.00,108937.00,NULL,50,'DAYS_7','ACTIVE',4.30,1305,'2026-03-08 07:52:51.013','2026-03-08 10:38:53.440',NULL),('bdd3dd15-5504-48e9-909e-81f095b3cd1f','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s Running Shoes','Fashion: Women\'s Running Shoes by Puma.','FA-WOM-09',2853.00,2073.00,NULL,50,'DAYS_7','ACTIVE',4.90,604,'2026-03-08 10:29:42.481','2026-03-08 10:38:53.535',NULL),('be0c0393-c211-43f3-a305-3333ec3bac05','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Coffee Table Glass Top','Home: Coffee Table Glass Top by Nilkamal.','HM-FUR-19',4061.00,3281.00,NULL,50,'DAYS_7','ACTIVE',4.60,407,'2026-03-08 10:38:53.624','2026-03-08 10:38:53.624',NULL),('bf38eccf-bf56-426a-b62f-e83ce8a7bc00','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Vitamin C Serum 20ml','Beauty: Vitamin C Serum 20ml by Minimalist.','BE-SKI-02',964.00,836.00,NULL,50,'DAYS_7','ACTIVE',5.00,267,'2026-03-08 10:29:42.508','2026-03-08 10:38:53.559',NULL),('c0c9e263-4406-432d-a132-af3d5a0cd820','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Boys T-Shirt Pack of 3','Fashion: Kids Boys T-Shirt Pack of 3 by Allen Solly.','FA-KID-11',668.00,501.00,NULL,50,'DAYS_7','ACTIVE',4.60,644,'2026-03-08 10:29:42.486','2026-03-08 10:38:53.539',NULL),('c1aedbe1-d5c5-49c0-a255-166d0d181667','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy S24+ 256GB - Violet','Samsung smartphone.','MB-SAM-02',130244.00,115007.00,NULL,50,'DAYS_7','ACTIVE',3.90,3076,'2026-03-08 07:52:50.776','2026-03-08 10:38:53.290',NULL),('c3d0b114-4e17-4da5-a79d-79431fcfc873','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Jump Rope Speed','Sports: Jump Rope Speed by Cockatoo.','SP-FIT-04',3888.00,2802.00,NULL,50,'DAYS_7','ACTIVE',4.80,214,'2026-03-08 10:06:53.785','2026-03-08 10:38:53.646',NULL),('c3f86e56-7e76-4555-8f8e-3bac5f7e241a','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Blender 500W','Home: Blender 500W by Morphy Richards.','HM-KIT-09',7919.00,6877.00,NULL,50,'DAYS_7','ACTIVE',3.90,635,'2026-03-08 10:38:53.609','2026-03-08 10:38:53.609',NULL),('c4ebf6a7-b732-4292-bdba-ccf1ef9751ce','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','07471c8e-5700-4bd1-af0f-4c7569e84316','Sunscreen Gel SPF 50','Beauty: Sunscreen Gel SPF 50 by Neutrogena.','BE-SKI-03',700.00,551.00,NULL,50,'DAYS_7','ACTIVE',3.80,227,'2026-03-08 10:29:42.511','2026-03-08 10:38:53.561',NULL),('c5899cb3-307e-4e91-a50c-312988327526','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','The Alchemist','Book: The Alchemist by HarperOne.','BK-FIC-05',622.00,590.00,NULL,50,'DAYS_7','ACTIVE',4.40,155,'2026-03-08 10:01:50.332','2026-03-08 10:38:53.452',NULL),('c8cddf84-b0b2-49c0-83f4-42ae6f1e9a8c','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi 13 Pro 5G 256GB - Black','Xiaomi smartphone.','MB-XIA-02',118070.00,98807.00,NULL,50,'DAYS_7','ACTIVE',4.00,1493,'2026-03-08 07:52:50.873','2026-03-08 10:38:53.364',NULL),('c937ca29-21d1-4a89-b6a5-ecb0511ce1bc','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Razr 40 Ultra - Infinite Black','Motorola smartphone.','MB-MOTO-03',9715.00,9706.00,NULL,50,'DAYS_7','ACTIVE',3.90,697,'2026-03-08 07:52:51.003','2026-03-08 10:38:53.435',NULL),('ca09fdf0-bc4e-4697-9936-58fa7d794ea2','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola G73 5G 128GB - Midnight Blue','Motorola smartphone.','MB-MOTO-09',127903.00,113164.00,NULL,50,'DAYS_7','ACTIVE',3.80,662,'2026-03-08 07:52:51.016','2026-03-08 10:38:53.444',NULL),('ccefa856-e9ba-433f-9039-3c8d5ee74bfe','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus 11R 5G 256GB - Sonic Black','OnePlus smartphone.','MB-OP-05',121992.00,97010.00,NULL,50,'DAYS_7','ACTIVE',4.20,1537,'2026-03-08 07:52:50.847','2026-03-08 10:38:53.335',NULL),('d0a20864-4648-420c-969c-1295a168e213','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Wardrobe 2 Door','Home: Wardrobe 2 Door by HomeTown.','HM-FUR-18',6213.00,4968.00,NULL,50,'DAYS_7','ACTIVE',4.00,537,'2026-03-08 10:38:53.623','2026-03-08 10:38:53.623',NULL),('d5630967-ff9c-4126-8d7d-27081cfbf7fa','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Kajal Eye Pencil','Beauty: Kajal Eye Pencil by Lakmé.','BE-MAK-07',534.00,433.00,NULL,50,'DAYS_7','ACTIVE',4.80,56,'2026-03-08 10:29:42.531','2026-03-08 10:38:53.568',NULL),('d6bb18e6-16cb-4949-b115-8efae486c6cb','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel S23 Plus 128GB - Starry Black','Itel smartphone.','MB-ITEL-S23-128',12999.00,9999.00,NULL,50,'DAYS_7','ACTIVE',4.20,1203,'2026-03-08 07:49:17.999','2026-03-08 07:49:17.999',NULL),('d7c4bdf1-12d3-4a10-8743-518ea7771c8b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Redmi 13C 5G 128GB - Starlight Black','Xiaomi smartphone.','MB-XIA-05',89369.00,73595.00,NULL,50,'DAYS_7','ACTIVE',3.90,805,'2026-03-08 07:52:50.880','2026-03-08 10:38:53.370',NULL),('d83b851d-1d71-4671-a802-f17c68e397e3','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','To Kill a Mockingbird','Book: To Kill a Mockingbird by Harper Perennial.','BK-FIC-02',924.00,675.00,NULL,50,'DAYS_7','ACTIVE',4.90,433,'2026-03-08 10:01:50.319','2026-03-08 10:38:53.448',NULL),('dad513a9-627b-49d6-8430-ff66b9da845d','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel A49 32GB - Force Black','Itel smartphone.','MB-ITEL-10',56633.00,46313.00,NULL,50,'DAYS_7','ACTIVE',4.00,3060,'2026-03-08 07:52:50.996','2026-03-08 10:38:53.430',NULL),('dae21dd5-514d-4883-8636-cd60272578c7','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel S23 64GB - Dreamy Blue','Itel smartphone.','MB-ITEL-04',24921.00,18799.00,NULL,50,'DAYS_7','ACTIVE',3.80,482,'2026-03-08 07:52:50.981','2026-03-08 10:38:53.421',NULL),('dbca3cdb-1209-49db-a8e3-1da6f155da70','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Pad 6 128GB - Graphite Gray','Xiaomi smartphone.','MB-XIA-09',127210.00,117864.00,NULL,50,'DAYS_7','ACTIVE',4.80,1225,'2026-03-08 07:52:50.895','2026-03-08 10:38:53.376',NULL),('dc959de8-c414-4fe7-b95a-23f974fc2222','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Nord CE 3 5G 128GB - Aqua Surge','OnePlus smartphone.','MB-OP-03',154036.00,138763.00,NULL,50,'DAYS_7','ACTIVE',3.90,798,'2026-03-08 07:52:50.839','2026-03-08 10:38:53.330',NULL),('df43d77a-3126-47a0-8650-fa67bab48bc2','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo Reno 7 Pro 5G 256GB - Starry Black','Oppo smartphone.','MB-OPPO-09',22705.00,19226.00,NULL,50,'DAYS_7','ACTIVE',4.30,2959,'2026-03-08 07:52:50.935','2026-03-08 10:38:53.397',NULL),('dff592f5-6df4-4cbb-85d6-a8c1300a4a13','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Resistance Bands Set of 5','Sports: Resistance Bands Set of 5 by Amazon Basics.','SP-FIT-02',1151.00,1020.00,NULL,50,'DAYS_7','ACTIVE',4.30,650,'2026-03-08 10:06:53.782','2026-03-08 10:38:53.643',NULL),('e0711991-c085-416f-9c9c-1b9b9ee1de6e','581b18b4-89a5-4007-87fd-16012dc032d4','7fbbd549-c469-41b7-864e-3e2a51135cd9','9fca5335-64b8-4dfb-934c-bc26be5a3556','Compact Powder Natural','Beauty: Compact Powder Natural by L\'Oreal.','BE-MAK-08',1584.00,1413.00,NULL,50,'DAYS_7','ACTIVE',4.50,143,'2026-03-08 10:29:42.556','2026-03-08 10:38:53.569',NULL),('e0ac112e-92c8-4092-b4d4-736361013797','3a242478-a9a5-4674-97df-da617d58c785','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','9c451e0d-bccf-4e1a-8d81-943e8691155e','Kent Atta and Bread Maker for Home, Fully Automatic With 19 Pre-set Menu, 550w 16010 (Steel Grey)','A convenient and hygienic way to prepare dough for puris and rotis/ chapattis and fresh bread for your snack time.\nThis electric dough maker has one-touch operation and detachable components make mixing and kneading easy.\nYou can use any kind of flour for preparing fresh and healthy bread.\nNot only plain and simple bread, but various ingredients can also be added to personalise flavours.\nKENT Bread Maker comes with 19 programme menus, so you can prepare different types of chapatti and puri atta, cake, jam, pizza dough, sticky rice, etc.\nThis silver grey machine has an amazing 550W power.\nIncludes Atta bread maker, dough pan (1 No.), measuring spoon (1 No.), measuring cup (1 No.), kneading panel remover (1 No.), user manual.','sddsdss',18000.00,12000.00,18.00,100,'DAYS_7','ACTIVE',NULL,0,'2026-03-08 03:40:17.766','2026-03-08 03:40:45.598',NULL),('e0b1b885-536a-494b-9520-63f0e89caa68','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Razr 40 - Sage Green','Motorola smartphone.','MB-MOTO-08',90383.00,82123.00,NULL,50,'DAYS_7','ACTIVE',4.10,2901,'2026-03-08 07:52:51.014','2026-03-08 10:38:53.442',NULL),('e18b5933-8c3d-4c7d-a5a9-eb9adb286bad','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy A54 5G 128GB - Awesome Graphite','Samsung smartphone.','MB-SAM-04',69707.00,59478.00,NULL,50,'DAYS_7','ACTIVE',4.90,2465,'2026-03-08 07:52:50.793','2026-03-08 10:38:53.295',NULL),('e23fb5b8-4efe-4081-ab0e-a29ae087306c','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','ff797442-9a56-4dfe-97bb-3c2d58fb84e1','Gym Training Shoes','Sports: Gym Training Shoes by Puma.','SP-FOO-18',1562.00,1314.00,NULL,50,'DAYS_7','ACTIVE',4.10,299,'2026-03-08 10:06:53.810','2026-03-08 10:38:53.667',NULL),('e3b6d736-cab8-4bd5-9a21-a08d8630fec3','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Oppo A79 5G 128GB - Mystery Black','Oppo smartphone.','MB-OPPO-04',90796.00,82964.00,NULL,50,'DAYS_7','ACTIVE',4.50,1741,'2026-03-08 07:52:50.913','2026-03-08 10:38:53.389',NULL),('e4261c69-b259-40f8-b8e4-54ff53a43ddb','581b18b4-89a5-4007-87fd-16012dc032d4','c4bd5d3b-0564-470d-9707-a788d84d6a65','bbbe7171-839d-4959-b5bf-88d5aff789f2','The Great Gatsby','Book: The Great Gatsby by Scribner.','BK-FIC-01',457.00,348.00,NULL,50,'DAYS_7','ACTIVE',4.40,348,'2026-03-08 10:01:50.315','2026-03-08 10:38:53.447',NULL),('e5abd3d1-9ec8-409d-a743-d3c40c9eb4fe','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo V29 5G 256GB - Peak Blue','Vivo smartphone.','MB-VIVO-04',143364.00,124614.00,NULL,50,'DAYS_7','ACTIVE',4.70,1448,'2026-03-08 07:52:50.950','2026-03-08 10:38:53.405',NULL),('e5f1fc08-af6c-4cb5-b0f9-c61ef5bb66f3','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Knee Support Brace','Sports: Knee Support Brace by Boldfit.','SP-FIT-21',1149.00,1049.00,NULL,50,'DAYS_7','ACTIVE',4.80,93,'2026-03-08 10:06:53.816','2026-03-08 10:38:53.671',NULL),('e68892e8-982d-4727-a37f-902bbfda37a2','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Open 256GB - Emerald Dusk','OnePlus smartphone.','MB-OP-06',18299.00,16266.00,NULL,50,'DAYS_7','ACTIVE',4.80,2937,'2026-03-08 07:52:50.850','2026-03-08 10:38:53.339',NULL),('e7e37351-8f3e-4694-b5f9-32d2bca27ff4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 15 Pro 128GB - Natural','Apple smartphone.','MB-APP-02',138115.00,118203.00,NULL,50,'DAYS_7','ACTIVE',4.50,594,'2026-03-08 07:52:50.490','2026-03-08 10:38:53.254',NULL),('e8ee6860-2286-41ff-ba0c-20a9b714ed86','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus 12 5G 256GB - Silky Black','OnePlus smartphone.','MB-OP-01',12817.00,10592.00,NULL,50,'DAYS_7','ACTIVE',4.20,716,'2026-03-08 07:52:50.825','2026-03-08 10:38:53.325',NULL),('e9a0ac02-565d-4e65-939c-2c0cfb1b6a17','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Football Size 5','Sports: Football Size 5 by Nivia.','SP-TEA-11',3009.00,2327.00,NULL,50,'DAYS_7','ACTIVE',4.20,566,'2026-03-08 10:06:53.797','2026-03-08 10:38:53.656',NULL),('eab9896c-6eec-491a-87e6-0acc9d733c79','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Motorola Edge 40 5G 256GB - Nebula Green','Motorola smartphone.','MB-MOTO-05',24382.00,19504.00,NULL,50,'DAYS_7','ACTIVE',4.40,2446,'2026-03-08 07:52:51.009','2026-03-08 10:38:53.438',NULL),('eae95954-9deb-4129-80df-06c00273421a','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','8bd3fdf5-9b6c-455c-a58f-929b2c873cef','Table Lamp LED','Home: Table Lamp LED by Ikea.','HM-DEC-21',11689.00,10450.00,NULL,50,'DAYS_7','ACTIVE',3.70,178,'2026-03-08 10:38:53.627','2026-03-08 10:38:53.627',NULL),('eb867fc5-a2ac-49ee-a8ce-43ba2a75bf3f','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi 13 5G 256GB - Blue','Xiaomi smartphone.','MB-XIA-07',90937.00,81058.00,NULL,50,'DAYS_7','ACTIVE',4.10,2761,'2026-03-08 07:52:50.888','2026-03-08 10:38:53.373',NULL),('ed842f32-6f83-4864-a1d6-69d7363c1bb1','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','e08f7a95-1741-445d-9bc8-3ad727192b2c','Food Container Set 10 Pcs','Home: Food Container Set 10 Pcs by Tupperware.','HM-KIT-06',11326.00,9942.00,NULL,50,'DAYS_7','ACTIVE',4.30,81,'2026-03-08 10:38:53.603','2026-03-08 10:38:53.603',NULL),('efd52231-8b99-4db1-aebf-4268142e7e74','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','OnePlus Nord N30 5G 128GB - Chromatic Gray','OnePlus smartphone.','MB-OP-09',24981.00,24173.00,NULL,50,'DAYS_7','ACTIVE',4.30,704,'2026-03-08 07:52:50.864','2026-03-08 10:38:53.355',NULL),('efe9efa9-42fe-4627-99b7-7813be87ebc2','581b18b4-89a5-4007-87fd-16012dc032d4','26a946d0-a894-47a5-a925-4354aeed1fa8','fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','Shoe Rack 4 Tier','Home: Shoe Rack 4 Tier by Spacewood.','HM-FUR-20',5963.00,5191.00,NULL,50,'DAYS_7','ACTIVE',4.60,483,'2026-03-08 10:38:53.625','2026-03-08 10:38:53.625',NULL),('f0ebf931-7076-4a7d-b4fc-1411ad0a3d94','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Xiaomi Redmi Note 12 Pro 5G 128GB - Midnight Black','Xiaomi smartphone.','MB-XIA-06',108944.00,92208.00,NULL,50,'DAYS_7','ACTIVE',4.20,1643,'2026-03-08 07:52:50.883','2026-03-08 10:38:53.372',NULL),('f1ea1353-e8e5-43d2-8993-28c8d3765aaf','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel Vision 51 32GB - Force Black','Itel smartphone.','MB-ITEL-07',83935.00,82294.00,NULL,50,'DAYS_7','ACTIVE',3.90,800,'2026-03-08 07:52:50.988','2026-03-08 10:38:53.426',NULL),('f1ecbe44-3226-4381-8820-b8428a98cd5b','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Samsung Galaxy S24 128GB - Onyx','Samsung smartphone.','MB-SAM-03',141906.00,117371.00,NULL,50,'DAYS_7','ACTIVE',3.90,682,'2026-03-08 07:52:50.789','2026-03-08 10:38:53.293',NULL),('f23c4442-2425-48ce-abc4-bcdf9bceea64','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','2ee2dedb-1121-4d04-aea1-c3065629a333','Women\'s Cotton Kurti','Fashion: Women\'s Cotton Kurti by W.','FA-WOM-08',3551.00,3010.00,NULL,50,'DAYS_7','ACTIVE',4.20,189,'2026-03-08 10:29:42.479','2026-03-08 10:38:53.532',NULL),('f3484048-ea96-4596-88d0-c23d9c574453','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','63d8717f-073c-4ac0-b056-6a6e923e4dd5','Badminton Racquet Carbon','Sports: Badminton Racquet Carbon by Yonex.','SP-TEA-13',4744.00,3523.00,NULL,50,'DAYS_7','ACTIVE',5.00,822,'2026-03-08 10:06:53.801','2026-03-08 10:38:53.659',NULL),('f654eeab-550d-45d9-ba34-8c914d16e58e','581b18b4-89a5-4007-87fd-16012dc032d4','93de6aef-503a-429d-b659-ea086abe1ec3','37c26ad5-9a88-4613-b4ae-59ed938f154c','Running Treadmill 2HP','Sports: Running Treadmill 2HP by Cockatoo.','SP-FIT-06',2702.00,2281.00,NULL,50,'DAYS_7','ACTIVE',4.10,673,'2026-03-08 10:06:53.789','2026-03-08 10:38:53.649',NULL),('f70742e4-6e0c-4318-aa13-7f720a6ff491','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Itel P55 5G 128GB - Mystery Black','Itel smartphone.','MB-ITEL-02',142970.00,115568.00,NULL,50,'DAYS_7','ACTIVE',4.10,987,'2026-03-08 07:52:50.975','2026-03-08 10:38:53.418',NULL),('f7948c80-9e47-4eca-bbda-1cbf7452fad4','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Apple iPhone 13 128GB - Starlight','Apple smartphone.','MB-APP-06',119407.00,105020.00,NULL,50,'DAYS_7','ACTIVE',4.80,466,'2026-03-08 07:52:50.639','2026-03-08 10:38:53.271',NULL),('f8d598ea-a08f-4cf7-ab44-b7ea4a4bd25a','581b18b4-89a5-4007-87fd-16012dc032d4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','Vivo V27 Pro 5G 256GB - Noble Black','Vivo smartphone.','MB-VIVO-05',95281.00,88259.00,NULL,50,'DAYS_7','ACTIVE',4.00,1106,'2026-03-08 07:52:50.953','2026-03-08 10:38:53.407',NULL),('fc75bdfc-cd75-469a-abb0-cd16396f0b50','581b18b4-89a5-4007-87fd-16012dc032d4','19dfc1dd-0709-48a9-b384-845c7519903c','a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','Kids Denim Jeans','Fashion: Kids Denim Jeans by US Polo Assn.','FA-KID-14',2347.00,2186.00,NULL,50,'DAYS_7','ACTIVE',3.70,565,'2026-03-08 10:29:42.494','2026-03-08 10:38:53.546',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_items`
--

DROP TABLE IF EXISTS `return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `return_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING_VERIFICATION','DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED','ON_HOLD') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `profile_extras` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime(3) DEFAULT NULL,
  `status_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `primary_category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `sellers` VALUES ('3a242478-a9a5-4674-97df-da617d58c785','pankajkumaragarwal40@gmail.com','$2b$12$2m4/8H26YmVx8gBfcKinouFoxj.dtRYi4CsLTc9yohNPcd/PfZama','Seecog Softwares Private Limited','Pankaj Kumar Agarwal','+917348820668',NULL,'APPROVED','2026-03-08 03:04:47.755','2026-03-08 03:33:06.155',NULL,'{\"legalName\":\"Seecog Softwares Private Limited\",\"businessType\":\"company\",\"pan\":\"atypa7475j\",\"gstin\":\"\",\"gstNotApplicable\":true,\"addressLine1\":\"\",\"addressLine2\":\"\",\"city\":\"\",\"state\":\"\",\"pincode\":\"\",\"pickupPincode\":\"\",\"storeLogo\":\"\",\"storeDescription\":\"\"}',1,'216fc3547777d5817f52ed7a7e5ef029b85e67393ee433bc91bb628e36ebf880','2026-03-11 03:04:47.754',NULL,'eacae3d0-0f93-42ee-af14-8ff7ca9738c2',NULL,NULL),('581b18b4-89a5-4007-87fd-16012dc032d4','vendor@example.com','$2b$12$p4aAcLZM49sCoUyn.AJ2sOsr4QPtz8TcnHb1AF59Aca0Mu.494rL2','Tech Store India','Vendor Demo',NULL,NULL,'DRAFT','2026-02-25 15:50:38.502','2026-03-08 10:38:53.201',NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL),('5fd91462-9d67-48af-b455-bf0a961dd757','pankaj.7613@gmail.com','$2b$12$JGRLnPzVlIchPXEnZbf9cOZ5qkeNGhNlkU0GLyo3wXZNz46VzBp.a','Abc store','Pankaj Kumar Agarwal','7348820668',NULL,'APPROVED','2026-03-04 05:00:10.719','2026-03-05 04:34:38.964',NULL,'{\"legalName\":\"Seecog Softwares Private Limited\",\"businessType\":\"company\",\"pan\":\"atypa7475j\",\"gstin\":\"121212121212121\",\"gstNotApplicable\":false,\"addressLine1\":\"\",\"addressLine2\":\"\",\"city\":\"\",\"state\":\"\",\"pincode\":\"\",\"pickupPincode\":\"\",\"storeLogo\":\"\",\"storeDescription\":\"\"}',1,'4197a4316cb2a1d6a01fc0acd15050ad10284c146f9393a42096a640558c1479','2026-03-07 05:00:10.718',NULL,'eacae3d0-0f93-42ee-af14-8ff7ca9738c2','11e5ab933775728ea6a98010783afce7a09168d842535eca64d793cc518c733d','2026-03-05 05:34:38.963'),('71ca2871-bb4b-4072-978e-ac92703411b2','pankaj.76132@gmail.com','$2b$12$FlmrOou40zx/w7ljW7a6s.1tcYXM16bX0XdjH8Ts6R5cePTPSlcOu','Abc Tech','Pankaj Kumar Agarwal','7348820668',NULL,'APPROVED','2026-03-04 07:31:13.459','2026-03-04 09:06:19.067',NULL,NULL,1,'ae83fbd0f845637b2cde1c3371d55a67845384d41dbc5145dba8c05a1ea8310f','2026-03-07 07:31:13.457',NULL,NULL,NULL,NULL),('9a2c4432-71c7-4015-9945-0855d1f90d09','pankaj.76131@gmail.com','$2b$12$aO854sT5614cGnWk2oJjgu2kfkmAbvxHlpYaVx0aEOuML8hik6Awy','abc tech','Pankaj Kumar Agarwal','+917348820668',NULL,'PENDING_VERIFICATION','2026-03-04 07:30:36.977','2026-03-04 07:30:36.977',NULL,NULL,0,'d6421048112f11444d1414b366e7d332c0a602ed84270145f03d72e889959b1a','2026-03-07 07:30:36.974',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settlements`
--

DROP TABLE IF EXISTS `settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlements` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `revenue` decimal(14,2) NOT NULL,
  `commission_amount` decimal(14,2) NOT NULL,
  `payout_amount` decimal(14,2) NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `sub_categories` VALUES ('07471c8e-5700-4bd1-af0f-4c7569e84316','7fbbd549-c469-41b7-864e-3e2a51135cd9','skincare','Skincare',0,'2026-03-08 10:29:41.978','2026-03-08 10:29:41.978',NULL),('0ea63777-46b0-44c6-ad91-8eb41a654176','c4bd5d3b-0564-470d-9707-a788d84d6a65','nonfiction','Non-Fiction',0,'2026-02-25 16:09:04.233','2026-02-25 16:09:04.233',NULL),('2ee2dedb-1121-4d04-aea1-c3065629a333','19dfc1dd-0709-48a9-b384-845c7519903c','womens','Women\'s Clothing',0,'2026-02-25 16:09:04.215','2026-02-25 16:09:04.215',NULL),('339a3323-b2a7-4517-8efb-a4896b78f1fe','93de6aef-503a-429d-b659-ea086abe1ec3','outdoor','Outdoor',0,'2026-03-08 10:06:53.478','2026-03-08 10:06:53.478',NULL),('37c26ad5-9a88-4613-b4ae-59ed938f154c','93de6aef-503a-429d-b659-ea086abe1ec3','fitness','Fitness',0,'2026-03-08 10:06:53.449','2026-03-08 10:06:53.449',NULL),('41c6538f-780f-4ef2-8f17-dbc0e33ef8b4','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','laptops','Laptops',0,'2026-02-25 16:09:04.204','2026-02-25 16:09:04.204',NULL),('63d8717f-073c-4ac0-b056-6a6e923e4dd5','93de6aef-503a-429d-b659-ea086abe1ec3','team-sports','Team Sports',0,'2026-03-08 10:06:53.494','2026-03-08 10:06:53.494',NULL),('78446d11-99aa-45e0-86a5-ff5919136748','7fbbd549-c469-41b7-864e-3e2a51135cd9','haircare','Haircare',0,'2026-03-08 10:29:41.993','2026-03-08 10:29:41.993',NULL),('8bd3fdf5-9b6c-455c-a58f-929b2c873cef','26a946d0-a894-47a5-a925-4354aeed1fa8','decor','Home Decor',0,'2026-02-25 16:09:04.225','2026-02-25 16:09:04.225',NULL),('9c451e0d-bccf-4e1a-8d81-943e8691155e','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','accessories','Accessories',0,'2026-02-25 16:09:04.208','2026-02-25 16:09:04.208',NULL),('9fca5335-64b8-4dfb-934c-bc26be5a3556','7fbbd549-c469-41b7-864e-3e2a51135cd9','makeup','Makeup',0,'2026-03-08 10:29:41.987','2026-03-08 10:29:41.987',NULL),('a19bd50f-7ad1-4e30-b6fa-a28a13d21f5f','19dfc1dd-0709-48a9-b384-845c7519903c','kids','Kids Wear',0,'2026-02-25 16:09:04.218','2026-02-25 16:09:04.218',NULL),('aed4b433-375b-4768-9210-0756bf5cb08c','c4bd5d3b-0564-470d-9707-a788d84d6a65','education','Educational',0,'2026-02-25 16:09:04.235','2026-02-25 16:09:04.235',NULL),('bbbe7171-839d-4959-b5bf-88d5aff789f2','c4bd5d3b-0564-470d-9707-a788d84d6a65','fiction','Fiction',0,'2026-02-25 16:09:04.231','2026-02-25 16:09:04.231',NULL),('cf6a73b2-9ed6-4dc5-b4fe-f674ca63a2b7','19dfc1dd-0709-48a9-b384-845c7519903c','mens','Men\'s Clothing',0,'2026-02-25 16:09:04.211','2026-02-25 16:09:04.211',NULL),('d23a0d6a-21a1-4ca7-9dac-65c8d7103e20','eacae3d0-0f93-42ee-af14-8ff7ca9738c2','mobiles','Mobile Phones',0,'2026-02-25 16:09:04.173','2026-02-25 16:09:04.173',NULL),('e08f7a95-1741-445d-9bc8-3ad727192b2c','26a946d0-a894-47a5-a925-4354aeed1fa8','kitchen','Kitchen',0,'2026-02-25 16:09:04.222','2026-02-25 16:09:04.222',NULL),('fdeb96f2-50e6-4a75-8aa2-f76f2b32c24d','26a946d0-a894-47a5-a925-4354aeed1fa8','furniture','Furniture',0,'2026-02-25 16:09:04.224','2026-02-25 16:09:04.224',NULL),('ff797442-9a56-4dfe-97bb-3c2d58fb84e1','93de6aef-503a-429d-b659-ea086abe1ec3','footwear','Sports Footwear',0,'2026-03-08 10:06:53.506','2026-03-08 10:06:53.506',NULL);
/*!40000 ALTER TABLE `sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `users` VALUES ('3be318d9-b976-44c4-9e5d-906e8fbe3474','lakshya@seecogsoftwares.com','$2b$12$/zi1JcUlG85S4Uu/m8Ab9u.oLLXjMRkozeWnKqk8X2PZo47h3F.e2','lakshya',NULL,'7231090321','2026-03-11 07:07:39.514','2026-03-11 07:07:39.514',NULL),('e252f86d-9528-4ff1-b9fe-36e71adaf71e','customer@example.com','$2b$12$KC0lrC.ltE0CNIlVYR4DTOghkzffZ9GEEU.0IhUzNBws9NGskSZqO','Demo','Customer',NULL,'2026-03-08 10:01:49.989','2026-03-08 10:38:52.974',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_documents`
--

DROP TABLE IF EXISTS `vendor_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_documents` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
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
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11 17:19:50
