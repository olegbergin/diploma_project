-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: project_db
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.2

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
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `business_id` int NOT NULL,
  `service_id` int NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled_by_user','cancelled_by_business','not_arrived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `customer_id` (`customer_id`),
  KEY `business_id` (`business_id`),
  KEY `service_id` (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (57,9,5,1,'2025-06-12 10:00:00','confirmed','מתחילה, צריכה מזרן יוגה','2025-06-10 18:31:13'),(58,12,5,2,'2025-06-13 18:00:00','confirmed','מתרגלת קבועה, מעדיפה מקום ליד החלון','2025-06-10 18:31:13'),(59,13,6,4,'2025-06-14 09:00:00','pending','רוצה ללמוד להכין לחם לשבת','2025-06-10 18:31:13'),(60,14,6,6,'2025-06-15 08:30:00','confirmed','חוגגים יום נישואין','2025-06-10 18:31:13'),(61,15,7,7,'2025-06-11 08:00:00','completed','מאזדה 3, שנת 2020','2025-06-10 18:31:13'),(62,16,7,8,'2025-06-12 14:00:00','confirmed','טויוטה קורולה, טסט בעוד שבועיים','2025-06-10 18:31:13'),(63,17,8,10,'2025-06-13 11:00:00','pending','פודל צעצוע, גוזז קצר בקיץ','2025-06-10 18:31:13'),(64,9,8,12,'2025-06-14 15:30:00','confirmed','גולדן רטריבר, פרווה סבוכה','2025-06-10 18:31:13'),(65,12,9,13,'2025-06-15 12:00:00','confirmed','משלוח לאמא ליום הולדת - כתובת: רמת גן, ביאליק 15','2025-06-10 18:31:13'),(66,13,9,14,'2025-06-16 18:00:00','pending','לחתונה באולם \"הגן הלבן\", 50 סידורי שולחן','2025-06-10 18:31:13'),(67,14,10,16,'2025-06-11 09:00:00','completed','בעיקר בגדי עבודה','2025-06-10 18:31:13'),(68,15,10,17,'2025-06-12 10:00:00','confirmed','חליפה כחולה, יש כתם על הדש','2025-06-10 18:31:13'),(69,37,5,12,'2025-07-28 14:00:00','pending','Test appointment','2025-07-26 14:10:08');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `business_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `businesses_chk_1` CHECK (json_valid(`photos`)),
  CONSTRAINT `businesses_chk_2` CHECK (json_valid(`schedule`))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (5,8,'יוגה סטודיו שאנטי','ספורט ובריאות','סטודיו ליוגה וויניאסה, אשטנגה ומדיטציה. שיעורים לכל הרמות באווירה שלווה ונעימה.','תל אביב, רחוב שינקין 15','[\"/images/yoga_studio.jpg\", \"/images/yoga_studio2.jpg\"]','{\"יום ראשון\": \"08:00-21:00\", \"יום שני\": \"08:00-21:00\", \"יום שלישי\": \"08:00-21:00\", \"יום רביעי\": \"08:00-21:00\", \"יום חמישי\": \"08:00-21:00\", \"יום שישי\": \"08:00-14:00\", \"יום שבת\": \"סגור\"}','2025-06-08 12:25:43'),(6,9,'מאפיית הבוטיק של יעל','אוכל וקפה','לחמי מחמצת, עוגות שמרים, קרואסונים בעבודת יד וקפה איכותי. הכל נאפה במקום מדי בוקר.','רמת גן, רחוב ביאליק 22','[\"/images/bakery_yael.jpg\"]','{\"ימים א-ה\": \"07:00-19:00\", \"יום ו\": \"07:00-15:00\", \"שבת\": \"סגור\"}','2025-06-08 12:25:43'),(7,10,'מוסך הגלגל המהיר','רכב ותחבורה','מוסך מורשה לכל סוגי הרכבים. טיפולים תקופתיים, הכנה לטסט, דיאגנוסטיקה ממוחשבת.','פתח תקווה, אזור תעשייה סגולה','[\"/images/garage_fast.jpg\"]','{\"ימים א-ה\": \"07:30-17:00\", \"יום ו\": \"07:30-13:00\", \"שבת\": \"סגור\"}','2025-06-08 12:25:43'),(8,8,'חנות חיות \"חברים על ארבע\"','חיות מחמד','מזון וציוד איכותי לכלבים, חתולים ומכרסמים. שירותי מספרה לכלבים במקום.','הרצליה, סוקולוב 50','[\"/images/pet_shop.jpg\", \"/images/pet_grooming.jpg\"]','{\"ימים א-ה\": \"09:00-20:00\", \"יום ו\": \"09:00-15:00\", \"שבת\": \"סגור\"}','2025-06-08 12:25:43'),(9,9,'פרחי יעל - משלוחים','מתנות ופרחים','סידורי פרחים מרהיבים לכל אירוע. זרים, עציצים ומתנות. משלוחים בכל אזור המרכז.','גבעתיים, כצנלסון 112','[\"/images/flowers_yael.jpg\"]','{\"ימים א-ה\": \"08:30-19:30\", \"יום ו\": \"08:30-14:30\", \"שבת\": \"סגור\"}','2025-06-08 12:25:43'),(10,10,'מכבסה אקספרס \"נקי ומהיר\"','שירותי ניקיון','שירותי כביסה, גיהוץ וניקוי יבש לפרטיים ולעסקים. שירות מהיר ואדיב.','באר שבע, רחוב רינגלבלום 18','[\"/images/laundry_express.jpg\"]','{\"ימים א-ה\": \"08:00-19:00\", \"יום ו\": \"08:00-13:00\", \"שבת\": \"סגור\"}','2025-06-08 12:25:43'),(11,29,'Test Business','Services','Test business for development and testing','Test City, Test Street 123','[]','{\"Sunday\": \"09:00-17:00\", \"Monday\": \"09:00-17:00\", \"Tuesday\": \"09:00-17:00\", \"Wednesday\": \"09:00-17:00\", \"Thursday\": \"09:00-17:00\", \"Friday\": \"09:00-13:00\", \"Saturday\": \"Closed\"}','2025-07-21 15:07:38'),(12,36,'Test Business','Test','Test description for testing','','[]','{}','2025-07-26 13:54:19'),(13,37,'מרפאת דוד כהן','בריאות ורפואה','מרפאה פרטית המתמחה ברפואה כללית ורפואת משפחה. טיפול מקצועי ואישי לכל המשפחה.','רחוב הרופאים 15, תל אביב','[]','{\"שעות פעילות\": \"ראשון-חמישי 8:00-18:00, שישי 8:00-13:00\"}','2025-07-26 13:54:39'),(14,39,'סלון יופי מירי','יופי וטיפוח','סלון יופי מוביל המציע שירותי עיצוב שיער, איפור וטיפוח. צוות מקצועי ומנוסה במרכז העיר.','שדרות רוטשילד 45, תל אביב','[]','{\"שעות פעילות\": \"ראשון-חמישי 9:00-19:00, שישי 9:00-15:00\"}','2025-07-26 14:17:59'),(15,40,'מוסך אוטו פיקס','שירותים מקצועיים','מוסך מוביל לתיקון רכבים עם 20 שנות ניסיון. שירותי אבחון ממוחשב, החלפת שמן, בלמים וצמיגים.','האזור התעשייתי 12, חולון','[]','{\"שעות פעילות\": \"ראשון-חמישי 7:30-17:00, שישי 7:30-13:00\"}','2025-07-26 14:43:04'),(16,41,'קורנר קפה','מזון ומשקאות','בית קפה אינטימי עם קפה טרי, מאפים ביתיים וארוחות בוקר מפנקות. אווירה נעימה במרכז העיר.','רחוב הרצל 28, רמת גן','[]','{\"שעות פעילות\": \"ראשון-חמישי 7:00-20:00, שישי 7:00-16:00, שבת 8:00-15:00\"}','2025-07-26 16:59:41');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `business_id` int NOT NULL,
  `rating` tinyint unsigned NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `customer_id` (`customer_id`),
  KEY `business_id` (`business_id`),
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Services',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`service_id`),
  KEY `business_id` (`business_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (10,5,'שיעור יוגה ויניאסה למתחילים',60.00,60,'שיעור יוגה זורמת למתחילים, כולל תרגילי נשימה והרפיה','2025-06-10 18:29:35','Services',1),(11,5,'יוגה אשטנגה למתקדמים',80.00,90,'שיעור אינטנסיבי למתרגלים מנוסים','2025-06-10 18:29:35','Services',1),(12,5,'סדנת מדיטציה',50.00,45,'סדנה להרגעה ומיקוד מחשבתי','2025-06-10 18:29:35','Services',1),(13,6,'סדנת אפיית לחם מחמצת',150.00,180,'לומדים להכין לחם מחמצת מתחילתו ועד סופו','2025-06-10 18:29:35','Services',1),(14,6,'סדנת קרואסונים צרפתיים',200.00,240,'סדנה מקצועית להכנת קרואסונים וממאפי בוטיק','2025-06-10 18:29:35','Services',1),(15,6,'ארוחת בוקר זוגית',120.00,60,'ארוחת בוקר מפנקת עם מאפים טריים','2025-06-10 18:29:35','Services',1),(16,7,'טיפול 10,000',350.00,90,'טיפול תקופתי מלא כולל החלפת שמנים ופילטרים','2025-06-10 18:29:35','Services',1),(17,7,'בדיקה לפני טסט',150.00,60,'בדיקה מקיפה והכנה לטסט רישוי','2025-06-10 18:29:35','Services',1),(18,7,'דיאגנוסטיקה ממוחשבת',200.00,45,'בדיקת תקלות באמצעות מחשב דיאגנוסטי','2025-06-10 18:29:35','Services',1),(19,8,'תספורת לכלב קטן',120.00,60,'תספורת מקצועית לכלבים עד 10 קג','2025-06-10 18:29:35','Services',1),(20,8,'תספורת לכלב גדול',180.00,90,'תספורת מקצועית לכלבים מעל 10 קג','2025-06-10 18:29:35','Services',1),(21,8,'רחיצה וייבוש',80.00,45,'רחיצה עם שמפו מיוחד וייבוש מקצועי','2025-06-10 18:29:35','Services',1),(22,9,'זר פרחים קלאסי',120.00,30,'זר פרחים יפהפה בסגנון קלאסי','2025-06-10 18:29:35','Services',1),(23,9,'סידור פרחים לאירוע',500.00,120,'סידור פרחים מרשים לאירועים','2025-06-10 18:29:35','Services',1),(24,9,'משלוח עציץ פורח',150.00,30,'עציץ פורח עם משלוח עד הבית','2025-06-10 18:29:35','Services',1),(25,10,'כביסה וקיפול - עד 8 קג',40.00,120,'שירות כביסה וקיפול סטנדרטי','2025-06-10 18:29:35','Services',1),(26,10,'ניקוי יבש לחליפה',60.00,1440,'ניקוי יבש מקצועי לחליפות','2025-06-10 18:29:35','Services',1),(27,10,'גיהוץ חולצות - 10 יחידות',50.00,60,'גיהוץ מקצועי לחולצות','2025-06-10 18:29:35','Services',1),(28,11,'Basic Service',50.00,30,'A basic service offering','2025-07-21 15:07:55','Services',1),(29,11,'Premium Service',100.00,60,'A premium service with more features','2025-07-21 15:07:55','Services',1),(30,11,'Consultation',75.00,45,'Professional consultation service','2025-07-21 15:07:55','Services',1),(31,16,'blabla',40.00,30,'bla blablablabla','2025-07-28 14:49:38','Services',1);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','business','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (28,'Test','User','user@mail.com','0501234567','$2b$10$miR.eUCfUAAacvFjVDwKheSITE6wqN37mvmBUb4b3xMoBhBIM2ISi','customer','2025-07-21 15:06:48'),(29,'Business','Owner','business@mail.com','0507654321','$2b$10$SpdyHboDChAVky42i.qkGOCfLe0xB9uAc5DZ2Xbqwf6XuQh3vjOvG','business','2025-07-21 15:07:10'),(30,'Admin','User','admin@mail.com','0509876543','$2b$10$b7aXiNkdv3BpE0tD4.UiY.OT9fTs3Ea0WLWWc.TbwAw0ULNm9Vi6G','admin','2025-07-21 15:08:22'),(31,'oleg','bergin','oleg.bragin.01@gmail.com','0509951290','$2b$10$JU2Y4STZMOOu7f3spsGrm.Akr7V4WibFvX8j35gvb/OBnJiTHMVxC','customer','2025-07-23 15:18:23'),(36,'Test','User','test@test.com',NULL,'$2b$10$JEUhc3PEbHBlEb4hINvtBO6h8T8pGGPuPB0BqNJGVn1at4b3Ch2ZO','business','2025-07-26 13:54:19'),(37,'דוד','כהן','david.cohen@clinic.co.il','050-1234567','$2b$10$hPAOSCQHcvBAo0Fmbf4cUugBR89Y4wpj54J3VI0dPWibvzzc3DaNe','business','2025-07-26 13:54:39'),(39,'מירי','לוי','miri.levy@beautysalon.co.il','052-9876543','$2b$10$ysPhiYaknGLIMRxOFSh/POhrg9qjol8MPpt6vopvBZAUHoKUKpuX2','business','2025-07-26 14:17:59'),(40,'אבי','שמואל','avi.shmuel@autofix.co.il','054-7788990','$2b$10$Y69eT0D0cjL.Fy6uUXMQ6uP3bha.Co/pF73nc2cMpgEeadYR.hm/S','business','2025-07-26 14:43:04'),(41,'דני','כהן','danny.cohen@cornercafe.co.il','054-9876543','$2b$10$fbw1J3uTim3FKXQxAO4gOuJUs1eietBPphhpEx8bAo2rdw5qv3Xt6','business','2025-07-26 16:59:41');
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

-- Dump completed on 2025-08-04 17:31:54
