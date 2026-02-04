-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Run this after 001_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Users can update their own profile (limited fields via app)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON profiles FOR DELETE
    USING (is_admin());

-- ============================================
-- DAILY REPORTS POLICIES
-- ============================================

-- Employees can view their own reports
CREATE POLICY "Employees can view own reports"
    ON daily_reports FOR SELECT
    USING (auth.uid() = employee_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON daily_reports FOR SELECT
    USING (is_admin());

-- Employees can insert their own reports
CREATE POLICY "Employees can insert own reports"
    ON daily_reports FOR INSERT
    WITH CHECK (auth.uid() = employee_id);

-- Admins can insert any report
CREATE POLICY "Admins can insert any report"
    ON daily_reports FOR INSERT
    WITH CHECK (is_admin());

-- Employees can update their own reports
CREATE POLICY "Employees can update own reports"
    ON daily_reports FOR UPDATE
    USING (auth.uid() = employee_id)
    WITH CHECK (auth.uid() = employee_id);

-- Admins can update any report
CREATE POLICY "Admins can update any report"
    ON daily_reports FOR UPDATE
    USING (is_admin());

-- Employees can delete their own reports
CREATE POLICY "Employees can delete own reports"
    ON daily_reports FOR DELETE
    USING (auth.uid() = employee_id);

-- Admins can delete any report
CREATE POLICY "Admins can delete any report"
    ON daily_reports FOR DELETE
    USING (is_admin());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- Allow inserts for authenticated users (controlled via app)
CREATE POLICY "Authenticated users can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- Note: Service role automatically bypasses RLS
-- This is used for admin operations like creating users
