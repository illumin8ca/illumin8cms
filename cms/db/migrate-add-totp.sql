-- Migration: Add TOTP support to users table
-- Run this if you get errors about totp_secret column not existing

-- Add totp_secret column for 2FA support
ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active); 