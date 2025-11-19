# Recorded Course System Documentation

## Overview
This system allows you to sell pre-recorded courses using YouTube unlisted links with enhanced security features to prevent unauthorized sharing.

## Features

### 1. Course Management
- Create, edit, and delete recorded courses
- Upload multiple YouTube unlisted video links
- Set preview videos (free to watch)
- Course pricing and discount management
- Course categorization and metadata

### 2. Security Features

#### Video Access Control
- **Token-based Access**: Videos are only accessible through authenticated API endpoints
- **No Direct URLs**: YouTube URLs are never exposed directly to the frontend
- **Enrollment Verification**: Only enrolled students with paid status can access full videos
- **Preview Videos**: Free preview videos available to all visitors

#### Player Security
- **Secure Video Player Component**: Custom player that prevents common extraction methods
- **Right-click Disabled**: Prevents context menu access
- **Keyboard Shortcuts Disabled**: Blocks F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
- **YouTube Privacy Mode**: Uses privacy-enhanced mode in YouTube embed
- **No Related Videos**: Prevents YouTube from showing related videos

### 3. Payment Integration
- Uses existing payment system
- Creates invoices for course enrollment
- Tracks enrollment status and payment status
- Automatic access activation after payment verification

### 4. Student Experience
- Browse available recorded courses
- Enroll in courses
- Watch videos in secure player
- Track progress per video
- Access course materials

## Important Security Notes

### ⚠️ Limitations
While we implement multiple security layers, **complete protection is not possible** with YouTube embeds because:

1. **Browser DevTools**: Users can still inspect page source and find video IDs
2. **Network Tab**: YouTube API calls can be intercepted
3. **YouTube's Public Nature**: Even unlisted videos can be accessed if someone has the direct link

### ✅ What We Protect Against
- **Casual Sharing**: Makes it difficult for students to casually copy and share links
- **Direct URL Exposure**: YouTube URLs are not visible in page source
- **Unauthorized Access**: Only enrolled, paid students can access videos
- **Bulk Extraction**: Makes it harder to extract all video links at once

### 🔒 Best Practices
1. **Use Unlisted Videos**: Always use YouTube's unlisted setting (not public)
2. **Monitor Access**: Track who accesses which videos
3. **Regular Audits**: Periodically check for unauthorized sharing
4. **Consider Alternatives**: For maximum security, consider:
   - Vimeo with password protection
   - Self-hosted video solutions
   - DRM-protected video platforms

## API Endpoints

### Course Management
- `GET /api/recorded-courses` - List all courses (admin) or published courses (public)
- `POST /api/recorded-courses` - Create new course (admin only)
- `GET /api/recorded-courses/[id]` - Get single course
- `PUT /api/recorded-courses/[id]` - Update course (admin only)
- `DELETE /api/recorded-courses/[id]` - Delete course (admin only)

### Video Access
- `GET /api/recorded-courses/[id]/video-access?videoId=xxx` - Get secure video access token

### Enrollment
- `POST /api/recorded-courses/enroll` - Enroll in a course

## Database Models

### RecordedCourse
- Stores course information
- Contains array of videos with YouTube URLs
- YouTube video IDs are extracted and stored separately
- URLs are stored but not exposed in public APIs

### RecordedCourseEnrollment
- Tracks student enrollments
- Manages payment status
- Tracks video progress
- Supports access expiration

## Usage

### Creating a Course (Admin)
1. Navigate to `/dashboard/recorded-courses`
2. Click "নতুন রেকর্ড করা কোর্স"
3. Fill in course details
4. Add YouTube unlisted video links
5. Set preview videos (optional)
6. Set pricing
7. Publish course

### Enrolling in a Course (Student)
1. Browse courses at `/recorded-courses`
2. Click on a course
3. Click "Enroll Now"
4. Complete payment
5. Access videos after payment verification

### Watching Videos (Student)
1. Navigate to enrolled course
2. Videos load in secure player
3. Progress is tracked automatically
4. Preview videos are accessible without enrollment

## Security Implementation Details

### Video Access Flow
```
Student requests video
    ↓
Check authentication token
    ↓
Verify enrollment status
    ↓
Check payment status
    ↓
Return only video ID (not full URL)
    ↓
Frontend constructs embed URL
    ↓
Load in secure player
```

### Player Security Measures
1. **Context Menu Disabled**: Prevents right-click access
2. **Keyboard Shortcuts Blocked**: Prevents DevTools access
3. **YouTube Privacy Mode**: Enhanced privacy settings
4. **No Related Videos**: Reduces exposure
5. **Origin Restriction**: YouTube embed respects origin

## Future Enhancements
- Video download tracking
- Access logging and analytics
- Watermarking (if using self-hosted solution)
- Time-limited access
- IP-based restrictions
- Device limit per enrollment

