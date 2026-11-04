-- ==============================================================
-- TPC ALUMNI INFORMATION AND CAREER MANAGEMENT SYSTEM
-- Complete Database Schema + Default Data
-- Target Database: tpc_alumni
-- Compatible with: MySQL 8.0+, MariaDB 10.4+ (XAMPP / Laragon)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `tpc_alumni` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tpc_alumni`;

SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- --------------------------------------------------------------
-- 1. Table structure for `departments`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 2. Table structure for `users`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint unsigned DEFAULT NULL,
  `school_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  KEY `users_department_id_foreign` (`department_id`),
  KEY `users_school_id_index` (`school_id`),
  CONSTRAINT `users_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 3. Table structure for `graduates`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `graduates`;
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
  KEY `graduates_department_batch_index` (`department_id`,`batch_year`),
  CONSTRAINT `graduates_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 4. Table structure for `alumni_profiles`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_profiles`;
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
  `onboarding_completed` tinyint(1) NOT NULL DEFAULT '0',
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
  KEY `alumni_profiles_batch_year_index` (`batch_year`),
  KEY `alumni_profiles_department_batch_index` (`department_id`,`batch_year`),
  KEY `alumni_profiles_department_status_index` (`department_id`,`employment_status`),
  CONSTRAINT `alumni_profiles_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alumni_profiles_graduate_id_foreign` FOREIGN KEY (`graduate_id`) REFERENCES `graduates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `alumni_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 5. Table structure for `events`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `events`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 6. Table structure for `announcements`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 7. Table structure for `job_histories`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `job_histories`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 8. Table structure for `reactions`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `reactions`;
CREATE TABLE `reactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `reactable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reactable_id` bigint unsigned NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_reaction` (`user_id`,`reactable_type`,`reactable_id`),
  KEY `reaction_lookup_index` (`reactable_type`,`reactable_id`,`type`),
  CONSTRAINT `reactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 9. Table structure for `account_activity_logs`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `account_activity_logs`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 10. Table structure for `rejection_logs`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `rejection_logs`;
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

-- --------------------------------------------------------------
-- 11. Table structure for `personal_access_tokens`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 12. Table structure for `password_reset_tokens`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 13. Table structure for `sessions`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
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

-- --------------------------------------------------------------
-- 14. Table structure for `cache` and `cache_locks`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 15. Table structure for `jobs`, `job_batches`, `failed_jobs`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `job_batches`;
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

DROP TABLE IF EXISTS `failed_jobs`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- 16. Table structure for `migrations`
-- --------------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------
-- Seed Migrations History (All 27 Migrations Registered)
-- --------------------------------------------------------------
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_05_24_025303_create_personal_access_tokens_table', 1),
(5, '2026_05_26_023511_add_google_and_role_to_users_table', 1),
(6, '2026_05_28_061955_add_role_columns_to_users_table', 1),
(7, '2026_06_20_000000_create_departments_and_update_user_roles', 1),
(8, '2026_06_20_010000_add_school_id_to_users_table', 1),
(9, '2026_06_24_000000_create_graduates_table', 1),
(10, '2026_06_24_000001_create_alumni_profiles_table', 1),
(11, '2026_06_24_000002_create_events_table', 1),
(12, '2026_06_24_000003_create_account_activity_logs_table', 1),
(13, '2026_06_25_000000_create_announcements_table', 1),
(14, '2026_06_25_000001_create_job_histories_table', 1),
(15, '2026_06_27_030559_convert_avatar_urls_to_relative_paths', 1),
(16, '2026_06_27_074203_add_batch_year_to_alumni_profiles_table', 1),
(17, '2026_06_29_015220_add_work_alignment_to_alumni_profiles_table', 1),
(18, '2026_08_07_000001_add_announcement_details_to_announcements_table', 1),
(19, '2026_08_07_000001_add_employment_type_to_job_histories_table', 1),
(20, '2026_08_07_000002_add_attachments_to_events_table', 1),
(21, '2026_09_13_000001_add_indexes_for_department_head_admin_list', 1),
(22, '2026_09_13_000001_update_employment_status_in_alumni_profiles_table', 1),
(23, '2026_09_13_000002_correct_alumni_employment_defaults', 1),
(24, '2026_09_13_000003_add_event_announcement_indexes', 1),
(25, '2026_09_30_000001_create_reactions_table', 1),
(26, '2026_10_01_000001_add_analytics_performance_indexes', 1),
(27, '2026_10_06_000001_add_onboarding_completed_to_alumni_profiles_table', 1);

-- --------------------------------------------------------------
-- Seed 7 Official Departments (DepartmentSeeder)
-- --------------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Bachelor of Arts in English Language', NOW(), NOW(), NULL),
(2, 'Bachelor of Arts in Political Science', NOW(), NOW(), NULL),
(3, 'Bachelor of Early Childhood Education', NOW(), NOW(), NULL),
(4, 'Bachelor of Science in Accounting Information System', NOW(), NOW(), NULL),
(5, 'Bachelor of Science in Agriculture', NOW(), NOW(), NULL),
(6, 'Bachelor of Science in Criminology', NOW(), NOW(), NULL),
(7, 'Bachelor of Science in Information System', NOW(), NOW(), NULL);

-- --------------------------------------------------------------
-- Seed Default Super Admin Account (Alumni President)
-- Default Password: password
-- --------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `department_id`, `school_id`, `email_verified_at`, `password`, `remember_token`, `google_id`, `avatar`, `role`, `is_verified`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Alumni President', 'francislouieauxtero@gmail.com', NULL, 'ADM-001', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'super_admin', 1, 'active', NOW(), NOW(), NULL),
(2, 'System Administrator', 'admin@tpc.edu.ph', NULL, 'ADM-002', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'super_admin', 1, 'active', NOW(), NOW(), NULL);

-- --------------------------------------------------------------
-- Seed Official Sample Graduates & Alumni Accounts (RestoredAlumniSeeder)
-- Default Password for sample accounts: password
-- --------------------------------------------------------------
INSERT INTO `graduates` (`id`, `department_id`, `student_number`, `name`, `batch_year`, `course`, `block`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 7, '2023-1-4001', 'Peter Paul B Polestico', '2026-2027', 'BSIS', 'Block 1', NOW(), NOW(), NULL),
(2, 4, '2022-1-2390', 'Kahryll Fernandez', '2025-2026', 'BSAIS', 'Block 1', NOW(), NOW(), NULL),
(3, 7, '2023-2-2878', 'Princess Mae E. Gonzaga', '2026-2027', 'BSIS', 'Block 1', NOW(), NOW(), NULL),
(4, 7, '2023-1-3990', 'Paul Christian O. Mendez', '2026-2027', 'BSIS', 'Block 1', NOW(), NOW(), NULL),
(5, 7, '2023-1-4089', 'Francis Louie Auxtero', '2026-2027', 'BSIS', 'Block 1', NOW(), NOW(), NULL),
(6, 7, '2023-1-3987', 'Geralden B. Cutamora', '2026-2027', 'BSIS', 'Block 1', NOW(), NOW(), NULL),
(7, 3, '2023-1-1234', 'Maria Santos', '2026-2027', 'BECE', 'Block 1', NOW(), NOW(), NULL),
(8, 2, '2023-1-5678', 'Juan Dela Cruz', '2026-2027', 'BAPolSci', 'Block 1', NOW(), NOW(), NULL),
(9, 6, '2023-1-9012', 'Pedro Penduko', '2026-2027', 'BSCrim', 'Block 1', NOW(), NOW(), NULL);

INSERT INTO `users` (`id`, `name`, `email`, `department_id`, `school_id`, `email_verified_at`, `password`, `remember_token`, `google_id`, `avatar`, `role`, `is_verified`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Peter Paul B Polestico', 'peterpaul@gmail.com', 7, '2023-1-4001', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(4, 'Kahryll Fernandez', 'kahryll@gmail.com', 4, '2022-1-2390', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(5, 'Princess Mae E. Gonzaga', 'princess@gmail.com', 7, '2023-2-2878', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(6, 'Paul Christian O. Mendez', 'paul@gmail.com', 7, '2023-1-3990', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(7, 'Francis Louie Auxtero', 'francislouie@gmail.com', 7, '2023-1-4089', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(8, 'Geralden B. Cutamora', 'geralden@gmail.com', 7, '2023-1-3987', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(9, 'Maria Santos', 'maria@gmail.com', 3, '2023-1-1234', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(10, 'Juan Dela Cruz', 'juan@gmail.com', 2, '2023-1-5678', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL),
(11, 'Pedro Penduko', 'pedro@gmail.com', 6, '2023-1-9012', NOW(), '$2y$12$KlVBPtLed//w34LdvSLOtez6ksQWWM6QX.oiDj688B/60gYq1H/Yu', NULL, NULL, NULL, 'user', 1, 'active', NOW(), NOW(), NULL);

INSERT INTO `alumni_profiles` (`id`, `user_id`, `department_id`, `graduate_id`, `contact_number`, `location`, `profile_photo_url`, `current_job`, `company`, `employment_status`, `onboarding_completed`, `is_work_aligned`, `work_aligned_reason`, `batch_year`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 3, 7, 1, '09123456789', 'Talibon, Bohol', NULL, 'Junior Web Developer', 'Tech Corp', 'employed', 1, 1, 'Software development directly aligns with BSIS curriculum', '2026-2027', NOW(), NOW(), NULL),
(2, 4, 4, 2, '09234567890', 'Tagbilaran City, Bohol', NULL, 'Accounting Assistant', 'Bohol Finance Inc', 'employed', 1, 1, 'Accounting procedures match BSAIS degree', '2025-2026', NOW(), NOW(), NULL),
(3, 5, 7, 3, '09345678901', 'Trinidad, Bohol', NULL, 'Data Analyst', 'Data Solutions Ltd', 'employed', 1, 1, 'Database management directly aligns with BSIS', '2026-2027', NOW(), NOW(), NULL),
(4, 6, 7, 4, '09456789012', 'Bien Unido, Bohol', NULL, NULL, NULL, 'unemployed', 1, NULL, NULL, '2026-2027', NOW(), NOW(), NULL),
(5, 7, 7, 5, '09567890123', 'Talibon, Bohol', NULL, 'Freelance Full-Stack Developer', 'Self-Employed', 'self_employed', 1, 1, 'Building web applications directly aligns with BSIS', '2026-2027', NOW(), NOW(), NULL),
(6, 8, 7, 6, '09678901234', 'San Miguel, Bohol', NULL, NULL, NULL, 'unemployed', 1, NULL, NULL, '2026-2027', NOW(), NOW(), NULL),
(7, 9, 3, 7, '09789012345', 'Ubay, Bohol', NULL, 'Preschool Teacher', 'Little Angels Academy', 'employed', 1, 1, 'Teaching early learners aligns with BECE', '2026-2027', NOW(), NOW(), NULL),
(8, 10, 2, 8, '09890123456', 'Talibon, Bohol', NULL, 'Administrative Officer', 'LGU Talibon', 'employed', 1, 1, 'Public governance aligns with Political Science', '2026-2027', NOW(), NOW(), NULL),
(9, 11, 6, 9, '09901234567', 'Inabanga, Bohol', NULL, 'Security Specialist', 'SafeGuard Security', 'employed', 1, 1, 'Law enforcement & security aligns with Criminology', '2026-2027', NOW(), NOW(), NULL);

INSERT INTO `job_histories` (`id`, `user_id`, `company`, `position`, `industry`, `start_date`, `end_date`, `is_current`, `employment_type`, `is_employer_updated`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 3, 'Tech Corp', 'Junior Web Developer', 'Information Technology', '2026-06-01', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL),
(2, 4, 'Bohol Finance Inc', 'Accounting Assistant', 'Finance & Banking', '2025-07-01', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL),
(3, 5, 'Data Solutions Ltd', 'Data Analyst', 'Data Analytics', '2026-06-15', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL),
(4, 7, 'Self-Employed', 'Freelance Full-Stack Developer', 'Freelance / Technology', '2026-05-01', NULL, 1, 'Self-employed', 0, NOW(), NOW(), NULL),
(5, 9, 'Little Angels Academy', 'Preschool Teacher', 'Education', '2026-06-01', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL),
(6, 10, 'LGU Talibon', 'Administrative Officer', 'Government / Public Administration', '2026-06-01', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL),
(7, 11, 'SafeGuard Security', 'Security Specialist', 'Security & Law Enforcement', '2026-06-01', NULL, 1, 'Full-time', 0, NOW(), NOW(), NULL);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;
SET SQL_NOTES=@OLD_SQL_NOTES;

