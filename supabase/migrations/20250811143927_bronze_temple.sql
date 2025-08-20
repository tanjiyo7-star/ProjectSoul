@@ .. @@
 -- Table structure for table `notifications`
 --

 CREATE TABLE `notifications` (
   `id` int(11) NOT NULL,
   `fromUserId` int(11) NOT NULL,
   `toUserId` int(11) NOT NULL,
   `postId` int(11) DEFAULT NULL,
   `message` text NOT NULL,
   `status` enum('unread','read') DEFAULT 'unread',
   `created_at` timestamp NOT NULL DEFAULT current_timestamp()
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

+-- --------------------------------------------------------
+
+--
+-- Table structure for table `stories`
+--
+
+CREATE TABLE `stories` (
+  `id` int(11) NOT NULL,
+  `userId` int(11) NOT NULL,
+  `media` varchar(255) NOT NULL,
+  `mediaType` enum('image','video') DEFAULT 'image',
+  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
+  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 24 hour)
+) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
+
+-- --------------------------------------------------------
+
+--
+-- Add is_read column to messages table
+--
+
+ALTER TABLE `messages` ADD COLUMN `is_read` tinyint(1) DEFAULT 0;