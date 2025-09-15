import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  bn: {
    translation: {
      // Navigation
      'nav.home': 'হোম',
      'nav.courses': 'কোর্সসমূহ',
      'nav.blog': 'ব্লগ',
      'nav.about': 'আমাদের সম্পর্কে',
      'nav.contact': 'যোগাযোগ',
      'nav.login': 'লগইন',
      'nav.register': 'নিবন্ধন',
      'nav.dashboard': 'ড্যাশবোর্ড',
      'nav.logout': 'লগআউট',

      // Authentication
      'auth.login': 'লগইন',
      'auth.register': 'নিবন্ধন',
      'auth.email': 'ইমেইল',
      'auth.password': 'পাসওয়ার্ড',
      'auth.name': 'নাম',
      'auth.phone': 'ফোন নম্বর',
      'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
      'auth.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
      'auth.alreadyHaveAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      'auth.dontHaveAccount': 'অ্যাকাউন্ট নেই?',

      // Dashboard
      'dashboard.student.title': 'শিক্ষার্থী ড্যাশবোর্ড',
      'dashboard.mentor.title': 'মেন্টর ড্যাশবোর্ড',
      'dashboard.admin.title': 'এডমিন ড্যাশবোর্ড',
      'dashboard.marketing.title': 'মার্কেটিং ড্যাশবোর্ড',
      'dashboard.support.title': 'সাপোর্ট ড্যাশবোর্ড',

      // Course Management
      'course.create': 'নতুন কোর্স তৈরি করুন',
      'course.edit': 'কোর্স সম্পাদনা করুন',
      'course.title': 'কোর্সের শিরোনাম',
      'course.description': 'বিবরণ',
      'course.syllabus': 'সিলেবাস',
      'course.duration': 'সময়কাল (ঘন্টা)',
      'course.price': 'মূল্য',
      'course.tags': 'ট্যাগ',
      'course.learningOutcomes': 'শিক্ষার ফলাফল',
      'course.enroll': 'এনরোল করুন',
      'course.enrolled': 'এনরোল করা হয়েছে',

      // Enrollment
      'enrollment.paymentMethod': 'পেমেন্ট পদ্ধতি',
      'enrollment.bkash': 'বিকাশ',
      'enrollment.nagad': 'নগদ',
      'enrollment.senderNumber': 'প্রেরকের নম্বর',
      'enrollment.transactionId': 'লেনদেনের আইডি',
      'enrollment.status.pending': 'অপেক্ষমান',
      'enrollment.status.approved': 'অনুমোদিত',
      'enrollment.status.rejected': 'প্রত্যাখ্যাত',

      // Certificate
      'certificate.download': 'ডাউনলোড করুন',
      'certificate.share': 'শেয়ার করুন',
      'certificate.verify': 'যাচাই করুন',

      // Blog
      'blog.readMore': 'আরও পড়ুন',
      'blog.publishedOn': 'প্রকাশিত হয়েছে',
      'blog.author': 'লেখক',

      // Common
      'common.save': 'সংরক্ষণ করুন',
      'common.cancel': 'বাতিল',
      'common.edit': 'সম্পাদনা',
      'common.delete': 'মুছে ফেলুন',
      'common.submit': 'জমা দিন',
      'common.loading': 'লোড হচ্ছে...',
      'common.error': 'ত্রুটি',
      'common.success': 'সফল',
      'common.warning': 'সতর্কতা',
      'common.info': 'তথ্য',
      'common.yes': 'হ্যাঁ',
      'common.no': 'না',
      'common.confirm': 'নিশ্চিত করুন',

      // Messages
      'message.loginSuccess': 'সফলভাবে লগইন হয়েছে',
      'message.registerSuccess': 'সফলভাবে নিবন্ধন হয়েছে',
      'message.logoutSuccess': 'সফলভাবে লগআউট হয়েছে',
      'message.courseCreated': 'কোর্স সফলভাবে তৈরি হয়েছে',
      'message.courseUpdated': 'কোর্স সফলভাবে আপডেট হয়েছে',
      'message.enrollmentPending': 'এনরোলমেন্ট অপেক্ষমান',
      'message.enrollmentApproved': 'এনরোলমেন্ট অনুমোদিত হয়েছে',
      'message.certificateGenerated': 'সার্টিফিকেট তৈরি হয়েছে',

      // Errors
      'error.invalidCredentials': 'ভুল ইমেইল বা পাসওয়ার্ড',
      'error.userNotFound': 'ব্যবহারকারী পাওয়া যায়নি',
      'error.courseNotFound': 'কোর্স পাওয়া যায়নি',
      'error.unauthorized': 'অনুমতি নেই',
      'error.serverError': 'সার্ভার ত্রুটি',
      'error.networkError': 'নেটওয়ার্ক ত্রুটি',
      'error.validationError': 'ভুল তথ্য',
    }
  },
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.courses': 'Courses',
      'nav.blog': 'Blog',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',

      // Authentication
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Name',
      'auth.phone': 'Phone Number',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.dontHaveAccount': "Don't have an account?",

      // Dashboard
      'dashboard.student.title': 'Student Dashboard',
      'dashboard.mentor.title': 'Mentor Dashboard',
      'dashboard.admin.title': 'Admin Dashboard',
      'dashboard.marketing.title': 'Marketing Dashboard',
      'dashboard.support.title': 'Support Dashboard',

      // Course Management
      'course.create': 'Create New Course',
      'course.edit': 'Edit Course',
      'course.title': 'Course Title',
      'course.description': 'Description',
      'course.syllabus': 'Syllabus',
      'course.duration': 'Duration (Hours)',
      'course.price': 'Price',
      'course.tags': 'Tags',
      'course.learningOutcomes': 'Learning Outcomes',
      'course.enroll': 'Enroll',
      'course.enrolled': 'Enrolled',

      // Enrollment
      'enrollment.paymentMethod': 'Payment Method',
      'enrollment.bkash': 'Bkash',
      'enrollment.nagad': 'Nagad',
      'enrollment.senderNumber': 'Sender Number',
      'enrollment.transactionId': 'Transaction ID',
      'enrollment.status.pending': 'Pending',
      'enrollment.status.approved': 'Approved',
      'enrollment.status.rejected': 'Rejected',

      // Certificate
      'certificate.download': 'Download',
      'certificate.share': 'Share',
      'certificate.verify': 'Verify',

      // Blog
      'blog.readMore': 'Read More',
      'blog.publishedOn': 'Published on',
      'blog.author': 'Author',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.submit': 'Submit',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.info': 'Info',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.confirm': 'Confirm',

      // Messages
      'message.loginSuccess': 'Successfully logged in',
      'message.registerSuccess': 'Successfully registered',
      'message.logoutSuccess': 'Successfully logged out',
      'message.courseCreated': 'Course created successfully',
      'message.courseUpdated': 'Course updated successfully',
      'message.enrollmentPending': 'Enrollment is pending',
      'message.enrollmentApproved': 'Enrollment approved',
      'message.certificateGenerated': 'Certificate generated',

      // Errors
      'error.invalidCredentials': 'Invalid email or password',
      'error.userNotFound': 'User not found',
      'error.courseNotFound': 'Course not found',
      'error.unauthorized': 'Unauthorized',
      'error.serverError': 'Server error',
      'error.networkError': 'Network error',
      'error.validationError': 'Validation error',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bn',
    lng: 'bn',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
