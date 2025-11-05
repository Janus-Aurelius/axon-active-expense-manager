CREATE TYPE user_role AS ENUM (
  'EMPLOYEE',
  'MANAGER',
  'FINANCE'
);

CREATE TYPE expense_status AS ENUM (
  'PENDING_MANAGER',
  'REJECTED_MANAGER',
  'APPROVED_MANAGER',
  'PENDING_FINANCE',
  'REJECTED_FINANCE',
  'PAID'
);

CREATE TYPE manager_action_type AS ENUM (
  'APPROVED',
  'REJECTED'
);

CREATE TYPE finance_action_type AS ENUM (
  'APPROVED',
  'REJECTED',
  'PAID'
);

-- 1. users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "role" user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. expense_requests
CREATE TABLE expense_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  receipt_url VARCHAR(255),
  status expense_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. manager_actions
CREATE TABLE manager_actions (
  id BIGSERIAL PRIMARY KEY,
  expense_id BIGINT NOT NULL REFERENCES expense_requests(id),
  manager_id BIGINT NOT NULL REFERENCES users(id),
  "action" manager_action_type NOT NULL,
  comment TEXT,
  action_at TIMESTAMPTZ DEFAULT now()
);

-- 4. finance_actions
CREATE TABLE finance_actions (
  id BIGSERIAL PRIMARY KEY,
  expense_id BIGINT NOT NULL REFERENCES expense_requests(id),
  finance_id BIGINT NOT NULL REFERENCES users(id),
  "action" finance_action_type NOT NULL,
  payment_reference VARCHAR(255),
  note TEXT,
  action_at TIMESTAMPTZ DEFAULT now()
);