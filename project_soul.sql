-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 13, 2025 at 06:09 PM
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
-- Database: `bolt`
--

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` int(11) NOT NULL,
  `type` enum('direct','group') DEFAULT 'direct',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `type`, `created_at`) VALUES
(30, 'direct', '2025-08-10 08:12:41'),
(31, 'direct', '2025-08-10 08:24:11'),
(32, 'direct', '2025-08-10 08:37:56'),
(33, 'direct', '2025-08-11 16:12:35'),
(34, 'direct', '2025-08-11 17:01:53'),
(35, 'direct', '2025-08-11 17:02:01'),
(36, 'direct', '2025-08-11 17:02:06'),
(37, 'direct', '2025-08-11 17:02:14'),
(38, 'direct', '2025-08-11 17:02:17'),
(39, 'direct', '2025-08-11 17:06:20'),
(40, 'direct', '2025-08-11 17:43:52'),
(41, 'direct', '2025-08-11 18:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `chat_participants`
--

CREATE TABLE `chat_participants` (
  `chatId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_participants`
--

INSERT INTO `chat_participants` (`chatId`, `userId`, `joined_at`) VALUES
(30, 18, '2025-08-10 08:12:41'),
(30, 19, '2025-08-10 08:12:41'),
(31, 19, '2025-08-10 08:24:11'),
(31, 20, '2025-08-10 08:24:11'),
(32, 18, '2025-08-10 08:37:56'),
(32, 20, '2025-08-10 08:37:56'),
(33, 19, '2025-08-11 16:12:35'),
(33, 20, '2025-08-11 16:12:35'),
(34, 19, '2025-08-11 17:01:53'),
(34, 20, '2025-08-11 17:01:53'),
(35, 19, '2025-08-11 17:02:01'),
(35, 20, '2025-08-11 17:02:01'),
(36, 18, '2025-08-11 17:02:06'),
(36, 20, '2025-08-11 17:02:06'),
(37, 19, '2025-08-11 17:02:14'),
(37, 20, '2025-08-11 17:02:14'),
(38, 19, '2025-08-11 17:02:17'),
(38, 20, '2025-08-11 17:02:17'),
(39, 19, '2025-08-11 17:06:20'),
(39, 20, '2025-08-11 17:06:20'),
(40, 19, '2025-08-11 17:43:52'),
(40, 20, '2025-08-11 17:43:52'),
(41, 19, '2025-08-11 18:15:37'),
(41, 20, '2025-08-11 18:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `userId`, `postId`, `content`, `created_at`) VALUES
(56, 20, 75, 'ksdjf', '2025-08-05 08:58:07'),
(57, 19, 84, 'gfdg', '2025-08-05 09:07:48'),
(58, 19, 85, 'ဟလို', '2025-08-05 09:09:02'),
(59, 20, 85, 'Hsh', '2025-08-10 09:16:38'),
(60, 19, 86, 'hi', '2025-08-11 16:59:51'),
(61, 19, 86, 'hi', '2025-08-11 16:59:59'),
(62, 19, 85, 'Hi', '2025-08-13 14:58:00'),
(63, 19, 88, 'Pritty', '2025-08-13 14:58:30'),
(64, 19, 88, 'Bdbdb', '2025-08-13 14:58:37'),
(65, 19, 88, '@\r\n                                                strategy                                               Hahh', '2025-08-13 14:58:47'),
(66, 19, 88, '👍', '2025-08-13 14:59:34'),
(67, 20, 82, '🤔', '2025-08-13 15:03:18'),
(68, 20, 82, '😍', '2025-08-13 15:03:28'),
(69, 20, 82, '@You dfs', '2025-08-13 15:03:36');

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `friendId` int(11) NOT NULL,
  `status` enum('accepted','pending','rejected') DEFAULT 'pending',
  `actionUserId` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`id`, `userId`, `friendId`, `status`, `actionUserId`, `created_at`) VALUES
(68, 19, 18, 'pending', 18, '2025-08-03 21:00:32');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `userId`, `postId`, `created_at`) VALUES
(580, 18, 85, '2025-08-05 09:14:41'),
(585, 19, 88, '2025-08-13 15:00:05'),
(586, 19, 85, '2025-08-13 15:00:07');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `chatId` int(11) DEFAULT NULL,
  `senderId` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `chatId`, `senderId`, `content`, `created_at`, `is_read`) VALUES
(157, 30, 19, 'Hello', '2025-08-10 08:18:22', 0),
(158, 30, 19, 'Hello', '2025-08-10 08:30:56', 0),
(159, 30, 19, 'haha', '2025-08-10 08:31:09', 0),
(160, 30, 19, 'hi', '2025-08-10 08:34:17', 0),
(161, 31, 20, 'hi', '2025-08-10 08:38:06', 1),
(162, 30, 19, 'Hey bro', '2025-08-10 08:41:03', 0),
(163, 31, 19, 'Hi', '2025-08-10 08:54:09', 1),
(164, 30, 19, 'Hi', '2025-08-10 08:54:19', 0),
(165, 30, 19, 'What', '2025-08-10 08:54:34', 0),
(166, 31, 20, 'Hi', '2025-08-10 09:14:30', 1),
(167, 31, 20, 'He’ll', '2025-08-10 09:14:46', 1),
(168, 31, 20, 'Hdh', '2025-08-10 09:15:10', 1),
(169, 31, 20, 'Hdh', '2025-08-10 09:15:33', 1),
(170, 31, 19, 'jhk', '2025-08-10 09:15:39', 1),
(171, 31, 19, 'kjk', '2025-08-10 09:15:52', 1),
(172, 31, 20, 'Gdhdh', '2025-08-10 09:15:59', 1),
(173, 31, 19, 'dsfljk', '2025-08-10 09:25:38', 1),
(174, 31, 19, 'djfklas', '2025-08-10 09:25:41', 1),
(175, 31, 19, 'kfj;sd', '2025-08-10 09:25:43', 1),
(176, 32, 20, 'hi', '2025-08-11 18:17:33', 0),
(177, 31, 20, '❤️', '2025-08-11 18:35:49', 1),
(178, 32, 20, '😎', '2025-08-11 18:36:22', 0),
(179, 32, 20, 'ံင', '2025-08-13 14:53:18', 0),
(180, 32, 20, '😍😍', '2025-08-13 14:53:30', 0),
(181, 31, 19, 'Hello', '2025-08-13 14:56:46', 1);

-- --------------------------------------------------------

--
-- Table structure for table `message_reads`
--

CREATE TABLE `message_reads` (
  `messageId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `fromUserId`, `toUserId`, `postId`, `message`, `status`, `created_at`) VALUES
(0, 19, 20, 86, 'commented on your post.', 'read', '2025-08-11 16:59:51'),
(0, 19, 20, 86, 'commented on your post.', 'read', '2025-08-11 16:59:59'),
(0, 20, 19, NULL, 'sent you a friend request.', 'read', '2025-08-11 17:03:32'),
(0, 19, 20, NULL, 'accepted your friend request.', 'read', '2025-08-11 17:04:16'),
(0, 19, 20, NULL, 'unfriended you', 'read', '2025-08-11 17:04:38'),
(0, 19, 20, NULL, 'sent you a friend request.', 'read', '2025-08-11 17:25:11'),
(0, 20, 19, NULL, 'accepted your friend request.', 'read', '2025-08-11 18:34:27'),
(0, 20, 19, NULL, 'unfriended you', 'read', '2025-08-11 18:34:42'),
(0, 20, 19, NULL, 'sent you a friend request.', 'read', '2025-08-13 15:04:34'),
(0, 19, 20, NULL, 'accepted your friend request.', 'unread', '2025-08-13 15:10:38'),
(0, 19, 20, NULL, 'unfriended you', 'unread', '2025-08-13 15:33:39');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `caption` text NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `isPublic` tinyint(1) NOT NULL DEFAULT 1,
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `caption`, `photo`, `created_at`, `isPublic`, `userId`) VALUES
(75, 'HELLO', NULL, '2025-08-03 09:28:21', 1, 19),
(76, 'you are 👣 ', NULL, '2025-08-04 11:37:29', 0, 19),
(77, 'hkd', NULL, '2025-08-04 11:37:38', 0, 19),
(78, 'hi', NULL, '2025-08-04 11:37:50', 0, 19),
(79, 'you are 👣 ', NULL, '2025-08-04 11:38:10', 0, 19),
(80, 'hi', 'uploads/1754308072_wp4507665-mr-robot-wallpapers.jpg', '2025-08-04 11:47:52', 1, 19),
(81, 'YOO!', NULL, '2025-08-04 12:21:53', 1, 20),
(82, 'hkd', NULL, '2025-08-04 12:22:14', 0, 20),
(83, 'you are 👣 ', 'uploads/1754380705_688c8f4b2884e_Messenger_creation_11FE761E-D9F5-4612-B487-3C5782B0C09E.jpeg', '2025-08-05 07:58:25', 0, 19),
(84, 'YOO!', 'uploads/1754381761_688c8f03e271a_wp12815529-4k-mr-robot-wallpapers.jpg', '2025-08-05 08:16:01', 0, 19),
(85, 'ဟလို မဂ်လာပါ', NULL, '2025-08-05 09:08:56', 1, 19),
(86, 'What ', 'uploads/1754817586_IMG_0836.jpeg', '2025-08-10 09:19:46', 1, 20),
(87, 'Award Norton', 'uploads/1754817772_IMG_0627.jpeg', '2025-08-10 09:22:52', 0, 20),
(88, 'hello welcome', 'uploads/1755095482_Screenshot 2025-07-01 172432.png', '2025-08-13 14:31:22', 0, 19),
(89, 'Hshjsh', 'uploads/1755095898_IMG_0717.mov', '2025-08-13 14:38:18', 1, 20),
(90, 'တိုင်ကြီးကိုထိုးပလိုက်ဟျောင်၊ သားရီးဟျောင်', 'uploads/1755098227_video6107092037738173841.mp4', '2025-08-13 15:17:07', 1, 19);

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `bio` text NOT NULL DEFAULT '',
  `avatar` varchar(255) DEFAULT NULL,
  `coverPhoto` varchar(255) DEFAULT NULL,
  `location` varchar(100) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `media` varchar(255) NOT NULL,
  `mediaType` enum('image','video') DEFAULT 'image',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 24 hour)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `userId`, `media`, `mediaType`, `created_at`, `expires_at`) VALUES
(0, 19, 'uploads/stories/689a166a27f01_1754928746.jpeg', 'image', '2025-08-11 16:12:26', '2025-08-12 16:12:26'),
(0, 19, 'uploads/stories/689a21b55fcb4_1754931637.jpg', 'image', '2025-08-11 17:00:37', '2025-08-12 17:00:37'),
(0, 20, 'uploads/stories/689a353854742_1754936632.jpg', 'image', '2025-08-11 18:23:52', '2025-08-12 18:23:52'),
(0, 19, 'uploads/stories/689ca0ecf2f32_1755095276.png', 'image', '2025-08-13 14:27:57', '2025-08-14 14:27:57'),
(0, 20, 'uploads/stories/689ca2c856d39_1755095752.jpeg', 'image', '2025-08-13 14:35:52', '2025-08-14 14:35:52'),
(0, 20, 'uploads/stories/689ca2dde5dff_1755095773.png', 'image', '2025-08-13 14:36:13', '2025-08-14 14:36:13'),
(0, 19, 'uploads/stories/689cab8db4896_1755097997.jpg', 'image', '2025-08-13 15:13:17', '2025-08-14 15:13:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstName` varchar(20) NOT NULL,
  `lastName` varchar(20) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `birthdate`, `gender`, `email`, `password`, `created_at`, `updated_at`) VALUES
(18, 'Han', 'Htut', '1973-03-15', 'male', 'hantharhtut63@gamil.com', '$2y$10$3dWTZwhZGmMfzpbT.fZAR./P4S6MhWBx423McSI3z5kkO98k.Af1y', '2025-08-03 07:21:33', '2025-08-03 07:21:33'),
(19, 'strategy', ' ', '2011-02-16', 'male', 'han@gmail.com', '$2y$10$TNRrJtYgbeVfZBLLktF8Tu2QymNVtPJ6m92rTXsHcKXhZvZvGLPsi', '2025-08-03 07:34:28', '2025-08-03 07:34:28'),
(20, 'Han', 'Thar', '2019-02-03', 'other', 'thar@gmail.com', '$2y$10$qu8rCxNJQ/ogB9bIAXCaK.wCiAv0rWMBE9XB8kmKagwJTOhy3tx4q', '2025-08-04 11:52:40', '2025-08-04 11:52:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD PRIMARY KEY (`chatId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_friendship` (`userId`,`friendId`),
  ADD KEY `friendId` (`friendId`),
  ADD KEY `idx_friend_status` (`friendId`,`status`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`userId`,`postId`),
  ADD KEY `postId` (`postId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_messages` (`chatId`),
  ADD KEY `idx_message_sender` (`senderId`);

--
-- Indexes for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD PRIMARY KEY (`messageId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_feed` (`userId`,`created_at`),
  ADD KEY `idx_post_photo` (`photo`),
  ADD KEY `idx_public_posts` (`isPublic`,`created_at`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=587;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friendId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD CONSTRAINT `message_reads_ibfk_1` FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reads_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
