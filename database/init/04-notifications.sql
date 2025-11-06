-- Add notification system tables and types

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'EXPENSE_APPROVED_BY_MANAGER',
  'EXPENSE_REJECTED_BY_MANAGER',
  'EXPENSE_APPROVED_BY_FINANCE',
  'EXPENSE_REJECTED_BY_FINANCE',
  'EXPENSE_PAID',
  'NEW_EXPENSE_SUBMITTED',
  'EXPENSE_PENDING_FINANCE_APPROVAL'
);

-- Create notifications table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_id BIGINT NOT NULL REFERENCES users(id),
  triggered_by_id BIGINT REFERENCES users(id),
  expense_request_id BIGINT REFERENCES expense_requests(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  "type" notification_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications("type");
CREATE INDEX idx_notifications_expense_request_id ON notifications(expense_request_id);

-- Composite index for common queries
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC);