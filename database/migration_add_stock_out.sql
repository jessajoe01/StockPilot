-- ============================================
-- Migration: Add 'Stock Out' to stock_transactions.transaction_type
-- Safe migration: only widens the ENUM, no data is modified or dropped.
-- ============================================

USE stockpilot_db;

ALTER TABLE stock_transactions
MODIFY COLUMN transaction_type ENUM(
    'Stock In',
    'Stock Out',
    'Sale',
    'Cancellation Return',
    'Adjustment'
) NOT NULL;