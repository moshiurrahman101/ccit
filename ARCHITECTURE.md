# CCIT Platform - Complete Architectural Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Pattern](#architecture-pattern)
4. [Project Structure](#project-structure)
5. [Database Architecture](#database-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Layer Architecture](#api-layer-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Core Features & Business Logic](#core-features--business-logic)
10. [Third-Party Integrations](#third-party-integrations)
11. [Security Implementation](#security-implementation)
12. [Performance Optimizations](#performance-optimizations)
13. [Deployment Architecture](#deployment-architecture)
14. [Development Workflow](#development-workflow)
15. [Future Enhancements](#future-enhancements)

---

## System Overview

### Product Description
**CCIT (Creative Canvas IT)** is a comprehensive Learning Management System (LMS) designed specifically for the Bangladeshi EdTech market. It enables educational institutions to manage students, mentors, courses, batches, payments, and content delivery through a modern, scalable web platform.

### Core Capabilities
- **Multi-role User Management**: Students, Mentors, Admins, Marketing, and Support staff
- **Batch-based Learning**: Organize courses into batches with schedules, assignments, and discussions
- **Payment Processing**: Integrated payment workflow supporting multiple local payment methods (bKash, Nagad, Rocket)
- **Content Management**: Blog system, mentor profiles, and course materials
- **Administrative Dashboard**: Comprehensive tools for managing all aspects of the platform
- **Student Portal**: Personalized dashboard with enrollment tracking, payment history, and progress monitoring
- **Mentor Portal**: Tools for managing batches, students, schedules, and assignments

### Target Audience
- **Primary**: Bangladeshi students seeking IT education
- **Secondary**: Educational institutions, IT training centers, and mentors
- **Language**: Primarily Bengali with English support

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.3 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - Radix UI (primitives for accessible components)
  - ShadCN UI (pre-built component library)
  - Lucide React (icon library)
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context API + Server Components
- **Internationalization**: i18next + react-i18next

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes (App Router)
- **Language**: TypeScript
- **Database**: MongoDB 8.18.1 (via Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken) + HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer (Gmail SMTP)

### Third-Party Services
- **Image Management**: Cloudinary
- **PDF Generation**: @react-pdf/renderer + jspdf
- **Email Delivery**: Gmail SMTP (Nodemailer)

### DevOps & Build Tools
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint 9
- **Version Control**: Git

---

## Architecture Pattern

### Overall Pattern
**Next.js Full-Stack Application with Server-Side Rendering (SSR) and API Routes**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │  Dashboard   │  │   Public     │     │
│  │    Pages     │  │    Pages     │  │   Pages      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────┬──────────────┬──────────────┬──────────────┘
                │              │              │
                ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server (SSR + API)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware (Auth Guard)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Routes │  │  Server      │  │   Server     │     │
│  │  (Business   │  │  Components  │  │   Actions    │     │
│  │   Logic)     │  │  (RSC)       │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MongoDB Database (Mongoose ODM)              │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  │
│  │  │ Users  │ │Batches │ │Payments│ │Invoices│  ...   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               External Services                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │Cloudinary│  │  Gmail   │  │ PDF Gen  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **MVC (Model-View-Controller)**
   - Models: Mongoose schemas (`models/`)
   - Views: React components (`components/`, `app/`)
   - Controllers: API routes (`app/api/`)

2. **Repository Pattern**
   - Mongoose models act as repositories
   - Encapsulate database operations

3. **Middleware Pattern**
   - Authentication middleware (`middleware.ts`)
   - Request/response interception
   - Role-based access control

4. **Factory Pattern**
   - Dynamic dashboard routing based on user role
   - Component factories for different user types

5. **Observer Pattern**
   - React state management
   - Real-time UI updates

---

## Project Structure

```
ccit-main/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend Logic)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin-only endpoints
│   │   │   ├── enrollments/      # Enrollment management
│   │   │   ├── invoices/         # Invoice management
│   │   │   ├── payments/         # Payment verification
│   │   │   ├── student-approvals/# Student approval system
│   │   │   └── users/            # User management
│   │   ├── batches/              # Batch CRUD operations
│   │   ├── blogs/                # Blog management
│   │   ├── enrollment/           # Student enrollment
│   │   ├── invoices/             # Invoice operations
│   │   ├── mentor/               # Mentor-specific APIs
│   │   ├── mentors/              # Mentor management
│   │   ├── payments/             # Payment processing
│   │   ├── student/              # Student-specific APIs
│   │   ├── students/             # Student management
│   │   ├── upload/               # File upload (Cloudinary)
│   │   └── users/                # User operations
│   ├── dashboard/                # Dashboard pages (protected)
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── analytics/            # Analytics page
│   │   ├── batches/              # Batch management UI
│   │   ├── blog/                 # Blog management UI
│   │   ├── enrollment/           # Enrollment management UI
│   │   ├── invoices/             # Invoice management UI
│   │   ├── mentor/               # Mentor dashboard
│   │   ├── mentors/              # Mentor management UI
│   │   ├── payments/             # Payment management UI
│   │   ├── settings/             # Settings page
│   │   ├── student/              # Student dashboard
│   │   │   ├── page.tsx          # Student home
│   │   │   ├── batches/          # Student's batches
│   │   │   ├── enrollment/       # Enrollment page
│   │   │   ├── payment/          # Payment submission
│   │   │   ├── invoices/         # Student invoices
│   │   │   └── settings/         # Student settings
│   │   ├── students/             # Student management UI
│   │   └── users/                # User management UI
│   ├── batches/                  # Public batch pages
│   ├── blog/                     # Public blog pages
│   ├── mentors/                  # Public mentor pages
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── forgot-password/          # Password reset request
│   ├── reset-password/           # Password reset form
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React Components
│   ├── admin/                    # Admin-specific components
│   ├── blog/                     # Blog components
│   ├── dashboard/                # Dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── MentorDashboard.tsx
│   │   ├── AdminApprovalSystem.tsx
│   │   ├── PaymentVerificationModal.tsx
│   │   ├── BatchForm.tsx
│   │   ├── UserTable.tsx
│   │   └── ...
│   ├── home/                     # Homepage components
│   ├── invoice/                  # Invoice components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── providers/                # Context providers
│   │   ├── AuthProvider.tsx
│   │   └── I18nProvider.tsx
│   └── ui/                       # Reusable UI components (ShadCN)
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
├── lib/                          # Utility libraries
│   ├── auth.ts                   # JWT authentication utilities
│   ├── mongodb.ts                # MongoDB connection
│   ├── email-service.ts          # Email sending service
│   ├── cloudinary.ts             # Cloudinary client utilities
│   ├── cloudinary-server.ts      # Cloudinary server utilities
│   ├── i18n.ts                   # Internationalization config
│   ├── pdfGenerator.ts           # PDF generation
│   ├── utils.ts                  # General utilities
│   └── utils/                    # Additional utility modules
├── models/                       # Mongoose Models (Database Schema)
│   ├── User.ts                   # User model
│   ├── Student.ts                # Student model
│   ├── Mentor.ts                 # Mentor model
│   ├── Batch.ts                  # Batch model
│   ├── Course.ts                 # Course model
│   ├── Enrollment.ts             # Enrollment model
│   ├── Payment.ts                # Payment model
│   ├── Invoice.ts                # Invoice model
│   ├── Blog.ts                   # Blog model
│   ├── Attendance.ts             # Attendance model
│   ├── Schedule.ts               # Schedule model
│   ├── PromoCode.ts              # Promo code model
│   ├── Newsletter.ts             # Newsletter model
│   ├── ContactMessage.ts         # Contact message model
│   └── PasswordReset.ts          # Password reset model
├── scripts/                      # Utility scripts
│   ├── seed-mentors.js           # Seed mentor data
│   ├── migrate-students.js       # Student data migration
│   ├── cleanup-database.js       # Database cleanup
│   └── ...
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main types
│   └── global.d.ts               # Global type declarations
├── public/                       # Static assets
│   ├── brand/                    # Brand assets
│   └── ...
├── middleware.ts                 # Next.js middleware (Auth guard)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
├── .env.local                    # Environment variables (not in repo)
├── README.md                     # Project readme
├── ARCHITECTURE.md               # This file
├── SYSTEM_DOCUMENTATION.md       # System documentation
├── BATCH_SYSTEM_README.md        # Batch system docs
├── PAYMENT_SYSTEM_README.md      # Payment system docs
└── STUDENT_APPROVAL_SYSTEM_README.md # Student approval docs
```

---

## Database Architecture

### Database: MongoDB (NoSQL)
**Why MongoDB?**
- Flexible schema for evolving data models
- Excellent performance for read-heavy operations
- Native JSON/BSON support matches JavaScript ecosystem
- Horizontal scalability
- Rich query capabilities

### Data Models & Relationships

#### 1. User Model
**Collection**: `users`

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique, indexed),
  password: string (bcrypt hashed),
  role: enum ['student', 'mentor', 'admin', 'marketing', 'support'],
  phone: string,
  avatar: string (Cloudinary URL),
  approvalStatus: enum ['pending', 'approved', 'rejected'],
  approvalDate: Date,
  approvedBy: ObjectId (ref: User),
  rejectionReason: string,
  isActive: boolean,
  
  // Student-specific fields (embedded)
  studentInfo: {
    studentId: string (unique, sparse),
    currentBatch: ObjectId (ref: Batch),
    enrollmentDate: Date,
    isActiveStudent: boolean
  },
  
  // Mentor-specific fields (embedded)
  mentorInfo: {
    specialization: string[],
    experience: number,
    bio: string,
    qualifications: string[],
    hourlyRate: number,
    availability: { ... }
  },
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
- `email: 1` (unique)
- `role: 1`
- `approvalStatus: 1`
- `studentInfo.studentId: 1` (unique, sparse)

**Relationships**:
- One-to-Many with Enrollments (as student)
- One-to-Many with Batches (as mentor via Batch.mentorId)
- One-to-Many with Payments (as student)
- Self-referencing: approvedBy → User

#### 2. Student Model
**Collection**: `students`

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  studentId: string (unique, indexed),
  batchId: ObjectId (ref: Batch, indexed),
  
  // Denormalized for performance
  name: string,
  email: string,
  phone: string,
  
  enrollmentDate: Date (indexed),
  status: enum ['enrolled', 'active', 'completed', 'dropped', 'suspended'] (indexed),
  
  // Academic info
  previousEducation: string,
  institution: string,
  graduationYear: number,
  
  // Payment info (aggregated)
  paymentStatus: enum ['paid', 'partial', 'due', 'overdue'] (indexed),
  totalAmount: number,
  paidAmount: number,
  dueAmount: number,
  
  // Emergency contact
  emergencyContact: {
    name: string,
    phone: string,
    relation: string
  },
  
  // Documents (filenames only)
  documents: {
    nid: string,
    photo: string
  },
  
  isOfflineStudent: boolean,
  isVerified: boolean (indexed),
  notes: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId: 1`
- `studentId: 1` (unique)
- `batchId: 1, status: 1` (compound)
- `paymentStatus: 1`
- `enrollmentDate: -1`
- `name: text, email: text` (text search)

**Design Decisions**:
- **Denormalization**: Name, email, phone stored here for performance
- **Separation from User**: Keeps User model lean, Student model focused
- **Compound Indexes**: Optimized for common query patterns

#### 3. Mentor Model
**Collection**: `mentors`

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: string (indexed),
  email: string (unique, indexed),
  phone: string,
  bio: string,
  avatar: string,
  designation: string,
  
  // Experience
  experience: number (years),
  teachingExperience: number,
  
  // Skills & Expertise
  expertise: string[] (indexed),
  skills: string[] (indexed),
  languages: string[],
  
  // Education
  education: [{
    degree: string,
    institution: string,
    year: number
  }],
  
  // Certifications
  certifications: [{
    name: string,
    issuer: string,
    date: string,
    credentialId: string
  }],
  
  // Social links
  socialLinks: {
    website: string,
    linkedin: string,
    github: string,
    twitter: string,
    facebook: string,
    instagram: string,
    youtube: string,
    portfolio: string
  },
  
  // Teaching info
  teachingStyle: string,
  availability: {
    timezone: string,
    workingHours: string,
    availableDays: string[]
  },
  
  // Stats
  rating: number (indexed),
  studentsCount: number,
  coursesCount: number,
  achievements: string[],
  
  // Status
  status: enum ['active', 'inactive', 'pending', 'suspended'],
  isVerified: boolean,
  isActive: boolean (indexed),
  
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email: 1` (unique)
- `name: 1`
- `isActive: 1`
- `expertise: 1`
- `skills: 1`
- `rating: -1`

#### 4. Batch Model
**Collection**: `batches`

```typescript
{
  _id: ObjectId,
  name: string (unique, indexed),
  description: string,
  coverPhoto: string (Cloudinary URL),
  courseType: enum ['online', 'offline'],
  
  // Pricing
  regularPrice: number (indexed),
  discountPrice: number,
  discountPercentage: number (calculated),
  
  // Mentor
  mentorId: ObjectId (ref: Mentor, indexed),
  
  // Course structure
  modules: [{
    title: string,
    description: string,
    duration: number (hours),
    order: number
  }],
  whatYouWillLearn: string[],
  requirements: string[],
  features: string[],
  
  // Duration & Dates
  duration: number,
  durationUnit: enum ['days', 'weeks', 'months', 'years'],
  startDate: Date (indexed),
  endDate: Date (indexed),
  
  // Capacity
  maxStudents: number,
  currentStudents: number,
  
  // SEO & Marketing
  marketing: {
    slug: string (unique, indexed),
    metaDescription: string,
    tags: string[] (indexed)
  },
  
  // Status
  status: enum ['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled'] (indexed),
  isActive: boolean (indexed),
  
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `name: 1` (unique)
- `marketing.slug: 1` (unique)
- `status: 1`
- `isActive: 1`
- `mentorId: 1`
- `regularPrice: 1`
- `courseType: 1, isActive: 1` (compound)
- `startDate: 1, endDate: 1`
- `marketing.tags: 1`

**Pre-save Hooks**:
- Auto-generate slug from name
- Calculate discount percentage
- Validate date ranges

#### 5. Enrollment Model
**Collection**: `enrollments`

```typescript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  batch: ObjectId (ref: Batch),
  
  enrollmentDate: Date,
  status: enum ['pending', 'approved', 'rejected', 'completed', 'dropped'],
  
  // Payment tracking
  paymentStatus: enum ['pending', 'paid', 'failed', 'refunded'],
  paymentMethod: enum ['bkash', 'nagad', 'rocket', 'cash'],
  transactionId: string,
  senderNumber: string,
  amount: number,
  
  // Approval tracking
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  completedAt: Date,
  
  // Progress tracking
  progress: number (0-100),
  lastAccessed: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{student: 1, course: 1}` (unique, compound)
- `{student: 1, batch: 1}` (unique, compound, sparse)
- `{status: 1, paymentStatus: 1}` (compound)
- `{approvedBy: 1, approvedAt: 1}` (compound)

**Critical Business Logic**:
- Prevents duplicate enrollments (compound unique index)
- Both `status: 'approved'` AND `paymentStatus: 'paid'` required for full access

#### 6. Payment Model
**Collection**: `payments`

```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User, indexed),
  batchId: ObjectId (ref: Batch, indexed),
  enrollmentId: ObjectId (ref: Enrollment, indexed),
  invoiceId: ObjectId (ref: Invoice, required, indexed),
  
  // Payment details
  amount: number,
  paymentMethod: enum ['bkash', 'nagad', 'rocket', 'bank', 'cash'],
  senderNumber: string,
  transactionId: string,
  referenceNumber: string,
  
  // Status tracking
  status: enum ['pending', 'verified', 'rejected', 'refunded'] (indexed),
  verificationStatus: enum ['pending', 'verified', 'rejected'] (indexed),
  
  // Payment type
  paymentType: enum ['full', 'partial', 'installment'] (indexed),
  
  // Admin verification
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  verificationNotes: string,
  rejectionReason: string,
  
  // Evidence
  paymentScreenshot: string (Cloudinary URL),
  bankReceipt: string (Cloudinary URL),
  otherDocuments: string[],
  
  submittedAt: Date (indexed),
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `studentId: 1, status: 1` (compound)
- `batchId: 1, status: 1` (compound)
- `verificationStatus: 1, submittedAt: -1` (compound)
- `verifiedBy: 1, verifiedAt: -1` (compound)
- `paymentMethod: 1, status: 1` (compound)
- `{status: 1, verificationStatus: 1}` (compound)
- `{studentId: 1, batchId: 1, status: 1}` (compound)

#### 7. Invoice Model
**Collection**: `invoices`

```typescript
{
  _id: ObjectId,
  invoiceNumber: string (unique, indexed),
  studentId: ObjectId (ref: User, indexed),
  batchId: ObjectId (ref: Batch, indexed),
  batchName: string,
  courseType: enum ['batch', 'course'],
  
  // Financial info
  amount: number,
  discountAmount: number,
  finalAmount: number,
  currency: string (default: 'BDT'),
  
  // Promo code
  promoCode: string,
  promoDiscount: number,
  
  // Payment tracking
  status: enum ['pending', 'partial', 'paid', 'overdue', 'cancelled'] (indexed),
  dueDate: Date (indexed),
  paidAmount: number,
  remainingAmount: number,
  
  // Payment history (embedded)
  payments: [{
    amount: number,
    method: enum ['bkash', 'nagad', 'bank_transfer', 'cash'],
    senderNumber: string,
    transactionId: string,
    status: enum ['pending', 'verified', 'rejected'],
    submittedAt: Date,
    verifiedAt: Date,
    adminNotes: string
  }],
  
  notes: string,
  createdBy: ObjectId (ref: User),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes**:
- `invoiceNumber: 1` (unique)
- `studentId: 1`
- `batchId: 1`
- `status: 1`
- `dueDate: 1`
- `createdAt: -1`

#### 8. Course Model
**Collection**: `courses`

```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  syllabus: string,
  tags: string[],
  keywords: string[],
  learningOutcomes: string[],
  
  duration: number (hours),
  price: number,
  mentor: ObjectId (ref: User),
  thumbnail: string,
  
  category: enum ['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other'],
  level: enum ['beginner', 'intermediate', 'advanced'],
  language: enum ['bengali', 'english'],
  
  maxStudents: number,
  hasOfflineBatch: boolean,
  hasOnlineBatch: boolean,
  
  requirements: string[],
  resources: [{
    title: string,
    type: enum ['video', 'document', 'link', 'assignment'],
    url: string,
    description: string
  }],
  
  assignments: [{
    title: string,
    description: string,
    dueDate: Date,
    maxMarks: number,
    instructions: string
  }],
  
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. Blog Model
**Collection**: `blogs`

```typescript
{
  _id: ObjectId,
  title: string,
  slug: string (unique, indexed),
  excerpt: string,
  content: string,
  featuredImage: string,
  
  author: {
    name: string,
    email: string,
    avatar: string
  },
  
  status: enum ['draft', 'published', 'archived'] (indexed),
  category: string (indexed),
  tags: string[] (indexed),
  
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: string[],
    canonicalUrl: string,
    ogImage: string
  },
  
  readingTime: number (minutes, calculated),
  views: number (indexed),
  likes: number (indexed),
  
  publishedAt: Date (indexed),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Text Search Index**: `{title: 'text', excerpt: 'text', content: 'text', tags: 'text'}`

#### 10. Schedule Model
**Collection**: `schedules`

```typescript
{
  _id: ObjectId,
  batchId: ObjectId (ref: Batch, indexed),
  title: string,
  description: string,
  
  date: string (YYYY-MM-DD, indexed),
  startTime: string (HH:MM),
  endTime: string (HH:MM),
  
  meetingLink: string,
  location: string,
  isOnline: boolean,
  
  status: enum ['scheduled', 'completed', 'cancelled'],
  
  createdBy: ObjectId (ref: User, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{batchId: 1, date: 1}` (compound)
- `createdBy: 1`

#### 11. Attendance Model
**Collection**: `attendances`

```typescript
{
  _id: ObjectId,
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  batch: ObjectId (ref: Batch),
  
  classDate: Date,
  status: enum ['present', 'absent', 'late', 'excused'],
  
  checkInTime: Date,
  checkOutTime: Date,
  notes: string,
  
  markedBy: ObjectId (ref: User),
  markedAt: Date,
  isOnline: boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{student: 1, course: 1, classDate: 1}` (unique, compound)
- `{student: 1, batch: 1, classDate: 1}` (unique, compound, sparse)
- `{classDate: 1, status: 1}` (compound)
- `{markedBy: 1, markedAt: 1}` (compound)

#### 12. PromoCode Model
**Collection**: `promocodes`

```typescript
{
  _id: ObjectId,
  code: string (unique, uppercase, indexed),
  description: string,
  
  type: enum ['percentage', 'fixed'],
  value: number,
  currency: string (default: 'BDT'),
  
  // Usage limits
  maxUses: number,
  usedCount: number,
  maxUsesPerUser: number,
  
  // Validity
  validFrom: Date (indexed),
  validUntil: Date (indexed),
  isActive: boolean (indexed),
  
  // Applicability
  applicableBatches: ObjectId[] (ref: Batch, indexed),
  applicableCourseTypes: enum[] ['batch', 'course'],
  minAmount: number,
  
  // Usage tracking
  usedBy: [{
    userId: ObjectId (ref: User),
    invoiceId: ObjectId (ref: Invoice),
    usedAt: Date,
    discountAmount: number
  }],
  
  createdBy: ObjectId (ref: User),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes**:
- `code: 1` (unique)
- `isActive: 1`
- `{validFrom: 1, validUntil: 1}` (compound)
- `applicableBatches: 1`
- `createdAt: -1`

#### 13. PasswordReset Model
**Collection**: `passwordresets`

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  token: string (unique, indexed),
  expiresAt: Date (indexed),
  used: boolean (indexed),
  createdAt: Date
}
```

**Indexes**:
- `token: 1` (unique)
- `userId: 1`
- `expiresAt: 1`
- `used: 1`

**TTL Index**: `expiresAt: 1` with `expireAfterSeconds: 0` (auto-delete expired)

#### 14. Newsletter Model
**Collection**: `newsletters`

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  isSubscribed: boolean (indexed),
  subscribedAt: Date,
  unsubscribedAt: Date,
  source: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 15. ContactMessage Model
**Collection**: `contactmessages`

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  status: enum ['new', 'read', 'replied', 'archived'] (indexed),
  repliedAt: Date,
  repliedBy: ObjectId (ref: User),
  replyMessage: string,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### Database Relationships Diagram

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│  User   │◄───────►│ Student  │◄───────►│  Batch  │
│         │         │          │         │         │
│ role    │         │ userId   │         │ mentorId│
└────┬────┘         └────┬─────┘         └────┬────┘
     │                   │                     │
     │                   │                     │
     ▼                   ▼                     ▼
┌─────────┐         ┌──────────┐         ┌─────────┐
│ Mentor  │         │Enrollment│         │Schedule │
│         │         │          │         │         │
│ userId  │         │ student  │         │ batchId │
└─────────┘         │ batch    │         └─────────┘
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Payment  │
                    │          │
                    │ studentId│
                    │ batchId  │
                    │ invoiceId│
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Invoice  │
                    │          │
                    │ studentId│
                    │ batchId  │
                    └──────────┘
```

### Database Performance Strategies

1. **Indexing Strategy**
   - Strategic compound indexes for common query patterns
   - Text indexes for search functionality
   - Unique indexes for data integrity

2. **Denormalization**
   - Student model duplicates user info for performance
   - Reduces JOIN-like operations

3. **Embedded Documents**
   - User embeds studentInfo and mentorInfo
   - Invoice embeds payment history
   - Reduces separate queries

4. **Query Optimization**
   - Lean queries (`lean()`) for read-only operations
   - Projection to fetch only required fields
   - Pagination for large datasets

5. **Connection Pooling**
   - Global cached connection in development
   - Prevents connection exhaustion

---

## Authentication & Authorization

### Authentication Flow

#### 1. Registration Flow
```
User submits registration form
           ↓
Validate input (Zod schema)
           ↓
Check if email exists
           ↓
Hash password (bcrypt, 12 rounds)
           ↓
Create User document (approvalStatus: 'pending')
           ↓
Generate JWT token (7-day expiry)
           ↓
Set HTTP-only cookie (auth-token)
           ↓
Redirect based on role:
  - student → /dashboard/student
  - mentor → /dashboard/mentor
  - admin → /dashboard
```

#### 2. Login Flow
```
User submits credentials
           ↓
Find user by email
           ↓
Compare password (bcrypt)
           ↓
Check user.isActive
           ↓
Check user.approvalStatus
           ↓
Generate JWT token
           ↓
Set HTTP-only cookie
           ↓
Return user data (without password)
           ↓
Redirect to role-specific dashboard
```

#### 3. Token Structure (JWT)
```typescript
{
  userId: string,
  email: string,
  role: UserRole,
  iat: number (issued at),
  exp: number (expiry, 7 days)
}
```

**Security Features**:
- HTTP-only cookie (prevents XSS)
- Secure flag in production
- SameSite: Strict
- 7-day expiration

#### 4. Middleware Protection
File: `middleware.ts`

```
Request arrives
      ↓
Extract auth-token cookie
      ↓
Verify JWT (Edge-compatible)
      ↓
Check expiry
      ↓
Extract user info (userId, email, role)
      ↓
Add headers: x-user-id, x-user-email, x-user-role
      ↓
Apply role-based access control
      ↓
Allow/Deny request
```

**Protected Routes**:
- `/dashboard/*` - All authenticated users
- `/api/admin/*` - Admin only
- `/api/mentor/*` - Mentor + Admin
- `/api/student/*` - Student + Admin

### Authorization (Role-Based Access Control)

#### User Roles & Permissions

```typescript
type UserRole = 'student' | 'mentor' | 'admin' | 'marketing' | 'support';
```

| Route/Feature | Student | Mentor | Marketing | Support | Admin |
|--------------|---------|--------|-----------|---------|-------|
| View own dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enroll in batches | ✅ | ❌ | ❌ | ❌ | ✅ |
| Submit payments | ✅ | ❌ | ❌ | ❌ | ✅ |
| View own invoices | ✅ | ❌ | ❌ | ❌ | ✅ |
| View own batches | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage batch content | ❌ | ✅ | ❌ | ❌ | ✅ |
| Create schedules | ❌ | ✅ | ❌ | ❌ | ✅ |
| Create assignments | ❌ | ✅ | ❌ | ❌ | ✅ |
| Grade submissions | ❌ | ✅ | ❌ | ❌ | ✅ |
| Approve students | ❌ | ❌ | ✅ | ❌ | ✅ |
| Verify payments | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage batches | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage mentors | ❌ | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ❌ | ✅ |

### Password Security

1. **Hashing**: bcrypt with 12 salt rounds
2. **Password Reset**: Time-limited tokens (1 hour)
3. **Validation**: Minimum 6 characters
4. **Storage**: Never stored in plain text

### Session Management

- **Token Expiry**: 7 days
- **Refresh Strategy**: Manual re-login required
- **Logout**: Clear HTTP-only cookie
- **Concurrent Sessions**: Allowed (stateless JWT)

---

## API Layer Architecture

### API Design Principles

1. **RESTful**: Follow REST conventions
2. **Consistent**: Uniform response formats
3. **Versioned**: (Future: /api/v1/)
4. **Documented**: Clear error messages
5. **Secure**: Authentication required by default

### API Response Format

#### Success Response
```typescript
{
  success: true,
  data: any,
  message?: string
}
```

#### Error Response
```typescript
{
  success: false,
  error: string,
  message: string,
  statusCode: number
}
```

### API Routes Structure

#### Authentication APIs (`/api/auth/`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/login` | POST | User login | No |
| `/api/auth/logout` | POST | User logout | Yes |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/validate-reset-token` | POST | Validate reset token | No |
| `/api/auth/reset-password` | POST | Reset password | No |
| `/api/auth/check` | GET | Check auth status | Yes |

#### Admin APIs (`/api/admin/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/admin/student-approvals` | GET | Get pending students | Yes | Admin, Marketing |
| `/api/admin/student-approvals` | POST | Approve/reject student | Yes | Admin, Marketing |
| `/api/admin/payments` | GET | Get all payments | Yes | Admin, Marketing |
| `/api/admin/payments` | POST | Verify/reject payment | Yes | Admin, Marketing |
| `/api/admin/payments` | DELETE | Delete payment (with OTP) | Yes | Admin |
| `/api/admin/payments/otp` | POST | Send OTP for payment deletion | Yes | Admin |
| `/api/admin/payments/otp` | GET | Verify OTP | Yes | Admin |
| `/api/admin/enrollments` | GET | Get all enrollments | Yes | Admin |
| `/api/admin/enrollments/[id]/approve` | POST | Approve enrollment | Yes | Admin |
| `/api/admin/enrollments/[id]/reject` | POST | Reject enrollment | Yes | Admin |
| `/api/admin/invoices` | GET | Get all invoices | Yes | Admin |
| `/api/admin/users` | GET | Get all users | Yes | Admin |
| `/api/admin/users` | POST | Create user | Yes | Admin |
| `/api/admin/users/[id]` | GET | Get user by ID | Yes | Admin |
| `/api/admin/users/[id]` | PUT | Update user | Yes | Admin |
| `/api/admin/users/[id]` | DELETE | Delete user | Yes | Admin |
| `/api/admin/users/[id]/password` | PUT | Update user password | Yes | Admin |
| `/api/admin/users/stats` | GET | Get user statistics | Yes | Admin |
| `/api/admin/users/bulk` | POST | Bulk user operations | Yes | Admin |

#### Batch APIs (`/api/batches/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/batches` | GET | List all batches | No | Public |
| `/api/batches` | POST | Create batch | Yes | Admin |
| `/api/batches/[id]` | GET | Get batch by ID | No | Public |
| `/api/batches/[id]` | PUT | Update batch | Yes | Admin |
| `/api/batches/[id]` | DELETE | Delete batch | Yes | Admin |
| `/api/batches/slug/[slug]` | GET | Get batch by slug | No | Public |
| `/api/batches/[id]/cover-photo` | POST | Upload cover photo | Yes | Admin |

#### Student APIs (`/api/student/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/student/batches` | GET | Get student's batches | Yes | Student, Admin |
| `/api/student/batches/[id]/schedule` | GET | Get batch schedule | Yes | Student, Admin |
| `/api/student/batches/[id]/assignments` | GET | Get batch assignments | Yes | Student, Admin |
| `/api/student/batches/[id]/discussions` | GET | Get batch discussions | Yes | Student, Admin |
| `/api/student/invoices` | GET | Get student invoices | Yes | Student, Admin |
| `/api/student/confirm-payment` | POST | Confirm payment | Yes | Student |

#### Mentor APIs (`/api/mentor/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/mentor/batches` | GET | Get mentor's batches | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]` | GET | Get batch details | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/students` | GET | Get batch students | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/schedule` | GET | Get batch schedule | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/schedule` | POST | Create schedule | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/assignments` | GET | Get assignments | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/assignments` | POST | Create assignment | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/discussions` | GET | Get discussions | Yes | Mentor, Admin |
| `/api/mentor/batches/[id]/discussions` | POST | Create discussion | Yes | Mentor, Admin |
| `/api/mentor/check-profile` | GET | Check mentor profile | Yes | Mentor, Admin |

#### Payment APIs (`/api/payments/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/payments` | GET | Get payment history | Yes | Student, Admin |
| `/api/payments` | POST | Submit payment | Yes | Student, Admin |

#### Invoice APIs (`/api/invoices/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/invoices` | GET | List invoices | Yes | Admin |
| `/api/invoices` | POST | Create invoice | Yes | Admin |
| `/api/invoices/[id]` | GET | Get invoice | Yes | Student, Admin |
| `/api/invoices/[id]` | PUT | Update invoice | Yes | Admin |
| `/api/invoices/[id]` | DELETE | Delete invoice | Yes | Admin |
| `/api/invoices/[id]/download` | GET | Download PDF | Yes | Student, Admin |
| `/api/invoices/[id]/payments` | GET | Get invoice payments | Yes | Admin |
| `/api/invoices/[id]/payments` | POST | Add payment to invoice | Yes | Admin |

#### Blog APIs (`/api/blogs/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/blogs` | GET | List blogs | No | Public |
| `/api/blogs` | POST | Create blog | Yes | Admin |
| `/api/blogs/[id]` | GET | Get blog by ID | No | Public |
| `/api/blogs/[id]` | PUT | Update blog | Yes | Admin |
| `/api/blogs/[id]` | DELETE | Delete blog | Yes | Admin |
| `/api/blogs/slug/[slug]` | GET | Get blog by slug | No | Public |
| `/api/blogs/validate-slug` | POST | Validate slug uniqueness | Yes | Admin |

#### Mentor Management APIs (`/api/mentors/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/mentors` | GET | List mentors | Yes | Admin |
| `/api/mentors` | POST | Create mentor | Yes | Admin |
| `/api/mentors/[id]` | GET | Get mentor | Yes | Admin |
| `/api/mentors/[id]` | PUT | Update mentor | Yes | Admin |
| `/api/mentors/[id]` | DELETE | Delete mentor | Yes | Admin |
| `/api/mentors/search` | GET | Search mentors | Yes | Admin |
| `/api/mentors/check-email` | POST | Check email availability | Yes | Admin |
| `/api/mentors/public` | GET | Public mentor list | No | Public |
| `/api/mentors/public/[id]` | GET | Public mentor profile | No | Public |

#### Upload APIs (`/api/upload/`)

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/upload/cloudinary` | POST | Upload to Cloudinary | Yes | Admin, Mentor |
| `/api/upload-image` | POST | Upload image (fallback) | Yes | Admin, Mentor |

#### Misc APIs

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/contact` | POST | Submit contact form | No | Public |
| `/api/newsletter/subscribe` | POST | Subscribe to newsletter | No | Public |
| `/api/newsletter/unsubscribe` | POST | Unsubscribe from newsletter | No | Public |
| `/api/seed/mentors` | POST | Seed mentor data | No | Public (Dev only) |

### Error Handling Strategy

```typescript
try {
  await connectDB();
  // Business logic
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { 
      success: false, 
      error: error.message,
      message: 'User-friendly error message'
    },
    { status: 500 }
  );
}
```

**HTTP Status Codes Used**:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

---

## Frontend Architecture

### Component Structure

#### 1. Layout Components (`components/layout/`)
- **Navbar**: Main navigation, role-based menu
- **Footer**: Site footer with links
- **TopContactBar**: Contact information bar
- **ConditionalLayout**: Conditional rendering based on route

#### 2. Dashboard Components (`components/dashboard/`)

**Role-Specific Dashboards**:
- `AdminDashboard.tsx`: Admin overview with stats
- `StudentDashboard.tsx`: Student overview
- `MentorDashboard.tsx`: Mentor overview
- `MarketingDashboard.tsx`: Marketing team dashboard
- `SupportDashboard.tsx`: Support team dashboard

**Feature Components**:
- `AdminApprovalSystem.tsx`: Student approval and payment verification
- `PaymentVerificationModal.tsx`: Payment verification UI
- `PaymentModal.tsx`: Payment submission modal
- `ResponsivePaymentForm.tsx`: Responsive payment form
- `BatchForm.tsx`: Batch creation/editing form
- `BatchFormSteps.tsx`: Multi-step batch form
- `BatchTable.tsx`: Batch listing table
- `UserTable.tsx`: User management table
- `StudentTable.tsx`: Student listing table
- `UserForm.tsx`: User creation/editing form
- `StudentForm.tsx`: Student form
- `MentorBatchForm.tsx`: Mentor batch management
- `NewsletterSubscribers.tsx`: Newsletter management
- `DeleteConfirmationDialog.tsx`: Confirmation dialog
- `PaymentOtpDialog.tsx`: OTP verification for payment deletion
- `RoleGuard.tsx`: Role-based component rendering

**Form Components** (`components/dashboard/forms/`):
- `AddStudentForm.tsx`: Add student to batch
- `CreateAssignmentForm.tsx`: Create assignment
- `ScheduleClassForm.tsx`: Schedule class
- `StartDiscussionForm.tsx`: Start discussion

#### 3. Home Components (`components/home/`)
- Landing page sections
- Hero section
- Feature grid
- Course carousel
- Testimonials
- Blog preview
- CTA sections

#### 4. UI Components (`components/ui/`)
Reusable ShadCN UI components:
- `button.tsx`
- `input.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `select.tsx`
- `checkbox.tsx`
- `switch.tsx`
- `tabs.tsx`
- `toast.tsx`
- `alert-dialog.tsx`
- `avatar.tsx`
- `progress.tsx`
- `label.tsx`
- etc.

#### 5. Blog Components (`components/blog/`)
- `ImageUpload.tsx`: Image upload for blogs
- `SEOPreview.tsx`: SEO meta preview
- `SlugValidator.tsx`: Slug validation

#### 6. Invoice Components (`components/invoice/`)
- `InvoicePDF.tsx`: Invoice PDF generator
- `SimpleInvoicePDF.tsx`: Simplified invoice

#### 7. Provider Components (`components/providers/`)
- `AuthProvider.tsx`: Authentication context
- `I18nProvider.tsx`: Internationalization

### State Management Strategy

**1. Server State**:
- Fetched via API routes
- Cached using React Server Components
- Revalidated on navigation

**2. Client State**:
- React `useState` for local state
- React `useContext` for global state
- Form state managed by React Hook Form

**3. Authentication State**:
- JWT in HTTP-only cookie
- User info fetched from `/api/auth/me`
- Stored in AuthProvider context

### Routing Structure

**Next.js App Router** (file-system based):

```
app/
├── (public routes - no auth required)
│   ├── page.tsx                    → /
│   ├── about/page.tsx              → /about
│   ├── contact/page.tsx            → /contact
│   ├── batches/
│   │   ├── page.tsx                → /batches
│   │   └── [slug]/page.tsx         → /batches/[slug]
│   ├── blog/
│   │   ├── page.tsx                → /blog
│   │   └── [slug]/page.tsx         → /blog/[slug]
│   ├── mentors/
│   │   ├── page.tsx                → /mentors
│   │   └── [id]/page.tsx           → /mentors/[id]
│   ├── login/page.tsx              → /login
│   ├── register/page.tsx           → /register
│   ├── forgot-password/page.tsx    → /forgot-password
│   └── reset-password/page.tsx     → /reset-password
│
├── (protected routes - auth required)
│   └── dashboard/
│       ├── page.tsx                → /dashboard (Admin)
│       ├── layout.tsx              → Dashboard layout
│       ├── analytics/page.tsx      → /dashboard/analytics
│       ├── batches/...
│       ├── blog/...
│       ├── enrollment/page.tsx
│       ├── invoices/page.tsx
│       ├── payments/page.tsx
│       ├── settings/page.tsx
│       ├── users/...
│       ├── students/...
│       ├── mentors/...
│       ├── student/                → Student dashboard
│       │   ├── page.tsx
│       │   ├── batches/...
│       │   ├── enrollment/page.tsx
│       │   ├── payment/page.tsx
│       │   ├── invoices/page.tsx
│       │   └── settings/page.tsx
│       └── mentor/                 → Mentor dashboard
│           ├── page.tsx
│           ├── batches/...
│           └── settings/page.tsx
│
└── api/                            → API routes
```

### Form Validation

**Library**: Zod + React Hook Form

```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  amount: z.number().positive('Amount must be positive'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### Responsive Design

**Breakpoints** (Tailwind CSS):
- `sm`: 640px (mobile)
- `md`: 768px (tablet)
- `lg`: 1024px (small desktop)
- `xl`: 1280px (desktop)
- `2xl`: 1536px (large desktop)

**Mobile-First Approach**:
- Default styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly UI elements

---

## Core Features & Business Logic

### 1. Student Registration & Approval

**Workflow**:
```
Student registers
      ↓
User.approvalStatus = 'pending'
      ↓
Admin views pending students
      ↓
Admin approves/rejects
      ↓
If approved:
  - User.approvalStatus = 'approved'
  - User can access dashboard
If rejected:
  - User.approvalStatus = 'rejected'
  - User.rejectionReason set
  - User cannot access dashboard
```

**Business Rules**:
- All new students start as 'pending'
- Only admin and marketing can approve
- Rejection requires reason

### 2. Batch Enrollment

**Workflow**:
```
Student browses batches
      ↓
Student clicks "Enroll"
      ↓
Check: Is student approved?
      ↓
Check: Is batch full? (currentStudents < maxStudents)
      ↓
Check: Is student already enrolled?
      ↓
Create Enrollment (status: 'pending')
      ↓
Create Invoice (status: 'pending')
      ↓
Redirect to payment page
```

**Business Rules**:
- Student must be approved
- Batch must not be full
- No duplicate enrollments
- Enrollment status and payment status are separate

### 3. Payment Processing

**Workflow**:
```
Student submits payment
      ↓
Create Payment (status: 'pending', verificationStatus: 'pending')
      ↓
Link to Invoice
      ↓
Admin views pending payments
      ↓
Admin verifies/rejects
      ↓
If verified:
  - Payment.status = 'verified'
  - Payment.verificationStatus = 'verified'
  - Invoice.paidAmount += payment.amount
  - Invoice.remainingAmount -= payment.amount
  - If Invoice.remainingAmount == 0:
    - Invoice.status = 'paid'
  - Enrollment.paymentStatus = 'paid'
  - Enrollment.status = 'approved'
  - User.approvalStatus = 'approved' (if not already)
If rejected:
  - Payment.status = 'rejected'
  - Payment.rejectionReason set
```

**Business Rules**:
- Multiple partial payments allowed
- Full payment not required for approval
- Admin verification required
- Payment amount validated against invoice remaining amount

### 4. Batch Management

**Batch Statuses**:
- **draft**: Work in progress
- **published**: Live, accepting enrollments
- **upcoming**: Scheduled to start soon
- **ongoing**: Currently active
- **completed**: Finished
- **cancelled**: Cancelled

**Auto-Status Update Logic** (can be implemented):
```
If today >= startDate && today < endDate:
  status = 'ongoing'
If today >= endDate:
  status = 'completed'
```

### 5. Schedule Management

**Features**:
- Create class schedules
- Set meeting links (Zoom, Google Meet)
- Mark as online/offline
- Track status (scheduled, completed, cancelled)

**Access Control**:
- Mentor can create schedules for own batches
- Admin can create schedules for all batches
- Students can view schedules for enrolled batches

### 6. Assignment System

**Features**:
- Create assignments with due dates
- Students submit assignments
- Mentors grade submissions
- Feedback system

**Business Rules**:
- Only enrolled students can submit
- Late submissions marked
- Grades within 0 to maxPoints

### 7. Discussion Forums

**Features**:
- Batch-specific discussions
- Threaded replies
- Pin important discussions
- Real-time updates

**Access Control**:
- Students can post in enrolled batches
- Mentors can post in assigned batches
- Admin can post everywhere

### 8. Invoice Generation

**Auto-Invoice Creation**:
```
When Enrollment created:
  Generate invoiceNumber (format: INV-YYYYMMDD-XXXX)
  amount = batch.discountPrice || batch.regularPrice
  Apply promo code if valid
  finalAmount = amount - discountAmount - promoDiscount
  remainingAmount = finalAmount
  paidAmount = 0
  status = 'pending'
  dueDate = enrollmentDate + 30 days
```

**Invoice Status Logic**:
- **pending**: No payment received
- **partial**: Some payment received
- **paid**: Fully paid (remainingAmount == 0)
- **overdue**: dueDate passed and not paid
- **cancelled**: Cancelled enrollment

### 9. Promo Code System

**Validation Rules**:
- Active (isActive: true)
- Valid date range (today between validFrom and validUntil)
- Not exceeded maxUses
- User hasn't exceeded maxUsesPerUser
- Invoice amount >= minAmount
- Applicable to batch/course type

**Application**:
```
Discount = 
  if type == 'percentage':
    (invoiceAmount * value) / 100
  else:
    value
```

### 10. Mentor Dashboard

**Features**:
- View assigned batches
- Manage batch students
- Create/edit schedules
- Create/grade assignments
- Moderate discussions
- Track student progress

### 11. Admin Dashboard

**Features**:
- System overview (stats, charts)
- User management (CRUD)
- Batch management (CRUD)
- Mentor management (CRUD)
- Student management (CRUD)
- Payment verification
- Invoice management
- Blog management
- Newsletter management
- Contact message management

### 12. Student Dashboard

**Features**:
- Enrolled batches overview
- Upcoming schedules
- Pending assignments
- Payment history
- Invoice access
- Progress tracking
- Profile settings

---

## Third-Party Integrations

### 1. Cloudinary (Image Management)

**Purpose**: Image upload, storage, optimization, and delivery

**Configuration**:
```typescript
// lib/cloudinary.ts
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

**Usage**:
- Batch cover photos
- Mentor avatars
- User profile pictures
- Blog featured images
- Payment screenshots

**Features Used**:
- Automatic image optimization
- Responsive image sizing
- Folder organization
- Secure uploads
- CDN delivery

**Client-Side Upload**:
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', UPLOAD_PRESET);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  { method: 'POST', body: formData }
);
```

**Server-Side Upload** (Fallback):
```typescript
// Uses Cloudinary SDK
import { v2 as cloudinary } from 'cloudinary';
const result = await cloudinary.uploader.upload(file, {
  folder: 'ccit',
  resource_type: 'auto'
});
```

### 2. Nodemailer (Email Service)

**Purpose**: Send transactional emails

**Configuration**:
```typescript
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

**Email Types**:
1. **Welcome Email**: Sent on registration
2. **Password Reset**: With time-limited link
3. **OTP Email**: For sensitive actions (payment deletion)

**Gmail SMTP Settings**:
- Host: smtp.gmail.com
- Port: 587
- Secure: false (STARTTLS)

**Email Templates**:
- Responsive HTML
- Plain text fallback
- Professional design
- Branded colors

### 3. PDF Generation

**Libraries**:
- `@react-pdf/renderer`: React-based PDF generation
- `jspdf`: Alternative PDF library

**Usage**:
- Invoice PDF generation
- Certificate generation (future)
- Report generation (future)

**Invoice PDF Features**:
- Company branding
- Invoice details
- Payment breakdown
- Professional formatting

---

## Security Implementation

### 1. Authentication Security

**JWT Best Practices**:
- Short expiration (7 days)
- HTTP-only cookies (prevents XSS)
- Secure flag in production
- SameSite: Strict
- Not stored in localStorage

**Password Security**:
- bcrypt hashing (12 rounds)
- Never transmitted/logged
- Password reset tokens (time-limited)
- No password in API responses

### 2. Authorization Security

**Middleware Protection**:
- All `/dashboard/*` routes protected
- Role-based API access control
- User ID validation
- Request headers sanitization

**API Security**:
- Authentication required by default
- Role validation on sensitive endpoints
- Resource ownership verification
- Rate limiting (can be added)

### 3. Input Validation

**Zod Schemas**:
- Server-side validation (all APIs)
- Client-side validation (forms)
- Type safety
- Sanitization

**Mongoose Validation**:
- Schema-level constraints
- Custom validators
- Unique constraints
- Required fields

### 4. Data Protection

**Sensitive Data**:
- Passwords: bcrypt hashed
- JWT secret: Environment variable
- Database URI: Environment variable
- API keys: Environment variables

**Data Sanitization**:
- XSS prevention
- SQL injection prevention (MongoDB)
- NoSQL injection prevention

### 5. CSRF Protection

**Mitigation**:
- SameSite cookies
- Origin validation
- Custom headers

### 6. File Upload Security

**Validation**:
- File type whitelist
- File size limits (5MB)
- Virus scanning (can be added)
- Secure file naming

### 7. Error Handling

**Production Best Practices**:
- No stack traces exposed
- Generic error messages
- Detailed logging server-side
- No sensitive data in errors

---

## Performance Optimizations

### 1. Database Optimizations

**Indexing**:
- Strategic indexes on frequently queried fields
- Compound indexes for common query patterns
- Text indexes for search
- Unique indexes for data integrity

**Query Optimization**:
- Projection (select only needed fields)
- Lean queries for read-only operations
- Pagination for large datasets
- Avoid N+1 queries

**Denormalization**:
- Student model duplicates user info
- Reduces JOIN-like operations

**Connection Pooling**:
- Reuse connections
- Global cached connection in development

### 2. Frontend Optimizations

**Next.js Features**:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG) for public pages
- Incremental Static Regeneration (ISR)
- Image optimization (next/image)
- Code splitting (automatic)
- Turbopack for faster builds

**React Optimizations**:
- React Server Components (RSC)
- Lazy loading
- Memoization (useMemo, useCallback)
- Suspense boundaries

**Bundle Optimization**:
- Tree shaking
- Code splitting
- Dynamic imports
- Minimal dependencies

### 3. Image Optimization

**Cloudinary**:
- Automatic format conversion (WebP)
- Responsive image sizing
- Lazy loading
- CDN delivery

**next/image**:
- Automatic optimization
- Lazy loading
- Responsive sizing
- WebP conversion

### 4. Caching Strategy

**Browser Caching**:
- Static assets cached
- Public pages cached
- API responses cached (where appropriate)

**Server Caching**:
- MongoDB connection pooling
- Query result caching (can be implemented)

### 5. API Optimizations

**Response Size**:
- Pagination
- Field projection
- Compression (gzip)

**Efficient Queries**:
- Batch operations
- Parallel processing
- Avoid sequential API calls

---

## Deployment Architecture

### Recommended Hosting

**Frontend + Backend**: Vercel (recommended for Next.js)
**Database**: MongoDB Atlas
**Image Storage**: Cloudinary
**Email**: Gmail SMTP or SendGrid

### Vercel Deployment

**Build Command**:
```bash
npm run build
```

**Environment Variables** (Vercel Dashboard):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
EMAIL_USER=...
EMAIL_APP_PASSWORD=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**Deployment Steps**:
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy (automatic on push to main)

### Alternative Hosting

**Other Platforms**:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Heroku

### Database Hosting

**MongoDB Atlas**:
- Free tier available
- Automatic backups
- Scalable
- Global distribution
- Built-in security

**Configuration**:
- IP whitelist (or allow all for serverless)
- Database user credentials
- Connection string

### Domain Configuration

**Custom Domain**:
- Add domain in Vercel
- Configure DNS records
- Enable HTTPS (automatic)

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**:
```bash
git clone <repository-url>
cd ccit-main
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Environment Variables**:
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/ccit
JWT_SECRET=your-development-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Run Development Server**:
```bash
npm run dev
```

5. **Access Application**:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

### Database Setup

**Local MongoDB**:
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Or use MongoDB Atlas (cloud)
```

**Seed Data** (optional):
```bash
node scripts/seed-mentors.js
```

### Code Quality

**Linting**:
```bash
npm run lint
```

**Type Checking**:
```bash
npx tsc --noEmit
```

### Git Workflow

**Branching Strategy**:
- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Hotfix branches

**Commit Convention**:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

### Debugging

**Server Logs**:
```bash
# Check console output
# Use console.log for debugging
```

**Database Queries**:
```bash
# Use MongoDB Compass for visual debugging
# Use mongo shell for queries
```

**Network Debugging**:
```bash
# Use browser DevTools Network tab
# Check API responses
```

---

## Future Enhancements

### Short-term (1-3 months)

1. **Real-time Features**
   - Live chat between students and mentors
   - Real-time notifications
   - WebSocket integration

2. **Advanced Analytics**
   - Student progress tracking
   - Batch performance metrics
   - Revenue analytics
   - Engagement metrics

3. **Certificate System**
   - Auto-generate certificates on completion
   - Downloadable PDF
   - Shareable links
   - Verification system

4. **Advanced Payment Features**
   - Installment plans
   - Payment reminders
   - Automatic payment gateway integration (SSLCommerz, Stripe)

5. **Mobile App**
   - React Native app
   - Push notifications
   - Offline access to content

### Mid-term (3-6 months)

1. **Video Streaming**
   - Integration with video platforms
   - Live streaming capabilities
   - Recorded session library

2. **Advanced Course Builder**
   - Drag-and-drop course creation
   - Multi-media support
   - Quiz system
   - Interactive coding exercises

3. **Gamification**
   - Points and badges
   - Leaderboards
   - Achievement system
   - Streak tracking

4. **Community Features**
   - Student forums
   - Mentor Q&A sessions
   - Peer-to-peer learning
   - Study groups

5. **Advanced Reporting**
   - Custom report builder
   - Automated report generation
   - Export to Excel/PDF
   - Scheduled reports

### Long-term (6+ months)

1. **AI/ML Features**
   - Personalized learning paths
   - Content recommendations
   - Automated grading
   - Chatbot support

2. **Multi-language Support**
   - Full i18n implementation
   - Multiple language interfaces
   - Localized content

3. **White-label Solution**
   - Multi-tenant architecture
   - Custom branding
   - Subdomain support
   - Separate databases

4. **Advanced Security**
   - Two-factor authentication
   - Biometric authentication
   - Security audits
   - Compliance certifications

5. **Marketplace**
   - Third-party course integration
   - Mentor marketplace
   - Revenue sharing
   - Content licensing

---

## Conclusion

This architectural documentation provides a comprehensive overview of the CCIT Learning Management System. It covers all aspects of the system from database design to frontend architecture, business logic, security, and deployment.

### Key Strengths

1. **Scalable Architecture**: Built on Next.js and MongoDB for horizontal scaling
2. **Secure by Design**: JWT authentication, role-based access control, input validation
3. **Modern Tech Stack**: Latest Next.js, React, TypeScript, Tailwind CSS
4. **Performance Optimized**: Strategic indexing, caching, code splitting
5. **Maintainable Code**: Clear structure, separation of concerns, TypeScript safety
6. **User-Friendly**: Responsive design, Bengali language support, intuitive UI

### Maintenance Guidelines

1. **Regular Updates**: Keep dependencies updated
2. **Database Backups**: Regular automated backups
3. **Security Patches**: Apply security updates promptly
4. **Performance Monitoring**: Monitor API response times, database queries
5. **Error Logging**: Implement centralized error logging (Sentry, LogRocket)
6. **Documentation**: Keep this documentation updated with changes

### Support

For technical questions or issues:
- Email: creativecanvasit@gmail.com
- Phone: 01603718379, 01845202101

---

**Last Updated**: October 1, 2025
**Version**: 1.0.0
**Maintained By**: Creative Canvas IT Development Team

