export type UserRole = 'student' | 'mentor' | 'admin' | 'marketing' | 'support';

export type PaymentMethod = 'bkash' | 'nagad';

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface StudentInfo {
  studentId?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nid?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: {
    street?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
    address?: string;
  };
  education?: {
    level?: string;
    institution?: string;
    graduationYear?: number;
    gpa?: number;
    major?: string;
  };
  socialInfo?: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  paymentInfo?: {
    paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
    paymentNumber?: string;
    transactionId?: string;
    paidAmount?: number;
    dueAmount?: number;
    lastPaymentDate?: Date;
    paymentStatus?: 'paid' | 'partial' | 'due' | 'overdue';
  };
  batchInfo?: {
    batchId?: string;
    batchName?: string;
    enrollmentDate?: Date;
    completionDate?: Date;
    status?: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
  };
  isOfflineStudent?: boolean;
  profilePicture?: string;
  documents?: Array<{
    type: 'nid' | 'certificate' | 'photo' | 'other';
    url: string;
    uploadedAt: Date;
  }>;
  notes?: string;
  isVerified?: boolean;
}

export interface MentorInfo {
  specialization?: string[];
  experience?: number; // in years
  bio?: string;
  qualifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  availability?: {
    timezone?: string;
    workingHours?: string;
    daysAvailable?: string[];
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  studentInfo?: StudentInfo;
  mentorInfo?: MentorInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseResource {
  title: string;
  type: 'video' | 'document' | 'link' | 'assignment';
  url: string;
  description: string;
}

export interface CourseAssignment {
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  instructions: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  syllabus: string;
  tags: string[];
  keywords: string[];
  learningOutcomes: string[];
  duration: number; // in hours
  price: number;
  mentorId: string;
  mentor: User;
  thumbnail?: string;
  category: 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'bengali' | 'english';
  maxStudents: number;
  hasOfflineBatch: boolean;
  hasOnlineBatch: boolean;
  requirements: string[];
  resources: CourseResource[];
  assignments: CourseAssignment[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  _id: string;
  studentId: string;
  courseId: string;
  student: User;
  course: Course;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  approvedByUser?: User;
}

export interface ClassSession {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  sessionDate: Date;
  duration: number; // in minutes
  zoomLink?: string;
  googleMeetLink?: string;
  youtubeVideoId?: string;
  resources: ClassResource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassResource {
  _id: string;
  title: string;
  type: 'pdf' | 'slides' | 'video' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  submissionText?: string;
  submissionFiles: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

export interface Certificate {
  _id: string;
  studentId: string;
  courseId: string;
  student: User;
  course: Course;
  certificateNumber: string;
  issueDate: Date;
  mentorSignature: string;
  pdfUrl: string;
  shareableLink: string;
  createdAt: Date;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
  author: User;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingApprovals: number;
  totalRevenue: number;
  monthlyRevenue: number;
}
