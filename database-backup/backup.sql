-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: capstone_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_activity_logs`
--

DROP TABLE IF EXISTS `account_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `target_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_activity_logs_actor_id_index` (`actor_id`),
  KEY `account_activity_logs_target_id_index` (`target_id`),
  KEY `account_activity_logs_action_index` (`action`),
  KEY `account_activity_logs_created_at_index` (`created_at`),
  CONSTRAINT `account_activity_logs_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `account_activity_logs_target_id_foreign` FOREIGN KEY (`target_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_activity_logs`
--

LOCK TABLES `account_activity_logs` WRITE;
/*!40000 ALTER TABLE `account_activity_logs` DISABLE KEYS */;
INSERT INTO `account_activity_logs` VALUES (1,2,5,'approved_alumni',NULL,'{\"alumni_name\": \"lawis\", \"alumni_email\": \"lawis@gmail.com\"}','2026-07-06 23:40:17','2026-07-06 23:40:17'),(2,4,17,'approved_alumni',NULL,'{\"alumni_name\": \"Maria Santos\", \"alumni_email\": \"maria@gmail.com\"}','2026-07-13 01:57:12','2026-07-13 01:57:12'),(3,4,16,'approved_alumni',NULL,'{\"alumni_name\": \"Jose Reyes\", \"alumni_email\": \"jose@gmail.com\"}','2026-07-13 01:57:15','2026-07-13 01:57:15'),(4,4,15,'approved_alumni',NULL,'{\"alumni_name\": \"Ana Garcia\", \"alumni_email\": \"ana@gmail.com\"}','2026-07-13 01:57:18','2026-07-13 01:57:18'),(5,4,19,'approved_alumni',NULL,'{\"alumni_name\": \"lawis\", \"alumni_email\": \"lawisjr@gmail.com\"}','2026-08-03 12:32:03','2026-08-03 12:32:03'),(6,4,21,'rejected_alumni','faf','{\"alumni_name\": \"andrea\", \"alumni_email\": \"andrea@gmai.com\"}','2026-08-03 13:05:11','2026-08-03 13:05:11'),(7,1,NULL,'created_announcement',NULL,'{\"title\": \"dsad\", \"announcement_id\": 1}','2026-08-03 13:20:53','2026-08-03 13:20:53'),(8,1,NULL,'updated_announcement',NULL,'{\"title\": \"dsadfs\", \"announcement_id\": 1}','2026-08-03 13:21:05','2026-08-03 13:21:05'),(9,1,22,'approved_alumni',NULL,'{\"alumni_name\": \"hadoken\", \"alumni_email\": \"hadoken@gmail.com\"}','2026-08-06 13:44:04','2026-08-06 13:44:04'),(10,4,NULL,'created_announcement',NULL,'{\"title\": \"fasf\", \"announcement_id\": 2}','2026-08-07 05:44:36','2026-08-07 05:44:36'),(11,4,NULL,'updated_announcement',NULL,'{\"title\": \"picture\", \"announcement_id\": 2}','2026-08-07 05:45:22','2026-08-07 05:45:22'),(12,1,NULL,'created_announcement',NULL,'{\"title\": \"test pic\", \"announcement_id\": 3}','2026-08-07 05:46:08','2026-08-07 05:46:08'),(13,1,NULL,'created_event',NULL,'{\"event_id\": 1, \"event_title\": \"test pic\"}','2026-08-07 06:18:01','2026-08-07 06:18:01'),(14,4,NULL,'created_event',NULL,'{\"event_id\": 2, \"event_title\": \"test\"}','2026-08-07 06:30:57','2026-08-07 06:30:57'),(15,4,NULL,'created_event',NULL,'{\"event_id\": 3, \"event_title\": \"fdsaf\"}','2026-08-07 06:44:27','2026-08-07 06:44:27'),(16,4,NULL,'created_event',NULL,'{\"event_id\": 4, \"event_title\": \"meeting\"}','2026-08-07 06:47:13','2026-08-07 06:47:13'),(17,1,NULL,'created_announcement',NULL,'{\"title\": \"reunion\", \"announcement_id\": 4}','2026-08-07 06:48:35','2026-08-07 06:48:35'),(18,1,24,'rejected_alumni','secret','{\"alumni_name\": \"sarah\", \"alumni_email\": \"sarah@gmail.com\"}','2026-08-07 07:17:26','2026-08-07 07:17:26'),(19,1,NULL,'rejected_alumni','dfs','{\"alumni_name\": \"misil\", \"alumni_email\": \"misil@gmail.com\"}','2026-08-07 07:25:19','2026-08-07 07:25:19');
/*!40000 ALTER TABLE `account_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumni_profiles`
--

DROP TABLE IF EXISTS `alumni_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumni_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `department_id` bigint unsigned NOT NULL,
  `graduate_id` bigint unsigned DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_job` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_status` enum('employed','unemployed','self_employed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unemployed',
  `is_work_aligned` tinyint(1) DEFAULT NULL,
  `work_aligned_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alumni_profiles_user_id_unique` (`user_id`),
  KEY `alumni_profiles_department_id_index` (`department_id`),
  KEY `alumni_profiles_graduate_id_index` (`graduate_id`),
  KEY `alumni_profiles_employment_status_index` (`employment_status`),
  KEY `alumni_profiles_is_work_aligned_index` (`is_work_aligned`),
  CONSTRAINT `alumni_profiles_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alumni_profiles_graduate_id_foreign` FOREIGN KEY (`graduate_id`) REFERENCES `graduates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `alumni_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumni_profiles`
--

LOCK TABLES `alumni_profiles` WRITE;
/*!40000 ALTER TABLE `alumni_profiles` DISABLE KEYS */;
INSERT INTO `alumni_profiles` VALUES (1,5,2,1,NULL,NULL,NULL,'encoder','beer pilsen','employed',1,'secret','2027-2028','2026-07-06 23:40:17','2026-07-15 00:38:33',NULL),(2,17,3,7,'0090021312','San Jose Talibon Bohol',NULL,'Shift Manager','Jollibee Foods Corporation','employed',0,'I\'m A criminology but I am at the jollibee','2026-2027','2026-07-13 01:57:12','2026-07-13 07:15:20',NULL),(3,16,3,8,NULL,NULL,NULL,'test','test','employed',NULL,NULL,'2027-2028','2026-07-13 01:57:15','2026-08-03 12:52:21',NULL),(4,15,3,9,NULL,NULL,NULL,NULL,NULL,'unemployed',NULL,NULL,'2027-2028','2026-07-13 01:57:18','2026-07-13 01:57:18',NULL),(5,19,3,21,NULL,NULL,NULL,NULL,NULL,'unemployed',NULL,NULL,'2027-2028','2026-08-03 12:32:02','2026-08-03 12:32:02',NULL),(6,22,3,22,'090900900','zamura',NULL,NULL,NULL,'self_employed',1,'secret','2026-2027','2026-08-06 13:44:04','2026-08-07 01:27:11',NULL);
/*!40000 ALTER TABLE `alumni_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_by` bigint unsigned NOT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `external_link` text COLLATE utf8mb4_unicode_ci,
  `posted_at` datetime DEFAULT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json DEFAULT NULL,
  `scope` enum('school_wide','department_specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'school_wide',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_created_by_foreign` (`created_by`),
  KEY `announcements_department_id_index` (`department_id`),
  KEY `announcements_scope_index` (`scope`),
  CONSTRAINT `announcements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `announcements_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,1,NULL,'dsadfs','fdfd',NULL,NULL,NULL,NULL,NULL,'school_wide','2026-08-03 13:20:53','2026-08-03 13:21:05',NULL),(2,4,3,'picture','test picture',NULL,NULL,NULL,NULL,'[\"/storage/announcements/tQju4TLCrX2xbAMDpSNYDUNH7GpYl6eSZYvA1XMJ.png\"]','department_specific','2026-08-07 05:44:36','2026-08-07 05:45:22',NULL),(3,1,NULL,'test pic','test pic',NULL,NULL,NULL,NULL,'[\"/storage/announcements/VBlmsxJ0bo80bdhZGAC6iqj0x1BMurp5itlsXG7t.jpg\"]','school_wide','2026-08-07 05:46:08','2026-08-07 05:46:08',NULL),(4,1,NULL,'reunion','batch 2026-2027',NULL,NULL,NULL,NULL,'[\"/storage/announcements/FpZiM1oHj5tIKIIX1AI9lNcdJP6eGOUFgO0yX8Mc.png\"]','school_wide','2026-08-07 06:48:35','2026-08-07 06:48:35',NULL);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'BSOA','2026-07-01 03:22:14','2026-07-01 03:22:14',NULL),(2,'BSIT','2026-07-01 03:22:14','2026-07-01 03:22:14',NULL),(3,'Criminology','2026-07-01 03:22:14','2026-07-01 03:22:14',NULL),(4,'BSIS','2026-08-07 01:55:13','2026-08-07 04:18:32','2026-08-07 04:18:32');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_by` bigint unsigned NOT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` enum('school_wide','department_specific') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'school_wide',
  `attachments` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_created_by_index` (`created_by`),
  KEY `events_department_id_index` (`department_id`),
  KEY `events_event_date_index` (`event_date`),
  KEY `events_scope_index` (`scope`),
  CONSTRAINT `events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `events_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,NULL,'test pic','test pic','2026-08-19 14:17:00','Manilak, Quezon, Philippines','school_wide',NULL,'2026-08-07 06:18:01','2026-08-07 06:18:01',NULL),(2,4,3,'test','test','2026-08-28 14:30:00','talibon','department_specific',NULL,'2026-08-07 06:30:57','2026-08-07 06:30:57',NULL),(3,4,3,'fdsaf','fasdf','2026-08-21 14:44:00','aranita','department_specific','[{\"url\": \"/storage/events/UqoUoIfZotnZwQBmo2UoEHA6nBuiUDyDLhsxrtAD.docx\", \"name\": \"Complete_SPMP_Formatted_Template.docx\", \"path\": \"events/UqoUoIfZotnZwQBmo2UoEHA6nBuiUDyDLhsxrtAD.docx\"}]','2026-08-07 06:44:27','2026-08-07 06:44:27',NULL),(4,4,3,'meeting','lets have some meeting here','2026-08-22 14:46:00','TPC studium','department_specific','[{\"url\": \"/storage/events/S5S6bYiss6BNqz1WvuOMfv9MAU38yHg0tNEhChUd.png\", \"name\": \"Screenshot 2026-07-23 204825.png\", \"path\": \"events/S5S6bYiss6BNqz1WvuOMfv9MAU38yHg0tNEhChUd.png\"}]','2026-08-07 06:47:13','2026-08-07 06:47:13',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
INSERT INTO `failed_jobs` VALUES (1,'6398564b-8fc5-4528-a89a-7e3aa14899ec','database','default','{\"uuid\":\"6398564b-8fc5-4528-a89a-7e3aa14899ec\",\"displayName\":\"App\\\\Mail\\\\AccountApprovedMail\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":17:{s:8:\\\"mailable\\\";O:28:\\\"App\\\\Mail\\\\AccountApprovedMail\\\":3:{s:7:\\\"\\u0000*\\u0000user\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:15:\\\"App\\\\Models\\\\User\\\";s:2:\\\"id\\\";i:19;s:9:\\\"relations\\\";a:1:{i:0;s:8:\\\"graduate\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:17:\\\"lawisjr@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\",\"batchId\":null},\"createdAt\":1785760331,\"delay\":null}','Symfony\\Component\\Mailer\\Exception\\TransportException: Connection could not be established with host \"smtp.gmail.com:587\": stream_socket_client(): php_network_getaddresses: getaddrinfo for smtp.gmail.com failed: Name or service not known in /var/www/backend/vendor/symfony/mailer/Transport/Smtp/Stream/SocketStream.php:154\nStack trace:\n#0 [internal function]: Symfony\\Component\\Mailer\\Transport\\Smtp\\Stream\\SocketStream->Symfony\\Component\\Mailer\\Transport\\Smtp\\Stream\\{closure}(2, \'stream_socket_c...\', \'/var/www/backen...\', 157)\n#1 /var/www/backend/vendor/symfony/mailer/Transport/Smtp/Stream/SocketStream.php(157): stream_socket_client(\'smtp.gmail.com:...\', 0, \'\', 60.0, 4, Resource id #1232)\n#2 /var/www/backend/vendor/symfony/mailer/Transport/Smtp/SmtpTransport.php(268): Symfony\\Component\\Mailer\\Transport\\Smtp\\Stream\\SocketStream->initialize()\n#3 /var/www/backend/vendor/symfony/mailer/Transport/Smtp/SmtpTransport.php(200): Symfony\\Component\\Mailer\\Transport\\Smtp\\SmtpTransport->start()\n#4 /var/www/backend/vendor/symfony/mailer/Transport/AbstractTransport.php(69): Symfony\\Component\\Mailer\\Transport\\Smtp\\SmtpTransport->doSend(Object(Symfony\\Component\\Mailer\\SentMessage))\n#5 /var/www/backend/vendor/symfony/mailer/Transport/Smtp/SmtpTransport.php(138): Symfony\\Component\\Mailer\\Transport\\AbstractTransport->send(Object(Symfony\\Component\\Mime\\Email), Object(Symfony\\Component\\Mailer\\DelayedEnvelope))\n#6 /var/www/backend/vendor/laravel/framework/src/Illuminate/Mail/Mailer.php(584): Symfony\\Component\\Mailer\\Transport\\Smtp\\SmtpTransport->send(Object(Symfony\\Component\\Mime\\Email), Object(Symfony\\Component\\Mailer\\DelayedEnvelope))\n#7 /var/www/backend/vendor/laravel/framework/src/Illuminate/Mail/Mailer.php(331): Illuminate\\Mail\\Mailer->sendSymfonyMessage(Object(Symfony\\Component\\Mime\\Email))\n#8 /var/www/backend/vendor/laravel/framework/src/Illuminate/Mail/Mailable.php(207): Illuminate\\Mail\\Mailer->send(Object(Closure), Array, Object(Closure))\n#9 /var/www/backend/vendor/laravel/framework/src/Illuminate/Support/Traits/Localizable.php(19): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}()\n#10 /var/www/backend/vendor/laravel/framework/src/Illuminate/Mail/Mailable.php(200): Illuminate\\Mail\\Mailable->withLocale(NULL, Object(Closure))\n#11 /var/www/backend/vendor/laravel/framework/src/Illuminate/Mail/SendQueuedMailable.php(82): Illuminate\\Mail\\Mailable->send(Object(Illuminate\\Mail\\MailManager))\n#12 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(36): Illuminate\\Mail\\SendQueuedMailable->handle(Object(Illuminate\\Mail\\MailManager))\n#13 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#14 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#15 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#16 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#17 /var/www/backend/vendor/laravel/framework/src/Illuminate/Bus/Dispatcher.php(129): Illuminate\\Container\\Container->call(Array)\n#18 /var/www/backend/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#19 /var/www/backend/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#20 /var/www/backend/vendor/laravel/framework/src/Illuminate/Bus/Dispatcher.php(133): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#21 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/CallQueuedHandler.php(136): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(Illuminate\\Mail\\SendQueuedMailable), false)\n#22 /var/www/backend/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#23 /var/www/backend/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#24 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/CallQueuedHandler.php(129): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#25 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/CallQueuedHandler.php(70): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Mail\\SendQueuedMailable))\n#26 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Jobs/Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#27 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Worker.php(504): Illuminate\\Queue\\Jobs\\Job->fire()\n#28 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Worker.php(454): Illuminate\\Queue\\Worker->process(\'database\', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#29 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Worker.php(212): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), \'database\', Object(Illuminate\\Queue\\WorkerOptions))\n#30 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Console/WorkCommand.php(149): Illuminate\\Queue\\Worker->daemon(\'database\', \'default\', Object(Illuminate\\Queue\\WorkerOptions))\n#31 /var/www/backend/vendor/laravel/framework/src/Illuminate/Queue/Console/WorkCommand.php(132): Illuminate\\Queue\\Console\\WorkCommand->runWorker(\'database\', \'default\')\n#32 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#33 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#34 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#35 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#36 /var/www/backend/vendor/laravel/framework/src/Illuminate/Container/Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#37 /var/www/backend/vendor/laravel/framework/src/Illuminate/Console/Command.php(211): Illuminate\\Container\\Container->call(Array)\n#38 /var/www/backend/vendor/symfony/console/Command/Command.php(341): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#39 /var/www/backend/vendor/laravel/framework/src/Illuminate/Console/Command.php(180): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#40 /var/www/backend/vendor/symfony/console/Application.php(1117): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#41 /var/www/backend/vendor/symfony/console/Application.php(356): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#42 /var/www/backend/vendor/symfony/console/Application.php(195): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#43 /var/www/backend/vendor/laravel/framework/src/Illuminate/Foundation/Console/Kernel.php(198): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#44 /var/www/backend/vendor/laravel/framework/src/Illuminate/Foundation/Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#45 /var/www/backend/artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#46 {main}','2026-08-03 12:32:51');
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `graduates`
--

DROP TABLE IF EXISTS `graduates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `graduates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `department_id` bigint unsigned NOT NULL,
  `student_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `block` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `graduates_student_number_unique` (`student_number`),
  KEY `graduates_department_id_index` (`department_id`),
  KEY `graduates_student_number_index` (`student_number`),
  KEY `graduates_batch_year_index` (`batch_year`),
  CONSTRAINT `graduates_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `graduates`
--

LOCK TABLES `graduates` WRITE;
/*!40000 ALTER TABLE `graduates` DISABLE KEYS */;
INSERT INTO `graduates` VALUES (1,2,'0001','Alvin Alba','2027-2028',NULL,'block1','2026-07-01 03:23:28','2026-07-01 03:23:28',NULL),(2,3,'0002','eze keyn','2026-2027',NULL,'block1','2026-07-01 03:27:51','2026-07-01 03:27:51',NULL),(3,3,'0003','keyn eze','2027-2028',NULL,'block1','2026-07-01 03:28:47','2026-07-01 03:28:47',NULL),(4,3,'0004','eze lawis','2028-2029',NULL,'block 2','2026-07-01 03:34:27','2026-07-01 03:34:27',NULL),(5,1,'0005','test1 graduate','2026-2027',NULL,'block1','2026-07-01 03:35:57','2026-07-01 03:35:57',NULL),(6,3,'0006','Juan Delacruz','2026-2027',NULL,'block1','2026-07-13 01:01:01','2026-07-13 01:01:01',NULL),(7,3,'0007','Maria Santos','2026-2027',NULL,'block3','2026-07-13 01:06:33','2026-07-13 01:06:33',NULL),(8,3,'0008','Jose Reyes','2027-2028',NULL,'block3','2026-07-13 01:07:20','2026-07-13 01:07:20',NULL),(9,3,'0009','Ana Garcia','2027-2028',NULL,'block1','2026-07-13 01:07:58','2026-07-13 01:07:58',NULL),(10,3,'0010','Mark Flores','2028-2029',NULL,'block1','2026-07-13 01:08:36','2026-07-13 01:08:36',NULL),(11,1,'0011','Sarah Mendoza','2026-2027',NULL,'block 5','2026-07-13 01:09:26','2026-07-13 01:09:26',NULL),(12,1,'0012','Kevin Ramos','2026-2027',NULL,'block 2','2026-07-13 01:10:00','2026-07-13 01:10:00',NULL),(13,1,'0013','Angelica Torres','2027-2028',NULL,'block1','2026-07-13 01:10:33','2026-07-13 01:10:33',NULL),(14,1,'0014','Paul Navaro','2027-2028',NULL,'block 2','2026-07-13 01:11:13','2026-07-13 01:11:13',NULL),(15,1,'0015','Jennifer Castro','2028-2029',NULL,'block1','2026-07-13 01:11:41','2026-07-13 01:11:41',NULL),(16,2,'0016','Christian Aquino','2026-2027',NULL,'block3','2026-07-13 01:12:11','2026-07-13 01:12:11',NULL),(17,2,'0017','Michelle Fernandez','2026-2027',NULL,'block 2','2026-07-13 01:12:52','2026-07-13 01:12:52',NULL),(18,2,'0018','Daniel Bautista','2027-2028',NULL,NULL,'2026-07-13 01:13:24','2026-07-13 01:13:24',NULL),(19,2,'0019','Patricia Lopez','2027-2028',NULL,'block 2','2026-07-13 01:13:59','2026-07-13 01:13:59',NULL),(20,2,'0020','Ryan Gonzales','2028-2029',NULL,'block1','2026-07-13 01:14:39','2026-07-13 01:14:39',NULL),(21,3,'0099','lawis jr','2027-2028',NULL,'block1','2026-08-03 12:29:57','2026-08-03 12:29:57',NULL),(22,3,'1234','hadoken','2026-2027',NULL,'block 1','2026-08-06 13:43:17','2026-08-06 13:43:17',NULL),(23,2,'0143','misil sajulan','2027-2028',NULL,'block 7','2026-08-07 07:24:42','2026-08-07 07:24:42',NULL);
/*!40000 ALTER TABLE `graduates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_histories`
--

DROP TABLE IF EXISTS `job_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_histories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `employment_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_employer_updated` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_histories_user_id_index` (`user_id`),
  KEY `job_histories_is_current_index` (`is_current`),
  CONSTRAINT `job_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_histories`
--

LOCK TABLES `job_histories` WRITE;
/*!40000 ALTER TABLE `job_histories` DISABLE KEYS */;
INSERT INTO `job_histories` VALUES (1,5,'beer pilsen','encoder','san miguel','2026-07-07',NULL,1,NULL,0,'2026-07-08 22:41:25','2026-07-08 22:41:25',NULL),(2,17,'Jollibee Foods Corporation','Shift Manager','Food & Beverage','2026-07-09',NULL,1,NULL,0,'2026-07-13 07:09:05','2026-07-13 07:12:23',NULL),(3,16,'test','test','test','2026-08-12',NULL,1,NULL,0,'2026-08-03 12:52:21','2026-08-03 12:52:21',NULL),(4,22,'','','etsat','2026-08-07',NULL,0,'self_employed',0,'2026-08-06 14:19:33','2026-08-07 01:27:11',NULL),(5,22,'','','test','2026-08-07',NULL,1,'self_employed',0,'2026-08-06 14:34:30','2026-08-07 01:24:42',NULL),(6,22,'brader','brad','fdasf','2026-08-12','2026-08-22',0,NULL,0,'2026-08-06 14:53:16','2026-08-07 01:24:42',NULL);
/*!40000 ALTER TABLE `job_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_05_24_025303_create_personal_access_tokens_table',1),(5,'2026_05_26_023511_add_google_and_role_to_users_table',1),(6,'2026_05_28_061955_add_role_columns_to_users_table',1),(7,'2026_06_20_000000_create_departments_and_update_user_roles',1),(8,'2026_06_20_010000_add_school_id_to_users_table',1),(9,'2026_06_24_000000_create_graduates_table',1),(10,'2026_06_24_000001_create_alumni_profiles_table',1),(11,'2026_06_24_000002_create_events_table',1),(12,'2026_06_24_000003_create_account_activity_logs_table',1),(13,'2026_06_25_000000_create_announcements_table',1),(14,'2026_06_25_000001_create_job_histories_table',1),(15,'2026_06_27_030559_convert_avatar_urls_to_relative_paths',1),(16,'2026_06_27_074203_add_batch_year_to_alumni_profiles_table',1),(17,'2026_06_29_015220_add_work_alignment_to_alumni_profiles_table',1),(18,'2026_08_07_000001_add_employment_type_to_job_histories_table',2),(19,'2026_08_07_000001_add_announcement_details_to_announcements_table',3),(20,'2026_08_07_000002_add_attachments_to_events_table',4),(21,'2026_08_07_070502_create_rejection_logs_table',5);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (4,'App\\Models\\User',3,'auth-token','644916220e56ce0bceb7fa1d167caf00bbe5429dff44fa1bfa62c089688ebf0c','[\"*\"]','2026-07-01 04:01:12',NULL,'2026-07-01 04:00:35','2026-07-01 04:01:12'),(9,'App\\Models\\User',5,'auth-token','147b87c470b9236b2cea98fa2eba30ba0160ff23b0fd14c0b174bfbd7767d27b','[\"*\"]','2026-07-07 00:26:25',NULL,'2026-07-07 00:01:23','2026-07-07 00:26:25'),(12,'App\\Models\\User',1,'auth-token','1c7688ad942f8e494bc9182f2e070fd33f81391fde26b75fc7fcd308d7970a31','[\"*\"]','2026-07-13 01:33:27',NULL,'2026-07-13 00:23:17','2026-07-13 01:33:27'),(19,'App\\Models\\User',17,'auth-token','7008d254621667c53675466d9c9717b8a37f069206552390b485ffaa040aeb07','[\"*\"]','2026-07-13 07:18:47',NULL,'2026-07-13 07:13:24','2026-07-13 07:18:47'),(22,'App\\Models\\User',3,'auth-token','c2f3493ac957fe71fe5828b1e04037e63416f013a26d122aeb4db14d84fb1eb5','[\"*\"]','2026-07-15 01:33:40',NULL,'2026-07-15 00:40:03','2026-07-15 01:33:40'),(23,'App\\Models\\User',1,'auth-token','504b00a44c0bf77ba6ccae32283fec61ceca2c459072ee88a35ca55925a872ee','[\"*\"]','2026-07-15 00:59:46',NULL,'2026-07-15 00:40:34','2026-07-15 00:59:46'),(25,'App\\Models\\User',1,'auth-token','83d87e714a3d7653778ecdb1685d55fc37b233a21d0ff82c2b1eca0598909fd6','[\"*\"]','2026-07-15 00:58:49',NULL,'2026-07-15 00:43:34','2026-07-15 00:58:49'),(28,'App\\Models\\User',1,'auth-token','a8cfec76f41a6380fafdbd11748b89fb55e1eae561537b30517a95cc6a672e88','[\"*\"]','2026-07-20 06:58:17',NULL,'2026-07-20 06:17:47','2026-07-20 06:58:17'),(35,'App\\Models\\User',1,'auth-token','4d4e46f137045c2b3d606cad4fa12e8dc42e99a9c53037480a8db5c8eb0d8545','[\"*\"]','2026-08-06 14:56:01',NULL,'2026-08-06 13:29:43','2026-08-06 14:56:01'),(38,'App\\Models\\User',1,'auth-token','3866998c8edc3fd1da0d10eaf853cf9999b65b09b32e3e07938f273b4948bed6','[\"*\"]','2026-08-07 01:55:31',NULL,'2026-08-07 01:07:42','2026-08-07 01:55:31'),(44,'App\\Models\\User',1,'auth-token','1d59d04f03d7213bdb5202d4aefb52cd1eb46b90cd0acc4dd085ca62955abc91','[\"*\"]','2026-08-07 07:34:31',NULL,'2026-08-07 04:50:34','2026-08-07 07:34:31'),(49,'App\\Models\\User',4,'auth-token','b3c2c7a9fff45a5ea7cee7c75c83d5814ebcb6cfec9dc3359f501ec9ec5e856a','[\"*\"]','2026-08-12 00:05:52',NULL,'2026-08-12 00:04:51','2026-08-12 00:05:52'),(50,'App\\Models\\User',4,'auth-token','3ac9ecf84a03db0f4ea81b56566cd4dbaaf20aea4e2dd80dc425170dd54008f2','[\"*\"]','2026-08-12 00:22:36',NULL,'2026-08-12 00:07:47','2026-08-12 00:22:36');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rejection_logs`
--

DROP TABLE IF EXISTS `rejection_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rejection_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `original_user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `rejected_by` bigint unsigned DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rejection_logs`
--

LOCK TABLES `rejection_logs` WRITE;
/*!40000 ALTER TABLE `rejection_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `rejection_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('VLepvIFpqifwuj5kCrPSxTp3U1cEbX7n3ORZUgUo',NULL,'139.135.78.150','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUzBMaE1WeVlQWTl4SkdZRjRFQ1BBeWVVQ1lzeklkTkxmYUpzOHA2dCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjE6Imh0dHBzOi8vZWRpbmJ1cmdoLW1lZXR1cC1hbGxpYW5jZS1jb21wb3NpdGUudHJ5Y2xvdWRmbGFyZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1783550935);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `school_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  KEY `users_department_id_foreign` (`department_id`),
  KEY `users_school_id_index` (`school_id`),
  CONSTRAINT `users_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'President','SystemAdmin@gmail.com',NULL,NULL,NULL,'$2y$12$f/.jZ4jiOzrYgAU9HQ7tPOrEcejCnhkY1.UBHq.kNm2G6vnf8Y/iC',NULL,'2026-07-01 03:22:14','2026-08-07 04:33:10',NULL,'/storage/avatars/gBVKxjfghA5nCahmsn1zlZUnZzYRILNyFeKH7mo1.png','super_admin',1,'active',NULL),(2,'Francis Magalona','francis@gmail.com',2,NULL,NULL,'$2y$12$ZtAmRwQjSn51HQ4najkPxupcpAySr5UCtG0dkBwHmn5fbZKkQkhye',NULL,'2026-07-01 03:24:33','2026-07-01 03:24:33',NULL,NULL,'admin',1,'active',NULL),(3,'Francisca Magalona','francisca@gmail.com',1,NULL,NULL,'$2y$12$pItqx38o2WRvP3lU3l6oBu01rz.2F.b5oTH8LItYz2o.Nx5sy94dK',NULL,'2026-07-01 03:25:06','2026-07-01 03:25:06',NULL,NULL,'admin',1,'active',NULL),(4,'Francisco Magalona','francisco@gmail.com',3,NULL,NULL,'$2y$12$YxrAZxrGXbxDFruDIGymYucwyiM.22/oJrQsO2.Bapo42VCwba/pC',NULL,'2026-07-01 03:25:46','2026-08-07 04:35:55',NULL,NULL,'admin',1,'active',NULL),(5,'lawis','lawis@gmail.com',2,'0001',NULL,'$2y$12$ixuDu1PA72MzaGMxoqk9.uljZtEdqbZygt7stTA0wx4Hv4AuNPc5W',NULL,'2026-07-06 23:39:19','2026-07-15 00:37:56',NULL,'/storage/avatars/Lpx6P2N8wNODeqZFD9yUDWnKH6fHCVlGTBWmvl0q.png','user',1,'active',NULL),(6,'Ryan Gonzales','Ryan@gmail.com',2,'0020',NULL,'$2y$12$3j83hTJuj3erxP95bvbyCOqmA/pH8x9F2HlllmM95iueZqyqXPB5m',NULL,'2026-07-13 01:21:03','2026-07-13 01:21:03',NULL,NULL,'user',0,'active',NULL),(7,'Patricia Lopez','patricia@gmail.com',2,'0019',NULL,'$2y$12$Sn395JX4ssFesGQs7fkPXuequmzyiThoudZb0DjOltp2s.nVS692O',NULL,'2026-07-13 01:22:05','2026-07-13 01:22:05',NULL,NULL,'user',0,'active',NULL),(8,'Daniel Bautista','Daniel@gmail.com',2,'0018',NULL,'$2y$12$7fsQlOKXfRmSoLV/cLDpP./Ijf13RlskbsnSmcFnchCPU2v03J/e2',NULL,'2026-07-13 01:22:49','2026-07-13 01:22:49',NULL,NULL,'user',0,'active',NULL),(9,'Michelle Fernandez','michelle@gmail.com',2,'0017',NULL,'$2y$12$ECYpSdytAyuQIvuB0Yewpe0GPrZBFp5uscsdbE/y3bRMCSwgi93Da',NULL,'2026-07-13 01:24:05','2026-07-13 01:24:05',NULL,NULL,'user',0,'active',NULL),(10,'Jennifer Castro','Jennifer@gmail.com',1,'0015',NULL,'$2y$12$Ob6UiO8Rjwc09A1RHfnvV.w3GHdUwzQ4Gb1UHDx9ttf8xALYIlY4e',NULL,'2026-07-13 01:24:59','2026-07-13 01:24:59',NULL,NULL,'user',0,'active',NULL),(11,'Paul Navaro','paul@gmail.com',1,'0014',NULL,'$2y$12$WXYGOUg2sJK1aU8T2cJLkuGaCXOzkkDkpTAh/DFsNCUe9Bi.3fpdW',NULL,'2026-07-13 01:27:45','2026-07-13 01:27:45',NULL,NULL,'user',0,'active',NULL),(12,'Angelica Torres','angelica@gmail.com',1,'0013',NULL,'$2y$12$uj9VqEVr//G.0yMJtly9HOD04WQ7Cmuslq42KRGPfD1bO6tOxZzEa',NULL,'2026-07-13 01:28:31','2026-07-13 01:28:31',NULL,NULL,'user',0,'active',NULL),(13,'Kiven Ramos','kiven@gmail.com',1,'0012',NULL,'$2y$12$NsSG0lkfNheSu6k2RhmOKuw0smcClUnwREub.8ytxhSsBIMm8mNvK',NULL,'2026-07-13 01:29:23','2026-07-13 01:29:23',NULL,NULL,'user',0,'active',NULL),(14,'Mark Lopez','mark@gmail.com',3,'0010',NULL,'$2y$12$YppQYgNkBZLFw92j099Geu7ctHpbCcdsd5wtw3GevFCQvySui/i/y',NULL,'2026-07-13 01:30:07','2026-07-13 01:30:07',NULL,NULL,'user',0,'active',NULL),(15,'Ana Garcia','ana@gmail.com',3,'0009',NULL,'$2y$12$EPUe2d.yEpBTXlDOmPOJ0.XQAuL2FWXAkTPUWtN5k9DiCzXI/N0qG',NULL,'2026-07-13 01:31:04','2026-07-13 01:57:18',NULL,NULL,'user',1,'active',NULL),(16,'Jose Reyes','jose@gmail.com',3,'0008',NULL,'$2y$12$Q.WX8n/TpDk6zUeP0k1hXORy..a8KhhZenc1gq52RKvMqAdKergMu',NULL,'2026-07-13 01:31:39','2026-07-13 01:57:15',NULL,NULL,'user',1,'active',NULL),(17,'Maria Santos','maria@gmail.com',3,'0007',NULL,'$2y$12$x01AVaVWYo9NKHnQJsJfMOXkmeawpyQX3Y9yI0rd4h/Iq9pi8vwJ2',NULL,'2026-07-13 01:32:31','2026-07-13 01:57:12',NULL,NULL,'user',1,'active',NULL),(18,'ara','ara@gmail.com',3,'0009',NULL,'$2y$12$REFnPH4ZfM3KU/zLbK9JzOMajvlCVaZl0em3um7nAiuYJS8UasVCy',NULL,'2026-07-20 06:02:23','2026-07-20 06:02:23',NULL,NULL,'user',0,'active',NULL),(19,'lawis','lawisjr@gmail.com',3,'0099',NULL,'$2y$12$Aq0tGLeKS2Xo9WZxA9Qiuupv8SbJiCKMOriec/BSAqUffuJpvUudK',NULL,'2026-08-03 12:31:39','2026-08-03 12:32:02',NULL,NULL,'user',1,'active',NULL),(20,'pels','pels@gmail.com',3,'1009',NULL,'$2y$12$knJf4FNPL0ru5JHz/SFKj.rF9sGX8PHT5aT4VPQRcxJmpgYbwitKu',NULL,'2026-08-03 12:47:33','2026-08-03 12:47:33',NULL,NULL,'user',0,'active',NULL),(21,'andrea','andrea@gmai.com',3,'1011',NULL,'$2y$12$OQnsa7v68/aWLcIu.jCJRufBcbXbCLkt.X7.2rQSYG/F045YXQh5a',NULL,'2026-08-03 13:04:30','2026-08-03 13:05:11',NULL,NULL,'user',0,'inactive',NULL),(22,'hadoken','hadoken@gmail.com',3,'1234',NULL,'$2y$12$TaujIhksrohgkvIKveG1IOQ85/rPzmnAwlj.ApJKEPJnUCeYwjxiC',NULL,'2026-08-06 13:43:29','2026-08-07 04:24:02',NULL,'/storage/avatars/xcCfiofBg5jhCkKpHOiLpcstqBqGWq9OfKhUPZOA.png','user',1,'active',NULL),(23,'france ace','france@gmail.com',3,NULL,NULL,'$2y$12$FMOFHWDImOVP9iTvCMgSI.cddjpf.CCN2eP8ZqBenZXKeOD/nIbTm',NULL,'2026-08-07 04:34:07','2026-08-07 04:35:46',NULL,NULL,'admin',1,'inactive',NULL),(24,'sarah','sarah@gmail.com',1,'0011',NULL,'$2y$12$ok10IohjLjkX1uYN7wUb2OhVI4W3i7oqcxwza7AILdOfwZcwF3q9O',NULL,'2026-08-07 07:17:03','2026-08-07 07:17:26',NULL,NULL,'user',0,'inactive',NULL),(26,'misil','misil@gmail.com',2,'0143',NULL,'$2y$12$1RVrsbglQ3unMqiXrBcLUeFN5wrCAYR7/ZqLFC8ypGTO26Lfi.vhe',NULL,'2026-08-07 07:26:00','2026-08-07 07:26:00',NULL,NULL,'user',0,'active',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12  0:27:36
