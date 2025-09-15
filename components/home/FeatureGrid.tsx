'use client';

import { 
  Briefcase, 
  Video, 
  Clock, 
  FileText, 
  Users, 
  Building2, 
  Headphones, 
  Award, 
  DollarSign,
  ChevronRight
} from 'lucide-react';
// Static content for feature grid
const content = {
  features: {
    title: "আমাদের বিশেষ সুবিধা",
    subtitle: "আপনার সফলতার জন্য আমরা যা অফার করি",
    items: [
      "পোর্টফোলিও তৈরি",
      "রেকর্ডেড মাস্টারক্লাস", 
      "লাইফটাইম অ্যাক্সেস",
      "সিভি বিল্ডার ও এক্সপার্ট সিভি রিভিউ",
      "গ্রুপ লার্নিং",
      "জব প্লেসমেন্ট",
      "২৪/৭ লাইভ সাপোর্ট",
      "বিশ্বাসযোগ্য সার্টিফিকেট",
      "সাশ্রয়ী এবং মানসম্মত কোর্স"
    ]
  }
};

const featureIcons = {
  'পোর্টফোলিও তৈরি': Briefcase,
  'রেকর্ডেড মাস্টারক্লাস': Video,
  'লাইফটাইম অ্যাক্সেস': Clock,
  'সিভি বিল্ডার ও এক্সপার্ট সিভি রিভিউ': FileText,
  'গ্রুপ লার্নিং': Users,
  'জব প্লেসমেন্ট': Building2,
  '২৪/৭ লাইভ সাপোর্ট': Headphones,
  'বিশ্বাসযোগ্য সার্টিফিকেট': Award,
  'সাশ্রয়ী এবং মানসম্মত কোর্স': DollarSign,
};

export function FeatureGrid() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-ccit-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-ccit-muted-1/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ccit-primary mb-6">
            আমাদের বিশেষ সুবিধাসমূহ
          </h2>
          <p className="text-xl text-ccit-muted-1 max-w-3xl mx-auto leading-relaxed">
            আপনার ক্যারিয়ার গড়ার জন্য আমরা যা যা দিচ্ছি
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.features.items.map((feature, index) => {
            const Icon = featureIcons[feature as keyof typeof featureIcons];
            
            return (
              <div
                key={index}
                className="group relative"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 h-full">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-ccit-primary/5 to-ccit-muted-1/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ccit-primary to-ccit-accent-1 text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {Icon && <Icon className="w-8 h-8" />}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-ccit-primary mb-4 group-hover:text-ccit-accent-1 transition-colors duration-300">
                      {feature}
                    </h3>
                    <p className="text-ccit-muted-1 leading-relaxed">
                      এই সুবিধাটি আপনার ক্যারিয়ার গড়তে সাহায্য করবে।
                    </p>
                  </div>

                  {/* Hover effect border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-ccit-primary/20 to-ccit-muted-1/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: 'linear-gradient(135deg, rgba(17, 10, 79, 0.2), rgba(89, 84, 136, 0.2))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-ccit-primary to-ccit-accent-1 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <span className="font-semibold text-lg">সব সুবিধা দেখুন</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
