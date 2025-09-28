'use client';

import { 
  Users, 
  Video, 
  Award, 
  Headphones, 
  FileText, 
  Briefcase, 
  Clock, 
  Building2 
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: "গ্রুপ লার্নিং",
    description: "অন্যান্য শিক্ষার্থীদের সাথে একসাথে শিখুন এবং অভিজ্ঞতা শেয়ার করুন"
  },
  {
    icon: Video,
    title: "লাইভ ক্লাস",
    description: "বিশেষজ্ঞ মেন্টরদের সাথে সরাসরি ক্লাসে অংশগ্রহণ করুন"
  },
  {
    icon: Award,
    title: "সার্টিফিকেট",
    description: "কোর্স সম্পূর্ণ করার পর প্রফেশনাল সার্টিফিকেট পান"
  },
  {
    icon: Headphones,
    title: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সময় আমাদের সাপোর্ট টিমের সাহায্য নিন"
  },
  {
    icon: FileText,
    title: "সিভি ফিল্ডার ও এক্সপার্ট সিডি রিভিউ",
    description: "পেশাদার সিভি তৈরি করুন এবং বিশেষজ্ঞ পর্যালোচনা পান"
  },
  {
    icon: Briefcase,
    title: "পোর্টফোলিও তৈরি",
    description: "আপনার কাজের সংগ্রহ তৈরি করুন এবং চাকরির সুযোগ বাড়ান"
  },
  {
    icon: Clock,
    title: "লাইফটাইম আক্সেস",
    description: "কোর্স সম্পূর্ণ করার পরও আজীবন অ্যাক্সেস পান"
  },
  {
    icon: Building2,
    title: "প্লেসমেন্ট সাপোর্ট",
    description: "চাকরি খোঁজার ক্ষেত্রে আমাদের বিশেষজ্ঞ দলের সহায়তা পান"
  }
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            আমাদের লাইভ কোর্সে কি কি সুযোগ-সুবিধা পাচ্ছেন
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            আমরা শুধু কোর্স দেই না, আপনার ক্যারিয়ার গড়ার সম্পূর্ণ পথনির্দেশনা দিয়ে থাকি
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
