import { Metadata } from 'next';
import { FileText, CheckCircle, XCircle, AlertTriangle, Mail, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Use | Creative Canvas IT',
  description: 'Terms and conditions for using Creative Canvas IT platform. Read our guidelines, user responsibilities, and service terms.',
  openGraph: {
    title: 'Terms of Use | Creative Canvas IT',
    description: 'Terms and conditions for using Creative Canvas IT platform.',
    type: 'website',
  },
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Use</h1>
          </div>
          <p className="text-xl text-indigo-100">
            Creative Canvas IT প্ল্যাটফর্ম ব্যবহারের শর্তাবলী
          </p>
          <p className="text-sm text-indigo-200 mt-4">
            Effective Date: October 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১. সম্মতি</h2>
            <p className="text-gray-700 leading-relaxed">
              Creative Canvas IT এর ওয়েবসাইট এবং সেবা ব্যবহার করে, আপনি এই Terms of Use এবং আমাদের Privacy Policy-তে উল্লেখিত সকল শর্তে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে অনুগ্রহ করে আমাদের প্ল্যাটফর্ম ব্যবহার করবেন না।
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">২. অ্যাকাউন্ট শর্তাবলী</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">২.১ অ্যাকাউন্ট নিবন্ধন</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>আপনাকে অবশ্যই ১৬ বছর বা তার বেশি বয়সী হতে হবে</li>
                  <li>সঠিক এবং সম্পূর্ণ তথ্য প্রদান করতে হবে</li>
                  <li>আপনার অ্যাকাউন্ট তথ্য আপডেট রাখার দায়িত্ব আপনার</li>
                  <li>প্রতি ব্যক্তি একটি মাত্র অ্যাকাউন্ট খুলতে পারবেন</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">২.২ অ্যাকাউন্ট নিরাপত্তা</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>আপনার পাসওয়ার্ড গোপন রাখার দায়িত্ব আপনার</li>
                  <li>আপনার অ্যাকাউন্টের সকল কার্যকলাপের জন্য আপনি দায়ী</li>
                  <li>unauthorized access হলে অবিলম্বে আমাদের জানান</li>
                  <li>আপনার অ্যাকাউন্ট অন্যকে ব্যবহার করতে দেওয়া নিষিদ্ধ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">৩. ব্যবহারকারীর দায়িত্ব</h2>
            </div>
            
            <div className="bg-green-50 p-5 rounded-lg">
              <p className="text-gray-700 mb-3 font-medium">আপনি যা করতে পারবেন:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                <li>নিবন্ধিত কোর্স এবং ব্যাচ অ্যাক্সেস করা</li>
                <li>শিক্ষামূলক উপকরণ ডাউনলোড করা (personal use এর জন্য)</li>
                <li>মেন্টর এবং অন্যান্য শিক্ষার্থীদের সাথে যোগাযোগ করা</li>
                <li>প্ল্যাটফর্মের সকল বৈধ ফিচার ব্যবহার করা</li>
                <li>constructive feedback এবং reviews প্রদান করা</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">৪. নিষিদ্ধ কার্যকলাপ</h2>
            </div>
            
            <div className="bg-red-50 p-5 rounded-lg">
              <p className="text-gray-700 mb-3 font-medium">আপনি যা করতে পারবেন না:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                <li>কোর্স content কপি, শেয়ার, বা redistribute করা</li>
                <li>অন্যের account unauthorized access করার চেষ্টা</li>
                <li>অসম্মানজনক, ক্ষতিকর, বা অবৈধ content পোস্ট করা</li>
                <li>প্ল্যাটফর্মের security features bypass করা</li>
                <li>automated scripts বা bots ব্যবহার করা</li>
                <li>spam, phishing, বা malware ছড়ানো</li>
                <li>intellectual property rights লঙ্ঘন করা</li>
                <li>অন্য ব্যবহারকারীদের harassment করা</li>
                <li>false information প্রদান করা</li>
                <li>প্ল্যাটফর্মের normal operation-এ হস্তক্ষেপ করা</li>
              </ul>
            </div>
          </section>

          {/* Course Enrollment */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৫. কোর্স Enrollment এবং পেমেন্ট</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">৫.১ Enrollment</h3>
                <p className="text-gray-700">
                  কোর্স/ব্যাচে enrollment করে আপনি সম্পূর্ণ ফি পরিশোধ এবং attendance requirements পূরণ করতে সম্মত হচ্ছেন।
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">৫.২ পেমেন্ট</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>সকল ফি বাংলাদেশী টাকা (BDT) তে নির্ধারিত</li>
                  <li>পেমেন্ট পদ্ধতি: bKash, Nagad, এবং অন্যান্য approved methods</li>
                  <li>পেমেন্ট non-refundable (বিশেষ ক্ষেত্র ছাড়া)</li>
                  <li>invoice প্রদান করা হবে</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">৫.৩ Refund Policy</h3>
                <p className="text-gray-700">
                  কোর্স শুরুর ৭ দিনের মধ্যে withdrawal করলে ৭০% refund পাবেন। এর পরে কোন refund প্রদান করা হবে না।
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৬. বুদ্ধিবৃত্তিক সম্পত্তি</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                সকল কোর্স content, materials, videos, documents, এবং অন্যান্য উপকরণ Creative Canvas IT এবং আমাদের mentors এর সম্পত্তি।
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>আপনি personal, non-commercial use এর জন্য সীমিত license পাবেন</li>
                <li>content কপি, modify, distribute, বা publicly display করা নিষিদ্ধ</li>
                <li>আমাদের লিখিত অনুমতি ছাড়া commercial use করা যাবে না</li>
                <li>copyright infringement গুরুতর আইনি পরিণতি ডেকে আনতে পারে</li>
              </ul>
            </div>
          </section>

          {/* Student Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৭. ব্যবহারকারীর Content</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                যখন আপনি content (assignments, projects, comments, etc.) জমা দেন:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>আপনি content এর মালিক থাকবেন</li>
                <li>আমাদের সেবা প্রদানের জন্য এটি ব্যবহার করার license দিচ্ছেন</li>
                <li>content অবশ্যই original এবং আইনসম্মত হতে হবে</li>
                <li>আমরা inappropriate content remove করার অধিকার সংরক্ষণ করি</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৮. অ্যাকাউন্ট Termination</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা নিম্নলিখিত কারণে আপনার অ্যাকাউন্ট suspend বা terminate করতে পারি:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Terms of Use লঙ্ঘন</li>
                <li>নিষিদ্ধ কার্যকলাপে জড়িত থাকা</li>
                <li>অন্যান্য ব্যবহারকারীদের harassment</li>
                <li>পেমেন্ট failure বা fraud</li>
                <li>দীর্ঘ সময় inactive থাকা (৩ বছর+)</li>
              </ul>
              <p className="mt-3">আপনি যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ করার অনুরোধ করতে পারেন।</p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৯. Disclaimers</h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>সেবা "AS IS" এবং "AS AVAILABLE" ভিত্তিতে প্রদান করা হয়</li>
                <li>আমরা uninterrupted বা error-free service এর গ্যারান্টি দিই না</li>
                <li>কোর্স completion employment guarantee নয়</li>
                <li>external links এর জন্য আমরা দায়ী নই</li>
                <li>মেন্টরদের মতামত তাদের নিজস্ব, প্রতিষ্ঠানের নয়</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১০. দায়বদ্ধতার সীমা</h2>
            <p className="text-gray-700">
              আইন দ্বারা অনুমোদিত সর্বোচ্চ পরিমাণে, Creative Canvas IT কোন indirect, incidental, consequential, বা punitive damages এর জন্য দায়ী থাকবে না।
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১১. শর্তাবলী পরিবর্তন</h2>
            <p className="text-gray-700">
              আমরা যেকোনো সময় এই Terms of Use আপডেট করতে পারি। পরিবর্তনগুলি এই পৃষ্ঠায় পোস্ট করা হবে। গুরুত্বপূর্ণ পরিবর্তনের জন্য ইমেইল নোটিফিকেশন পাঠাব। পরিবর্তনের পর সেবা ব্যবহার অব্যাহত রাখা মানে আপনি নতুন শর্তে সম্মত।
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১২. প্রযোজ্য আইন</h2>
            <p className="text-gray-700">
              এই Terms of Use বাংলাদেশের আইন দ্বারা নিয়ন্ত্রিত হবে। কোন বিরোধ বাংলাদেশের আদালতের এখতিয়ারে নিষ্পত্তি হবে।
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">১৩. যোগাযোগ</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Terms of Use সম্পর্কে প্রশ্ন থাকলে যোগাযোগ করুন:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Creative Canvas IT</strong></p>
              <p>📧 Email: <a href="mailto:creativecanvasit@gmail.com" className="text-indigo-600 hover:underline">creativecanvasit@gmail.com</a></p>
              <p>📞 Phone: 01603718379, 01845202101</p>
            </div>
          </section>

          {/* Acceptance */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">সম্মতির স্বীকারোক্তি</h3>
                <p className="text-sm text-gray-700">
                  একটি অ্যাকাউন্ট তৈরি করে বা আমাদের সেবা ব্যবহার করে, আপনি স্বীকার করছেন যে আপনি এই Terms of Use পড়েছেন, বুঝেছেন, এবং মেনে চলতে সম্মত হয়েছেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

