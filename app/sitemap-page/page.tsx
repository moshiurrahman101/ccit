'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map, Home, BookOpen, Users, GraduationCap, FileText, Mail, Shield, Info, Settings } from 'lucide-react';

interface SitemapLink {
  title: string;
  href: string;
  description: string;
}

interface SitemapSection {
  icon: React.ReactNode;
  title: string;
  links: SitemapLink[];
}

export default function SitemapPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch batches
      const batchesRes = await fetch('/api/public/batches?limit=20');
      if (batchesRes.ok) {
        const batchesData = await batchesRes.json();
        setBatches(batchesData.batches || []);
      }

      // Fetch blogs
      const blogsRes = await fetch('/api/blogs?limit=20');
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.blogs || []);
      }

      // Fetch mentors
      const mentorsRes = await fetch('/api/mentors/public?limit=20');
      if (mentorsRes.ok) {
        const mentorsData = await mentorsRes.json();
        setMentors(mentorsData.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching sitemap data:', error);
    }
  };

  const sections: SitemapSection[] = [
    {
      icon: <Home className="w-6 h-6" />,
      title: 'মূল পেজ',
      links: [
        { title: 'হোম', href: '/', description: 'Creative Canvas IT এর মূল পেজ' },
        { title: 'About Us', href: '/about', description: 'আমাদের সম্পর্কে জানুন' },
        { title: 'যোগাযোগ', href: '/contact', description: 'আমাদের সাথে যোগাযোগ করুন' },
      ]
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'ব্যাচসমূহ',
      links: [
        { title: 'সব ব্যাচ', href: '/batches', description: 'সকল উপলব্ধ ব্যাচ দেখুন' },
        ...batches.slice(0, 10).map(batch => ({
          title: batch.name,
          href: `/batches/${batch.marketing.slug}`,
          description: batch.description
        }))
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'মেন্টরস',
      links: [
        { title: 'সব মেন্টর', href: '/mentors', description: 'আমাদের সকল মেন্টর দেখুন' },
        ...mentors.slice(0, 10).map(mentor => ({
          title: mentor.name,
          href: `/mentors/${mentor._id}`,
          description: mentor.designation || 'Mentor'
        }))
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'ব্লগ',
      links: [
        { title: 'সব ব্লগ', href: '/blog', description: 'সকল ব্লগ পোস্ট দেখুন' },
        ...blogs.slice(0, 10).map(blog => ({
          title: blog.title,
          href: `/blog/${blog.slug}`,
          description: blog.excerpt || ''
        }))
      ]
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Dashboard',
      links: [
        { title: 'Login', href: '/login', description: 'আপনার অ্যাকাউন্টে লগইন করুন' },
        { title: 'Register', href: '/register', description: 'নতুন অ্যাকাউন্ট তৈরি করুন' },
        { title: 'Dashboard', href: '/dashboard', description: 'Student/Admin Dashboard' },
        { title: 'Forgot Password', href: '/forgot-password', description: 'পাসওয়ার্ড রিসেট করুন' },
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'আইনি তথ্য',
      links: [
        { title: 'Privacy Policy', href: '/privacy-policy', description: 'আমাদের গোপনীয়তা নীতি' },
        { title: 'Terms of Use', href: '/terms-of-use', description: 'ব্যবহারের শর্তাবলী' },
        { title: 'Disclaimer', href: '/disclaimer', description: 'দায়মুক্তি বিবৃতি' },
        { title: 'Accessibility', href: '/accessibility', description: 'অ্যাক্সেসিবিলিটি তথ্য' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Sitemap</h1>
          </div>
          <p className="text-xl text-blue-100">
            Creative Canvas IT এর সকল পেজ এক জায়গায়
          </p>
          <p className="text-sm text-blue-200 mt-4">
            আমাদের ওয়েবসাইটের সম্পূর্ণ নেভিগেশন এবং content structure
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{batches.length}+</div>
            <div className="text-sm text-gray-600 mt-1">ব্যাচ</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{mentors.length}+</div>
            <div className="text-sm text-gray-600 mt-1">মেন্টর</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{blogs.length}+</div>
            <div className="text-sm text-gray-600 mt-1">ব্লগ</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{sections.length}</div>
            <div className="text-sm text-gray-600 mt-1">বিভাগ</div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {section.links.length} items
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {section.links.map((link, linkIndex) => (
                  <button
                    key={linkIndex}
                    onClick={() => router.push(link.href)}
                    className="group text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {link.description}
                    </p>
                    <div className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {link.href} →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">কোন পেজ খুঁজে পাচ্ছেন না?</h3>
              <p className="text-gray-700 mb-4">
                আপনি যদি নির্দিষ্ট কোন পেজ বা তথ্য খুঁজে না পান, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন। আমরা সাহায্য করতে পেরে খুশি হব।
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/contact')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  যোগাযোগ করুন
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium border border-gray-300 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  হোমে ফিরুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Sitemap */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Search Engine Optimization এর জন্য XML Sitemap প্রয়োজন?
          </p>
          <a 
            href="/sitemap.xml" 
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            XML Sitemap দেখুন →
          </a>
        </div>
      </div>
    </div>
  );
}

