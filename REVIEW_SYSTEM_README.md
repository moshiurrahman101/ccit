# Review System Documentation

## Overview
A comprehensive review and success story system that allows students to submit reviews and admins to manage them. Reviews can be displayed dynamically on a success stories page.

## Features

### For Students
- **Submit Reviews**: Students can share their experiences and success stories
- **Rating System**: 5-star rating system
- **Success Story Tags**: Mark reviews as success stories
- **Achievement Sharing**: Include earnings or career achievements
- **Admin Approval**: Reviews are submitted for admin approval before being published

### For Admins
- **Review Management**: Approve, reject, feature, or delete reviews
- **Featured Reviews**: Mark outstanding reviews as featured
- **Auto-Approval**: Admin-created reviews are auto-approved
- **Filtering**: Filter by approval status, featured status, or success stories

### Public Display
- **Success Stories Page**: Dynamic display of approved reviews
- **Filtering**: Filter by all, success stories, or featured reviews
- **Featured Highlighting**: Featured reviews are visually highlighted
- **Responsive Design**: Beautiful gradient UI with card-based layout

## File Structure

```
models/
├── Review.ts                    # Review database model

app/
├── api/
│   ├── reviews/
│   │   └── route.ts             # Public review API (GET, POST)
│   └── admin/
│       └── reviews/
│           └── route.ts         # Admin review management API

├── reviews/
│   └── upload/
│       └── page.tsx             # Review submission page

└── success-stories/
    └── page.tsx                 # Success stories display page

components/
└── review/
    ├── ReviewForm.tsx           # Review submission form
    ├── ReviewCard.tsx           # Individual review card component
    └── SuccessStoriesClient.tsx # Success stories client component
```

## Database Model

### Review Schema
```typescript
{
  studentId: ObjectId,           // Reference to User
  batchId?: ObjectId,            // Reference to Batch (optional)
  name: string,
  email: string,
  avatar?: string,
  role: string,
  company?: string,
  rating: number,                // 1-5
  review: string,
  earning?: string,
  isSuccessStory: boolean,
  isApproved: boolean,
  isFeatured: boolean,
  tags?: string[],
  beforeAfter?: {
    before: string,
    after: string
  },
  createdBy: ObjectId,
  approvedBy?: ObjectId,
  approvedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Reviews API (`/api/reviews`)

#### GET Reviews
```
GET /api/reviews?isApproved=true&isFeatured=true&isSuccessStory=true&limit=50
```
Query Parameters:
- `isApproved` - Filter by approval status
- `isFeatured` - Filter featured reviews
- `isSuccessStory` - Filter success stories
- `limit` - Number of reviews to return

Response:
```json
{
  "reviews": [...]
}
```

#### POST Create Review
```
POST /api/reviews
Authorization: Bearer <token>
```
Body:
```json
{
  "name": "Student Name",
  "role": "Developer",
  "company": "Tech Corp",
  "rating": 5,
  "review": "Amazing course...",
  "earning": "৳80,000/month",
  "isSuccessStory": true
}
```

### Admin Reviews API (`/api/admin/reviews`)

#### GET All Reviews (Admin Only)
```
GET /api/admin/reviews?page=1&limit=20&isApproved=true
```

#### PATCH Update Review Status
```
PATCH /api/admin/reviews
Authorization: Bearer <token>
```
Body:
```json
{
  "reviewId": "...",
  "action": "approve",  // approve, reject, feature, unfeature, update
  "data": {}  // For update action
}
```

#### DELETE Review
```
DELETE /api/admin/reviews?id=<reviewId>
Authorization: Bearer <token>
```

## Pages

### Review Upload Page (`/reviews/upload`)
- Student-facing page for submitting reviews
- Beautiful form with all review fields
- Auto-fills user information from token
- Success confirmation after submission
- Link to success stories page

### Success Stories Page (`/success-stories`)
- Public page displaying all approved reviews
- Filtering by All, Success Stories, or Featured
- Stats section showing student counts and ratings
- Call-to-action to submit reviews
- Responsive grid layout for reviews

## Components

### ReviewForm
**Location**: `components/review/ReviewForm.tsx`

Props: None (uses user context from localStorage token)

Features:
- Form validation
- Star rating selector
- Character count for review text
- Success story checkbox
- Achievement/earning field
- Loading states
- Success confirmation

### ReviewCard
**Location**: `components/review/ReviewCard.tsx`

Props:
```typescript
{
  name: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  earning?: string;
  avatar?: string;
  isFeatured?: boolean;
}
```

Features:
- Beautiful card design with gradient background
- Avatar with fallback to initials
- Star rating display
- Achievement badge
- Featured badge
- Quote icon

### SuccessStoriesClient
**Location**: `components/review/SuccessStoriesClient.tsx`

Features:
- Fetches reviews on component mount
- Filter state management
- Loading and error states
- Empty state with CTA
- Separate featured from regular reviews
- Sort featured reviews first

## Usage Examples

### Student Submitting a Review

1. Navigate to `/reviews/upload`
2. Fill in the form:
   - Name (auto-filled from user data)
   - Role (e.g., "Full Stack Developer")
   - Company (optional)
   - Rating (click stars)
   - Review text
   - Achievement (optional)
   - Check "Success Story" if applicable
3. Click "Submit Review"
4. Review is submitted for admin approval
5. Success message is displayed

### Admin Managing Reviews

1. Go to `/dashboard`
2. Navigate to review management section
3. View pending reviews
4. Actions available:
   - **Approve**: Make review visible publicly
   - **Reject**: Keep review hidden
   - **Feature**: Highlight on success stories page
   - **Unfeature**: Remove featured status
   - **Delete**: Remove review permanently

### Viewing Success Stories

1. Navigate to `/success-stories`
2. Browse all approved reviews
3. Use filter buttons:
   - **All Stories**: Show all approved reviews
   - **Success Stories**: Show only success stories
   - **Featured**: Show only featured reviews
4. Featured reviews appear first and have a highlighted border

## Styling

### Design System
- **Background**: Gradient from blue-900 via purple-900 to orange-900
- **Cards**: White/10 with backdrop blur and white/20 border
- **Featured**: Yellow-400/50 ring for featured reviews
- **Primary Actions**: Gradient from yellow-400 to orange-500

### Responsive Design
- Mobile: Single column grid
- Tablet: Single column (optimized for readability)
- Desktop: Two column grid for reviews

## Security Features

1. **Authentication Required**: All API endpoints require JWT token
2. **Admin Authorization**: Admin endpoints verify admin role
3. **Auto-Approval**: Admin-created reviews are auto-approved
4. **Rate Limiting**: Can be added for production
5. **Input Validation**: All fields are validated before saving

## Future Enhancements

1. **Image Upload**: Allow students to upload profile photos
2. **Video Reviews**: Support video testimonials
3. **Batch-Specific Reviews**: Show reviews by batch/course
4. **Review Reactions**: Like/react to reviews
5. **Reply System**: Allow admins to reply to reviews
6. **Report System**: Let users report inappropriate reviews
7. **Analytics**: Track review metrics and trends
8. **Export**: Export reviews to CSV/PDF

## Testing Checklist

### Student Flow
- [ ] Can access review upload page
- [ ] Can fill out and submit review
- [ ] See success confirmation
- [ ] Receive "pending approval" message
- [ ] Cannot see unpublished reviews

### Admin Flow
- [ ] Can see all reviews in dashboard
- [ ] Can filter by approval status
- [ ] Can approve pending reviews
- [ ] Can feature/unfeature reviews
- [ ] Can delete reviews
- [ ] Admin-created reviews auto-approved

### Public Display
- [ ] Success stories page loads reviews
- [ ] Can filter by all/success/featured
- [ ] Featured reviews appear first
- [ ] Featured reviews have visual distinction
- [ ] CTA buttons work correctly
- [ ] Responsive on mobile/tablet/desktop

## Troubleshooting

### Reviews Not Showing
1. Check if reviews are approved (`isApproved: true`)
2. Verify API endpoint is returning data
3. Check browser console for errors
4. Verify database connection

### Form Submission Fails
1. Check if user is logged in (token in localStorage)
2. Verify all required fields are filled
3. Check network tab for API errors
4. Ensure backend is running

### Admin Actions Not Working
1. Verify admin role in user document
2. Check token is valid and not expired
3. Review API route logs for errors
4. Verify MongoDB connection

## Support

For issues or questions:
1. Check this documentation
2. Review API route code comments
3. Check console/network errors
4. Contact development team
