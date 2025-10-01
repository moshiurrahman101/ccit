# Payment System Documentation

## Overview
This document describes the redesigned payment system for the CCIT platform, featuring a dedicated student payment page and admin verification system.

## Features

### 1. Student Payment Page (`/dashboard/student/payment`)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Invoice Selection**: Students can select from their pending invoices
- **Partial Payment Support**: Students can make full, partial, or installment payments
- **Multiple Payment Methods**: Support for bKash, Nagad, Rocket, Bank Transfer, and Cash
- **Payment History**: View all previous payments with status tracking
- **Real-time Validation**: Form validation with proper error handling

### 2. Admin Payment Verification (`/dashboard/payments`)
- **Payment Management**: View all student payments with filtering and search
- **Verification Interface**: Modern modal-based verification system
- **Status Tracking**: Track payment status (pending, verified, rejected)
- **Bulk Operations**: Filter and manage multiple payments
- **Detailed Information**: View complete payment details and student information

## Technical Implementation

### API Endpoints

#### Student Payment APIs
- `POST /api/payments` - Submit new payment
- `GET /api/payments` - Get payment history
- `GET /api/student/invoices` - Get student invoices

#### Admin Payment APIs
- `GET /api/admin/payments` - Get all payments for admin
- `POST /api/admin/payments` - Verify or reject payment
- `DELETE /api/admin/payments` - Delete payment record

### Database Models

#### Payment Model
```typescript
interface IPayment {
  _id: string;
  studentId: string; // Reference to User
  batchId: string; // Reference to Batch
  invoiceId: string; // Reference to Invoice
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  senderNumber: string;
  transactionId?: string;
  referenceNumber?: string;
  paymentType: 'full' | 'partial' | 'installment';
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string; // Reference to User (admin)
  verifiedAt?: Date;
  verificationNotes?: string;
  rejectionReason?: string;
  paymentScreenshot?: string;
  bankReceipt?: string;
  otherDocuments?: string[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## User Flow

### Student Payment Flow
1. Student logs in and navigates to `/dashboard/student/payment`
2. Student selects an invoice from the dropdown
3. Student fills out payment form with:
   - Payment amount (validated against remaining amount)
   - Payment method
   - Sender number
   - Transaction ID (optional)
   - Reference number (optional)
   - Payment type (full/partial/installment)
   - Supporting documents (optional)
4. Student submits payment
5. Payment is created with "pending" status
6. Admin receives notification for verification

### Admin Verification Flow
1. Admin navigates to `/dashboard/payments`
2. Admin sees all pending payments
3. Admin clicks "যাচাই করুন" (Verify) button
4. Admin opens verification modal with:
   - Student information
   - Payment details
   - Options to verify or reject
   - Fields for notes/reason
5. Admin submits verification decision
6. Payment status is updated
7. Invoice is updated with payment amount (if verified)

## Key Features

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### Partial Payment Support
- Students can make multiple payments for the same invoice
- Real-time calculation of remaining amount
- Automatic validation against invoice balance
- Support for installment payments

### Admin Verification
- Modern modal interface
- Clear action buttons (Verify/Reject)
- Required fields for rejection reasons
- Optional verification notes
- Real-time status updates

### Error Handling
- Form validation with user-friendly messages
- API error handling with proper HTTP status codes
- Loading states for better UX
- Toast notifications for success/error feedback

## Security Features
- Authentication required for all endpoints
- Role-based access control
- Input validation and sanitization
- CSRF protection
- Secure cookie handling

## Testing
- Test endpoint available at `/api/test-payment-flow`
- Comprehensive error handling
- Form validation testing
- API endpoint testing

## Future Enhancements
- Email notifications for payment status changes
- Payment receipt generation
- Advanced reporting and analytics
- Integration with external payment gateways
- Automated payment verification
- Payment reminders and notifications

## File Structure
```
app/
├── dashboard/
│   ├── student/
│   │   └── payment/
│   │       └── page.tsx          # Student payment page
│   └── payments/
│       └── page.tsx              # Admin payment verification
├── api/
│   ├── payments/
│   │   └── route.ts              # Payment CRUD operations
│   ├── admin/
│   │   └── payments/
│   │       └── route.ts          # Admin payment management
│   └── student/
│       └── invoices/
│           └── route.ts          # Student invoice fetching
components/
└── dashboard/
    ├── PaymentVerificationModal.tsx  # Verification modal
    └── DeleteConfirmationDialog.tsx  # Delete confirmation
models/
└── Payment.ts                    # Payment database model
```

## Usage Examples

### Student Making a Payment
```typescript
// Navigate to payment page
router.push('/dashboard/student/payment');

// Select invoice and fill form
const paymentData = {
  invoiceId: 'invoice_id',
  amount: 5000,
  paymentMethod: 'bkash',
  senderNumber: '01712345678',
  transactionId: 'TXN123456',
  paymentType: 'partial'
};

// Submit payment
const response = await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});
```

### Admin Verifying Payment
```typescript
// Verify payment
const response = await fetch('/api/admin/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId: 'payment_id',
    action: 'verify',
    verificationNotes: 'Payment verified successfully'
  })
});
```

This payment system provides a complete solution for managing student payments with a modern, responsive interface and robust admin verification system.
