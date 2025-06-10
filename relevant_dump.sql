-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2025 at 08:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Table structure for table `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Table structure for table `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Table structure for table `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

--
-- Dumping data for table `pma__designer_settings`
--

INSERT INTO `pma__designer_settings` (`username`, `settings_data`) VALUES
('root', '{\"relation_lines\":\"true\",\"angular_direct\":\"direct\",\"snap_to_grid\":\"off\"}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

--
-- Dumping data for table `pma__export_templates`
--

INSERT INTO `pma__export_templates` (`id`, `username`, `export_type`, `template_name`, `template_data`) VALUES
(1, 'root', 'server', 'dump1', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"db_select[]\":[\"phpmyadmin\",\"project_db\",\"python_articles\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@SERVER@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Structure of table @TABLE@\",\"latex_structure_continued_caption\":\"Structure of table @TABLE@ (continued)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Content of table @TABLE@\",\"latex_data_continued_caption\":\"Content of table @TABLE@ (continued)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"yaml_structure_or_data\":\"data\",\"\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_drop_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_procedure_function\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Table structure for table `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Dumping data for table `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"project_db\",\"table\":\"appointments\"},{\"db\":\"project_db\",\"table\":\"services\"},{\"db\":\"project_db\",\"table\":\"businesses\"},{\"db\":\"project_db\",\"table\":\"users\"},{\"db\":\"project_db\",\"table\":\"reviews\"},{\"db\":\"python_articles\",\"table\":\"articles\"},{\"db\":\"task2\",\"table\":\"articles\"},{\"db\":\"auth_exercise\",\"table\":\"accounts\"},{\"db\":\"school\",\"table\":\"students\"},{\"db\":\"school\",\"table\":\"students_teachers\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Table structure for table `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Table structure for table `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dumping data for table `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2025-06-10 18:18:42', '{\"Console\\/Mode\":\"collapse\",\"Console\\/Height\":307.973615,\"NavigationWidth\":181}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Table structure for table `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indexes for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indexes for table `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indexes for table `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indexes for table `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indexes for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indexes for table `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indexes for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indexes for table `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indexes for table `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indexes for table `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indexes for table `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indexes for table `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indexes for table `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Database: `project_db`
--
CREATE DATABASE IF NOT EXISTS `project_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `project_db`;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `status` enum('scheduled','completed','cancelled_by_user','cancelled_by_business','no_show') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`appointment_id`, `customer_id`, `business_id`, `service_id`, `appointment_datetime`, `status`, `notes`, `created_at`) VALUES
(57, 9, 5, 1, '2025-06-12 10:00:00', 'scheduled', 'מתחילה, צריכה מזרן יוגה', '2025-06-10 18:31:13'),
(58, 12, 5, 2, '2025-06-13 18:00:00', 'scheduled', 'מתרגלת קבועה, מעדיפה מקום ליד החלון', '2025-06-10 18:31:13'),
(59, 13, 6, 4, '2025-06-14 09:00:00', 'scheduled', 'רוצה ללמוד להכין לחם לשבת', '2025-06-10 18:31:13'),
(60, 14, 6, 6, '2025-06-15 08:30:00', 'scheduled', 'חוגגים יום נישואין', '2025-06-10 18:31:13'),
(61, 15, 7, 7, '2025-06-11 08:00:00', 'scheduled', 'מאזדה 3, שנת 2020', '2025-06-10 18:31:13'),
(62, 16, 7, 8, '2025-06-12 14:00:00', 'scheduled', 'טויוטה קורולה, טסט בעוד שבועיים', '2025-06-10 18:31:13'),
(63, 17, 8, 10, '2025-06-13 11:00:00', 'scheduled', 'פודל צעצוע, גוזז קצר בקיץ', '2025-06-10 18:31:13'),
(64, 9, 8, 12, '2025-06-14 15:30:00', 'scheduled', 'גולדן רטריבר, פרווה סבוכה', '2025-06-10 18:31:13'),
(65, 12, 9, 13, '2025-06-15 12:00:00', 'scheduled', 'משלוח לאמא ליום הולדת - כתובת: רמת גן, ביאליק 15', '2025-06-10 18:31:13'),
(66, 13, 9, 14, '2025-06-16 18:00:00', 'scheduled', 'לחתונה באולם \"הגן הלבן\", 50 סידורי שולחן', '2025-06-10 18:31:13'),
(67, 14, 10, 16, '2025-06-11 09:00:00', 'scheduled', 'בעיקר בגדי עבודה', '2025-06-10 18:31:13'),
(68, 15, 10, 17, '2025-06-12 10:00:00', 'scheduled', 'חליפה כחולה, יש כתם על הדש', '2025-06-10 18:31:13');

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `business_id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`business_id`, `owner_id`, `name`, `category`, `description`, `location`, `photos`, `schedule`, `created_at`) VALUES
(5, 8, 'יוגה סטודיו שאנטי', 'ספורט ובריאות', 'סטודיו ליוגה וויניאסה, אשטנגה ומדיטציה. שיעורים לכל הרמות באווירה שלווה ונעימה.', 'תל אביב, רחוב שינקין 15', '[\"/images/yoga_studio.jpg\", \"/images/yoga_studio2.jpg\"]', '{\"יום ראשון\": \"08:00-21:00\", \"יום שני\": \"08:00-21:00\", \"יום שלישי\": \"08:00-21:00\", \"יום רביעי\": \"08:00-21:00\", \"יום חמישי\": \"08:00-21:00\", \"יום שישי\": \"08:00-14:00\", \"יום שבת\": \"סגור\"}', '2025-06-08 12:25:43'),
(6, 9, 'מאפיית הבוטיק של יעל', 'אוכל וקפה', 'לחמי מחמצת, עוגות שמרים, קרואסונים בעבודת יד וקפה איכותי. הכל נאפה במקום מדי בוקר.', 'רמת גן, רחוב ביאליק 22', '[\"/images/bakery_yael.jpg\"]', '{\"ימים א-ה\": \"07:00-19:00\", \"יום ו\": \"07:00-15:00\", \"שבת\": \"סגור\"}', '2025-06-08 12:25:43'),
(7, 10, 'מוסך הגלגל המהיר', 'רכב ותחבורה', 'מוסך מורשה לכל סוגי הרכבים. טיפולים תקופתיים, הכנה לטסט, דיאגנוסטיקה ממוחשבת.', 'פתח תקווה, אזור תעשייה סגולה', '[\"/images/garage_fast.jpg\"]', '{\"ימים א-ה\": \"07:30-17:00\", \"יום ו\": \"07:30-13:00\", \"שבת\": \"סגור\"}', '2025-06-08 12:25:43'),
(8, 8, 'חנות חיות \"חברים על ארבע\"', 'חיות מחמד', 'מזון וציוד איכותי לכלבים, חתולים ומכרסמים. שירותי מספרה לכלבים במקום.', 'הרצליה, סוקולוב 50', '[\"/images/pet_shop.jpg\", \"/images/pet_grooming.jpg\"]', '{\"ימים א-ה\": \"09:00-20:00\", \"יום ו\": \"09:00-15:00\", \"שבת\": \"סגור\"}', '2025-06-08 12:25:43'),
(9, 9, 'פרחי יעל - משלוחים', 'מתנות ופרחים', 'סידורי פרחים מרהיבים לכל אירוע. זרים, עציצים ומתנות. משלוחים בכל אזור המרכז.', 'גבעתיים, כצנלסון 112', '[\"/images/flowers_yael.jpg\"]', '{\"ימים א-ה\": \"08:30-19:30\", \"יום ו\": \"08:30-14:30\", \"שבת\": \"סגור\"}', '2025-06-08 12:25:43'),
(10, 10, 'מכבסה אקספרס \"נקי ומהיר\"', 'שירותי ניקיון', 'שירותי כביסה, גיהוץ וניקוי יבש לפרטיים ולעסקים. שירות מהיר ואדיב.', 'באר שבע, רחוב רינגלבלום 18', '[\"/images/laundry_express.jpg\"]', '{\"ימים א-ה\": \"08:00-19:00\", \"יום ו\": \"08:00-13:00\", \"שבת\": \"סגור\"}', '2025-06-08 12:25:43');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `business_id`, `name`, `price`, `duration_minutes`, `description`, `created_at`) VALUES
(10, 5, 'שיעור יוגה ויניאסה למתחילים', 60.00, 60, 'שיעור יוגה זורמת למתחילים, כולל תרגילי נשימה והרפיה', '2025-06-10 18:29:35'),
(11, 5, 'יוגה אשטנגה למתקדמים', 80.00, 90, 'שיעור אינטנסיבי למתרגלים מנוסים', '2025-06-10 18:29:35'),
(12, 5, 'סדנת מדיטציה', 50.00, 45, 'סדנה להרגעה ומיקוד מחשבתי', '2025-06-10 18:29:35'),
(13, 6, 'סדנת אפיית לחם מחמצת', 150.00, 180, 'לומדים להכין לחם מחמצת מתחילתו ועד סופו', '2025-06-10 18:29:35'),
(14, 6, 'סדנת קרואסונים צרפתיים', 200.00, 240, 'סדנה מקצועית להכנת קרואסונים וממאפי בוטיק', '2025-06-10 18:29:35'),
(15, 6, 'ארוחת בוקר זוגית', 120.00, 60, 'ארוחת בוקר מפנקת עם מאפים טריים', '2025-06-10 18:29:35'),
(16, 7, 'טיפול 10,000', 350.00, 90, 'טיפול תקופתי מלא כולל החלפת שמנים ופילטרים', '2025-06-10 18:29:35'),
(17, 7, 'בדיקה לפני טסט', 150.00, 60, 'בדיקה מקיפה והכנה לטסט רישוי', '2025-06-10 18:29:35'),
(18, 7, 'דיאגנוסטיקה ממוחשבת', 200.00, 45, 'בדיקת תקלות באמצעות מחשב דיאגנוסטי', '2025-06-10 18:29:35'),
(19, 8, 'תספורת לכלב קטן', 120.00, 60, 'תספורת מקצועית לכלבים עד 10 קג', '2025-06-10 18:29:35'),
(20, 8, 'תספורת לכלב גדול', 180.00, 90, 'תספורת מקצועית לכלבים מעל 10 קג', '2025-06-10 18:29:35'),
(21, 8, 'רחיצה וייבוש', 80.00, 45, 'רחיצה עם שמפו מיוחד וייבוש מקצועי', '2025-06-10 18:29:35'),
(22, 9, 'זר פרחים קלאסי', 120.00, 30, 'זר פרחים יפהפה בסגנון קלאסי', '2025-06-10 18:29:35'),
(23, 9, 'סידור פרחים לאירוע', 500.00, 120, 'סידור פרחים מרשים לאירועים', '2025-06-10 18:29:35'),
(24, 9, 'משלוח עציץ פורח', 150.00, 30, 'עציץ פורח עם משלוח עד הבית', '2025-06-10 18:29:35'),
(25, 10, 'כביסה וקיפול - עד 8 קג', 40.00, 120, 'שירות כביסה וקיפול סטנדרטי', '2025-06-10 18:29:35'),
(26, 10, 'ניקוי יבש לחליפה', 60.00, 1440, 'ניקוי יבש מקצועי לחליפות', '2025-06-10 18:29:35'),
(27, 10, 'גיהוץ חולצות - 10 יחידות', 50.00, 60, 'גיהוץ מקצועי לחולצות', '2025-06-10 18:29:35');

-- --------------------------------------------------------

--
-- Table structure for table `users`
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `role`, `created_at`) VALUES
(8, 'oleg', 'oleg', 'oleg@mail.com', '0509951299', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'admin', '2025-05-25 11:25:11'),
(9, 'basic', 'user', 'user@mail.com', '0501111111', '$2b$10$w8jKhRYPMNf81DN2wLKqZ.C.PkuW.0ttI0rRkoLYjJZG9Rlbbulq.', 'customer', '2025-05-26 12:31:14'),
(10, 'admin', 'admin', 'admin@mail.com', '11111111111', '$2b$10$s0BigVR0uXq0M8/Ga/whNeuzksF1IUDVwT1jwm4QTwCff1GL8qsdO', 'admin', '2025-06-08 12:05:03'),
(11, 'business', 'business', 'business@mail.com', '22222222', '$2b$10$8fMQEm3h5W4fiV1DhEJAM.3wVakg.serj6YWRCs70Up1yRpLI9H7S', 'business', '2025-06-08 12:05:42'),
(12, 'דוד', 'כהן', 'david.cohen@mail.com', '0501234567', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35'),
(13, 'שרה', 'לוי', 'sara.levi@mail.com', '0502345678', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35'),
(14, 'משה', 'אברהם', 'moshe.avraham@mail.com', '0503456789', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35'),
(15, 'רחל', 'יוסף', 'rachel.yosef@mail.com', '0504567890', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35'),
(16, 'יעקב', 'מזרחי', 'yaakov.mizrahi@mail.com', '0505678901', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35'),
(17, 'מרים', 'פרץ', 'miriam.peretz@mail.com', '0506789012', '$2b$10$6enEDTaI3WH/jAHVKglEjuCKdn4sIe/KX0JcSf6UjYZxg.TxfWivi', 'customer', '2025-06-10 18:29:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`business_id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `business_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `businesses`
--
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) ON DELETE CASCADE;
--
-- Database: `python_articles`
--
CREATE DATABASE IF NOT EXISTS `python_articles` DEFAULT CHARACTER SET utf16 COLLATE utf16_general_ci;
USE `python_articles`;

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `subtitle` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_general_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `author`, `title`, `subtitle`) VALUES
(1, 'מערכת וואלה חדשות', 'רגע האמת של הפרקליטות ושל נתניהו הגיע - החקירה הנגדית של רה\"מ התחילה', 'בפרקליטות שומרים את הקלפים קרוב לחזה, אולם לפי ההערכה זו תפתח את החקירה בתיק המתנות (תיק 1000) שנחשב קל להוכחה. עד כה, נחקר רה\"מ בעיקר על ידי סנגורו עו\"ד עמית חדד'),
(2, 'יואב שוסטר', 'מנהיג מפלגת הימין בהולנד חירט וילדרס הודיע על פרישה מהקואליציה', 'חירט וילדרס הודיע כי מפלגתו תפרוש מהממשלה בעקבות סירוב השותפות הקואליציוניות לאמץ את תכניותיו לעצירת ההגירה - מהלך יוביל להפלת ממשלת הימין בהולנד'),
(3, 'יואב שוסטר', 'דיווח: משטרת קנדה פתחה בחקירה נגד חיילי צה\"ל עם אזרחות קנדית בחשד לפשעים נגד האנושות', 'החקירה, שנפתחה בחשאי בשקט בתחילת 2024 במסגרת תכנית לחקירת פשעי מלחמה ופשעים נגד האנושות של ממשלת קנדה, נערכה עד כה ללא פרסום פומבי בניגוד לחקירות קודמות - כולל זו בנוגע למלחמה באוקראינה'),
(4, 'אמיר בוחבוט', 'הותר לפרסום: שלושה לוחמי חטיבת גבעתי נפלו בצפון רצועת עזה', 'הלוחמים, שנהגו על ג\'יפ מסוג האמר, נהרגו לאחר שרכבם עלה על מטען. בתקרית נפצעו גם שני לוחמים באורח קשה ותשעה באורח בינוני וקל'),
(5, 'אמיר בוחבוט', 'מאבדים שליטה: 14 לוחמים נפצעו בסדרת התקלויות בעזה', 'בשתי תקריות שונות במהלך הלחימה ברצועה נפצעו שלושה חיילים במצב קשה, באחת התקריות מחבלים ירו על מסוק חילוץ של 669. הבוקר הודיע צה\"ל על נפילתם של שלושה חיילי חטיבת גבעתי שהרכב בו נסעו עלה על מטען'),
(6, 'טל שלו', 'בעוד נתניהו בורח מוועדת חקירה ממלכתית, 73% מהישראלים יקחו את זה בחשבון בבחירות הבאות', 'רה\"מ ממסמס ודוחה את הדרישה להקמת ועדת חקירה ממלכתית, אך סקר של מועצת אוקטובר מגלה עד כמה הציבור לא איתו. רוב גורף של הישראלים, כולל של תומכי הקואליציה הנוכחית, רוצה ועדת חקירה לפי החוק, וחושב שהממשלה מסרבת להקים אותה מסיבות פוליטיות ולא ענייניות'),
(7, 'אביחי חיים', 'אחד מכל חמישה ישראלים מעשן - ובחברה הערבית פי שניים', 'דוח שר הבריאות חושף: שיעור העישון בישראל גבוה ב-30% מהממוצע העולמי, וירידה איטית מהממוצע ב-OECD. שיעור המעשנים בחברה הערבית כפול; בני נוער משתמשים בעיקר בסיגריות אלקטרוניות בטעמים. משרד הבריאות: \"מגבירים את המאבק\"'),
(8, 'לירן אהרוני', 'דיווחים בעזה: 19 נהרגו כתוצאה מירי צה\"ל בזמן שהמתינו בסמוך למתחם סיוע ברפיח', 'ברצועה מדווחים פעם נוספת על אירוע ירי על תושבים שמחכים לקבלת סיוע הומניטרי, הפעם בדרום הרצועה, בסמוך לרפיח. ביום ראשון הכחיש צה\"ל את הדיווחים לפיהם נהרגו כ-30 בני אדם בתקיפת נקודת חלוקת סיוע'),
(9, 'יניר יגנה', '7 קילו חשיש וכסף ירדני: מעצר דרמטי של שוטרי יחידת יואב', 'לא פחות מ-85 פלטות חשיש נמצאו ברכבו של תושב הפזורה, בשווי מוערך של יותר מ-100 אלף שקלים. מעצרו של החשוד הוארך בבית משפט לקראת כתב אישום שצפוי להיות מוגש כנגדו'),
(10, 'סוכנויות הידיעות', 'דיווח: איראן מתכוננת לתקיפה ישראלית - ופורסת מחדש סוללות הגנה', 'לפי הערכות של גופי מודיעין במערב ותמונות לוויין שנבחנו על ידי אנליסטים בתחום הביטחון, איראן העבירה משגרים של טילים נגד מטוסים - כולל מערכות S-300 - סמוך לאתרים גרעיניים מרכזיים, כמו נתנז ופורדו'),
(11, 'מערכת וואלה חדשות', 'חצי שנה אחרי שקרוב המשפחה נפל בלבנון, עומר נפל בעזה: \"אסון נוסף פוקד אותנו\"', 'בפוסט שכתב בחשבון הפייסבוק שלו, ספד לעומר ואן גלדר שנפל בקרב ברצועה בן משפחתו, והוסיף כי מדובר באסון שני למשפחה - שלפני חצי שנה שכלה את עמר משה גאלדור. בתקרית בה נפל עומר, נפלו גם שניים מחבריו לחטיבת גבעתי, סמ\"ר אופק ברהנה וסמ\"ר ליאור שטיינברג בני ה-20'),
(12, 'הודיה רן', '\"הצילו, אבא דקר את אמא\": פרטים חדשים על הרצח בבת ים', 'הנערה בת ה-17 התקשרה למוקד מד\"א בבכי לאחר שצפתה באביה דוקר את אמה למוות בדירה. שכנים סיפרו כי שמעו את זעקותיה לעזרה מהדירה. לאחר הרצח, האב התבצר על גג הבניין במשך שעות - ולבסוף קפץ אל מותו | כך נראתה הדרמה היום ברחוב אלי כהן בבת ים'),
(13, 'מערכת וואלה חדשות', 'בגיל 92: איש העסקים משה טלנסקי הלך לעולמו', 'טלנסקי נודע כמי ששימש עד מרכזי בפרשת \"מעטפות הכסף\", שבמסגרתה הורשע ראש הממשלה לשעבר אהוד אולמרט בקבלת כספים שלא כדין, בהיותו ראש עיריית ירושלים ושר התמ\"ת.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
