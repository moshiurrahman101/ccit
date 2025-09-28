import { Users, Video, Award, Headphones, FileText, Briefcase, Clock, Zap, Shield, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "লাইভ ক্লাস",
    description: "বিশেষজ্ঞ মেন্টরদের সাথে সরাসরি ক্লাসে অংশগ্রহণ করুন",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Video,
    title: "রেকর্ডেড ক্লাস",
    description: "যেকোনো সময় দেখুন এবং শিখুন আমাদের রেকর্ডেড ক্লাসগুলো",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: Award,
    title: "সার্টিফিকেট",
    description: "কোর্স সম্পূর্ণ করার পর প্রফেশনাল সার্টিফিকেট পান",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Headphones,
    title: "২৪/৭ সাপোর্ট",
    description: "যেকোনো সময় আমাদের সাপোর্ট টিমের সাহায্য নিন",
    color: "from-green-500 to-green-600"
  },
  {
    icon: FileText,
    title: "সিভি বিল্ডার",
    description: "পেশাদার সিভি তৈরি করুন এবং বিশেষজ্ঞ পর্যালোচনা পান",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Briefcase,
    title: "জব প্লেসমেন্ট",
    description: "চাকরি খোঁজার ক্ষেত্রে আমাদের বিশেষজ্ঞ দলের সহায়তা পান",
    color: "from-red-500 to-red-600"
  },
  {
    icon: Clock,
    title: "লাইফটাইম অ্যাক্সেস",
    description: "কোর্স সম্পূর্ণ করার পরও আজীবন অ্যাক্সেস পান",
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: Zap,
    title: "ফাস্ট লার্নিং",
    description: "আমাদের প্রমাণিত পদ্ধতিতে দ্রুত শিখুন",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    icon: Shield,
    title: "গ্যারান্টি",
    description: "সন্তুষ্ট না হলে ৩০ দিনের মধ্যে টাকা ফেরত",
    color: "from-pink-500 to-pink-600"
  }
];

export function Features() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            কেন Creative Canvas IT?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            আপনার ক্যারিয়ার গড়ার জন্য আমরা যা যা দিচ্ছি
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover effect border */}
                  <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
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
          <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <span className="font-semibold text-lg">সব সুবিধা দেখুন</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </div>
      </div>
    </section>
  );
}