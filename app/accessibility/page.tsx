import { Metadata } from 'next';
import { Accessibility, Eye, Keyboard, Volume2, Mouse, Settings, Mail, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Creative Canvas IT',
  description: 'Our commitment to making Creative Canvas IT accessible to everyone. Learn about our accessibility features and how to get support.',
  openGraph: {
    title: 'Accessibility Statement | Creative Canvas IT',
    description: 'Our commitment to digital accessibility for all users.',
    type: 'website',
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Accessibility className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Accessibility Statement</h1>
          </div>
          <p className="text-xl text-green-100">
            সবার জন্য অ্যাক্সেসযোগ্য শিক্ষা প্ল্যাটফর্ম
          </p>
          <p className="text-sm text-green-200 mt-4">
            Last Updated: October 1, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Commitment */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">আমাদের অঙ্গীকার</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                Creative Canvas IT বিশ্বাস করে যে শিক্ষা সবার জন্য হওয়া উচিত। আমরা প্রতিশ্রুতিবদ্ধ যে আমাদের ওয়েবসাইট এবং শিক্ষামূলক প্ল্যাটফর্ম সকল ব্যবহারকারীর জন্য অ্যাক্সেসযোগ্য, ব্যবহারযোগ্য এবং উপভোগ্য হবে - তাদের ক্ষমতা বা ব্যবহৃত প্রযুক্তি নির্বিশেষে।
              </p>
              <p>
                আমরা ক্রমাগত আমাদের প্ল্যাটফর্মের অ্যাক্সেসিবিলিটি উন্নত করার চেষ্টা করছি এবং Web Content Accessibility Guidelines (WCAG) 2.1 Level AA মান মেনে চলার লক্ষ্যে কাজ করছি।
              </p>
            </div>
          </section>

          {/* Current Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">বর্তমান Accessibility Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Visual Accessibility */}
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">দৃষ্টিগত অ্যাক্সেসিবিলিটি</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>উচ্চ contrast color scheme</li>
                  <li>রিসাইজেবল text (zoom support)</li>
                  <li>পরিষ্কার typography এবং readable fonts</li>
                  <li>Alt text সহ images</li>
                  <li>ফোকাস indicators</li>
                </ul>
              </div>

              {/* Keyboard Navigation */}
              <div className="bg-purple-50 p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">কীবোর্ড Navigation</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>সম্পূর্ণ keyboard navigable</li>
                  <li>Logical tab order</li>
                  <li>Skip navigation links</li>
                  <li>Keyboard shortcuts support</li>
                  <li>Accessible forms এবং controls</li>
                </ul>
              </div>

              {/* Screen Reader Support */}
              <div className="bg-green-50 p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Screen Reader Support</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>ARIA landmarks এবং labels</li>
                  <li>Semantic HTML structure</li>
                  <li>Descriptive link text</li>
                  <li>Form field labels</li>
                  <li>Error message announcements</li>
                </ul>
              </div>

              {/* Interactive Elements */}
              <div className="bg-orange-50 p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Mouse className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">ইন্টারঅ্যাক্টিভ Elements</h3>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-2">
                  <li>বড় clickable areas</li>
                  <li>Clear button labels</li>
                  <li>Hover এবং focus states</li>
                  <li>Form validation feedback</li>
                  <li>Error prevention এবং recovery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technical Standards */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">প্রযুক্তিগত মান</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>আমাদের প্ল্যাটফর্ম নিম্নলিখিত মান এবং নির্দেশিকা অনুসরণ করে:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines মেনে চলার চেষ্টা</li>
                <li><strong>Semantic HTML5:</strong> সঠিক HTML elements ব্যবহার</li>
                <li><strong>ARIA (Accessible Rich Internet Applications):</strong> Screen reader compatibility</li>
                <li><strong>Responsive Design:</strong> সব device size এ accessible</li>
                <li><strong>Progressive Enhancement:</strong> basic functionality সবার জন্য available</li>
              </ul>
            </div>
          </section>

          {/* Content Accessibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Accessibility</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ভিডিও Content</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Captions এবং subtitles (যেখানে সম্ভব)</li>
                  <li>Transcript উপলব্ধ করার চেষ্টা</li>
                  <li>Playback speed control</li>
                  <li>Pause, stop, এবং volume controls</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">লেখা Content</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>সরল এবং পরিষ্কার ভাষা ব্যবহার</li>
                  <li>সঠিক heading structure (H1, H2, H3...)</li>
                  <li>Short paragraphs এবং lists</li>
                  <li>Readable font sizes</li>
                  <li>বাংলা এবং ইংরেজি উভয় ভাষায় support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ডকুমেন্ট এবং ফাইল</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Accessible PDF format</li>
                  <li>Alternative formats উপলব্ধ (যেখানে সম্ভব)</li>
                  <li>Clear file names এবং descriptions</li>
                  <li>ডাউনলোড করার আগে file type এবং size তথ্য</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Browser and Assistive Technology */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">সমর্থিত ব্রাউজার এবং Assistive Technology</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ব্রাউজার</h3>
                <p className="text-gray-700 mb-2">আমরা নিম্নলিখিত modern browsers এর সাম্প্রতিক সংস্করণ support করি:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Microsoft Edge</li>
                  <li>Safari</li>
                  <li>Opera</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Assistive Technologies</h3>
                <p className="text-gray-700 mb-2">আমাদের সাইট নিম্নলিখিত assistive technologies এর সাথে কাজ করে:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                  <li>Screen magnification software</li>
                  <li>Speech recognition software</li>
                  <li>Alternative input devices</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Known Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">পরিচিত সীমাবদ্ধতা</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="space-y-2 text-gray-700">
                <p>আমরা স্বীকার করি যে কিছু ক্ষেত্রে সীমাবদ্ধতা আছে:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>কিছু পুরানো content পুরোপুরি accessible নাও হতে পারে</li>
                  <li>Third-party embedded content (YouTube videos, etc.) আমাদের নিয়ন্ত্রণের বাইরে</li>
                  <li>কিছু complex interactive features আরও উন্নতির প্রয়োজন</li>
                  <li>সব video তে এখনো Bengali captions নেই</li>
                </ul>
                <p className="mt-3 font-medium">আমরা এই সমস্যাগুলো সমাধানের জন্য ক্রমাগত কাজ করছি।</p>
              </div>
            </div>
          </section>

          {/* Feedback and Support */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Feedback এবং Support</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                আমরা আপনার accessibility feedback মূল্য দিই এবং সক্রিয়ভাবে চাই। আপনি যদি:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>কোন accessibility barrier খুঁজে পান</li>
                <li>Accessibility improvement এর পরামর্শ থাকে</li>
                <li>Specific accommodation এর প্রয়োজন হয়</li>
                <li>Alternative format এ content চান</li>
              </ul>
              <p className="mt-3">অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mt-4">
              <div className="space-y-2 text-gray-700">
                <p><strong>Accessibility Team</strong></p>
                <p><strong>Creative Canvas IT</strong></p>
                <p>📧 Email: <a href="mailto:creativecanvasit@gmail.com" className="text-green-600 hover:underline">creativecanvasit@gmail.com</a></p>
                <p>📧 Subject: "Accessibility Support"</p>
                <p>📞 Phone: 01603718379, 01845202101</p>
                <p className="text-sm mt-3">
                  আমরা ৪৮ ঘন্টার মধ্যে সাড়া দেওয়ার চেষ্টা করি।
                </p>
              </div>
            </div>
          </section>

          {/* Ongoing Improvements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">চলমান উন্নতি</h2>
            <div className="space-y-3 text-gray-700">
              <p>আমরা accessibility একটি চলমান প্রক্রিয়া হিসাবে দেখি। আমাদের পরিকল্পনায় রয়েছে:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>নিয়মিত accessibility audits পরিচালনা</li>
                <li>Users এবং accessibility experts থেকে feedback সংগ্রহ</li>
                <li>নতুন WCAG guidelines অনুসরণ</li>
                <li>আমাদের টিমকে accessibility training প্রদান</li>
                <li>সব নতুন features accessibility মাথায় রেখে ডিজাইন</li>
                <li>পুরানো content আপডেট এবং improve করা</li>
              </ul>
            </div>
          </section>

          {/* Alternative Ways */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">বিকল্প উপায়ে অ্যাক্সেস</h2>
            <div className="space-y-3 text-gray-700">
              <p>যদি আপনি website অ্যাক্সেস করতে অসুবিধা পান:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>আমাদের ফোন করুন সরাসরি সহায়তার জন্য</li>
                <li>আমাদের ইমেইল করুন এবং আমরা alternative format এ তথ্য পাঠাব</li>
                <li>আমাদের অফিসে visit করুন in-person সহায়তার জন্য</li>
              </ul>
            </div>
          </section>

          {/* Complaints Process */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">অভিযোগ প্রক্রিয়া</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                আপনি যদি আমাদের accessibility response নিয়ে সন্তুষ্ট না হন, আপনি formal complaint করতে পারেন:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>আমাদের লিখিত অভিযোগ পাঠান (ইমেইল বা চিঠি)</li>
                <li>আপনার নাম, যোগাযোগের তথ্য, এবং সমস্যার বিবরণ দিন</li>
                <li>আমরা ৭ কর্মদিবসের মধ্যে acknowledgment পাঠাব</li>
                <li>আমরা ৩০ দিনের মধ্যে সমাধান প্রদানের চেষ্টা করব</li>
              </ol>
            </div>
          </section>

          {/* Resources */}
          <section className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">সহায়ক Resources</h2>
            <div className="space-y-2 text-gray-700">
              <p>আরও জানতে:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Web Accessibility Initiative (WAI)</a></li>
                <li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">WCAG 2.1 Quick Reference</a></li>
                <li><a href="https://webaim.org/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">WebAIM - Web Accessibility In Mind</a></li>
              </ul>
            </div>
          </section>

          {/* Statement Date */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-sm text-gray-700">
              এই Accessibility Statement সর্বশেষ পর্যালোচনা করা হয়েছে: <strong>October 1, 2025</strong>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              আমরা নিয়মিত এই statement আপডেট করি আমাদের accessibility প্রচেষ্টা reflect করতে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

