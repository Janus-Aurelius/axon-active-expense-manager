-- Temporary fix: Convert PostgreSQL enums to VARCHAR for development
-- This allows Hibernate @Enumerated(EnumType.STRING) to work properly

-- First, add new columns with VARCHAR type
ALTER TABLE users ADD COLUMN role_temp VARCHAR(20);
ALTER TABLE expense_requests ADD COLUMN status_temp VARCHAR(30);
ALTER TABLE manager_actions ADD COLUMN action_temp VARCHAR(20);
ALTER TABLE finance_actions ADD COLUMN action_temp VARCHAR(20);

-- Copy data from enum columns to VARCHAR columns
UPDATE users SET role_temp = role::text;
UPDATE expense_requests SET status_temp = status::text;
UPDATE manager_actions SET action_temp = "action"::text;
UPDATE finance_actions SET action_temp = "action"::text;

-- Drop old enum columns
ALTER TABLE users DROP COLUMN "role";
ALTER TABLE expense_requests DROP COLUMN status;
ALTER TABLE manager_actions DROP COLUMN "action";
ALTER TABLE finance_actions DROP COLUMN "action";

-- Rename new columns to original names
ALTER TABLE users RENAME COLUMN role_temp TO "role";
ALTER TABLE expense_requests RENAME COLUMN status_temp TO status;
ALTER TABLE manager_actions RENAME COLUMN action_temp TO "action";
ALTER TABLE finance_actions RENAME COLUMN action_temp TO "action";

-- Add NOT NULL constraints
ALTER TABLE users ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE expense_requests ALTER COLUMN status SET NOT NULL;
ALTER TABLE manager_actions ALTER COLUMN "action" SET NOT NULL;
ALTER TABLE finance_actions ALTER COLUMN "action" SET NOT NULL;