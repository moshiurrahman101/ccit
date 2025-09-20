# New Batch System Documentation

## Overview

The new Batch system is a comprehensive learning management feature that allows administrators and mentors to create, manage, and publish educational batches with detailed course information, mentor assignments, and student enrollment tracking.

## Features

### 🎯 Multi-Step Batch Creation Form

The batch creation process is divided into 5 intuitive steps:

1. **Basic Information**
   - Batch name (unique, required)
   - Cover photo upload via Cloudinary
   - Course type (online/offline)
   - Regular price and optional discount pricing
   - Mentor selection with live search
   - Short description

2. **Study & Course Details**
   - Syllabus/Modules management (title, description, duration, order)
   - Learning outcomes (what students will learn)
   - Requirements/Prerequisites
   - Course features (e.g., "Certificate", "Lifetime Access")

3. **Schedule & Capacity**
   - Duration (number + unit: days/weeks/months/years)
   - Start and end dates
   - Maximum students (default: 30)
   - Current students count

4. **SEO & Marketing**
   - Auto-generated slug (editable, unique)
   - Meta description for SEO
   - Tags for categorization

5. **Finalize**
   - Status selection (draft/published/upcoming/ongoing/completed/cancelled)
   - Review all details before publishing

### 🗂️ Database Schema

#### Batch Model
```typescript
interface IBatch {
  name: string;                    // Unique batch name
  description: string;             // Short description
  coverPhoto?: string;             // Cloudinary URL
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;     // Auto-calculated
  mentorId: ObjectId;             // Reference to Mentor
  modules: [{
    title: string;
    description: string;
    duration: number;              // in hours
    order: number;
  }];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: Date;
  endDate: Date;
  maxStudents: number;            // default: 30
  currentStudents: number;        // default: 0
  marketing: {
    slug: string;                 // URL-friendly, unique
    metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;              // default: true
  createdBy: string;              // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

#### Mentor Model
```typescript
interface IMentor {
  name: string;
  email: string;                  // Unique
  phone: string;
  bio: string;
  avatar?: string;
  designation: string;
  experience: number;             // years
  expertise: string[];            // areas of expertise
  skills: string[];               // technical skills
  socialLinks: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  teachingExperience: number;     // years
  rating?: number;                // 0-5
  studentsCount?: number;
  coursesCount?: number;
  achievements: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 🚀 API Endpoints

#### Batch Management
- `GET /api/batches` - List batches with pagination and filters
- `POST /api/batches` - Create new batch (admin/mentor only)
- `GET /api/batches/[id]` - Get single batch by ID
- `PUT /api/batches/[id]` - Update batch (admin/mentor only)
- `DELETE /api/batches/[id]` - Delete batch (admin only)
- `GET /api/batches/slug/[slug]` - Get batch by slug (public)

#### Mentor Management
- `GET /api/mentors/search` - Search mentors with live search

#### File Upload
- `POST /api/upload/cloudinary` - Upload images to Cloudinary

### 🎨 Frontend Components

#### BatchForm Component
- Multi-step form with progress indicator
- Real-time validation
- Mentor live search
- Cloudinary image upload
- Auto-slug generation

#### BatchFormSteps Components
- `Step1BasicInfo` - Basic information and mentor selection
- `Step2CourseDetails` - Syllabus, learning outcomes, requirements
- `Step3ScheduleCapacity` - Duration, dates, capacity
- `Step4SEOMarketing` - SEO and marketing details
- `Step5Finalize` - Review and status selection

#### Pages
- `/batches` - Public batch listing page with filters
- `/batches/[slug]` - Individual batch detail page
- `/dashboard/batches` - Admin batch management dashboard

### 🔧 Key Features

#### Auto-Generated Slugs
- Automatically creates URL-friendly slugs from batch names
- Ensures uniqueness across all batches
- Editable during creation/editing

#### Cloudinary Integration
- Automatic image optimization
- Responsive image sizing
- Secure upload with folder organization

#### Live Mentor Search
- Real-time search as you type
- Searches by name, designation, expertise, and skills
- Displays mentor ratings and experience

#### Status Management
- Draft: Work in progress, not visible to public
- Published: Live and visible to public
- Upcoming: Scheduled for future
- Ongoing: Currently running
- Completed: Finished
- Cancelled: Cancelled

#### Pricing System
- Regular price (required)
- Optional discount price
- Auto-calculated discount percentage
- Support for different currencies

### 📊 Dashboard Features

#### Statistics Cards
- Total batches
- Upcoming batches
- Ongoing batches
- Completed batches
- Cancelled batches
- Active batches

#### Batch Management Table
- Sortable columns
- Search functionality
- Status filtering
- Bulk actions
- Direct links to public pages

### 🔍 Search and Filtering

#### Public Batch Listing
- Search by name, description, or tags
- Filter by status (published, upcoming, ongoing)
- Filter by course type (online, offline)
- Pagination support

#### Admin Dashboard
- Advanced search and filtering
- Status-based filtering
- Mentor-based filtering
- Real-time updates

### 🛡️ Security and Validation

#### Authentication
- JWT-based authentication
- Role-based access control
- Admin and mentor permissions

#### Validation
- Server-side validation with Zod schemas
- Client-side validation with real-time feedback
- Unique constraint validation
- File upload validation

#### Data Integrity
- Referential integrity with mentor relationships
- Automatic slug generation and validation
- Date validation (end date after start date)
- Student count validation (current ≤ max)

### 🚀 Getting Started

1. **Environment Setup**
   ```bash
   # Add to .env.local
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ccit_uploads
   ```

2. **Seed Sample Data**
   ```bash
   node scripts/seed-mentors.js
   ```

3. **Access the System**
   - Public batches: `/batches`
   - Admin dashboard: `/dashboard/batches`
   - Create batch: Click "New Batch" in dashboard

### 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

### 🎯 SEO Optimization

- SEO-friendly URLs with slugs
- Meta descriptions
- Structured data ready
- Social media sharing support
- Fast loading times

### 🔄 Future Enhancements

- Batch enrollment system
- Payment integration
- Student progress tracking
- Certificate generation
- Batch analytics and reporting
- Email notifications
- Calendar integration
- Video content support

## File Structure

```
├── models/
│   ├── Batch.ts              # Batch model and schema
│   └── Mentor.ts             # Mentor model and schema
├── app/api/
│   ├── batches/
│   │   ├── route.ts          # Batch CRUD operations
│   │   ├── [id]/route.ts     # Individual batch operations
│   │   └── slug/[slug]/route.ts # Public batch by slug
│   ├── mentors/
│   │   └── search/route.ts   # Mentor search API
│   └── upload/
│       └── cloudinary/route.ts # Image upload API
├── components/dashboard/
│   ├── BatchForm.tsx         # Main batch form component
│   └── BatchFormSteps.tsx    # Individual step components
├── app/
│   ├── batches/
│   │   ├── page.tsx          # Public batch listing
│   │   └── [slug]/page.tsx   # Individual batch page
│   └── dashboard/batches/
│       └── page.tsx          # Admin dashboard
└── scripts/
    └── seed-mentors.js       # Sample data seeding
```

This new Batch system provides a complete solution for managing educational content with a modern, user-friendly interface and robust backend architecture.
