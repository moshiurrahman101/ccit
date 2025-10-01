'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusText } from '@/lib/utils/statusDictionary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Mail, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  GraduationCap,
  MessageSquare,
  Newspaper,
  DollarSign,
  Shield,
  UserCheck,
  LogOut,
  Bell,
  UserPlus
} from 'lucide-react';
import { User } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
  badge?: number;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'ওভারভিউ',
    icon: Home,
    path: '/dashboard',
    roles: ['admin', 'marketing', 'support'],
    description: 'মূল ড্যাশবোর্ড'
  },
  {
    id: 'mentor-overview',
    label: 'মেন্টর ড্যাশবোর্ড',
    icon: Home,
    path: '/dashboard/mentor',
    roles: ['mentor'],
    description: 'মেন্টর ড্যাশবোর্ড'
  },
  {
    id: 'student-overview',
    label: 'স্টুডেন্ট ড্যাশবোর্ড',
    icon: Home,
    path: '/dashboard/student',
    roles: ['student'],
    description: 'স্টুডেন্ট ড্যাশবোর্ড'
  },
  {
    id: 'students',
    label: 'শিক্ষার্থী',
    icon: GraduationCap,
    path: '/dashboard/students',
    roles: ['admin', 'mentor', 'support'],
    description: 'শিক্ষার্থী ব্যবস্থাপনা'
  },
  {
    id: 'users',
    label: 'ব্যবহারকারী',
    icon: Users,
    path: '/dashboard/users',
    roles: ['admin'],
    description: 'ব্যবহারকারী ব্যবস্থাপনা'
  },
  {
    id: 'mentors',
    label: 'মেন্টর',
    icon: UserPlus,
    path: '/dashboard/mentors',
    roles: ['admin'],
    description: 'মেন্টর ব্যবস্থাপনা'
  },
  {
    id: 'batches',
    label: 'ব্যাচ/কোর্স',
    icon: BookOpen,
    path: '/dashboard/batches',
    roles: ['admin', 'marketing'],
    description: 'অনলাইন/অফলাইন ব্যাচ ও কোর্স ব্যবস্থাপনা'
  },
  {
    id: 'enrollment-management',
    label: 'এনরোলমেন্ট ম্যানেজমেন্ট',
    icon: GraduationCap,
    path: '/dashboard/enrollment',
    roles: ['admin'],
    description: 'শিক্ষার্থী এনরোলমেন্ট ও পেমেন্ট ব্যবস্থাপনা'
  },
  {
    id: 'mentor-batches',
    label: 'আমার ব্যাচ',
    icon: BookOpen,
    path: '/dashboard/mentor/batches',
    roles: ['mentor'],
    description: 'আপনার ব্যাচ ও কোর্স ব্যবস্থাপনা'
  },
  {
    id: 'blog',
    label: 'ব্লগ',
    icon: FileText,
    path: '/dashboard/blog',
    roles: ['admin', 'marketing'],
    description: 'ব্লগ পোস্ট ব্যবস্থাপনা'
  },
  {
    id: 'newsletter',
    label: 'নিউজলেটার',
    icon: Mail,
    path: '/dashboard/newsletter',
    roles: ['admin', 'marketing'],
    description: 'নিউজলেটার ব্যবস্থাপনা'
  },
  {
    id: 'payments',
    label: 'পেমেন্ট',
    icon: CreditCard,
    path: '/dashboard/payments',
    roles: ['admin', 'support'],
    description: 'পেমেন্ট ও ফিন্যান্স'
  },
  {
    id: 'analytics',
    label: 'এনালিটিক্স',
    icon: BarChart3,
    path: '/dashboard/analytics',
    roles: ['admin', 'marketing'],
    description: 'বিশ্লেষণ ও রিপোর্ট'
  },
  {
    id: 'messages',
    label: 'মেসেজ',
    icon: MessageSquare,
    path: '/dashboard/messages',
    roles: ['admin', 'mentor', 'support'],
    description: 'মেসেজ ও যোগাযোগ'
  },
  {
    id: 'enrollment',
    label: 'এনরোলমেন্ট',
    icon: BookOpen,
    path: '/dashboard/student/enrollment',
    roles: ['student'],
    description: 'আপনার কোর্স এবং নতুন কোর্সে এনরোল করুন'
  },
  {
    id: 'student-batches',
    label: 'আমার ব্যাচ',
    icon: BookOpen,
    path: '/dashboard/student/batches',
    roles: ['student'],
    description: 'আপনার এনরোল করা ব্যাচসমূহ'
  },
  {
    id: 'accounts',
    label: 'অ্যাকাউন্টস',
    icon: DollarSign,
    path: '/dashboard/student/accounts',
    roles: ['student'],
    description: 'পেমেন্ট ও বিলিং ব্যবস্থাপনা'
  },
  {
    id: 'cleanup',
    label: 'ডেটা ক্লিনআপ',
    icon: Settings,
    path: '/dashboard/cleanup',
    roles: ['admin'],
    description: 'এনরোলমেন্ট ডেটা ক্লিনআপ'
  },
  {
    id: 'settings',
    label: getStatusText('settings'),
    icon: Settings,
    path: '/dashboard/settings',
    roles: ['admin', 'mentor', 'student', 'marketing', 'support'],
    description: 'সিস্টেম সেটিংস'
  }
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleMenuClick = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'mentor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      case 'marketing': return 'bg-purple-500';
      case 'support': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'অ্যাডমিন';
      case 'mentor': return 'মেন্টর';
      case 'student': return 'শিক্ষার্থী';
      case 'marketing': return 'মার্কেটিং';
      case 'support': return 'সাপোর্ট';
      default: return role;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex h-full flex-col bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img 
                  src="/icon.png" 
                  alt="CCIT Logo" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    // Fallback if icon not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg items-center justify-center hidden">
                  <span className="text-white font-bold text-lg">CC</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CCIT</h1>
                <p className="text-xs text-gray-700">ড্যাশবোর্ড</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-green-50 shadow-sm border border-green-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                    isActive ? 'text-green-600' : 'text-gray-700 group-hover:text-green-600'
                  }`} />
                  <div className="flex-1 text-left">
                    <p className={`text-xs sm:text-sm font-medium transition-colors ${
                      isActive ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-0.5 hidden sm:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-700 hover:text-red-800 hover:bg-red-50 text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
              {getStatusText('logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {filteredMenuItems.find(item => item.path === pathname)?.label || 'ড্যাশবোর্ড'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 hidden sm:block">
                  {filteredMenuItems.find(item => item.path === pathname)?.description || 'সিস্টেম ড্যাশবোর্ড'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                  3
                </Badge>
              </Button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs sm:text-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-700">{getRoleLabel(user.role)}</p>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}