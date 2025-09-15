import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowRight, TrendingUp } from 'lucide-react';

const courses = [
  {
    title: "Master Class Live Adobe Illustrator",
    subtitle: "From Basic To Freelancing Pro",
    instructor: "রাহুল আহমেদ",
    price: 6000,
    originalPrice: 7000,
    rating: 4.9,
    students: 1200,
    duration: "৩ মাস",
    level: "বিগিনার",
    badge: "লাইভ ক্লাস",
    badgeColor: "bg-green-500",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    title: "Complete Web Development Bootcamp",
    subtitle: "2024 Edition",
    instructor: "সুমাইয়া খান",
    price: 8000,
    originalPrice: 10000,
    rating: 4.8,
    students: 980,
    duration: "৪ মাস",
    level: "ইন্টারমিডিয়েট",
    badge: "নতুন কোর্স",
    badgeColor: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    title: "Digital Marketing Mastery",
    subtitle: "Complete Course",
    instructor: "আরিফ হোসেন",
    price: 5500,
    originalPrice: 6500,
    rating: 4.7,
    students: 750,
    duration: "২.৫ মাস",
    level: "বিগিনার",
    badge: "পপুলার",
    badgeColor: "bg-orange-500",
    gradient: "from-orange-500 to-red-600"
  }
];

export function Courses() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            আমাদের জনপ্রিয় কোর্স
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            আপনার ক্যারিয়ার গড়ার জন্য সেরা কোর্সগুলো
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div 
              key={index} 
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white/50"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-60">🎓</div>
                </div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${course.badgeColor} text-white border-0 shadow-lg`}>
                    {course.badge}
                  </Badge>
                </div>

                {/* Trending indicator */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">{course.subtitle}</p>

                {/* Instructor */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {course.instructor.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{course.instructor}</span>
                </div>

                {/* Rating and Students */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{course.students}+</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {course.price.toLocaleString('bn-BD')}৳
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {course.originalPrice.toLocaleString('bn-BD')}৳
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">লেভেল</div>
                    <div className="text-sm font-medium text-gray-900">{course.level}</div>
                  </div>
                </div>

                <Button className={`w-full bg-gradient-to-r ${course.gradient} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-white font-semibold`}>
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold bg-white/80 backdrop-blur-md"
          >
            সব কোর্স দেখুন
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}