import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Clock, ArrowRight, Filter, Search, BookOpen } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    subtitle: "Complete Course with React & Node.js",
    instructor: "রাহুল আহমেদ",
    price: 15000,
    originalPrice: 20000,
    rating: 4.9,
    students: 1200,
    duration: "৬ মাস",
    level: "বিগিনার",
    category: "ওয়েব ডেভেলপমেন্ট",
    image: "🌐",
    description: "শূন্য থেকে শুরু করে সম্পূর্ণ ওয়েব ডেভেলপার হয়ে উঠুন। HTML, CSS, JavaScript, React, Node.js সব কিছু শিখুন।"
  },
  {
    id: 2,
    title: "Digital Marketing Mastery",
    subtitle: "Complete Digital Marketing Course",
    instructor: "সুমাইয়া খান",
    price: 12000,
    originalPrice: 15000,
    rating: 4.8,
    students: 980,
    duration: "৪ মাস",
    level: "ইন্টারমিডিয়েট",
    category: "ডিজিটাল মার্কেটিং",
    image: "📱",
    description: "ডিজিটাল মার্কেটিংয়ে মাস্টার হন। SEO, Social Media Marketing, Google Ads সব কিছু শিখুন।"
  },
  {
    id: 3,
    title: "Graphic Design with Adobe",
    subtitle: "From Basic to Professional",
    instructor: "আরিফ হোসেন",
    price: 10000,
    originalPrice: 13000,
    rating: 4.7,
    students: 850,
    duration: "৩ মাস",
    level: "বিগিনার",
    category: "গ্রাফিক ডিজাইন",
    image: "🎨",
    description: "Adobe Photoshop, Illustrator, InDesign দিয়ে গ্রাফিক ডিজাইনার হয়ে উঠুন।"
  },
  {
    id: 4,
    title: "Python Programming",
    subtitle: "Complete Python Developer Course",
    instructor: "ফাতেমা খাতুন",
    price: 14000,
    originalPrice: 18000,
    rating: 4.9,
    students: 1100,
    duration: "৫ মাস",
    level: "বিগিনার",
    category: "প্রোগ্রামিং",
    image: "🐍",
    description: "Python দিয়ে প্রোগ্রামিং শিখুন। Data Science, Web Development, Automation সব কিছু।"
  },
  {
    id: 5,
    title: "UI/UX Design",
    subtitle: "User Interface & Experience Design",
    instructor: "করিম উদ্দিন",
    price: 13000,
    originalPrice: 16000,
    rating: 4.8,
    students: 750,
    duration: "৪ মাস",
    level: "ইন্টারমিডিয়েট",
    category: "ডিজাইন",
    image: "🎯",
    description: "মডার্ন UI/UX ডিজাইন শিখুন। Figma, Adobe XD, Prototyping সব কিছু।"
  },
  {
    id: 6,
    title: "Data Science & Analytics",
    subtitle: "Complete Data Science Course",
    instructor: "নাসির আহমেদ",
    price: 18000,
    originalPrice: 22000,
    rating: 4.9,
    students: 650,
    duration: "৬ মাস",
    level: "এডভান্সড",
    category: "ডেটা সাইন্স",
    image: "📊",
    description: "Data Science, Machine Learning, Python, R সব কিছু শিখুন।"
  }
];

const categories = [
  "সব কোর্স",
  "ওয়েব ডেভেলপমেন্ট", 
  "ডিজিটাল মার্কেটিং",
  "গ্রাফিক ডিজাইন",
  "প্রোগ্রামিং",
  "ডিজাইন",
  "ডেটা সাইন্স"
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              আমাদের কোর্সসমূহ
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              আপনার ক্যারিয়ার গড়ার জন্য সেরা কোর্সগুলো। 
              বিশেষজ্ঞ মেন্টরদের সাথে শিখুন এবং সফল হন।
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={category === "সব কোর্স" ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="কোর্স খুঁজুন..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                ফিল্টার
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="relative">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      {course.category}
                    </Badge>
                  </div>
                  
                  <div className="text-6xl mb-4 text-center">{course.image}</div>
                  
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {course.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {course.instructor.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{course.instructor}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ৳{course.price.toLocaleString('bn-BD')}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ৳{course.originalPrice.toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    কোর্স বিস্তারিত
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              আরো কোর্স দেখুন
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">৫০+</div>
              <div className="text-blue-100">প্রফেশনাল কোর্স</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">১০,০০০+</div>
              <div className="text-blue-100">সফল শিক্ষার্থী</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">৯৮%</div>
              <div className="text-blue-100">সন্তুষ্টি হার</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">২৪/৭</div>
              <div className="text-blue-100">সাপোর্ট</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
