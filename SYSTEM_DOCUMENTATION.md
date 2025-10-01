# CCIT Learning Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Models & Relationships](#database-models--relationships)
3. [User Roles & Permissions](#user-roles--permissions)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Student Enrollment Process](#student-enrollment-process)
7. [Admin Approval System](#admin-approval-system)
8. [Payment System](#payment-system)
9. [Batch Management](#batch-management)
10. [Troubleshooting](#troubleshooting)
11. [Development Guidelines](#development-guidelines)

---

## System Overview

The CCIT Learning Management System is a comprehensive platform for managing online courses, student enrollments, payments, and educational content delivery.

### Core Features
- **Multi-role System**: Students, Mentors, Admins
- **Batch-based Learning**: Students enroll in specific course batches
- **Payment Integration**: Multiple payment methods with verification
- **Admin Approval**: Two-step approval (student + payment)
- **Google Classroom-style Interface**: Modern learning experience

---

## Database Models & Relationships

### 1. User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone?: string,
  password: string (hashed),
  role: 'student' | 'mentor' | 'admin' | 'marketing',
  avatar?: string,
  approvalStatus: 'pending' | 'approved' | 'rejected',
  approvedBy?: ObjectId,
  approvalDate?: Date,
  rejectionReason?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Relationships:**
- One-to-Many with Enrollments (as student)
- One-to-Many with Batches (as mentor)

### 2. Batch Model
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  coverPhoto?: string,
  courseType: 'online' | 'offline',
  regularPrice: number,
  discountPrice?: number,
  mentorId: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  modules: [{
    title: string,
    description: string,
    duration: number,
    order: number
  }],
  duration: number,
  durationUnit: 'days' | 'weeks' | 'months' | 'years',
  startDate: Date,
  endDate: Date,
  maxStudents: number,
  currentStudents: number,
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Relationships:**
- Many-to-One with User (mentor)
- Many-to-One with Course
- One-to-Many with Enrollments
- One-to-Many with Schedules
- One-to-Many with Assignments

### 3. Course Model
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  category: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  prerequisites: [string],
  learningOutcomes: [string],
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Enrollment Model
```typescript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  batch: ObjectId (ref: Batch),
  course: ObjectId (ref: Course),
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  amount: number,
  progress: number,
  enrollmentDate: Date,
  approvedBy?: ObjectId,
  approvedAt?: Date,
  lastAccessed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Critical Fields:**
- `status`: Controls student access to batch content
- `paymentStatus`: Tracks payment completion
- Both must be 'approved'/'paid' for full access

### 5. Invoice Model
```typescript
{
  _id: ObjectId,
  invoiceNumber: string (unique),
  student: ObjectId (ref: User),
  batch: ObjectId (ref: Batch),
  course: ObjectId (ref: Course),
  finalAmount: number,
  discountAmount?: number,
  paidAmount: number,
  remainingAmount: number,
  status: 'unpaid' | 'partial' | 'paid' | 'overdue',
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Payment Model
```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  batchId: ObjectId (ref: Batch),
  invoiceId: ObjectId (ref: Invoice),
  amount: number,
  paymentMethod: 'bkash' | 'nagad' | 'cash',
  senderNumber: string,
  transactionId?: string,
  paymentType: 'full' | 'partial' | 'installment',
  status: 'pending' | 'verified' | 'rejected' | 'refunded',
  verificationStatus: 'pending' | 'verified' | 'rejected',
  submittedAt: Date,
  verifiedBy?: ObjectId,
  verifiedAt?: Date,
  verificationNotes?: string,
  rejectionReason?: string
}
```

### 7. Schedule Model
```typescript
{
  _id: ObjectId,
  batchId: ObjectId (ref: Batch),
  title: string,
  description: string,
  date: Date,
  startTime: string,
  endTime: string,
  meetingLink?: string,
  location?: string,
  isOnline: boolean,
  status: 'scheduled' | 'completed' | 'cancelled',
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Assignment Model
```typescript
{
  _id: ObjectId,
  batchId: ObjectId (ref: Batch),
  title: string,
  description: string,
  dueDate: Date,
  maxPoints: number,
  attachments?: [string],
  createdBy: ObjectId (ref: User),
  submissions: [{
    student: ObjectId (ref: User),
    content: string,
    attachments?: [string],
    submittedAt: Date,
    grade?: number,
    feedback?: string,
    gradedBy?: ObjectId,
    gradedAt?: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Discussion Model
```typescript
{
  _id: ObjectId,
  batchId: ObjectId (ref: Batch),
  title: string,
  content: string,
  author: ObjectId (ref: User),
  isPinned: boolean,
  replies: [{
    author: ObjectId (ref: User),
    content: string,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## User Roles & Permissions

### Student Role
**Dashboard**: `/dashboard/student`
**Permissions:**
- View enrolled batches
- Access batch content (schedules, assignments, discussions)
- Submit payments
- Submit assignments
- Participate in discussions
- View progress

**Access Control:**
- Can only access batches where `Enrollment.status = 'approved'`
- Can only access content if `Enrollment.paymentStatus = 'paid'`

### Mentor Role
**Dashboard**: `/dashboard/mentor`
**Permissions:**
- Manage assigned batches
- Create schedules
- Create assignments
- Grade submissions
- Manage discussions
- View enrolled students

**Access Control:**
- Can only access batches where `Batch.mentorId = currentUser._id`

### Admin Role
**Dashboard**: `/dashboard`
**Permissions:**
- Approve/reject student registrations
- Verify/reject payments
- Manage all batches
- Manage all users
- View system analytics
- Access all content

**Access Control:**
- Full system access

### Marketing Role
**Dashboard**: `/dashboard/marketing`
**Permissions:**
- Manage batch marketing
- Create promotional content
- View payment analytics
- Manage batch visibility

---

## API Endpoints

### Authentication
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/me               # Get current user
POST /api/auth/logout           # User logout
POST /api/auth/reset-password   # Password reset request
POST /api/auth/validate-reset-token # Validate reset token
```

### Student APIs
```
GET  /api/student/batches                    # Get enrolled batches
GET  /api/student/batches/[id]/schedule      # Get batch schedule
GET  /api/student/batches/[id]/assignments   # Get batch assignments
GET  /api/student/batches/[id]/discussions   # Get batch discussions
GET  /api/student/invoices                   # Get student invoices
```

### Mentor APIs
```
GET  /api/mentor/batches                     # Get mentor's batches
GET  /api/mentor/batches/[id]/students       # Get batch students
POST /api/mentor/batches/[id]/schedule       # Create schedule
POST /api/mentor/batches/[id]/assignments    # Create assignment
POST /api/mentor/batches/[id]/discussions    # Create discussion
```

### Admin APIs
```
GET  /api/admin/student-approvals            # Get pending students
POST /api/admin/student-approvals            # Approve/reject student
GET  /api/admin/payments                     # Get payments
POST /api/admin/payments                     # Verify/reject payment
DELETE /api/admin/payments                   # Delete payment (with OTP)
GET  /api/admin/enrollments                  # Get all enrollments
```

### Payment APIs
```
POST /api/payments                           # Submit payment
GET  /api/payments                           # Get payment history
POST /api/admin/payments/otp                 # Send OTP for deletion
GET  /api/admin/payments/otp                 # Verify OTP
```

### Batch APIs
```
GET  /api/batches                            # Get all batches
GET  /api/batches/[id]                       # Get single batch
POST /api/batches                            # Create batch
PUT  /api/batches/[id]                       # Update batch
DELETE /api/batches/[id]                     # Delete batch
GET  /api/batches/active                     # Get active batches (special case)
```

### Enrollment APIs
```
POST /api/enrollment                         # Create enrollment
GET  /api/enrollment                         # Get enrollments
```

---

## Authentication Flow

### 1. User Registration
```
User submits form → Validation → Create User with approvalStatus: 'pending' → Send confirmation
```

### 2. User Login
```
User submits credentials → Verify → Generate JWT → Set cookie → Redirect to dashboard
```

### 3. Protected Routes
```
Check JWT token → Verify role → Check approval status → Allow/deny access
```

### 4. Token Verification
```javascript
// Middleware example
const token = request.cookies.get('auth-token')?.value;
const payload = verifyToken(token);
if (!payload || payload.role !== 'admin') {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
```

---

## Student Enrollment Process

### Complete Flow Diagram
```
1. Student Registration
   ├── User.approvalStatus = 'pending'
   └── Redirect to login

2. Student Enrolls in Batch
   ├── Create Enrollment (status: 'pending')
   ├── Create Invoice (status: 'unpaid')
   └── Show payment options

3. Student Submits Payment
   ├── Create Payment (status: 'pending')
   └── Redirect to payment confirmation

4. Admin Approves Student (Optional)
   ├── User.approvalStatus = 'approved'
   └── Enrollment.status = 'approved' (if payment also verified)

5. Admin Verifies Payment
   ├── Payment.status = 'verified'
   ├── Invoice.paidAmount += payment.amount
   ├── Enrollment.status = 'approved'
   ├── Enrollment.paymentStatus = 'paid'
   └── User.approvalStatus = 'approved' (if not already)

6. Student Gets Full Access
   ├── Dashboard shows "Active" status
   ├── Can access schedules
   ├── Can access assignments
   └── Can participate in discussions
```

### Critical Status Dependencies
- **Student Access**: Requires `Enrollment.status = 'approved'`
- **Content Access**: Requires `Enrollment.paymentStatus = 'paid'`
- **Full Access**: Requires both conditions

---

## Admin Approval System

### Student Approval Process
```javascript
// API: POST /api/admin/student-approvals
{
  "userId": "student_id",
  "action": "approve" | "reject",
  "rejectionReason": "optional reason"
}

// Updates:
// 1. User.approvalStatus = 'approved'
// 2. Enrollment.status = 'approved' (for pending enrollments)
```

### Payment Verification Process
```javascript
// API: POST /api/admin/payments
{
  "paymentId": "payment_id",
  "action": "verify" | "reject",
  "verificationNotes": "optional notes"
}

// Updates:
// 1. Payment.status = 'verified'
// 2. Invoice.paidAmount += payment.amount
// 3. Enrollment.status = 'approved'
// 4. Enrollment.paymentStatus = 'paid'
// 5. User.approvalStatus = 'approved' (if not already)
```

### Admin Dashboard Integration
```typescript
// Component: AdminApprovalSystem.tsx
// Location: /dashboard (admin main page)
// Features:
// - Student approval tab
// - Payment verification tab
// - Real-time updates
// - Batch operations
```

---

## Payment System

### Payment Methods
- **bKash**: Mobile financial service
- **Nagad**: Mobile financial service  
- **Cash**: Physical payment

### Payment Flow
```
1. Student submits payment form
   ├── Payment.method = selected method
   ├── Payment.senderNumber = user input
   ├── Payment.transactionId = optional
   └── Payment.status = 'pending'

2. Admin reviews payment
   ├── Check payment details
   ├── Verify transaction
   └── Approve/reject

3. Payment verification updates
   ├── Update Invoice.paidAmount
   ├── Update Enrollment.status
   ├── Update Enrollment.paymentStatus
   └── Grant student access
```

### Payment Verification UI
```typescript
// Component: PaymentVerificationModal.tsx
// Features:
// - Student details display
// - Payment information
// - Approve/reject buttons
// - Notes field
// - Real-time status updates
```

### Payment Deletion (2-Step Verification)
```javascript
// Step 1: Send OTP
POST /api/admin/payments/otp
// Sends 6-digit OTP to admin email

// Step 2: Verify OTP and delete
DELETE /api/admin/payments?id=payment_id&otp=123456
// Verifies OTP and deletes payment
```

---

## Batch Management

### Batch Creation
```javascript
// API: POST /api/batches
{
  "name": "MERN Stack Development",
  "description": "Complete web development course",
  "mentorId": "mentor_id",
  "courseType": "online",
  "regularPrice": 15000,
  "discountPrice": 12000,
  "maxStudents": 30,
  "startDate": "2025-02-01",
  "endDate": "2025-04-01"
}
```

### Batch Status Flow
```
draft → published → upcoming → ongoing → completed
                              ↓
                          cancelled (any time)
```

### Special API Endpoints
```javascript
// Get active batches
GET /api/batches/active
// Returns all batches with status: 'published'

// Get ongoing batches  
GET /api/batches/ongoing
// Returns all batches with status: 'ongoing'
```

### Mentor Batch Management
```typescript
// Page: /dashboard/mentor/batches/[id]
// Features:
// - Student list
// - Schedule management
// - Assignment creation
// - Discussion moderation
// - Progress tracking
```

---

## Troubleshooting

### Common Issues

#### 1. Student Dashboard Shows "Pending" After Admin Approval
**Symptoms:**
- Admin approves student
- Student dashboard still shows "Awaiting Approval"
- Student cannot access batch content

**Root Cause:**
- Admin approval only updated User model
- Enrollment model not updated

**Solution:**
```javascript
// Ensure both models are updated
await User.findByIdAndUpdate(userId, { approvalStatus: 'approved' });
await Enrollment.updateMany(
  { student: userId, status: 'pending' },
  { status: 'approved', approvedBy: adminId }
);
```

#### 2. Payment Verified But Student Cannot Access Content
**Symptoms:**
- Payment shows as verified in admin panel
- Student still cannot access schedules/assignments
- Enrollment status remains pending

**Root Cause:**
- Payment verification didn't update enrollment status

**Solution:**
```javascript
// Payment verification must update enrollment
await Enrollment.updateMany(
  { student: payment.studentId, batch: payment.batchId },
  { 
    status: 'approved',
    paymentStatus: 'paid',
    approvedBy: adminId
  }
);
```

#### 3. CastError: Invalid ObjectId
**Symptoms:**
```
CastError: Cast to ObjectId failed for value "active" (type string)
```

**Root Cause:**
- API endpoint receives non-ObjectId values
- Special status values like "active" passed as ID

**Solution:**
```javascript
// Handle special cases in batch API
if (id === 'active' || id === 'published') {
  return await Batch.find({ status: id === 'active' ? 'published' : id });
}

// Validate ObjectId format
if (!/^[0-9a-fA-F]{24}$/.test(id)) {
  return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
}
```

#### 4. Missing Schema Error
**Symptoms:**
```
MissingSchemaError: Schema hasn't been registered for model "Batch"
```

**Root Cause:**
- Model not imported before population
- Circular dependency issues

**Solution:**
```javascript
// Explicitly import models
import Batch from '@/models/Batch';
import Course from '@/models/Course';

// Ensure models are registered
await Batch.findById(id).populate('course');
```

### Debug Tools

#### 1. Enrollment Status Debug Page
```
URL: /debug-enrollment-status
Purpose: View and update enrollment statuses
Features:
- List all enrollments
- Update status with dropdown
- See current status for each enrollment
```

#### 2. Quick Update Tool
```
URL: /debug-update-enrollment
Purpose: Quickly update specific enrollment
Features:
- Pre-filled student and batch IDs
- One-click approval
- Real-time status updates
```

#### 3. API Debug Endpoints
```javascript
// Debug all enrollments
GET /api/debug/fix-enrollment-status

// Update specific enrollment
POST /api/debug/fix-enrollment-status
{
  "enrollmentId": "id",
  "status": "approved",
  "paymentStatus": "paid"
}
```

### Logging and Monitoring

#### Enhanced Logging
```javascript
console.log('=== STUDENT APPROVAL UPDATE ===');
console.log('User ID:', userId);
console.log('Action:', action);
console.log('Updated user approval status:', updatedUser?.approvalStatus);
console.log('Enrollment update result:', enrollmentUpdate);
console.log('Modified enrollments count:', enrollmentUpdate.modifiedCount);
```

#### Payment Verification Logging
```javascript
console.log('=== PAYMENT VERIFICATION ENROLLMENT UPDATE ===');
console.log('Payment ID:', paymentId);
console.log('Student ID:', payment.studentId);
console.log('Batch ID:', payment.batchId);
console.log('Enrollment update result:', enrollmentUpdate);
console.log('User approval status updated:', userUpdate?.approvalStatus);
```

---

## Development Guidelines

### 1. Model Relationships
- Always import related models before population
- Use consistent field naming across models
- Maintain referential integrity

### 2. API Design
- Use consistent response formats
- Include proper error handling
- Add comprehensive logging
- Validate input data with Zod

### 3. Status Management
- Keep status fields synchronized
- Update related models together
- Use transactions for critical operations

### 4. Authentication
- Verify tokens on all protected routes
- Check user roles and permissions
- Handle expired tokens gracefully

### 5. Error Handling
- Use try-catch blocks
- Return meaningful error messages
- Log errors for debugging
- Handle edge cases

### 6. Testing
- Test complete user flows
- Verify database updates
- Check status synchronization
- Test error scenarios

---

## File Structure Reference

```
app/
├── api/
│   ├── auth/                    # Authentication endpoints
│   ├── admin/                   # Admin-only endpoints
│   ├── student/                 # Student endpoints
│   ├── mentor/                  # Mentor endpoints
│   ├── payments/                # Payment endpoints
│   ├── batches/                 # Batch management
│   ├── enrollment/              # Enrollment endpoints
│   └── debug/                   # Debug tools
├── dashboard/
│   ├── page.tsx                 # Admin dashboard
│   ├── payments/                # Payment management
│   ├── students/                # Student management
│   ├── mentor/                  # Mentor dashboard
│   └── student/                 # Student dashboard
├── components/
│   └── dashboard/               # Dashboard components
├── models/                      # Database models
├── lib/                         # Utilities
└── middleware.ts                # Route protection
```

---

## Status Codes Reference

### User Status
- `pending`: Awaiting admin approval
- `approved`: Can access system
- `rejected`: Access denied

### Enrollment Status
- `pending`: Awaiting approval
- `approved`: Can access batch content
- `rejected`: Access denied
- `completed`: Course finished
- `dropped`: Student left

### Payment Status
- `pending`: Awaiting verification
- `verified`: Payment confirmed
- `rejected`: Payment denied
- `refunded`: Payment returned

### Batch Status
- `draft`: Not published
- `published`: Available for enrollment
- `upcoming`: Starting soon
- `ongoing`: Currently active
- `completed`: Finished
- `cancelled`: Cancelled

---

This documentation should be updated whenever new features are added or existing functionality is modified. It serves as the single source of truth for understanding the system architecture and relationships.
