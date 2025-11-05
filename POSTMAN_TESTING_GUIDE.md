# Expense Manager - Complete Flow Testing Guide

## Overview

This guide provides step-by-step instructions for testing the complete expense manager workflow using Postman, covering the entire flow from employee expense submission to final finance approval.

## Complete Workflow

1. **Employee** submits expense → Status: `PENDING_MANAGER`
2. **Manager** reviews and approves → Status: `PENDING_FINANCE`
3. **Finance** processes and pays → Status: `PAID`

## Setup Instructions

### 1. Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select the file: `Expense_Manager_Complete_Flow_Postman_Collection.json`
4. The collection will be imported with all requests and environment variables

### 2. Environment Variables

The collection uses these environment variables (automatically set by login requests):

- `base_url`: http://localhost:8080
- `employee_token`: JWT token for employee user
- `manager_token`: JWT token for manager user
- `finance_token`: JWT token for finance user
- `expense_id`: ID of the created expense (auto-set)

## Step-by-Step Testing Flow

### Phase 1: Authentication

**Execute in this order:**

1. **Login as Employee (John Smith)**

   - Endpoint: `POST /api/auth/login`
   - Body: Employee credentials
   - **Result**: JWT token saved to `employee_token` variable

2. **Login as Manager (Robert Taylor)**

   - Endpoint: `POST /api/auth/login`
   - Body: Manager credentials
   - **Result**: JWT token saved to `manager_token` variable

3. **Login as Finance (David Brown)**

   - Endpoint: `POST /api/auth/login`
   - Body: Finance credentials
   - **Result**: JWT token saved to `finance_token` variable

4. **Verify Employee Token**
   - Endpoint: `GET /api/auth/verify`
   - **Result**: Confirms JWT token is valid

### Phase 2: Employee Submits Expense

5. **Create New Expense Request**

   - Endpoint: `POST /api/expenses`
   - Uses: `employee_token`
   - Body: Expense details (business dinner)
   - **Result**: Expense created with status `PENDING_MANAGER`, ID saved to `expense_id`

6. **Get My Expenses (Employee)**

   - Endpoint: `GET /api/expenses/my-expenses`
   - **Result**: Shows all expenses for the employee

7. **Get Expense by ID**
   - Endpoint: `GET /api/expenses/{{expense_id}}`
   - **Result**: Shows specific expense details

### Phase 3: Manager Reviews & Approves

8. **Get Pending Expenses for Manager Approval**

   - Endpoint: `GET /api/expenses/pending-manager-approval`
   - Uses: `manager_token`
   - **Result**: Shows all expenses awaiting manager approval

9. **Approve Expense (Manager)**
   - Endpoint: `POST /api/expenses/{{expense_id}}/approve`
   - Uses: `manager_token`
   - Body: Manager comment
   - **Result**: Status changes from `PENDING_MANAGER` to `PENDING_FINANCE`

### Phase 4: Finance Processes Payment

10. **Get Pending Expenses for Finance Approval**

    - Endpoint: `GET /api/expenses/pending-finance-approval`
    - Uses: `finance_token`
    - **Result**: Shows all expenses awaiting finance approval

11. **Approve Expense with Payout Details (Finance)**
    - Endpoint: `POST /api/expenses/{{expense_id}}/finance-approve`
    - Uses: `finance_token`
    - Body: Payout details and reimbursement method
    - **Result**: Status changes from `PENDING_FINANCE` to `PAID`

### Phase 5: Verification

12. **Final Status Check (Employee)**
    - Endpoint: `GET /api/expenses/{{expense_id}}`
    - Uses: `employee_token`
    - **Result**: Confirms expense is now `PAID`

## Test User Credentials

### Employees

- **John Smith**: `john.smith@company.com` / `employee123`
- **Sarah Johnson**: `sarah.johnson@company.com` / `employee123`
- **Michael Davis**: `michael.davis@company.com` / `employee123`
- **Emily Wilson**: `emily.wilson@company.com` / `employee123`

### Managers

- **Robert Taylor**: `robert.taylor@company.com` / `manager123`
- **Lisa Anderson**: `lisa.anderson@company.com` / `manager123`

### Finance Team

- **David Brown**: `david.brown@company.com` / `finance123`
- **Jennifer Martinez**: `jennifer.martinez@company.com` / `finance123`

## Sample Request Bodies

### Login Request

```json
{
  "email": "john.smith@company.com",
  "password": "employee123"
}
```

### Create Expense Request

```json
{
  "title": "Business Dinner with Client",
  "description": "Dinner meeting with ABC Corp representatives to discuss new project proposal. Attended by 3 people from our team and 2 from client side.",
  "amount": 175.5,
  "receiptUrl": "https://example.com/receipts/dinner_20241105_001.jpg"
}
```

### Manager Approval

```json
{
  "comment": "Business dinner expense is reasonable and aligns with company policy. Client meeting was productive and necessary for the project. Approved for finance review."
}
```

### Finance Approval

```json
{
  "note": "Expense approved for payment. Amount verified against receipt. Payment will be processed via direct bank transfer to employee account.",
  "reimbursementMethod": "Direct Bank Transfer",
  "expectedPayoutDate": "2024-11-15"
}
```

## Alternative Testing Scenarios

### Manager Rejection

Use the "Reject Expense (Manager)" request with:

```json
{
  "comment": "Expense amount exceeds the company policy limit for client dinners. Please submit a revised expense within the approved limits or provide additional justification."
}
```

### Finance Rejection

Use the "Reject Expense (Finance)" request with:

```json
{
  "rejectionReason": "Receipt does not match the claimed amount. Discrepancy found in the submitted documentation.",
  "note": "Please provide a corrected receipt or revised expense amount for resubmission."
}
```

## Expected Response Status Codes

- **200 OK**: Successful GET requests, successful approvals
- **201 Created**: Successful expense creation
- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Access denied (wrong role)
- **404 Not Found**: Expense not found

## Validation Testing

### Test Invalid Data

1. **Missing Required Fields**:

   ```json
   {
     "description": "Missing title and amount"
   }
   ```

2. **Invalid Amount**:

   ```json
   {
     "title": "Test Expense",
     "amount": -10.0
   }
   ```

3. **Invalid Email**:
   ```json
   {
     "email": "invalid-email",
     "password": "test123"
   }
   ```

## Status Flow Verification

Track the expense status through each phase:

1. **Created**: `PENDING_MANAGER`
2. **Manager Approved**: `PENDING_FINANCE`
3. **Finance Approved**: `PAID`

Alternative flows:

- **Manager Rejected**: `REJECTED_MANAGER`
- **Finance Rejected**: `REJECTED_FINANCE`

## Tips for Testing

1. **Run requests in sequence** for the complete flow
2. **Check response bodies** for proper data structure
3. **Verify status codes** match expectations
4. **Test different user roles** to ensure proper access control
5. **Use the expense_id variable** for tracking the same expense through the workflow
6. **Test edge cases** like updating expenses, deleting expenses, etc.

## Troubleshooting

- **401 Unauthorized**: Make sure you've logged in and the token is set
- **403 Forbidden**: Check you're using the correct role token
- **404 Not Found**: Verify the expense_id is set correctly
- **400 Bad Request**: Check request body format and required fields

## Complete Test Execution Time

Executing the full workflow should take approximately 2-3 minutes if done manually, or can be automated using Postman's collection runner.
