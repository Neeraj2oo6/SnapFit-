-- ====================================================================
-- SnapFit Full-Stack MySQL Database Schema
-- Defines all 14 core tables for users, meals, macros, AI coach, 
-- activity logs, hydration, barcode scanning, progress, and gamification
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `snapfit_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `snapfit_db`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `dob` DATE NULL,
  `gender` ENUM('Male', 'Female', 'Other', 'Prefer not to say') DEFAULT 'Male',
  `height_cm` INT DEFAULT 175,
  `weight_kg` DECIMAL(5,2) DEFAULT 70.00,
  `goal` VARCHAR(100) DEFAULT 'Build Muscle',
  `activity_level` ENUM('Sedentary', 'Light', 'Moderate', 'Very Active') DEFAULT 'Moderate',
  `avatar_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB;

-- 2. MEALS TABLE
CREATE TABLE IF NOT EXISTS `meals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('Breakfast', 'Lunch', 'Evening Snack', 'Dinner', 'Snack') DEFAULT 'Breakfast',
  `calories` INT NOT NULL DEFAULT 0,
  `protein` INT NOT NULL DEFAULT 0,
  `carbs` INT NOT NULL DEFAULT 0,
  `fat` INT NOT NULL DEFAULT 0,
  `fiber` INT NOT NULL DEFAULT 0,
  `quantity` DECIMAL(5,2) DEFAULT 1.00,
  `serving_size` VARCHAR(100) DEFAULT '1 serving',
  `image_url` VARCHAR(500) NULL,
  `meal_date` DATE DEFAULT (CURRENT_DATE),
  `meal_time` TIME DEFAULT (CURRENT_TIME),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_meal_user_date` (`user_id`, `meal_date`)
) ENGINE=InnoDB;

-- 3. MEAL ITEMS TABLE
CREATE TABLE IF NOT EXISTS `meal_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meal_id` INT NOT NULL,
  `food_name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(5,2) DEFAULT 1.00,
  `serving_size` VARCHAR(100) DEFAULT '100g',
  `calories` INT NOT NULL DEFAULT 0,
  `protein` INT NOT NULL DEFAULT 0,
  `carbs` INT NOT NULL DEFAULT 0,
  `fat` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. NUTRITION LOGS TABLE
CREATE TABLE IF NOT EXISTS `nutrition_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `total_calories` INT DEFAULT 0,
  `total_protein` INT DEFAULT 0,
  `total_carbs` INT DEFAULT 0,
  `total_fat` INT DEFAULT 0,
  `calorie_target` INT DEFAULT 2200,
  `protein_target` INT DEFAULT 80,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_log_date` (`user_id`, `log_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. WATER LOGS TABLE
CREATE TABLE IF NOT EXISTS `water_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `glasses` INT DEFAULT 0,
  `target_glasses` INT DEFAULT 8,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_water_user_date` (`user_id`, `log_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `activity_type` VARCHAR(100) NOT NULL DEFAULT 'Workout',
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `calories_burned` INT NOT NULL DEFAULT 150,
  `steps` INT DEFAULT 0,
  `log_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_act_user_date` (`user_id`, `log_date`)
) ENGINE=InnoDB;

-- 7. PROGRESS TABLE
CREATE TABLE IF NOT EXISTS `progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `recorded_date` DATE NOT NULL,
  `weight_kg` DECIMAL(5,2) NULL,
  `health_score` INT DEFAULT 85,
  `calories_avg` INT DEFAULT 2000,
  `protein_avg` INT DEFAULT 75,
  `water_avg` DECIMAL(4,1) DEFAULT 7.0,
  `steps` INT DEFAULT 7500,
  `activity_minutes` INT DEFAULT 45,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_prog_user_date` (`user_id`, `recorded_date`)
) ENGINE=InnoDB;

-- 8. AI CHATS TABLE
CREATE TABLE IF NOT EXISTS `ai_chats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `role` ENUM('user', 'assistant', 'system') NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. BARCODE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `barcode_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `barcode` VARCHAR(64) NOT NULL UNIQUE,
  `product_name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(150) NULL,
  `serving_size` VARCHAR(100) DEFAULT '100g',
  `calories` INT NOT NULL DEFAULT 0,
  `protein` INT NOT NULL DEFAULT 0,
  `carbs` INT NOT NULL DEFAULT 0,
  `fat` INT NOT NULL DEFAULT 0,
  `fiber` INT NOT NULL DEFAULT 0,
  `ingredients` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_barcode` (`barcode`)
) ENGINE=InnoDB;

-- 10. FIT POINTS TABLE
CREATE TABLE IF NOT EXISTS `fit_points` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `points_change` INT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. STREAKS TABLE
CREATE TABLE IF NOT EXISTS `streaks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `current_streak_days` INT DEFAULT 1,
  `longest_streak_days` INT DEFAULT 1,
  `last_activity_date` DATE NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `badge_key` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_badge` (`user_id`, `badge_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. REWARDS TABLE
CREATE TABLE IF NOT EXISTS `rewards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `points_required` INT NOT NULL,
  `reward_type` VARCHAR(50) DEFAULT 'voucher',
  `icon` VARCHAR(50) DEFAULT 'Award',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. REWARD REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS `reward_redemptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `reward_id` INT NOT NULL,
  `points_spent` INT NOT NULL,
  `voucher_code` VARCHAR(50) NOT NULL,
  `status` ENUM('active', 'used', 'expired') DEFAULT 'active',
  `redeemed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DEFAULT REWARDS
INSERT INTO `rewards` (`title`, `description`, `points_required`, `reward_type`, `icon`) VALUES
('Premium Fitness Badge', 'Display exclusive golden Pro athlete badge on your profile and leaderboards.', 100, 'badge', 'ShieldCheck'),
('30-Day Fitness Challenge', 'Unlock advanced high-intensity interval training and macro cycling plans.', 250, 'challenge', 'Flame'),
('Nutrition Consultation Voucher', 'Get a 20% discount on 1-on-1 certified nutritionist meal coaching.', 500, 'voucher', 'Gift'),
('SnapFit Pro Monthly Pass', '1 Month of unlimited AI vision scans and real-time biometric analysis.', 1000, 'pro_pass', 'Crown')
ON DUPLICATE KEY UPDATE `points_required` = VALUES(`points_required`);
