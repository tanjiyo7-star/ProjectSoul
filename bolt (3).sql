-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2025 at 05:18 PM
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
(41, 'direct', '2025-08-11 18:15:37'),
(42, 'direct', '2025-08-16 05:40:12'),
(43, 'direct', '2025-08-16 09:06:26'),
(44, 'direct', '2025-08-16 09:06:28'),
(45, 'direct', '2025-08-16 09:06:31'),
(46, 'direct', '2025-08-16 09:06:32'),
(47, 'direct', '2025-08-17 08:48:29'),
(48, 'direct', '2025-08-17 12:49:21'),
(49, 'direct', '2025-08-19 16:36:25'),
(50, 'direct', '2025-08-20 03:29:03'),
(51, 'direct', '2025-08-25 19:27:33'),
(52, 'direct', '2025-08-26 04:00:38'),
(53, 'direct', '2025-08-26 04:03:15'),
(54, 'direct', '2025-08-26 06:14:33');

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
(30, 19, '2025-08-10 08:12:41'),
(31, 19, '2025-08-10 08:24:11'),
(33, 19, '2025-08-11 16:12:35'),
(34, 19, '2025-08-11 17:01:53'),
(35, 19, '2025-08-11 17:02:01'),
(37, 19, '2025-08-11 17:02:14'),
(38, 19, '2025-08-11 17:02:17'),
(39, 19, '2025-08-11 17:06:20'),
(40, 19, '2025-08-11 17:43:52'),
(41, 19, '2025-08-11 18:15:37'),
(42, 19, '2025-08-16 05:40:12'),
(45, 19, '2025-08-16 09:06:31'),
(47, 19, '2025-08-17 08:48:29'),
(48, 19, '2025-08-17 12:49:21'),
(48, 24, '2025-08-17 12:49:21'),
(49, 19, '2025-08-19 16:36:25'),
(49, 25, '2025-08-19 16:36:25'),
(50, 24, '2025-08-20 03:29:03'),
(50, 25, '2025-08-20 03:29:03'),
(51, 25, '2025-08-25 19:27:33'),
(51, 26, '2025-08-25 19:27:33'),
(52, 19, '2025-08-26 04:00:38'),
(52, 27, '2025-08-26 04:00:38'),
(53, 24, '2025-08-26 04:03:15'),
(53, 27, '2025-08-26 04:03:15'),
(54, 25, '2025-08-26 06:14:33'),
(54, 27, '2025-08-26 06:14:33');

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
(57, 19, 84, 'gfdg', '2025-08-05 09:07:48'),
(58, 19, 85, 'ဟလို', '2025-08-05 09:09:02'),
(62, 19, 85, 'Hi', '2025-08-13 14:58:00'),
(77, 19, 93, 'hy', '2025-08-16 06:01:06'),
(81, 19, 85, 'hello', '2025-08-17 12:39:28'),
(82, 19, 79, 'hello', '2025-08-18 14:51:51'),
(83, 25, 85, 'hy', '2025-08-19 16:33:54'),
(84, 25, 96, 'hello', '2025-08-20 02:26:56'),
(85, 27, 90, 'fdksfj', '2025-08-26 04:03:02'),
(86, 25, 96, 'kdskfj', '2025-08-26 04:33:29'),
(92, 27, 99, '🎧', '2025-08-27 14:02:52'),
(113, 25, 110, 'fix', '2025-08-27 15:14:57');

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
(84, 25, 19, 'accepted', 19, '2025-08-19 16:34:23'),
(85, 25, 24, 'pending', 25, '2025-08-19 16:37:44'),
(87, 25, 26, 'pending', 25, '2025-08-26 10:47:29'),
(88, 25, 28, 'pending', 25, '2025-08-26 10:47:33'),
(91, 27, 26, 'pending', 27, '2025-08-26 16:05:29'),
(92, 27, 28, 'pending', 27, '2025-08-26 16:05:49'),
(93, 27, 19, 'pending', 27, '2025-08-26 16:12:45'),
(100, 25, 27, 'pending', 25, '2025-08-26 18:24:12');

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
(586, 19, 85, '2025-08-13 15:00:07'),
(597, 19, 78, '2025-08-15 18:58:23'),
(613, 19, 76, '2025-08-15 19:33:53'),
(614, 19, 77, '2025-08-15 19:33:56'),
(680, 19, 92, '2025-08-16 09:39:16'),
(683, 19, 93, '2025-08-16 13:34:47'),
(684, 19, 84, '2025-08-16 13:35:11'),
(691, 24, 95, '2025-08-17 12:46:19'),
(692, 19, 95, '2025-08-17 12:47:36'),
(695, 19, 83, '2025-08-17 15:27:48'),
(702, 25, 92, '2025-08-19 16:32:46'),
(703, 25, 90, '2025-08-19 16:33:12'),
(704, 25, 85, '2025-08-19 16:33:13'),
(705, 25, 94, '2025-08-19 16:45:15'),
(711, 19, 94, '2025-08-20 05:26:40'),
(713, 19, 88, '2025-08-20 11:11:27'),
(714, 19, 80, '2025-08-20 11:11:51'),
(720, 19, 96, '2025-08-22 14:15:26'),
(721, 25, 75, '2025-08-25 19:28:20'),
(730, 19, 90, '2025-08-26 03:58:12'),
(731, 27, 96, '2025-08-26 04:02:49'),
(732, 27, 92, '2025-08-26 04:02:56'),
(733, 28, 97, '2025-08-26 04:31:10'),
(734, 28, 96, '2025-08-26 04:32:19'),
(737, 25, 96, '2025-08-26 09:34:37'),
(742, 25, 99, '2025-08-26 16:35:28'),
(743, 25, 97, '2025-08-26 16:37:35'),
(745, 25, 110, '2025-08-27 13:17:00'),
(746, 27, 109, '2025-08-27 14:01:03'),
(747, 27, 106, '2025-08-27 14:02:07'),
(749, 25, 93, '2025-08-27 14:05:15');

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
  `is_read` tinyint(4) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `chatId`, `senderId`, `content`, `created_at`, `is_read`, `image_path`) VALUES
(157, 30, 19, 'Hello', '2025-08-10 08:18:22', 0, NULL),
(158, 30, 19, 'Hello', '2025-08-10 08:30:56', 0, NULL),
(159, 30, 19, 'haha', '2025-08-10 08:31:09', 0, NULL),
(160, 30, 19, 'hi', '2025-08-10 08:34:17', 0, NULL),
(162, 30, 19, 'Hey bro', '2025-08-10 08:41:03', 0, NULL),
(163, 31, 19, 'Hi', '2025-08-10 08:54:09', 1, NULL),
(164, 30, 19, 'Hi', '2025-08-10 08:54:19', 0, NULL),
(165, 30, 19, 'What', '2025-08-10 08:54:34', 0, NULL),
(170, 31, 19, 'jhk', '2025-08-10 09:15:39', 1, NULL),
(171, 31, 19, 'kjk', '2025-08-10 09:15:52', 1, NULL),
(173, 31, 19, 'dsfljk', '2025-08-10 09:25:38', 1, NULL),
(174, 31, 19, 'djfklas', '2025-08-10 09:25:41', 1, NULL),
(175, 31, 19, 'kfj;sd', '2025-08-10 09:25:43', 1, NULL),
(181, 31, 19, 'Hello', '2025-08-13 14:56:46', 1, NULL),
(182, 31, 19, 'dksjlf', '2025-08-16 07:36:32', 1, NULL),
(183, 31, 19, 'hi', '2025-08-17 06:35:45', 0, NULL),
(184, 31, 19, '😍', '2025-08-17 06:36:01', 0, NULL),
(185, 31, 19, '😍', '2025-08-17 08:47:58', 0, NULL),
(186, 31, 19, '❤️', '2025-08-17 08:48:10', 0, NULL),
(187, 47, 19, '😍', '2025-08-17 08:48:33', 0, NULL),
(188, 47, 19, 'hi', '2025-08-17 08:57:09', 0, NULL),
(189, 31, 19, '😂', '2025-08-17 10:06:33', 0, NULL),
(190, 47, 19, 'hello', '2025-08-17 10:08:20', 0, NULL),
(191, 48, 24, 'hi👍', '2025-08-17 12:49:34', 1, NULL),
(192, 48, 19, 'Hello🤔', '2025-08-17 12:51:53', 1, NULL),
(193, 48, 19, '🔥', '2025-08-17 12:52:19', 1, NULL),
(194, 48, 24, 'jkh', '2025-08-17 12:52:40', 1, NULL),
(195, 48, 19, 'hi', '2025-08-17 15:20:18', 0, NULL),
(196, 48, 19, 'hi', '2025-08-18 12:23:41', 0, NULL),
(197, 48, 19, 'hi', '2025-08-18 12:23:51', 0, NULL),
(198, 48, 19, 'kdsjlaf', '2025-08-18 12:23:54', 0, NULL),
(199, 48, 19, '🔥', '2025-08-18 12:24:05', 0, NULL),
(200, 48, 19, 'Han', '2025-08-18 12:35:19', 0, NULL),
(201, 48, 19, '😍', '2025-08-19 10:27:54', 0, NULL),
(202, 49, 19, '🤔', '2025-08-19 16:36:28', 1, NULL),
(203, 49, 25, '👍', '2025-08-19 16:39:18', 1, NULL),
(204, 49, 25, '😂', '2025-08-19 16:40:51', 1, NULL),
(205, 49, 25, '🔥', '2025-08-19 16:43:21', 1, NULL),
(206, 49, 25, '🔥', '2025-08-19 16:43:24', 1, NULL),
(207, 49, 25, '❤️🔥😀👍', '2025-08-19 16:43:27', 1, NULL),
(208, 49, 25, '🤔', '2025-08-19 16:43:34', 1, NULL),
(209, 50, 25, '🎉😀', '2025-08-20 03:29:06', 0, NULL),
(210, 49, 19, '😀', '2025-08-20 11:22:47', 1, NULL),
(211, 48, 19, '😀', '2025-08-20 11:23:27', 0, NULL),
(212, 48, 19, '🤔', '2025-08-20 12:46:09', 0, NULL),
(213, 48, 19, '😍', '2025-08-20 12:46:36', 0, NULL),
(214, 48, 19, '🤔', '2025-08-20 12:46:59', 0, NULL),
(215, 48, 19, '🎉', '2025-08-20 14:12:57', 0, NULL),
(216, 48, 19, '👍', '2025-08-20 15:01:43', 0, NULL),
(217, 48, 19, '😂', '2025-08-20 15:41:48', 0, NULL),
(218, 49, 25, 'Hello', '2025-08-22 14:17:37', 1, NULL),
(219, 49, 19, '🤔', '2025-08-22 14:19:14', 1, NULL),
(220, 52, 19, 'hi', '2025-08-26 04:00:54', 1, NULL),
(221, 54, 27, 'hi', '2025-08-26 06:14:48', 1, NULL),
(222, 54, 25, 'hi', '2025-08-26 06:18:22', 1, NULL),
(223, 54, 25, 'dkjf', '2025-08-26 16:39:32', 1, NULL),
(224, 54, 27, 'df', '2025-08-26 16:39:40', 1, NULL),
(225, 54, 25, 'sss', '2025-08-26 16:39:46', 1, NULL),
(226, 54, 25, 'http://localhost:8000/comments?post_id=110', '2025-08-26 18:43:06', 1, NULL);

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
(0, 19, 20, NULL, 'accepted your friend request.', 'read', '2025-08-11 17:04:16'),
(0, 19, 20, NULL, 'unfriended you', 'read', '2025-08-11 17:04:38'),
(0, 19, 20, NULL, 'sent you a friend request.', 'read', '2025-08-11 17:25:11'),
(0, 19, 20, NULL, 'accepted your friend request.', 'read', '2025-08-13 15:10:38'),
(0, 19, 20, NULL, 'unfriended you', 'read', '2025-08-13 15:33:39'),
(0, 19, 20, NULL, 'accepted your friend request.', 'read', '2025-08-14 18:11:18'),
(0, 19, 20, NULL, 'accepted your friend request.', 'read', '2025-08-14 18:18:00'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-15 18:48:55'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-15 18:49:00'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-15 18:49:02'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-15 19:03:16'),
(0, 21, 20, NULL, 'sent you a friend request.', 'read', '2025-08-15 19:38:31'),
(0, 20, 21, NULL, 'accepted your friend request.', 'read', '2025-08-15 19:39:44'),
(0, 20, 21, NULL, 'unfriended you', 'read', '2025-08-15 19:43:56'),
(0, 20, 21, NULL, 'sent you a friend request.', 'read', '2025-08-15 19:43:59'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-16 05:54:20'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:11'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:27'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:32'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:34'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:37'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:02:43'),
(0, 19, 20, 91, 'liked your post.', 'read', '2025-08-16 06:25:36'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:25:51'),
(0, 19, 20, 89, 'commented on your post.', 'read', '2025-08-16 06:25:56'),
(0, 19, 20, 89, 'commented on your post.', 'read', '2025-08-16 06:25:56'),
(0, 19, 20, 89, 'liked your post.', 'read', '2025-08-16 06:27:05'),
(0, 19, 21, NULL, 'sent you a friend request.', 'read', '2025-08-16 08:21:47'),
(0, 21, 20, NULL, 'accepted your friend request.', 'read', '2025-08-16 08:23:54'),
(0, 20, 23, NULL, 'sent you a friend request.', 'read', '2025-08-16 09:14:38'),
(0, 19, 20, NULL, 'unfriended you', 'read', '2025-08-16 12:51:10'),
(0, 20, 18, NULL, 'sent you a friend request.', 'unread', '2025-08-16 13:53:24'),
(0, 20, 22, NULL, 'sent you a friend request.', 'unread', '2025-08-16 13:53:28'),
(0, 19, 20, NULL, 'accepted your friend request.', 'unread', '2025-08-17 10:13:56'),
(0, 19, 24, NULL, 'accepted your friend request.', 'read', '2025-08-17 12:47:18'),
(0, 19, 24, 95, 'liked your post.', 'read', '2025-08-17 12:47:36'),
(0, 19, 24, NULL, 'unfriended you', 'unread', '2025-08-18 12:34:25'),
(0, 25, 24, NULL, 'sent you a friend request.', 'unread', '2025-08-19 16:37:44'),
(0, 25, 19, 75, 'liked your post.', 'read', '2025-08-25 19:28:20'),
(0, 27, 19, 92, 'liked your post.', 'read', '2025-08-26 04:02:56'),
(0, 27, 19, 90, 'commented on your post.', 'read', '2025-08-26 04:03:02'),
(0, 28, 27, 97, 'liked your post.', 'read', '2025-08-26 04:31:10'),
(0, 25, 27, NULL, 'accepted your friend request.', 'read', '2025-08-26 06:19:30'),
(0, 25, 27, 97, 'liked your post.', 'read', '2025-08-26 06:22:10'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 06:22:15'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 09:34:47'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 09:34:47'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 09:34:47'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 09:34:48'),
(0, 25, 26, NULL, 'sent you a friend request.', 'unread', '2025-08-26 10:47:29'),
(0, 25, 28, NULL, 'sent you a friend request.', 'unread', '2025-08-26 10:47:33'),
(0, 25, 27, NULL, 'sent you a friend request.', 'read', '2025-08-26 10:47:34'),
(0, 25, 27, NULL, 'sent you a friend request.', 'read', '2025-08-26 16:05:03'),
(0, 27, 26, NULL, 'sent you a friend request.', 'unread', '2025-08-26 16:05:29'),
(0, 27, 28, NULL, 'sent you a friend request.', 'unread', '2025-08-26 16:05:49'),
(0, 27, 19, NULL, 'sent you a friend request.', 'unread', '2025-08-26 16:12:45'),
(0, 25, 27, NULL, 'accepted your friend request.', 'read', '2025-08-26 16:24:14'),
(0, 25, 27, NULL, 'unfriended you', 'read', '2025-08-26 16:25:28'),
(0, 25, 27, 99, 'liked your post.', 'read', '2025-08-26 16:35:28'),
(0, 25, 27, 97, 'liked your post.', 'read', '2025-08-26 16:37:35'),
(0, 25, 27, NULL, 'accepted your friend request.', 'read', '2025-08-26 17:45:53'),
(0, 25, 27, NULL, 'unfriended you', 'read', '2025-08-26 18:17:16'),
(0, 25, 27, NULL, 'sent you a friend request.', 'read', '2025-08-26 18:17:46'),
(0, 25, 27, NULL, 'accepted your friend request.', 'read', '2025-08-26 18:18:17'),
(0, 25, 27, NULL, 'accepted your friend request.', 'read', '2025-08-26 18:19:41'),
(0, 25, 27, NULL, 'unfriended you', 'read', '2025-08-26 18:24:02'),
(0, 25, 27, NULL, 'sent you a friend request.', 'read', '2025-08-26 18:24:12'),
(0, 25, 19, 93, 'liked your post.', 'unread', '2025-08-27 14:05:15');

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
(83, 'you are 👣 ', 'uploads/1754380705_688c8f4b2884e_Messenger_creation_11FE761E-D9F5-4612-B487-3C5782B0C09E.jpeg', '2025-08-05 07:58:25', 0, 19),
(84, 'YOO!', 'uploads/1754381761_688c8f03e271a_wp12815529-4k-mr-robot-wallpapers.jpg', '2025-08-05 08:16:01', 0, 19),
(85, 'ဟလို မဂ်လာပါ', NULL, '2025-08-05 09:08:56', 1, 19),
(88, 'hello welcome', 'uploads/1755095482_Screenshot 2025-07-01 172432.png', '2025-08-13 14:31:22', 0, 19),
(90, 'တိုင်ကြီးကိုထိုးပလိုက်ဟျောင်၊ သားရီးဟျောင်', 'uploads/1755098227_video6107092037738173841.mp4', '2025-08-13 15:17:07', 1, 19),
(92, 'ksl', 'uploads/1755285240_wp7943076-mr-robot-4k-desktop-wallpapers.jpg', '2025-08-15 19:14:00', 1, 19),
(93, 'hello welcome', NULL, '2025-08-15 19:14:10', 0, 19),
(94, ' Smule https://www.smule.com › song › arrangement စာ(စိုးလွင်လွင်) · စာ · တေးရေး-ညီညီသွင် · ((((((((((((( · ကိုယ်မြတ်နိုးဖူးသူရဲ့လက်နဲ့ · ကိုယ်တိုင်ရေးလို့ထားရှာတယ် · အရင်တုန်းက ရင်ခုန်ဖူးခဲ့တဲ့ · စာလုံးဝိုင်းလေးတွေကို · ပြန်မြင်လိုက်ရတော့. စာ - စိုးလွင်လွင် [Lyrics] Sar-SoeLwinLwin  YouTube · Lyrics By Lemon ကြည့်ရှုမှု ၅.၅ သန်း+ · ပြီးခဲ့သည့် ၂ နှစ်  ၃:၂၉ Sar #SoeLwinLwin #LyricsByLemon #MyanmarMusic #VintageSong Credits to the owner of this audio. Disclaimer : I do not own the original song. စာ - Unicode - Lyrics and Music by အေသင်ချိုဆွေ  Smule https://www.smule.com › song › arrangement ဒီစာ ကို ဖွင့်လို့ မဖတ်တော့ဘူး. ဒီစာ ကို ဖွင့်လို့ မဖတ်တော့ဘူး. ဒီစာ ကို ဖွင့်လို့. မဖတ်ကြည့်တော့ဘူးကွယ်... ကိုယ်ခံစားပြီးနေရ နေ့ရက်တွေဟာ. ဟောင်းနွမ်းသွားပြီပဲ. ဘယ်သဘောမျိုး အကြံစည်မျိုးနဲ့. ထပ်မံ နိုပ်စက်ရပြန်သလဲ', NULL, '2025-08-16 13:36:32', 0, 19),
(95, 'Friend', 'uploads/1755434763_video6107092037738173841.mp4', '2025-08-17 12:46:03', 0, 24),
(96, 'Friend', 'uploads/1755656800_0b27aa75eede5e28f47e99fc0362dcc4.png', '2025-08-20 02:26:40', 1, 25),
(97, 'video', 'uploads/1756181109_video6107092037738173841.mp4', '2025-08-26 04:05:09', 1, 27),
(98, 'video', NULL, '2025-08-26 06:20:27', 0, 27),
(99, 'hiii', NULL, '2025-08-26 06:20:51', 1, 27),
(100, ' ', 'uploads/1756226318_8be1641a-f5b5-40ec-b348-d29924729d34.jpg', '2025-08-26 16:38:38', 0, 25),
(101, 'video', NULL, '2025-08-26 17:31:27', 1, 27),
(102, 'Friend', NULL, '2025-08-26 17:44:37', 1, 25),
(103, 'video', NULL, '2025-08-26 17:45:18', 0, 27),
(104, 'hiii', NULL, '2025-08-26 17:46:14', 0, 27),
(105, 'Friend', NULL, '2025-08-26 17:46:51', 1, 25),
(106, 'video', NULL, '2025-08-26 17:47:41', 0, 27),
(107, ' ', 'uploads/1756230847_6154566214387615343.jpg', '2025-08-26 17:54:07', 0, 27),
(108, 'df', NULL, '2025-08-26 17:54:23', 0, 25),
(109, 'video', NULL, '2025-08-26 17:54:42', 0, 27),
(110, 'Friend', NULL, '2025-08-26 17:58:10', 0, 25);

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

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `bio`, `avatar`, `coverPhoto`, `location`) VALUES
(19, 'Hello', 'uploads/avatars/avatar_19_1755331544.jfif', NULL, 'Yangon'),
(24, 'World is worth fighting for...', 'uploads/avatars/avatar_24_1755434660.jfif', NULL, 'Maubin'),
(25, 'Hello', 'uploads/avatars/avatar_25_1756289856.jpg', NULL, 'Pyapon'),
(26, '', 'uploads/avatars/avatar_26_1755877804.jfif', NULL, ''),
(27, '', 'uploads/avatars/avatar_27_1756181065.jpg', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `profile_views`
--

CREATE TABLE `profile_views` (
  `viewer_id` int(11) NOT NULL,
  `profile_user_id` int(11) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp()
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
(33, 20, 'uploads/stories/68a0481b1bf4f_1755334683.jfif', 'image', '2025-08-16 08:58:03', '2025-08-17 08:58:03'),
(34, 20, 'uploads/stories/68a048228ebfe_1755334690.jfif', 'image', '2025-08-16 08:58:10', '2025-08-17 08:58:10'),
(35, 19, 'uploads/stories/68a04839239f9_1755334713.jfif', 'image', '2025-08-16 08:58:33', '2025-08-17 08:58:33'),
(36, 21, 'uploads/stories/68a04852de927_1755334738.jpg', 'image', '2025-08-16 08:58:58', '2025-08-17 08:58:58'),
(37, 22, 'uploads/stories/68a048aae4d98_1755334826.jfif', 'image', '2025-08-16 09:00:26', '2025-08-17 09:00:26'),
(38, 23, 'uploads/stories/68a0490d5c87e_1755334925.jfif', 'image', '2025-08-16 09:02:05', '2025-08-17 09:02:05'),
(39, 19, 'uploads/stories/68a1a99025416_1755425168.jpg', 'image', '2025-08-17 10:06:08', '2025-08-18 10:06:08'),
(40, 19, 'uploads/stories/68a1aad4d4ac2_1755425492.jpeg', 'image', '2025-08-17 10:11:32', '2025-08-18 10:11:32'),
(41, 19, 'uploads/stories/68a1cf819544a_1755434881.jpg', 'image', '2025-08-17 12:48:01', '2025-08-18 12:48:01'),
(42, 24, 'uploads/stories/68a1cfb5b348f_1755434933.jpg', 'image', '2025-08-17 12:48:53', '2025-08-18 12:48:53'),
(43, 19, 'uploads/stories/68a31b842d5b5_1755519876.jpg', 'image', '2025-08-18 12:24:36', '2025-08-19 12:24:36'),
(44, 19, 'uploads/stories/68a459f578ee8_1755601397.png', 'image', '2025-08-19 11:03:17', '2025-08-20 11:03:17'),
(45, 25, 'uploads/stories/68a4a6e97f773_1755621097.png', 'image', '2025-08-19 16:31:37', '2025-08-20 16:31:37'),
(46, 25, 'uploads/stories/68a4a7211c674_1755621153.png', 'image', '2025-08-19 16:32:33', '2025-08-20 16:32:33'),
(47, 25, 'uploads/stories/68a5abded73b1_1755687902.png', 'image', '2025-08-20 11:05:02', '2025-08-21 11:05:02'),
(48, 19, 'uploads/stories/68a5abfea2839_1755687934.png', 'image', '2025-08-20 11:05:34', '2025-08-21 11:05:34'),
(49, 19, 'uploads/stories/68a87ada371bb_1755871962.jpeg', 'image', '2025-08-22 14:12:42', '2025-08-23 14:12:42'),
(50, 26, 'uploads/stories/68a891cd28e27_1755877837.jfif', 'image', '2025-08-22 15:50:37', '2025-08-23 15:50:37'),
(51, 25, 'uploads/stories/68a892584f884_1755877976.jfif', 'image', '2025-08-22 15:52:56', '2025-08-23 15:52:56'),
(52, 25, 'uploads/stories/68acb93c3ba12_1756150076.jpg', 'image', '2025-08-25 19:27:56', '2025-08-26 19:27:56'),
(53, 27, 'uploads/stories/68ad32184c7ef_1756181016.jpg', 'image', '2025-08-26 04:03:36', '2025-08-27 04:03:36'),
(54, 27, 'uploads/stories/68ad322640e8b_1756181030.jpg', 'image', '2025-08-26 04:03:50', '2025-08-27 04:03:50'),
(55, 25, 'uploads/stories/68ad3a9b4fd07_1756183195.jpg', 'image', '2025-08-26 04:39:55', '2025-08-27 04:39:55'),
(56, 25, 'uploads/stories/68aebe38af821_1756282424.jpg', 'image', '2025-08-27 08:13:44', '2025-08-28 08:13:44');

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
  `last_seen` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remember_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `birthdate`, `gender`, `email`, `password`, `last_seen`, `created_at`, `updated_at`, `remember_token`) VALUES
(19, 'strategy', 'Htut', '2011-02-16', 'male', 'han@gmail.com', '$2y$10$Z0Dw.KMRq2.AUADGvvhWWOG9ovUKd4syA4gSc0/e94Y1NGxN.FCYe', '2025-08-26 04:31:10', '2025-08-03 07:34:28', '2025-08-26 04:31:10', '9e67c4b2589ee38f8f4b64e972d86e8b1c1a5badd42e099eecd825ade53822f8'),
(24, 'Tony', 'Montana', '2006-11-18', 'M', 'tony@gmail.com', '$2y$10$h6G/aKjtRdQc2KvQm8Gb8OdGViMYx2Mq/heS3ozARa.tOPlDS1gIm', '2025-08-26 04:12:34', '2025-08-17 12:42:53', '2025-08-17 12:45:19', NULL),
(25, 'Han', 'Htut', '2005-07-15', 'M', 'thar@gmail.com', '$2y$10$vjcMV9IUbcRKALIXqjJbNeFzDnIlckbf5zyrnCy3NaFHdtO5pPY9O', '2025-08-27 15:16:29', '2025-08-19 16:31:16', '2025-08-27 15:16:29', NULL),
(26, 'Han', 'Htut', '1979-11-04', 'female', 'htut@gmail.com', '$2y$10$/h8Bh9llw9bBvGt9Oydnvuw7dIMGZC1BGb7GQF4V4ihElyIdb5mry', '2025-08-26 04:12:34', '2025-08-22 15:49:35', '2025-08-22 15:49:35', NULL),
(27, 'Han', 'Thar Htut', '2005-01-14', 'male', 'htuthanthar8@gmail.com', '$2y$12$tsIU/8r881YvnGzw.TqWieUPoK37HG7XuU.UZ8KibcvkfhRi09LU2', '2025-08-27 15:17:58', '2025-08-26 04:00:04', '2025-08-27 15:17:58', NULL),
(28, 'Khin Myint', 'Myat', '2005-05-17', 'female', 'khinmyintmyat798@gmail.com', '$2y$12$QWFCiBeSjMXen5UQHen0keoKDD1p8HTuD3JPmQKDCRdyoRchEIKbq', '2025-08-26 04:32:58', '2025-08-26 04:30:54', '2025-08-26 04:32:58', NULL);

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
-- Indexes for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD PRIMARY KEY (`viewer_id`,`profile_user_id`),
  ADD KEY `idx_profile_views_profile` (`profile_user_id`,`viewed_at`),
  ADD KEY `idx_profile_views_viewer` (`viewer_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_remember_token` (`remember_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=750;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=227;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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

--
-- Constraints for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD CONSTRAINT `fk_profile_views_profile` FOREIGN KEY (`profile_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_profile_views_viewer` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
