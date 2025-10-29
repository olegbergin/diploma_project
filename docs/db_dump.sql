-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Окт 29 2025 г., 21:07
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `project_db`
--
DROP DATABASE IF EXISTS `project_db`;
CREATE DATABASE IF NOT EXISTS `project_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `project_db`;

-- --------------------------------------------------------

--
-- Структура таблицы `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled_by_user','cancelled_by_business','not_arrived') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `appointments`
--

INSERT INTO `appointments` (`appointment_id`, `customer_id`, `business_id`, `service_id`, `appointment_datetime`, `status`, `notes`, `created_at`) VALUES
(1, 9, 1, 1, '2025-01-15 10:00:00', 'confirmed', 'תספורת ראשונה אחרי הלידה', '2025-01-10 13:30:00'),
(2, 10, 1, 2, '2025-01-15 14:00:00', 'confirmed', 'רוצה לחזור לחום טבעי', '2025-01-11 07:15:00'),
(3, 11, 1, 5, '2025-01-16 09:00:00', 'pending', 'שיער מתולתל וקשה', '2025-01-13 15:45:00'),
(4, 12, 1, 6, '2025-01-18 15:00:00', 'confirmed', 'חתונה של חברה הטובה', '2025-01-12 10:20:00'),
(5, 13, 1, 3, '2025-01-20 11:30:00', 'pending', 'רוצה פן קצר אבל נשאר נשי', '2025-01-14 08:10:00'),
(6, 9, 2, 8, '2025-01-15 16:00:00', 'confirmed', 'צבע ורוד עדין', '2025-01-12 12:30:00'),
(7, 14, 2, 10, '2025-01-16 10:00:00', 'confirmed', 'מניקור לחתונה בעוד שבוע', '2025-01-10 16:00:00'),
(8, 15, 2, 13, '2025-01-17 13:00:00', 'pending', 'רוצה משהו בסגנון צרפתי', '2025-01-15 09:30:00'),
(9, 16, 2, 11, '2025-01-19 14:30:00', 'confirmed', 'פדיקור לפני חופשה', '2025-01-13 14:20:00'),
(10, 10, 2, 14, '2025-01-21 11:00:00', 'pending', 'עיצוב עם פרחים קטנים', '2025-01-16 07:45:00'),
(11, 11, 3, 15, '2025-01-15 11:00:00', 'confirmed', 'טיפול ראשון, עור רגיש', '2025-01-08 13:30:00'),
(12, 17, 3, 16, '2025-01-16 15:00:00', 'confirmed', 'גיל 45, רוצה טיפול נגד קמטים', '2025-01-09 10:15:00'),
(13, 18, 3, 17, '2025-01-18 10:00:00', 'pending', 'עיסוי לכאבי גב כרוניים', '2025-01-14 15:20:00'),
(14, 12, 3, 18, '2025-01-19 13:30:00', 'confirmed', 'מתנה לעצמי ליום הולדת', '2025-01-12 17:45:00'),
(15, 19, 3, 19, '2025-01-22 16:00:00', 'pending', 'שמעתי המלצות נפלאות', '2025-01-17 12:10:00'),
(16, 13, 4, 21, '2025-01-25 09:00:00', 'confirmed', 'חתונה ב-15 בפברואר', '2025-01-10 14:30:00'),
(17, 14, 4, 22, '2025-01-16 10:30:00', 'confirmed', 'רוצה משהו מרענן', '2025-01-13 09:20:00'),
(18, 20, 4, 23, '2025-01-17 14:00:00', 'pending', 'שורשים כל 6 שבועות', '2025-01-15 07:40:00'),
(19, 15, 4, 26, '2025-02-01 11:00:00', 'pending', 'חבילה מלאה לכלה - ניסיון ב-25.1', '2025-01-16 13:50:00'),
(20, 16, 4, 25, '2025-01-20 15:30:00', 'confirmed', 'יום נישואין כסף', '2025-01-14 11:25:00'),
(21, 17, 5, 27, '2025-02-15 08:00:00', 'confirmed', 'כלה - חתונה בערב', '2025-01-15 08:30:00'),
(22, 11, 5, 28, '2025-01-18 17:00:00', 'confirmed', 'יום נישואין', '2025-01-12 12:20:00'),
(23, 18, 5, 29, '2025-01-19 10:00:00', 'pending', 'רוצה ללמוד איפור לבד', '2025-01-16 14:45:00'),
(24, 19, 5, 30, '2025-01-21 15:00:00', 'confirmed', 'צילומי פורטרט מקצועיים', '2025-01-17 09:15:00'),
(25, 12, 5, 32, '2025-02-14 13:00:00', 'pending', 'חבילה לכלה + איפור לאמא', '2025-01-18 07:30:00'),
(26, 20, 6, 33, '2025-01-16 11:00:00', 'confirmed', 'הרמה ראשונה, ריסים קצרים', '2025-01-11 15:30:00'),
(27, 13, 6, 34, '2025-01-17 13:30:00', 'confirmed', 'רוצה מראה טבעי', '2025-01-13 13:20:00'),
(28, 14, 6, 35, '2025-01-19 10:00:00', 'pending', 'ריסים רוסיות לחתונה', '2025-01-15 10:40:00'),
(29, 15, 6, 37, '2025-01-22 14:00:00', 'confirmed', 'מילוי אחרי 3 שבועות', '2025-01-18 14:10:00'),
(30, 9, 6, 39, '2025-01-24 16:30:00', 'pending', 'צביעה בחום כהה', '2025-01-19 08:50:00'),
(31, 16, 7, 40, '2025-01-15 14:00:00', 'confirmed', 'גבות עבות, רוצה עיצוב דרמטי', '2025-01-10 09:30:00'),
(32, 17, 7, 42, '2025-01-16 15:30:00', 'confirmed', 'צביעה ראשונה', '2025-01-12 11:45:00'),
(33, 18, 7, 43, '2025-01-18 10:30:00', 'pending', 'עיצוב וצביעה יחד', '2025-01-14 14:20:00'),
(34, 19, 7, 45, '2025-01-20 12:00:00', 'confirmed', 'פיגמנטציה - התייעצות ראשונה', '2025-01-16 16:15:00'),
(35, 20, 7, 44, '2025-01-22 11:00:00', 'pending', 'שעווה לכל הפנים', '2025-01-17 12:30:00'),
(36, 10, 8, 46, '2025-01-20 10:00:00', 'confirmed', 'בוטוקס ראשון, גיל 35', '2025-01-08 14:45:00'),
(37, 11, 8, 47, '2025-01-22 14:30:00', 'pending', 'מילוי שפתיים דק', '2025-01-15 10:20:00'),
(38, 12, 8, 48, '2025-01-24 11:00:00', 'confirmed', 'פילינג לטיפול בכתמי השמש', '2025-01-16 13:40:00'),
(39, 13, 8, 49, '2025-01-25 09:30:00', 'pending', 'הסרת שיער - רגליים', '2025-01-18 15:10:00'),
(40, 14, 8, 50, '2025-01-26 16:00:00', 'confirmed', 'טיפול פנים לעור שמן', '2025-01-19 11:25:00'),
(41, 15, 1, 4, '2024-12-20 10:00:00', 'completed', 'הבהרות יפות מאוד!', '2024-12-15 12:30:00'),
(42, 16, 2, 9, '2024-12-18 15:00:00', 'completed', 'מניקור מושלם לחגים', '2024-12-10 09:20:00'),
(43, 17, 3, 20, '2024-12-22 13:00:00', 'completed', 'עיסוי מדהים, אחזור', '2024-12-17 14:40:00'),
(44, 18, 4, 24, '2024-12-19 11:30:00', 'completed', 'טיפול שיער מעולה', '2024-12-14 07:15:00'),
(45, 19, 5, 31, '2024-12-25 09:00:00', 'completed', 'איפור יומיומי מושלם', '2024-12-20 10:50:00'),
(46, 20, 6, 36, '2025-01-10 14:00:00', 'cancelled_by_user', 'נדחה בגלל מחלה', '2025-01-05 08:30:00'),
(47, 9, 7, 41, '2025-01-12 16:00:00', 'cancelled_by_business', 'עובדת חלתה', '2025-01-08 13:20:00'),
(48, 10, 8, 51, '2025-01-14 12:00:00', 'cancelled_by_user', 'שינוי תוכניות', '2025-01-10 15:45:00'),
(49, 19, 11, 53, '2025-09-01 10:00:00', 'confirmed', 'First appointment with New Salon', '2025-08-22 17:20:17'),
(50, 19, 11, 53, '2025-09-02 11:00:00', 'confirmed', 'Second appointment with New Salon', '2025-08-22 17:20:17'),
(51, 19, 2, 7, '2025-09-03 14:00:00', 'pending', 'Manicure with Yael', '2025-08-22 17:20:17'),
(52, 19, 11, 53, '2025-08-27 13:00:00', 'confirmed', NULL, '2025-08-25 18:51:46'),
(53, 19, 11, 53, '2025-08-28 10:00:00', 'confirmed', 'First appointment with New Salon', '2025-08-25 23:22:43'),
(54, 19, 11, 53, '2025-08-29 11:00:00', 'confirmed', 'Second appointment with New Salon', '2025-08-25 23:22:43'),
(55, 19, 11, 53, '2025-08-25 14:00:00', 'completed', 'Appointment this week (before today)', '2025-08-25 23:26:28'),
(56, 19, 11, 53, '2025-08-19 09:30:00', 'completed', 'Appointment last week', '2025-08-25 23:26:28'),
(57, 19, 11, 53, '2025-08-26 11:00:00', 'completed', 'Appointment today)', '2025-08-26 00:33:22'),
(58, 19, 11, 53, '2025-08-24 13:00:00', 'completed', 'Appointment this week (before today)', '2025-08-26 00:34:02'),
(59, 19, 11, 53, '2025-09-28 20:29:40', 'completed', 'First appointment with this business', '2025-09-27 17:29:40'),
(60, 19, 11, 54, '2025-10-02 20:29:40', 'completed', 'Second visit - different service', '2025-10-01 17:29:40'),
(61, 19, 11, 53, '2025-10-09 20:29:40', 'completed', 'Regular follow-up', '2025-10-08 17:29:40'),
(62, 19, 11, 54, '2025-10-13 20:29:40', '', 'Upcoming appointment', '2025-10-12 17:29:40'),
(63, 19, 11, 53, '2025-09-28 20:32:41', 'completed', 'First appointment with this business', '2025-09-27 17:32:41'),
(64, 19, 11, 54, '2025-10-02 20:32:41', 'completed', 'Second visit - different service', '2025-10-01 17:32:41'),
(65, 19, 11, 53, '2025-10-09 20:32:41', 'completed', 'Regular follow-up', '2025-10-08 17:32:41'),
(66, 19, 11, 54, '2025-10-13 20:32:41', '', 'Upcoming appointment', '2025-10-12 17:32:41'),
(67, 9, 11, 53, '2025-10-18 09:00:00', 'confirmed', 'Morning haircut appointment', '2025-10-15 07:00:00'),
(68, 10, 11, 54, '2025-10-18 10:30:00', 'confirmed', 'Hair coloring session', '2025-10-15 08:30:00'),
(69, 11, 11, 55, '2025-10-18 14:00:00', 'confirmed', 'Manicure and pedicure', '2025-10-16 05:20:00'),
(70, 12, 11, 53, '2025-10-18 16:00:00', 'confirmed', 'Evening haircut', '2025-10-16 11:45:00'),
(71, 13, 11, 54, '2025-10-19 10:00:00', 'confirmed', 'Weekend hair coloring', '2025-10-16 13:30:00'),
(72, 14, 11, 53, '2025-10-19 11:30:00', 'confirmed', 'Basic haircut', '2025-10-17 06:15:00'),
(73, 15, 11, 56, '2025-10-19 13:00:00', 'confirmed', 'Long hair treatment', '2025-10-17 09:00:00'),
(74, 16, 11, 55, '2025-10-19 15:30:00', 'confirmed', 'Nail care treatment', '2025-10-17 11:20:00'),
(75, 17, 11, 53, '2025-10-20 09:30:00', 'confirmed', 'Sunday morning haircut', '2025-10-17 14:00:00'),
(76, 18, 11, 54, '2025-10-20 11:00:00', 'confirmed', 'Deluxe coloring treatment', '2025-10-18 05:30:00'),
(77, 20, 11, 55, '2025-10-20 14:30:00', 'confirmed', 'Complete nail care', '2025-10-18 07:45:00'),
(78, 19, 11, 56, '2025-10-20 16:00:00', 'confirmed', 'Long hair styling', '2025-10-18 10:20:00'),
(79, 9, 11, 55, '2025-10-21 09:00:00', 'confirmed', 'Manicure and pedicure combo', '2025-10-18 12:00:00'),
(80, 10, 11, 53, '2025-10-21 11:00:00', 'pending', 'Regular haircut', '2025-10-19 06:00:00'),
(81, 11, 11, 54, '2025-10-21 13:30:00', 'confirmed', 'Premium hair coloring', '2025-10-19 08:30:00'),
(82, 12, 11, 56, '2025-10-21 15:00:00', 'confirmed', 'Long hair care', '2025-10-19 11:00:00'),
(83, 13, 11, 53, '2025-10-22 09:30:00', 'confirmed', 'Haircut before weekend', '2025-10-19 13:30:00'),
(84, 14, 11, 55, '2025-10-22 11:00:00', 'confirmed', 'Nail care session', '2025-10-20 05:45:00'),
(85, 15, 11, 54, '2025-10-22 13:00:00', 'pending', 'Hair coloring and treatment', '2025-10-20 07:30:00'),
(86, 16, 11, 56, '2025-10-22 15:30:00', 'confirmed', 'Long hair styling session', '2025-10-20 09:15:00'),
(87, 17, 11, 53, '2025-10-22 17:00:00', 'pending', 'Evening haircut appointment', '2025-10-20 12:00:00'),
(88, 9, 11, 53, '2025-10-15 09:00:00', 'completed', 'Morning haircut - excellent service', '2025-10-12 07:00:00'),
(89, 10, 11, 54, '2025-10-15 10:30:00', 'completed', 'Hair coloring session', '2025-10-12 08:30:00'),
(90, 11, 11, 55, '2025-10-15 13:00:00', 'completed', 'Manicure and pedicure', '2025-10-13 05:20:00'),
(91, 12, 11, 56, '2025-10-15 15:00:00', 'completed', 'Long hair treatment - very satisfied', '2025-10-13 11:45:00'),
(92, 13, 11, 53, '2025-10-15 16:30:00', 'completed', 'Evening haircut', '2025-10-13 13:00:00'),
(93, 14, 11, 54, '2025-10-16 09:30:00', 'completed', 'Deluxe hair coloring', '2025-10-13 14:30:00'),
(94, 15, 11, 53, '2025-10-16 11:00:00', 'completed', 'Basic haircut', '2025-10-14 06:15:00'),
(95, 16, 11, 55, '2025-10-16 13:30:00', 'completed', 'Nail care treatment', '2025-10-14 09:00:00'),
(96, 17, 11, 56, '2025-10-16 15:00:00', 'completed', 'Long hair styling', '2025-10-14 11:20:00'),
(97, 18, 11, 53, '2025-10-16 16:30:00', 'completed', 'End of day haircut', '2025-10-14 13:45:00'),
(98, 20, 11, 54, '2025-10-17 09:00:00', 'completed', 'Friday morning coloring', '2025-10-14 14:00:00'),
(99, 9, 11, 55, '2025-10-17 11:00:00', 'completed', 'Manicure and pedicure combo', '2025-10-15 05:30:00'),
(100, 10, 11, 53, '2025-10-17 13:00:00', 'completed', 'Quick haircut before weekend', '2025-10-15 07:45:00'),
(101, 11, 11, 56, '2025-10-17 14:30:00', 'completed', 'Long hair care session', '2025-10-15 10:20:00'),
(102, 9, 11, 53, '2025-10-11 15:06:02', 'completed', 'Completed haircut', '2025-10-07 12:06:02'),
(103, 10, 11, 54, '2025-10-11 15:06:02', 'completed', 'Completed coloring', '2025-10-07 12:06:02'),
(104, 11, 11, 55, '2025-10-12 15:06:02', 'completed', 'Completed manicure', '2025-10-08 12:06:02'),
(105, 12, 11, 53, '2025-10-12 15:06:02', 'completed', 'Completed haircut', '2025-10-08 12:06:02'),
(106, 13, 11, 54, '2025-10-13 15:06:02', 'completed', 'Completed coloring', '2025-10-09 12:06:02'),
(107, 14, 11, 56, '2025-10-13 15:06:02', 'completed', 'Completed long hair', '2025-10-09 12:06:02'),
(108, 15, 11, 53, '2025-10-14 15:06:02', 'completed', 'Completed haircut', '2025-10-10 12:06:02'),
(109, 16, 11, 55, '2025-10-14 15:06:02', 'completed', 'Completed nails', '2025-10-10 12:06:02'),
(110, 17, 11, 54, '2025-10-15 15:06:02', 'completed', 'Completed coloring', '2025-10-11 12:06:02'),
(111, 18, 11, 53, '2025-10-15 15:06:02', 'completed', 'Completed haircut', '2025-10-11 12:06:02'),
(112, 20, 11, 56, '2025-10-16 15:06:02', 'completed', 'Completed long hair treatment', '2025-10-12 12:06:02'),
(113, 9, 11, 55, '2025-10-16 15:06:02', 'completed', 'Completed manicure', '2025-10-12 12:06:02');

-- --------------------------------------------------------

--
-- Структура таблицы `businesses`
--

CREATE TABLE `businesses` (
  `business_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Дамп данных таблицы `businesses`
--

INSERT INTO `businesses` (`business_id`, `owner_id`, `name`, `category`, `description`, `location`, `city`, `photos`, `schedule`, `created_at`) VALUES
(2, 2, 'אמנות הציפורניים - יעל', 'יופי וטיפוח', 'סטודיו מקצועי לעיצוב ציפורניים. מניקור, פדיקור, הדבקת ציפורניים, ג\'ל פוליש ועיצובים אמנותיים. שימוש בחומרים איכותיים ומתקדמים.', 'רמת גן, הרצל 45', 'רמת גן', '[]', '{\"ראשון\": \"10:00-18:00\", \"שני\": \"10:00-18:00\", \"שלישי\": \"10:00-18:00\", \"רביעי\": \"10:00-18:00\", \"חמישי\": \"10:00-19:00\", \"שישי\": \"09:00-14:00\", \"שבת\": \"סגור\"}', '2025-08-22 15:54:45'),
(3, 3, 'ספא יוקרה דנה - חוויית רגיעה מושלמת', 'יופי וטיפוח', 'ספא יוקרתי המציע מגוון טיפולי פנים מתקדמים, עיסויים טיפוליים ושיטות אנטי אייג\'ינג. אווירה רגועה וטיפול אישי מקצועי.', 'הרצליה, סוקולוב 88', 'הרצליה', '[]', '{\"ראשון\": \"09:00-20:00\", \"שני\": \"09:00-20:00\", \"שלישי\": \"09:00-20:00\", \"רביעי\": \"09:00-20:00\", \"חמישי\": \"09:00-21:00\", \"שישי\": \"09:00-16:00\", \"שבת\": \"10:00-17:00\"}', '2025-08-22 15:54:45'),
(4, 4, 'הייר סטייל רונית - מעצבי השיער המובילים', 'יופי וטיפוח', 'מעצבי שיער מובילים המתמחים בחתנות, אירועים ומראה יומיומי. תסרוקות מעוצבות, צביעות אופנתיות וטיפולי שיער משקמים.', 'פתח תקווה, רוטשילד 25', 'פתח תקווה', '[]', '{\"ראשון\": \"סגור\", \"שני\": \"09:00-19:00\", \"שלישי\": \"09:00-19:00\", \"רביעי\": \"09:00-19:00\", \"חמישי\": \"09:00-20:00\", \"שישי\": \"08:00-15:00\", \"שבת\": \"סגור\"}', '2025-08-22 15:54:45'),
(5, 5, 'מייק אפ אמנות - נועה', 'יופי וטיפוח', 'מאפרת מקצועית לחתנות, אירועים וצילומים. התמחות באיפור כלות, איפור ערב ושיעורי איפור אישיים. שימוש במוצרים מובילים בעולם.', 'גבעתיים, בורוכוב 12', 'גבעתיים', '[]', '{\"ראשון\": \"10:00-17:00\", \"שני\": \"10:00-18:00\", \"שלישי\": \"10:00-18:00\", \"רביעי\": \"10:00-18:00\", \"חמישי\": \"10:00-19:00\", \"שישי\": \"09:00-14:00\", \"שבת\": \"10:00-15:00\"}', '2025-08-22 15:54:45'),
(6, 6, 'לאש טיק - הרמת ריסים ועיצוב גבות', 'יופי וטיפוח', 'מתמחים בהרמת ריסים, הדבקת ריסים, צביעה ועיצוב גבות. טכניקות מתקדמות ותוצאות טבעיות לחיזוק המראה הטבעי שלך.', 'תל אביב, אלנבי 65', 'תל אביב', '[]', '{\"ראשון\": \"09:00-18:00\", \"שני\": \"09:00-18:00\", \"שלישי\": \"09:00-18:00\", \"רביעי\": \"09:00-18:00\", \"חמישי\": \"09:00-19:00\", \"שישי\": \"08:00-14:00\", \"שבת\": \"סגור\"}', '2025-08-22 15:54:45'),
(7, 7, 'גבות פרפקט - תמר', 'יופי וטיפוח', 'מתמחים בעיצוב גבות מקצועי, שעווה, חוטים ופיגמנטציה. יצירת צורת גבות מושלמת הניתנת לפניך ולאישיותך.', 'בת ים, בן גוריון 78', 'בת ים', '[]', '{\"ראשון\": \"10:00-17:00\", \"שני\": \"10:00-18:00\", \"שלישי\": \"10:00-18:00\", \"רביעי\": \"10:00-18:00\", \"חמישי\": \"10:00-19:00\", \"שישי\": \"09:00-14:00\", \"שבת\": \"סגור\"}', '2025-08-22 15:54:45'),
(8, 8, 'קליניקת העור ליאור - טיפולי פנים מתקדמים', 'יופי וטיפוח', 'קליניקה מתקדמת לטיפולי פנים קוסמטיים. מתמחים בטיפולי לייזר, פילינג כימי, בוטוקס וחומצה היאלורונית. טיפול מקצועי ובטוח.', 'רעננה, אחוזה 95', 'רעננה', '[]', '{\"ראשון\": \"09:00-17:00\", \"שני\": \"09:00-19:00\", \"שלישי\": \"09:00-19:00\", \"רביעי\": \"09:00-19:00\", \"חמישי\": \"09:00-17:00\", \"שישי\": \"09:00-13:00\", \"שבת\": \"סגור\"}', '2025-08-22 15:54:45'),
(11, 23, 'Test Update 456', 'Hair Salon', 'Test description', 'Test Address', 'New City', '[\"/uploads/1760301223161-apn32wdn0qs.webp\",\"/uploads/1760301230912-ooran2j6p8.webp\",\"/uploads/1760301233212-sld936uo0lk.webp\"]', '{\"sunday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"},\"monday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"},\"tuesday\":{\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"},\"wednesday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"},\"thursday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"},\"friday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"14:00\"},\"saturday\":{\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"17:00\"}}', '2025-08-22 17:14:16'),
(12, 24, 'New Spa', 'Spa', 'Relaxing spa services.', '200 Old Rd, Old Town', 'Old Town', '[]', '{\"שעות פעילות\": \"Tue-Sun 10 AM - 8 PM\"}', '2025-08-22 17:14:22');

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `business_review_stats`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `business_review_stats` (
`business_id` int(11)
,`business_name` varchar(255)
,`total_reviews` bigint(21)
,`average_rating` decimal(13,2)
,`five_star_count` bigint(21)
,`four_star_count` bigint(21)
,`three_star_count` bigint(21)
,`two_star_count` bigint(21)
,`one_star_count` bigint(21)
,`responses_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `reviewable_appointments`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `reviewable_appointments` (
`appointment_id` int(11)
,`customer_id` int(11)
,`business_id` int(11)
,`service_id` int(11)
,`appointment_datetime` datetime
,`status` enum('pending','confirmed','completed','cancelled_by_user','cancelled_by_business','not_arrived')
,`business_name` varchar(255)
,`service_name` varchar(255)
,`first_name` varchar(100)
,`last_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Структура таблицы `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `rating` int(1) NOT NULL,
  `text` text DEFAULT NULL,
  `business_response` text DEFAULT NULL,
  `response_date` timestamp NULL DEFAULT NULL,
  `is_hidden` tinyint(1) DEFAULT 0,
  `hidden_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ;

--
-- Дамп данных таблицы `reviews`
--

INSERT INTO `reviews` (`review_id`, `customer_id`, `business_id`, `appointment_id`, `rating`, `text`, `business_response`, `response_date`, `is_hidden`, `hidden_reason`, `created_at`, `updated_at`) VALUES
(1, 19, 11, 56, 5, 'Excellent service! Very professional and friendly staff. The appointment was on time and exceeded my expectations. Highly recommend!', 'Thank you so much for your kind words! We are delighted to hear you had such a positive experience. We look forward to serving you again soon!', '2025-10-01 17:32:41', 0, NULL, '2025-09-30 17:32:41', '2025-10-12 17:32:41'),
(2, 19, 12, NULL, 4, 'Very good service overall. The quality was great but I had to wait a bit longer than expected. Staff was apologetic and the end result was worth it.', 'We sincerely apologize for the wait time. We have taken your feedback seriously and are working on improving our scheduling. Thank you for your patience and understanding!', '2025-10-04 17:32:41', 0, NULL, '2025-10-03 17:32:41', '2025-10-12 17:32:41'),
(3, 19, 11, 58, 5, 'Another fantastic experience! Consistency is key and this business delivers every time. The different service I tried today was just as excellent as the first one.', 'We truly appreciate your continued support and loyalty! It means the world to us that you trust us with your needs. Thank you for being such a wonderful customer!', '2025-10-07 17:32:41', 0, NULL, '2025-10-06 17:32:41', '2025-10-12 17:32:41'),
(4, 19, 12, NULL, 5, 'I am impressed! They clearly took my previous feedback to heart. No wait time this visit and the service was impeccable. This is the level of quality I was hoping for!', 'Your feedback helped us improve! We are thrilled to hear about your positive experience this time. Thank you for giving us another chance and for helping us grow!', '2025-10-11 17:32:41', 0, NULL, '2025-10-10 17:32:41', '2025-10-12 17:32:41'),
(5, 19, 11, 65, 5, 'cxascdfsadf', NULL, NULL, 0, NULL, '2025-10-12 17:34:11', NULL),
(6, 19, 11, 61, 1, 'sfasf', NULL, NULL, 0, NULL, '2025-10-12 17:34:50', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `review_complaints`
--

CREATE TABLE `review_complaints` (
  `complaint_id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `complaint_type` enum('inappropriate','fake','offensive','spam','other') NOT NULL,
  `complaint_text` text DEFAULT NULL,
  `status` enum('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(100) DEFAULT 'Services',
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `services`
--

INSERT INTO `services` (`service_id`, `business_id`, `name`, `price`, `duration_minutes`, `description`, `created_at`, `category`, `is_active`) VALUES
(1, 1, 'תספורת נשים', 120.00, 45, 'תספורת מקצועית לנשים כולל שטיפה ועיצוב', '2025-08-22 15:54:45', 'שיער', 1),
(2, 1, 'צביעה מלאה', 350.00, 120, 'צביעת שיער מלאה עם צבעים איכותיים', '2025-08-22 15:54:45', 'שיער', 1),
(3, 1, 'תספורת + פן', 180.00, 75, 'תספורת וקיצור פן מקצועי', '2025-08-22 15:54:45', 'שיער', 1),
(4, 1, 'הבהרות + טונר', 450.00, 150, 'הבהרת שיער וטונר לגוון מושלם', '2025-08-22 15:54:45', 'שיער', 1),
(5, 1, 'טיפול קרטין', 550.00, 180, 'טיפול החלקה עם קרטין למשך 4-6 חודשים', '2025-08-22 15:54:45', 'שיער', 1),
(6, 1, 'פן ועיצוב לאירוע', 220.00, 90, 'עיצוב שיער מקצועי לחתונות ואירועים', '2025-08-22 15:54:45', 'שיער', 1),
(7, 2, 'מניקור רגיל', 80.00, 45, 'מניקור בסיסי עם לק רגיל', '2025-08-22 15:54:45', 'ציפורניים', 1),
(8, 2, 'מניקור ג\'ל', 120.00, 60, 'מניקור עם לק ג\'ל עמיד', '2025-08-22 15:54:45', 'ציפורניים', 1),
(9, 2, 'פדיקור רגיל', 100.00, 60, 'פדיקור בסיסי כולל קרצוף וקרם', '2025-08-22 15:54:45', 'ציפורניים', 1),
(10, 2, 'פדיקור ג\'ל', 140.00, 75, 'פדיקור עם לק ג\'ל עמיד', '2025-08-22 15:54:45', 'ציפורניים', 1),
(11, 2, 'הדבקת ציפורניים', 180.00, 90, 'הדבקת ציפורניים מלאכותיות עם עיצוב', '2025-08-22 15:54:45', 'ציפורניים', 1),
(12, 2, 'מילוי ציפורניים', 120.00, 60, 'מילוי ציפורניים קיימות', '2025-08-22 15:54:45', 'ציפורניים', 1),
(13, 2, 'עיצוב אמנותי', 200.00, 75, 'עיצוב ציפורניים מורכב עם אמנות', '2025-08-22 15:54:45', 'ציפורניים', 1),
(14, 3, 'טיפול פנים בסיסי', 250.00, 75, 'טיפול פנים ניקוי עמוק ולחות', '2025-08-22 15:54:45', 'פנים', 1),
(15, 3, 'טיפול פנים אנטי אייג\'ינג', 420.00, 90, 'טיפול פנים נגד הזדקנות עם מכשור מתקדם', '2025-08-22 15:54:45', 'פנים', 1),
(16, 3, 'עיסוי שוודי', 280.00, 60, 'עיסוי רפואי מרגיע לכל הגוף', '2025-08-22 15:54:45', 'עיסוי', 1),
(17, 3, 'עיסוי אבנים חמות', 320.00, 75, 'עיסוי טיפולי עם אבנים חמות', '2025-08-22 15:54:45', 'עיסוי', 1),
(18, 3, 'מסכת פנים יהלום', 350.00, 60, 'מסכה מחדשת עם אבקת יהלום', '2025-08-22 15:54:45', 'פנים', 1),
(19, 3, 'טיפול אינטנסיבי לעיניים', 180.00, 45, 'טיפול מיוחד לאזור העיניים', '2025-08-22 15:54:45', 'פנים', 1),
(20, 4, 'תסרוקת לכלה', 450.00, 120, 'תסרוקת חתונה מקצועית כולל ניסיון מוקדם', '2025-08-22 15:54:45', 'שיער', 1),
(21, 4, 'תספורת + פן מעוצב', 200.00, 90, 'תספורת וסטיילינג מקצועי', '2025-08-22 15:54:45', 'שיער', 1),
(22, 4, 'צביעת שורשים', 180.00, 75, 'צביעת שורשים בלבד', '2025-08-22 15:54:45', 'שיער', 1),
(23, 4, 'טיפול שיער משקם', 150.00, 60, 'טיפול משקם לשיער פגום', '2025-08-22 15:54:45', 'שיער', 1),
(24, 4, 'פן לאירוע', 280.00, 75, 'עיצוב שיער לאירועים מיוחדים', '2025-08-22 15:54:45', 'שיער', 1),
(25, 4, 'חבילת כלה שלמה', 750.00, 240, 'חבילה כוללת: תספורת, צביעה, טיפול ותסרוקת', '2025-08-22 15:54:45', 'שיער', 1),
(26, 5, 'איפור כלה', 400.00, 90, 'איפור כלה מקצועי כולל ניסיון מוקדם', '2025-08-22 15:54:45', 'איפור', 1),
(27, 5, 'איפור ערב', 250.00, 60, 'איפור לאירועים ומסיבות', '2025-08-22 15:54:45', 'איפור', 1),
(28, 5, 'שיעור איפור אישי', 300.00, 90, 'שיעור איפור אישי ומותאם אישית', '2025-08-22 15:54:45', 'איפור', 1),
(29, 5, 'איפור לצילומים', 200.00, 45, 'איפור מקצועי לצילומים', '2025-08-22 15:54:45', 'איפור', 1),
(30, 5, 'איפור יומיומי', 150.00, 45, 'איפור טבעי ליום יום', '2025-08-22 15:54:45', 'איפור', 1),
(31, 5, 'חבילת כלה מלאה', 650.00, 150, 'ניסיון + איפור כלה + איפור לאמא', '2025-08-22 15:54:45', 'איפור', 1),
(32, 6, 'הרמת ריסים', 180.00, 75, 'הרמה וצביעת ריסים למראה טבעי', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(33, 6, 'הדבקת ריסים קלאסית', 220.00, 90, 'הדבקת ריסים אחד על אחד', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(34, 6, 'הדבקת ריסים רוסית', 320.00, 120, 'הדבקת ריסים בטכניקה רוסית עם נפח', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(35, 6, 'מילוי ריסים', 150.00, 60, 'מילוי ריסים קיימים', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(36, 6, 'הסרת ריסים', 80.00, 30, 'הסרה בטוחה של ריסים', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(37, 6, 'צביעת ריסים וגבות', 100.00, 45, 'צביעה מקצועית לריסים וגבות', '2025-08-22 15:54:45', 'ריסים ועיניים', 1),
(38, 7, 'עיצוב גבות בחוט', 80.00, 30, 'עיצוב גבות מדויק בטכניקת החוט', '2025-08-22 15:54:45', 'גבות', 1),
(39, 7, 'עיצוב גבות בשעווה', 70.00, 30, 'עיצוב גבות עם שעווה איכותית', '2025-08-22 15:54:45', 'גבות', 1),
(40, 7, 'צביעת גבות', 60.00, 20, 'צביעת גבות למראה מושלם', '2025-08-22 15:54:45', 'גבות', 1),
(41, 7, 'עיצוב וצביעה משולב', 120.00, 45, 'עיצוב וצביעת גבות במחיר מיוחד', '2025-08-22 15:54:45', 'גבות', 1),
(42, 7, 'שעווה לפנים מלא', 150.00, 45, 'הסרת שיער מכל הפנים', '2025-08-22 15:54:45', 'הסרת שיער', 1),
(43, 7, 'מיקרו פיגמנטציה', 800.00, 180, 'פיגמנטציה קבועה לגבות', '2025-08-22 15:54:45', 'גבות', 1),
(44, 8, 'טיפול בוטוקס', 1200.00, 45, 'זריקות בוטוקס לאזור המצח והעיניים', '2025-08-22 15:54:45', 'טיפולים אסתטיים', 1),
(45, 8, 'מילוי בחומצה היאלורונית', 1500.00, 60, 'מילוי קמטים עם חומצה היאלורונית', '2025-08-22 15:54:45', 'טיפולים אסתטיים', 1),
(46, 8, 'פילינג כימי עמוק', 600.00, 90, 'פילינג כימי לחידוש העור', '2025-08-22 15:54:45', 'טיפולים אסתטיים', 1),
(47, 8, 'טיפול לייזר להסרת שיער', 300.00, 45, 'הסרת שיער בלייזר - אזור לבחירה', '2025-08-22 15:54:45', 'הסרת שיער', 1),
(48, 8, 'טיפול פנים רפואי', 350.00, 75, 'טיפול פנים רפואי מתקדם', '2025-08-22 15:54:45', 'פנים', 1),
(49, 8, 'טיפול נגד צלקות', 450.00, 60, 'טיפול מתקדם להפחתת צלקות', '2025-08-22 15:54:45', 'טיפולים אסתטיים', 1),
(50, 9, 'Haircut', 50.00, 30, 'Professional haircut for men and women.', '2025-08-22 16:28:50', 'Services', 1),
(51, 9, 'Hair Coloring', 120.00, 90, 'Full hair coloring with premium products.', '2025-08-22 16:28:50', 'Services', 1),
(52, 9, 'Manicure', 25.00, 45, 'Classic manicure with nail shaping and polish.', '2025-08-22 16:28:50', 'Services', 1),
(53, 11, 'Basic Haircut', 40.00, 30, 'A standard haircut service.', '2025-08-22 17:16:03', 'Services', 1),
(54, 11, 'Deluxe Hair Coloring', 150.00, 120, 'Premium hair coloring with deep conditioning.', '2025-08-22 17:16:03', 'Services', 1),
(55, 11, 'Manicure & Pedicure', 75.00, 90, 'Complete nail care for hands and feet.', '2025-08-22 17:17:28', 'Services', 1),
(56, 11, 'long hair', 100.00, 45, 'blablablalba', '2025-08-25 22:57:48', 'Services', 1),
(57, 12, 'Relaxing Massage', 120.00, 60, 'Full body relaxation massage with essential oils', '2025-10-12 17:33:11', 'Services', 1),
(58, 12, 'Facial Treatment', 85.00, 45, 'Deep cleansing facial with moisturizing treatment', '2025-10-12 17:33:11', 'Services', 1),
(59, 12, 'Spa Package', 180.00, 90, 'Complete spa experience with massage and facial', '2025-10-12 17:33:11', 'Services', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','business','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `role`, `created_at`) VALUES
(1, 'מירי', 'כהן', 'info@mirysalon.co.il', '03-1234567', '$2b$10$example1hash', 'business', '2025-08-22 15:54:45'),
(2, 'יעל', 'לוי', 'yael.levy@nailstudio.co.il', '054-7654321', '$2b$10$example2hash', 'business', '2025-08-22 15:54:45'),
(3, 'דנה', 'אברהם', 'dana.avraham@spaluxury.co.il', '053-9876543', '$2b$10$example3hash', 'business', '2025-08-22 15:54:45'),
(4, 'רונית', 'שמיר', 'ronit.shamir@hairstyle.co.il', '050-5555555', '$2b$10$example4hash', 'business', '2025-08-22 15:54:45'),
(5, 'נועה', 'בן דוד', 'noa.bendavid@makeup.co.il', '052-7777777', '$2b$10$example5hash', 'business', '2025-08-22 15:54:45'),
(6, 'שירה', 'גולד', 'shira.gold@lashtique.co.il', '054-8888888', '$2b$10$example6hash', 'business', '2025-08-22 15:54:45'),
(7, 'תמר', 'רוזן', 'tamar.rosen@eyebrows.co.il', '053-3333333', '$2b$10$example7hash', 'business', '2025-08-22 15:54:45'),
(8, 'ליאור', 'אלון', 'lior.alon@skinclinic.co.il', '050-4444444', '$2b$10$example8hash', 'business', '2025-08-22 15:54:45'),
(9, 'שרה', 'משה', 'sarah.moshe@gmail.com', '052-1111111', '$2b$10$customer1hash', 'customer', '2025-08-22 15:54:45'),
(10, 'רחל', 'דוד', 'rachel.david@gmail.com', '054-2222222', '$2b$10$customer2hash', 'customer', '2025-08-22 15:54:45'),
(11, 'ליאת', 'שמואל', 'liat.shmuel@gmail.com', '053-4444444', '$2b$10$customer3hash', 'customer', '2025-08-22 15:54:45'),
(12, 'עינת', 'יוסף', 'einat.yosef@gmail.com', '050-3333333', '$2b$10$customer4hash', 'customer', '2025-08-22 15:54:45'),
(13, 'מיכל', 'חזן', 'michal.hazan@gmail.com', '052-5555555', '$2b$10$customer5hash', 'customer', '2025-08-22 15:54:45'),
(14, 'אורית', 'בר', 'orit.bar@gmail.com', '054-6666666', '$2b$10$customer6hash', 'customer', '2025-08-22 15:54:45'),
(15, 'דיאנה', 'כפיר', 'diana.kfir@gmail.com', '053-7777777', '$2b$10$customer7hash', 'customer', '2025-08-22 15:54:45'),
(16, 'יעל', 'פרידמן', 'yael.fridman@gmail.com', '050-8888888', '$2b$10$customer8hash', 'customer', '2025-08-22 15:54:45'),
(17, 'נטלי', 'גרין', 'natali.green@gmail.com', '052-9999999', '$2b$10$customer9hash', 'customer', '2025-08-22 15:54:45'),
(18, 'ענת', 'בלום', 'anat.bloom@gmail.com', '054-1010101', '$2b$10$customer10hash', 'customer', '2025-08-22 15:54:45'),
(19, 'Oleg', 'Bergin', 'bergin.oleg@gmail.com', '0509951291', '$2b$10$uzmth9vLGhe7aVDYt65/aOQuoqzc3Cx7TrlpUlaBCqV.foiBW8kJ2', 'customer', '2025-08-22 16:23:52'),
(20, 'Jane', 'Doe', 'jane.doe@example.com', '0987654321', '$2b$10$JubWeDJg2AGwLn.peUFwPeJHHiY2J73NgmAuuKxg2VJo3v.uE8Hc6', 'admin', '2025-08-22 16:23:52'),
(23, 'NewOwner1', 'Biz', 'newbiz1@example.com', '1111111111', '$2b$10$gtlJIp6Oq/RVCM78IcTNpeeeSdw4s5mxK6HG9UCPcvK.h0WigiFlu', 'business', '2025-08-22 17:14:16'),
(24, 'NewOwner2', 'Biz', 'newbiz2@example.com', '2222222222', '$2b$10$kvCLyWVVxw/fDJi7cKLBy.FyfziLXbLJhVZf6mFqFtUqUfC.UFUV.', 'business', '2025-08-22 17:14:22');

-- --------------------------------------------------------

--
-- Структура таблицы `user_favorites`
--

CREATE TABLE `user_favorites` (
  `user_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `user_favorites`
--

INSERT INTO `user_favorites` (`user_id`, `business_id`, `created_at`) VALUES
(19, 11, '2025-08-25 18:45:01'),
(19, 12, '2025-08-25 18:45:02'),
(23, 11, '2025-08-25 21:22:52');

-- --------------------------------------------------------

--
-- Структура для представления `business_review_stats`
--
DROP TABLE IF EXISTS `business_review_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `business_review_stats`  AS SELECT `b`.`business_id` AS `business_id`, `b`.`name` AS `business_name`, count(`r`.`review_id`) AS `total_reviews`, round(avg(`r`.`rating`),2) AS `average_rating`, count(case when `r`.`rating` = 5 then 1 end) AS `five_star_count`, count(case when `r`.`rating` = 4 then 1 end) AS `four_star_count`, count(case when `r`.`rating` = 3 then 1 end) AS `three_star_count`, count(case when `r`.`rating` = 2 then 1 end) AS `two_star_count`, count(case when `r`.`rating` = 1 then 1 end) AS `one_star_count`, count(case when `r`.`business_response` is not null then 1 end) AS `responses_count` FROM (`businesses` `b` left join `reviews` `r` on(`b`.`business_id` = `r`.`business_id` and `r`.`is_hidden` = 0)) GROUP BY `b`.`business_id`, `b`.`name` ;

-- --------------------------------------------------------

--
-- Структура для представления `reviewable_appointments`
--
DROP TABLE IF EXISTS `reviewable_appointments`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reviewable_appointments`  AS SELECT `a`.`appointment_id` AS `appointment_id`, `a`.`customer_id` AS `customer_id`, `a`.`business_id` AS `business_id`, `a`.`service_id` AS `service_id`, `a`.`appointment_datetime` AS `appointment_datetime`, `a`.`status` AS `status`, `b`.`name` AS `business_name`, `s`.`name` AS `service_name`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name` FROM ((((`appointments` `a` join `businesses` `b` on(`a`.`business_id` = `b`.`business_id`)) join `services` `s` on(`a`.`service_id` = `s`.`service_id`)) join `users` `u` on(`a`.`customer_id` = `u`.`user_id`)) left join `reviews` `r` on(`a`.`appointment_id` = `r`.`appointment_id`)) WHERE `a`.`status` = 'completed' AND `r`.`review_id` is null AND `a`.`appointment_datetime` >= current_timestamp() - interval 30 day ;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Индексы таблицы `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`business_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Индексы таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `idx_reviews_business_id` (`business_id`),
  ADD KEY `idx_reviews_customer_id` (`customer_id`),
  ADD KEY `idx_reviews_appointment_id` (`appointment_id`),
  ADD KEY `idx_reviews_created_at` (`created_at`);

--
-- Индексы таблицы `review_complaints`
--
ALTER TABLE `review_complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `idx_review_complaints_review_id` (`review_id`),
  ADD KEY `idx_review_complaints_status` (`status`);

--
-- Индексы таблицы `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Индексы таблицы `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`user_id`,`business_id`),
  ADD KEY `fk_business_favorites` (`business_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT для таблицы `businesses`
--
ALTER TABLE `businesses`
  MODIFY `business_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `review_complaints`
--
ALTER TABLE `review_complaints`
  MODIFY `complaint_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `review_complaints`
--
ALTER TABLE `review_complaints`
  ADD CONSTRAINT `review_complaints_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`review_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_complaints_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `fk_business_favorites` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_favorites` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
