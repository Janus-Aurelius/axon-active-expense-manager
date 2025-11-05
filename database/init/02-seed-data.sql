-- Seed data for expense manager application

-- Insert test users with different roles
INSERT INTO users (full_name, email, password, "role") VALUES
-- Employees
('John Smith', 'john.smith@company.com', 'employee123', 'EMPLOYEE'),
('Sarah Johnson', 'sarah.johnson@company.com', 'employee123', 'EMPLOYEE'),
('Michael Davis', 'michael.davis@company.com', 'employee123', 'EMPLOYEE'),
('Emily Wilson', 'emily.wilson@company.com', 'employee123', 'EMPLOYEE'),

-- Managers
('Robert Taylor', 'robert.taylor@company.com', 'manager123', 'MANAGER'),
('Lisa Anderson', 'lisa.anderson@company.com', 'manager123', 'MANAGER'),

-- Finance team
('David Brown', 'david.brown@company.com', 'finance123', 'FINANCE'),
('Jennifer Martinez', 'jennifer.martinez@company.com', 'finance123', 'FINANCE');

-- Insert expense requests with various statuses
INSERT INTO expense_requests (employee_id, title, description, amount, receipt_url, status, created_at, updated_at) VALUES
-- Pending manager approval
(1, 'Business Lunch with Client', 'Lunch meeting with potential client at Restaurant ABC', 85.50, 'https://example.com/receipts/lunch_001.jpg', 'PENDING_MANAGER', '2024-11-01 10:30:00', '2024-11-01 10:30:00'),
(2, 'Office Supplies', 'Purchase of notebooks, pens, and other stationery', 45.75, 'https://example.com/receipts/supplies_001.jpg', 'PENDING_MANAGER', '2024-11-02 14:15:00', '2024-11-02 14:15:00'),
(3, 'Conference Registration', 'Registration fee for Tech Conference 2024', 299.00, 'https://example.com/receipts/conference_001.pdf', 'PENDING_MANAGER', '2024-11-03 09:00:00', '2024-11-03 09:00:00'),

-- Approved by manager, pending finance
(1, 'Travel Expenses - Business Trip', 'Hotel and transportation costs for client visit', 450.00, 'https://example.com/receipts/travel_001.jpg', 'PENDING_FINANCE', '2024-10-28 16:45:00', '2024-10-30 11:20:00'),
(4, 'Software License', 'Annual license for project management tool', 120.00, 'https://example.com/receipts/software_001.pdf', 'PENDING_FINANCE', '2024-10-29 13:30:00', '2024-10-31 09:15:00'),

-- Rejected by manager
(2, 'Personal Item', 'Coffee machine for personal use', 200.00, 'https://example.com/receipts/coffee_001.jpg', 'REJECTED_MANAGER', '2024-10-25 11:20:00', '2024-10-26 14:30:00'),

-- Approved by manager but rejected by finance
(3, 'Expensive Dinner', 'Team dinner at luxury restaurant', 500.00, 'https://example.com/receipts/dinner_001.jpg', 'REJECTED_FINANCE', '2024-10-20 19:30:00', '2024-10-24 10:45:00'),

-- Paid expenses
(1, 'Taxi Fare', 'Transportation to client meeting', 25.50, 'https://example.com/receipts/taxi_001.jpg', 'PAID', '2024-10-15 08:30:00', '2024-10-18 16:00:00'),
(4, 'Training Materials', 'Books and online course subscription', 150.00, 'https://example.com/receipts/training_001.pdf', 'PAID', '2024-10-10 12:00:00', '2024-10-16 14:20:00'),
(2, 'Parking Fee', 'Parking at client location', 15.00, 'https://example.com/receipts/parking_001.jpg', 'PAID', '2024-10-08 16:45:00', '2024-10-12 11:30:00');

-- Insert manager actions
INSERT INTO manager_actions (expense_id, manager_id, "action", comment, action_at) VALUES
-- Approved expenses
(4, 5, 'APPROVED', 'Valid business expense, approved for finance review', '2024-10-30 11:20:00'),
(5, 6, 'APPROVED', 'Software license is necessary for project work', '2024-10-31 09:15:00'),
(7, 5, 'APPROVED', 'Team building activity approved', '2024-10-22 15:30:00'),
(8, 6, 'APPROVED', 'Transportation expense is reasonable', '2024-10-16 09:45:00'),
(9, 5, 'APPROVED', 'Training expense supports professional development', '2024-10-14 13:20:00'),
(10, 6, 'APPROVED', 'Parking fee is legitimate business expense', '2024-10-10 08:15:00'),

-- Rejected expense
(6, 5, 'REJECTED', 'Personal items are not reimbursable under company policy', '2024-10-26 14:30:00');

-- Insert finance actions
INSERT INTO finance_actions (expense_id, finance_id, "action", payment_reference, note, action_at) VALUES
-- Rejected by finance
(7, 7, 'REJECTED', NULL, 'Amount exceeds per-person limit for team meals', '2024-10-24 10:45:00'),

-- Paid expenses
(8, 8, 'PAID', 'PAY-2024-001', 'Payment processed via bank transfer', '2024-10-18 16:00:00'),
(9, 7, 'PAID', 'PAY-2024-002', 'Reimbursement completed', '2024-10-16 14:20:00'),
(10, 8, 'PAID', 'PAY-2024-003', 'Payment processed', '2024-10-12 11:30:00');