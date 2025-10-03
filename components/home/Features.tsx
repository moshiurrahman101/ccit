import { DollarSign, Briefcase, BookOpen, Award, FileText, Users, Clock, Zap, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: "সাশ্রয়ী এবং মানসম্মত কোর্স",
    description: "Creative Canvas IT সাশ্রয়ী মূল্যে সকল শিক্ষার্থীকে মানসম্মত কোর্স প্রদান করে থাকে।",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Briefcase,
    title: "চাকরি সংযোগকারী",
    description: "ফ্রিল্যান্স এবং জব মার্কেটের জন্য দক্ষতা অর্জনের পাশাপাশি চাকরি সংযোগের জন্য সহায়তা প্রদান করা হয়।",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: BookOpen,
    title: "একটি সম্পূর্ণ ও নমনীয় কোর্স",
    description: "শিক্ষার্থীরা সহজে এবং দ্রুত দক্ষতা অর্জন করতে পারে এমনভাবে কোর্সগুলো সম্পূর্ণ এবং নমনীয়ভাবে সাজানো হয়েছে।",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Award,
    title: "নিয়োগদাতা সার্টিফিকেট",
    description: "Creative Canvas IT থেকে প্রাপ্ত সার্টিফিকেট শিক্ষার্থীদের ভবিষ্যৎ কর্মজীবনে নিয়োগদাতাদের কাছে গ্রহণযোগ্য হয়।",
    color: "from-green-500 to-green-600"
  },
  {
    icon: FileText,
    title: "পোর্টফোলিও তৈরি",
    description: "কোর্স চলাকালীন সময়ে শিক্ষার্থীরা বাস্তব প্রজেক্টের মাধ্যমে নিজেদের পোর্টফোলিও তৈরি করতে পারে, যা ভবিষ্যতে কাজ পেতে সহায়তা করবে।",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Users,
    title: "গ্রুপ লার্নিং",
    description: "শিক্ষার্থীরা একসাথে কাজ করে শিখতে পারে, যার ফলে প্রশ্নের সমাধান সহজ হয় এবং শেখার মান বৃদ্ধি পায়।",
    color: "from-red-500 to-red-600"
  },
  {
    icon: Zap,
    title: "লাইভ ক্লাস",
    description: "লাইভ ক্লাসের মাধ্যমে প্রশ্নোত্তর ও ইন্টারেক্টিভ শেখার সুযোগ থাকে, যা শিক্ষার্থীদের জন্য অত্যন্ত উপকারী।",
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: Clock,
    title: "লাইফটাইম অ্যাক্সেস",
    description: "শিক্ষার্থীরা একবার ভর্তি হলে কোর্স কনটেন্টে লাইফটাইম অ্যাক্সেস পায়, ফলে ভবিষ্যতে পুনরায় শেখা সম্ভব হয়।",
    color: "from-yellow-500 to-yellow-600"
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
            আমরা কেন আপনার সেরা পছন্দ হবো তার কিছু কারণ
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