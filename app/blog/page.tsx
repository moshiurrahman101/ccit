import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, ArrowRight, Search, Filter, BookOpen } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "ফ্রিল্যান্সিং শুরু করার সম্পূর্ণ গাইড ২০২৪",
    excerpt: "ফ্রিল্যান্সিং শুরু করতে চান? এই গাইডে শিখুন কিভাবে প্রথম ফ্রিল্যান্সিং প্রজেক্ট পাবেন এবং সফল হবেন।",
    content: "ফ্রিল্যান্সিং একটি চমৎকার ক্যারিয়ার অপশন। এই আর্টিকেলে আমরা বিস্তারিত আলোচনা করব...",
    author: "রাহুল আহমেদ",
    date: "২০২৪-০১-১৫",
    readTime: "৮ মিনিট",
    category: "ফ্রিল্যান্সিং",
    image: "💼",
    tags: ["ফ্রিল্যান্সিং", "ক্যারিয়ার", "প্রজেক্ট"],
    featured: true
  },
  {
    id: 2,
    title: "React.js শেখার সেরা উপায়",
    excerpt: "React.js শিখতে চান? জানুন কোন পথে এগোলে দ্রুত শিখতে পারবেন এবং সফল হবেন।",
    content: "React.js বর্তমান সময়ের সবচেয়ে জনপ্রিয় JavaScript লাইব্রেরি। এই আর্টিকেলে...",
    author: "সুমাইয়া খান",
    date: "২০২৪-০১-১২",
    readTime: "৬ মিনিট",
    category: "প্রোগ্রামিং",
    image: "⚛️",
    tags: ["React", "JavaScript", "Web Development"],
    featured: false
  },
  {
    id: 3,
    title: "ডিজিটাল মার্কেটিংয়ে সফল হওয়ার টিপস",
    excerpt: "ডিজিটাল মার্কেটিংয়ে ক্যারিয়ার গড়তে চান? এই টিপসগুলো আপনাকে সাহায্য করবে।",
    content: "ডিজিটাল মার্কেটিং বর্তমান সময়ের সবচেয়ে চাহিদা সম্পন্ন ফিল্ড। এখানে কিছু গুরুত্বপূর্ণ টিপস...",
    author: "আরিফ হোসেন",
    date: "২০২৪-০১-১০",
    readTime: "৭ মিনিট",
    category: "ডিজিটাল মার্কেটিং",
    image: "📱",
    tags: ["Digital Marketing", "SEO", "Social Media"],
    featured: false
  },
  {
    id: 4,
    title: "Python দিয়ে Data Science শুরু করা",
    excerpt: "Data Science শিখতে চান? Python দিয়ে কিভাবে শুরু করবেন তা জানুন এই গাইডে।",
    content: "Data Science বর্তমান সময়ের সবচেয়ে চাহিদা সম্পন্ন ফিল্ড। Python দিয়ে শুরু করা...",
    author: "ফাতেমা খাতুন",
    date: "২০২৪-০১-০৮",
    readTime: "৯ মিনিট",
    category: "ডেটা সাইন্স",
    image: "🐍",
    tags: ["Python", "Data Science", "Machine Learning"],
    featured: false
  },
  {
    id: 5,
    title: "UI/UX ডিজাইনের ভবিষ্যৎ",
    excerpt: "UI/UX ডিজাইন কেন গুরুত্বপূর্ণ এবং এর ভবিষ্যৎ কেমন হবে তা জানুন।",
    content: "UI/UX ডিজাইন এখন শুধু একটি পেশা নয়, এটি একটি প্রয়োজন। ভবিষ্যতে এর গুরুত্ব আরো বাড়বে...",
    author: "করিম উদ্দিন",
    date: "২০২৪-০১-০৫",
    readTime: "৫ মিনিট",
    category: "ডিজাইন",
    image: "🎨",
    tags: ["UI/UX", "Design", "Future"],
    featured: false
  },
  {
    id: 6,
    title: "সাইবার সিকিউরিটি কেন গুরুত্বপূর্ণ",
    excerpt: "সাইবার সিকিউরিটি সম্পর্কে জানুন এবং কেন এটি শিখা গুরুত্বপূর্ণ।",
    content: "সাইবার সিকিউরিটি বর্তমান সময়ের সবচেয়ে গুরুত্বপূর্ণ বিষয়। প্রতিটি প্রতিষ্ঠান...",
    author: "নাসির আহমেদ",
    date: "২০২৪-০১-০৩",
    readTime: "৬ মিনিট",
    category: "সাইবার সিকিউরিটি",
    image: "🔒",
    tags: ["Cybersecurity", "Security", "Technology"],
    featured: false
  }
];

const categories = [
  "সব আর্টিকেল",
  "ফ্রিল্যান্সিং",
  "প্রোগ্রামিং",
  "ডিজিটাল মার্কেটিং",
  "ডেটা সাইন্স",
  "ডিজাইন",
  "সাইবার সিকিউরিটি"
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              আমাদের ব্লগ
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              ক্যারিয়ার, প্রযুক্তি এবং সফলতার নিয়ে নিয়মিত আপডেট পান। 
              আমাদের বিশেষজ্ঞদের অভিজ্ঞতা এবং টিপস জানুন।
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">ফিচার্ড আর্টিকেল</h2>
          {blogPosts.filter(post => post.featured).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className="bg-green-500 text-white">ফিচার্ড</Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </CardTitle>
                  
                  <CardDescription className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    পুরো আর্টিকেল পড়ুন
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-8 lg:p-12">
                  <div className="text-8xl">{post.image}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={category === "সব আর্টিকেল" ? "default" : "outline"}
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
                  placeholder="আর্টিকেল খুঁজুন..."
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

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">সব আর্টিকেল</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="text-4xl">{post.image}</div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-200">
                      পড়ুন
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              আরো আর্টিকেল দেখুন
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            নতুন আর্টিকেলের খবর পান
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            আমাদের নিউজলেটারে সাবস্ক্রাইব করুন এবং নতুন আর্টিকেলের খবর প্রথমে পান।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="আপনার ইমেইল দিন"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
              সাবস্ক্রাইব
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
