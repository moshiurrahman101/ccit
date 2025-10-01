import { Metadata } from 'next';
import { AlertTriangle, Info, Shield, BookOpen, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer | Creative Canvas IT',
  description: 'Important disclaimers and limitations regarding Creative Canvas IT services, course content, and information accuracy.',
  openGraph: {
    title: 'Disclaimer | Creative Canvas IT',
    description: 'Important disclaimers regarding Creative Canvas IT services and content.',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Disclaimer</h1>
          </div>
          <p className="text-xl text-amber-100">
            গুরুত্বপূর্ণ নোটিশ এবং দায়মুক্তি বিবৃতি
          </p>
          <p className="text-sm text-amber-200 mt-4">
            Last Updated: October 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* General Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">১. সাধারণ দায়মুক্তি</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                Creative Canvas IT এর ওয়েবসাইট এবং সেবাগুলিতে থাকা তথ্য শুধুমাত্র সাধারণ তথ্যের উদ্দেশ্যে প্রদান করা হয়। আমরা তথ্যের সম্পূর্ণতা, নির্ভুলতা, নির্ভরযোগ্যতা, উপযুক্ততা বা প্রাপ্যতার বিষয়ে কোন প্রতিনিধিত্ব বা ওয়ারেন্টি প্রদান করি না।
              </p>
              <p>
                আপনি যে কোনো তথ্যের উপর নির্ভর করেন তা সম্পূর্ণভাবে আপনার নিজের ঝুঁকিতে। এই ধরনের তথ্যের উপর নির্ভরতা থেকে উদ্ভূত কোনো ক্ষতি এবং/অথবা ক্ষয়ক্ষতির জন্য আমরা কোনোভাবেই দায়ী থাকব না।
              </p>
            </div>
          </section>

          {/* Educational Content Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">২. শিক্ষামূলক Content</h2>
            </div>
            <div className="bg-amber-50 p-5 rounded-lg space-y-3 text-gray-700">
              <h3 className="font-semibold text-gray-900">কোর্স এবং ব্যাচ সম্পর্কিত:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>কোন গ্যারান্টি নেই:</strong> কোর্স completion চাকরি, ফ্রিল্যান্সিং সাফল্য, বা আয়ের গ্যারান্টি দেয় না</li>
                <li><strong>ব্যক্তিগত ফলাফল:</strong> প্রতিটি শিক্ষার্থীর শেখার গতি এবং ফলাফল ভিন্ন হতে পারে</li>
                <li><strong>প্রযুক্তি পরিবর্তন:</strong> IT field দ্রুত পরিবর্তনশীল, content এর relevance সময়ের সাথে পরিবর্তিত হতে পারে</li>
                <li><strong>Additional Learning:</strong> কোর্স সম্পূর্ণ দক্ষতা অর্জনের জন্য self-study এবং practice প্রয়োজন</li>
                <li><strong>Certification:</strong> আমাদের সার্টিফিকেট কোন সরকারী বা আন্তর্জাতিক accreditation নয়</li>
              </ul>
            </div>
          </section>

          {/* No Professional Advice */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৩. পেশাদার পরামর্শ নয়</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                আমাদের প্ল্যাটফর্মের তথ্য এবং content শিক্ষামূলক উদ্দেশ্যে প্রদান করা হয়। এটি পেশাদার পরামর্শ হিসেবে বিবেচনা করা উচিত নয়:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>ক্যারিয়ার পরামর্শ</li>
                <li>আইনি পরামর্শ</li>
                <li>ব্যবসায়িক পরামর্শ</li>
                <li>আর্থিক পরামর্শ</li>
                <li>চাকরি placement সহায়তা</li>
              </ul>
              <p className="mt-3">
                গুরুত্বপূর্ণ সিদ্ধান্ত নেওয়ার আগে উপযুক্ত পেশাদারদের সাথে পরামর্শ করুন।
              </p>
            </div>
          </section>

          {/* Technical Issues */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৪. প্রযুক্তিগত সমস্যা</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা যথাসাধ্য চেষ্টা করলেও নিম্নলিখিত বিষয়ে গ্যারান্টি দিতে পারি না:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Uptime:</strong> ১০০% uptime guarantee নেই, রক্ষণাবেক্ষণ বা technical issues এর কারণে সাময়িক downtime হতে পারে</li>
                <li><strong>Data Loss:</strong> যদিও আমরা regular backup করি, data loss এর সম্ভাবনা সম্পূর্ণ eliminate করা যায় না</li>
                <li><strong>Third-Party Services:</strong> পেমেন্ট গেটওয়ে, ইমেইল সার্ভিস ইত্যাদির সমস্যার জন্য দায়ী নই</li>
                <li><strong>Browser Compatibility:</strong> সব browser/device-এ perfect rendering এর গ্যারান্টি নেই</li>
                <li><strong>Internet Connection:</strong> আপনার ইন্টারনেট সংযোগের সমস্যার জন্য দায়ী নই</li>
              </ul>
            </div>
          </section>

          {/* External Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৫. External Links এবং Resources</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইট এবং resources এর লিংক থাকতে পারে:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>এই external sites এর content এর জন্য আমরা দায়ী নই</li>
                <li>তাদের privacy policies বা terms এর জন্য দায়ী নই</li>
                <li>external links এর availability guarantee করি না</li>
                <li>তাদের products বা services endorse করি না</li>
              </ul>
              <p className="mt-3">
                External links ব্যবহার করার সময় সতর্ক থাকুন এবং তাদের নিজস্ব terms পড়ুন।
              </p>
            </div>
          </section>

          {/* Mentor Opinions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৬. মেন্টর এবং ব্যবহারকারীর মতামত</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                আমাদের মেন্টর এবং ব্যবহারকারীরা যে মতামত, পরামর্শ, বা তথ্য শেয়ার করেন তা তাদের ব্যক্তিগত দৃষ্টিভঙ্গি:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Creative Canvas IT এর official position নয়</li>
                <li>আমরা তাদের accuracy বা completeness যাচাই করি না</li>
                <li>প্রতিটি মেন্টরের teaching style ভিন্ন</li>
                <li>student reviews subjective এবং ব্যক্তিগত অভিজ্ঞতার উপর ভিত্তি করে</li>
              </ul>
            </div>
          </section>

          {/* Testimonials */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৭. Testimonials এবং Success Stories</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="space-y-2 text-gray-700">
                <p>
                  আমাদের সাইটে প্রদর্শিত testimonials এবং success stories সত্য এবং যাচাইকৃত, তবে:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>প্রতিটি শিক্ষার্থীর ফলাফল ভিন্ন হতে পারে</li>
                  <li>সাফল্য ব্যক্তিগত প্রচেষ্টা এবং পরিস্থিতির উপর নির্ভর করে</li>
                  <li>past performance ভবিষ্যতের ফলাফলের গ্যারান্টি নয়</li>
                  <li>additional skills এবং experience প্রয়োজন হতে পারে</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">৮. দায়বদ্ধতার সীমা</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                আইন দ্বারা অনুমোদিত সর্বোচ্চ পরিমাণে, Creative Canvas IT এবং এর কর্মকর্তা, directors, employees, বা agents নিম্নলিখিত বিষয়ে দায়ী থাকবে না:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Direct, indirect, incidental, consequential, বা punitive damages</li>
                <li>লাভের ক্ষতি, ডেটা ক্ষতি, বা ব্যবসায়িক সুযোগ হারানো</li>
                <li>সেবা ব্যবহার বা ব্যবহার করতে না পারার ফলে সৃষ্ট ক্ষতি</li>
                <li>তৃতীয় পক্ষের content বা actions থেকে উদ্ভূত ক্ষতি</li>
                <li>technical glitches, bugs, বা errors থেকে সৃষ্ট সমস্যা</li>
              </ul>
              <p className="mt-3 font-medium">
                আমাদের মোট দায়বদ্ধতা কখনও আপনার দ্বারা পরিশোধিত ফি এর পরিমাণ অতিক্রম করবে না।
              </p>
            </div>
          </section>

          {/* Changes to Courses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৯. কোর্স পরিবর্তন এবং বাতিলকরণ</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা যেকোনো সময় নিম্নলিখিত অধিকার সংরক্ষণ করি:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>কোর্স content আপডেট বা modify করা</li>
                <li>কোর্স schedule পরিবর্তন করা</li>
                <li>কম enrollment এর কারণে ব্যাচ বাতিল করা</li>
                <li>মেন্টর প্রতিস্থাপন (unavailability এর কারণে)</li>
                <li>কোর্স ফি সমন্বয় করা</li>
              </ul>
              <p className="mt-3">
                গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা enrolled students দের অবহিত করব।
              </p>
            </div>
          </section>

          {/* Accuracy of Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১০. তথ্যের যথার্থতা</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                আমরা সঠিক এবং আপডেট তথ্য প্রদানের চেষ্টা করি, তবে:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>ওয়েবসাইটে typographical বা clerical errors থাকতে পারে</li>
                <li>কোর্স details, মূল্য, বা features পরিবর্তিত হতে পারে</li>
                <li>সব তথ্য সবসময় real-time update নাও হতে পারে</li>
                <li>বাংলা translation এ ছোটখাটো ভুল থাকতে পারে</li>
              </ul>
              <p className="mt-3">
                গুরুত্বপূর্ণ তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">যোগাযোগ</h2>
            </div>
            <p className="text-gray-700 mb-4">
              এই Disclaimer সম্পর্কে প্রশ্ন থাকলে:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Creative Canvas IT</strong></p>
              <p>📧 Email: <a href="mailto:creativecanvasit@gmail.com" className="text-amber-600 hover:underline">creativecanvasit@gmail.com</a></p>
              <p>📞 Phone: 01603718379, 01845202101</p>
            </div>
          </section>

          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">গুরুত্বপূর্ণ সতর্কতা</h3>
                <p className="text-sm text-gray-700">
                  এই disclaimer পড়ে এবং বুঝে নিয়ে আমাদের সেবা ব্যবহার করুন। আমাদের সেবা ব্যবহার অব্যাহত রেখে, আপনি এই disclaimer মেনে নিচ্ছেন এবং আপনার নিজের ঝুঁকিতে সেবা ব্যবহার করছেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

