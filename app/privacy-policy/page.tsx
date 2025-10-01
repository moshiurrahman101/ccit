import { Metadata } from 'next';
import { Shield, Lock, Eye, FileText, Mail, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Creative Canvas IT',
  description: 'Learn how Creative Canvas IT collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
  openGraph: {
    title: 'Privacy Policy | Creative Canvas IT',
    description: 'Learn how Creative Canvas IT collects, uses, and protects your personal information.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-100">
            আপনার গোপনীয়তা আমাদের অগ্রাধিকার
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Last Updated: October 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১. ভূমিকা</h2>
            <p className="text-gray-700 leading-relaxed">
              Creative Canvas IT ("আমরা", "আমাদের") আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই Privacy Policy ব্যাখ্যা করে কিভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং সুরক্ষিত করি যখন আপনি আমাদের ওয়েবসাইট এবং সেবা ব্যবহার করেন।
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              আমাদের সেবা ব্যবহার করে, আপনি এই Privacy Policy-তে বর্ণিত শর্তাবলীতে সম্মত হচ্ছেন।
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">২. আমরা যে তথ্য সংগ্রহ করি</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">২.১ ব্যক্তিগত তথ্য</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>নাম এবং যোগাযোগের তথ্য (ইমেইল, ফোন নম্বর)</li>
                  <li>অ্যাকাউন্ট তথ্য (ইউজারনেম, পাসওয়ার্ড)</li>
                  <li>শিক্ষাগত এবং পেশাগত তথ্য</li>
                  <li>পেমেন্ট তথ্য (নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে)</li>
                  <li>প্রোফাইল ছবি এবং অন্যান্য আপলোড করা কন্টেন্ট</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">২.২ স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>IP Address এবং Device তথ্য</li>
                  <li>Browser Type এবং Operating System</li>
                  <li>ওয়েবসাইট ব্যবহারের তথ্য (পেজ ভিজিট, সময়কাল)</li>
                  <li>Cookies এবং Similar Technologies</li>
                  <li>লগইন এবং কার্যকলাপের লগ</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">২.৩ শিক্ষার্থী এবং মেন্টর তথ্য</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>কোর্স enrollment এবং progress তথ্য</li>
                  <li>অ্যাসাইনমেন্ট জমা এবং পারফরম্যান্স ডেটা</li>
                  <li>attendance records</li>
                  <li>সার্টিফিকেট এবং অর্জন</li>
                  <li>মেন্টর-স্টুডেন্ট যোগাযোগ</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">৩. তথ্যের ব্যবহার</h2>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <p className="font-medium">আমরা আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>সেবা প্রদান:</strong> কোর্স delivery, ব্যাচ ম্যানেজমেন্ট, এবং শিক্ষামূলক সেবা</li>
                <li><strong>অ্যাকাউন্ট ম্যানেজমেন্ট:</strong> নিবন্ধন, authentication, এবং ব্যবহারকারী সহায়তা</li>
                <li><strong>পেমেন্ট প্রসেসিং:</strong> invoice জেনারেশন এবং পেমেন্ট ট্র্যাকিং</li>
                <li><strong>যোগাযোগ:</strong> কোর্স আপডেট, ইমেইল নোটিফিকেশন, এবং newsletter</li>
                <li><strong>উন্নতি:</strong> প্ল্যাটফর্ম অপটিমাইজেশন এবং ব্যবহারকারী অভিজ্ঞতা উন্নত করা</li>
                <li><strong>নিরাপত্তা:</strong> জালিয়াতি প্রতিরোধ এবং প্ল্যাটফর্ম নিরাপত্তা বজায় রাখা</li>
                <li><strong>Analytics:</strong> ব্যবহারের প্যাটার্ন বিশ্লেষণ এবং performance মেট্রিক্স</li>
                <li><strong>আইনি বাধ্যবাধকতা:</strong> আইন এবং নিয়ম মেনে চলা</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">৪. ডেটা নিরাপত্তা</h2>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <p>আমরা আপনার তথ্য রক্ষায় শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Encryption:</strong> পাসওয়ার্ড এবং সংবেদনশীল ডেটা encrypted সংরক্ষণ</li>
                <li><strong>Secure Connections:</strong> HTTPS প্রোটোকল ব্যবহার</li>
                <li><strong>Access Control:</strong> সীমিত এবং role-based access</li>
                <li><strong>Regular Backups:</strong> ডেটা হারানো প্রতিরোধ</li>
                <li><strong>Monitoring:</strong> নিরাপত্তা হুমকির জন্য ক্রমাগত পর্যবেক্ষণ</li>
                <li><strong>JWT Authentication:</strong> নিরাপদ session management</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৫. তথ্য শেয়ারিং</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। তবে, নিম্নলিখিত পরিস্থিতিতে শেয়ার করতে পারি:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>মেন্টর এবং শিক্ষার্থী:</strong> শিক্ষামূলক উদ্দেশ্যে প্রয়োজনীয় তথ্য</li>
                <li><strong>সেবা প্রদানকারী:</strong> পেমেন্ট গেটওয়ে, ইমেইল সার্ভিস, ক্লাউড storage</li>
                <li><strong>আইনি প্রয়োজন:</strong> আদালতের আদেশ বা আইন প্রয়োগকারী সংস্থা</li>
                <li><strong>আপনার সম্মতিতে:</strong> যখন আপনি স্পষ্টভাবে অনুমতি দেন</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৬. Cookies এবং Tracking</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা নিম্নলিখিত উদ্দেশ্যে cookies ব্যবহার করি:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Authentication এবং session management</li>
                <li>ব্যবহারকারীর preferences সংরক্ষণ</li>
                <li>সাইট ব্যবহার বিশ্লেষণ</li>
                <li>ব্যবহারকারী অভিজ্ঞতা personalization</li>
              </ul>
              <p className="mt-3">আপনি browser settings থেকে cookies নিয়ন্ত্রণ করতে পারেন।</p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৭. আপনার অধিকার</h2>
            <div className="space-y-3 text-gray-700">
              <p>আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Access:</strong> আপনার ব্যক্তিগত তথ্য দেখার অধিকার</li>
                <li><strong>Correction:</strong> ভুল তথ্য সংশোধনের অধিকার</li>
                <li><strong>Deletion:</strong> আপনার ডেটা মুছে ফেলার অনুরোধ</li>
                <li><strong>Export:</strong> আপনার ডেটা ডাউনলোড করার অধিকার</li>
                <li><strong>Opt-out:</strong> marketing communication থেকে বেরিয়ে আসা</li>
                <li><strong>Withdraw Consent:</strong> যেকোনো সময় সম্মতি প্রত্যাহার</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৮. ডেটা সংরক্ষণ</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা আপনার তথ্য ততক্ষণ সংরক্ষণ করি যতক্ষণ:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>আপনার অ্যাকাউন্ট active থাকে</li>
                <li>সেবা প্রদানের জন্য প্রয়োজন</li>
                <li>আইনি বাধ্যবাধকতা পূরণের জন্য প্রয়োজন</li>
                <li>বিরোধ নিষ্পত্তি এবং চুক্তি প্রয়োগের জন্য প্রয়োজন</li>
              </ul>
              <p className="mt-3">অ্যাকাউন্ট deletion এর পর, আমরা আপনার তথ্য আইনি প্রয়োজনীয়তা অনুযায়ী মুছে ফেলি।</p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">৯. শিশুদের গোপনীয়তা</h2>
            <p className="text-gray-700">
              আমাদের সেবা ১৬ বছরের কম বয়সীদের জন্য নয়। আমরা জেনেশুনে শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি আমরা জানতে পারি যে একটি শিশু তথ্য প্রদান করেছে, আমরা অবিলম্বে তা মুছে ফেলব।
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১০. তৃতীয় পক্ষের লিংক</h2>
            <p className="text-gray-700">
              আমাদের সাইটে তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকতে পারে। আমরা তাদের privacy practices-এর জন্য দায়ী নই। আমরা আপনাকে তাদের privacy policies পর্যালোচনা করার পরামর্শ দিই।
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">১১. Policy আপডেট</h2>
            <p className="text-gray-700">
              আমরা সময়ে সময়ে এই Privacy Policy আপডেট করতে পারি। পরিবর্তনগুলি এই পৃষ্ঠায় পোস্ট করা হবে এবং "Last Updated" তারিখ আপডেট করা হবে। গুরুত্বপূর্ণ পরিবর্তনের জন্য, আমরা ইমেইলের মাধ্যমে বিজ্ঞপ্তি পাঠাব।
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">১২. যোগাযোগ</h2>
            </div>
            <p className="text-gray-700 mb-4">
              এই Privacy Policy সম্পর্কে কোন প্রশ্ন বা উদ্বেগ থাকলে যোগাযোগ করুন:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Creative Canvas IT</strong></p>
              <p>📧 Email: <a href="mailto:creativecanvasit@gmail.com" className="text-blue-600 hover:underline">creativecanvasit@gmail.com</a></p>
              <p>📞 Phone: 01603718379, 01845202101</p>
              <p>🌐 Website: <a href="/" className="text-blue-600 hover:underline">www.creativecanvasit.com</a></p>
            </div>
          </section>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">গুরুত্বপূর্ণ নোট</h3>
                <p className="text-sm text-gray-700">
                  আমাদের সেবা ব্যবহার অব্যাহত রেখে, আপনি এই Privacy Policy এবং আমাদের Terms of Use-তে বর্ণিত সকল শর্তে সম্মত হচ্ছেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

