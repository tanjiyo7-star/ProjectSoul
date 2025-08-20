/*
  # SoulBridge Database Optimizations and New Features

  1. New Tables
    - `profile_views` - Track who viewed profiles with timestamps
    - Enhanced `messages` table for media support
    
  2. Indexes
    - Add performance indexes for frequently queried columns
    - Optimize for real-time polling queries
    
  3. Features
    - Profile view tracking
    - Message media support
    - Optimized notification queries
*/

-- Create profile views table
CREATE TABLE IF NOT EXISTS profile_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  viewer_id INT NOT NULL,
  profile_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_view_today (viewer_id, profile_id, DATE(viewed_at))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add media support to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'media_path'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_path VARCHAR(255) DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_type ENUM('text', 'image', 'gif') DEFAULT 'text';
  END IF;
END $$;

-- Add remember token to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'remember_token'
  ) THEN
    ALTER TABLE users ADD COLUMN remember_token VARCHAR(255) DEFAULT NULL;
  END IF;
END $$;

-- Add last_seen to users table for online status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(userId, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chatId, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(toUserId, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(postId, userId);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(postId, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status, userId, friendId);
CREATE INDEX IF NOT EXISTS idx_profile_views_profile ON profile_views(profile_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_remember ON users(remember_token);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC);