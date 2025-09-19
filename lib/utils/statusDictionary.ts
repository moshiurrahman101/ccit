// Status Dictionary - English to Bengali Casual
export const statusDictionary = {
  // General Status
  'Active': 'অ্যাক্টিভ',
  'Inactive': 'ইনঅ্যাক্টিভ',
  'Pending': 'পেন্ডিং',
  'Completed': 'কমপ্লিট',
  'Cancelled': 'ক্যানসেল',
  'Ongoing': 'রানিং',
  'Running': 'রানিং',
  'Upcoming': 'আপকামিং',
  
  // User Status
  'active': 'অ্যাক্টিভ',
  'inactive': 'ইনঅ্যাক্টিভ',
  'pending': 'পেন্ডিং',
  'completed': 'কমপ্লিট',
  'cancelled': 'ক্যানসেল',
  'ongoing': 'রানিং',
  'running': 'রানিং',
  'upcoming': 'আপকামিং',
  
  // Batch Status
  'draft': 'ড্রাফ্ট',
  'published': 'পাবলিশড',
  'archived': 'আর্কাইভড',
  'scheduled': 'সিডিউলড',
  'in_progress': 'চলমান',
  'finished': 'শেষ',
  
  // Enrollment Status
  'enrolled': 'এনরোলড',
  'dropped': 'ড্রপড',
  'suspended': 'সাসপেন্ড',
  'graduated': 'গ্র্যাজুয়েট',
  
  // Payment Status
  'paid': 'পেইড',
  'unpaid': 'আনপেইড',
  'partial': 'আংশিক',
  'refunded': 'রিফান্ড',
  'failed': 'ফেইলড',
  
  // Course Status
  'available': 'উপলব্ধ',
  'unavailable': 'অনুপলব্ধ',
  'coming_soon': 'শীঘ্রই আসছে',
  'discontinued': 'বন্ধ',
  
  // Mentor Status
  'verified': 'ভেরিফাইট',
  'unverified': 'নন ভেরিফাইট',
  'on_leave': 'ছুটিতে',
  'busy': 'ব্যস্ত',
  'offline': 'অফলাইন',
  'blocked': 'ব্লক করা',
  
  // Notification Status
  'read': 'পড়া',
  'unread': 'অপড়া',
  'sent': 'পাঠানো',
  'delivered': 'ডেলিভারড',
  
  // System Status
  'enabled': 'সক্রিয়',
  'disabled': 'নিষ্ক্রিয়',
  'maintenance': 'রক্ষণাবেক্ষণ',
  'error': 'ত্রুটি',
  'success': 'সফল',
  'warning': 'সতর্কতা',
  'info': 'তথ্য',
  
  // UI Labels
  'notifications': 'নোটিফিকেশন',
  'settings': 'সেটিংস',
  'save_changes': 'সেভ করুন',
  'cancel': 'ক্যানসেল',
  'logout': 'লগ আউট',
  'dashboard_loading': 'ড্যাশবোর্ড ওপেন হচ্ছে...'
} as const;

// Type for status keys
export type StatusKey = keyof typeof statusDictionary;

// Function to get Bengali status text
export const getStatusText = (status: string): string => {
  return statusDictionary[status as StatusKey] || status;
};

// Function to get all available statuses
export const getAllStatuses = (): Array<{ key: string; value: string }> => {
  return Object.entries(statusDictionary).map(([key, value]) => ({ key, value }));
};

// Function to get statuses by category
export const getStatusesByCategory = (category: 'general' | 'user' | 'batch' | 'enrollment' | 'payment' | 'course' | 'mentor' | 'notification' | 'system') => {
  const categories = {
    general: ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled', 'Ongoing', 'Running', 'Upcoming'],
    user: ['active', 'inactive', 'pending', 'completed', 'cancelled', 'ongoing', 'running', 'upcoming'],
    batch: ['draft', 'published', 'archived', 'scheduled', 'in_progress', 'finished', 'cancelled'],
    enrollment: ['enrolled', 'dropped', 'suspended', 'graduated'],
    payment: ['paid', 'unpaid', 'partial', 'refunded', 'failed'],
    course: ['available', 'unavailable', 'coming_soon', 'discontinued'],
    mentor: ['verified', 'unverified', 'on_leave', 'available', 'busy', 'offline'],
    notification: ['read', 'unread', 'sent', 'delivered', 'failed'],
    system: ['enabled', 'disabled', 'maintenance', 'error', 'success', 'warning', 'info']
  };
  
  return categories[category].map(key => ({ key, value: statusDictionary[key as StatusKey] }));
};
