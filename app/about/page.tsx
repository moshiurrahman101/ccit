import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Target, Heart, Lightbulb, Shield, Globe, BookOpen } from 'lucide-react';

const stats = [
  { icon: Users, value: "১০,০০০+", label: "সফল শিক্ষার্থী" },
  { icon: BookOpen, value: "৫০+", label: "প্রফেশনাল কোর্স" },
  { icon: Award, value: "৯৮%", label: "সন্তুষ্টি হার" },
  { icon: Globe, value: "১০+", label: "দেশে সেবা" }
];

const values = [
  {
    icon: Target,
    title: "মানসম্মত শিক্ষা",
    description: "আমরা বিশ্বমানের শিক্ষার মান নিশ্চিত করি এবং প্রতিটি কোর্সে সর্বোচ্চ মান বজায় রাখি।"
  },
  {
    icon: Heart,
    title: "শিক্ষার্থী কেন্দ্রিক",
    description: "আমাদের সব সিদ্ধান্ত শিক্ষার্থীদের সাফল্যের কথা মাথায় রেখে নেওয়া হয়।"
  },
  {
    icon: Lightbulb,
    title: "নবাচার",
    description: "প্রযুক্তির অগ্রগতির সাথে তাল মিলিয়ে আমরা সবসময় নতুন নতুন কোর্স নিয়ে আসি।"
  },
  {
    icon: Shield,
    title: "বিশ্বস্ততা",
    description: "আমরা শিক্ষার্থীদের সাথে বিশ্বস্ত সম্পর্ক গড়ে তুলি এবং তাদের সাফল্যের জন্য কাজ করি।"
  }
];

const team = [
  {
    name: "রাহুল আহমেদ",
    role: "প্রতিষ্ঠাতা ও CEO",
    image: "R",
    bio: "১০ বছরের অভিজ্ঞতা নিয়ে একজন সফল উদ্যোক্তা। Google এবং Microsoft এ কাজ করেছেন।"
  },
  {
    name: "সুমাইয়া খান",
    role: "Chief Technology Officer",
    image: "S",
    bio: "টেকনোলজি ক্ষেত্রে বিশেষজ্ঞ। MIT থেকে কম্পিউটার সাইন্সে PhD করেছেন।"
  },
  {
    name: "আরিফ হোসেন",
    role: "Chief Marketing Officer",
    image: "A",
    bio: "ডিজিটাল মার্কেটিংয়ে বিশেষজ্ঞ। বিভিন্ন স্টার্টআপের সফল মার্কেটিং ক্যাম্পেইন পরিচালনা করেছেন।"
  },
  {
    name: "ফাতেমা খাতুন",
    role: "Head of Education",
    image: "F",
    bio: "শিক্ষা ক্ষেত্রে ১৫ বছরের অভিজ্ঞতা। শিক্ষার মান উন্নয়নে বিশেষ অবদান রেখেছেন।"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              আমাদের সম্পর্কে
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Creative Canvas IT - বাংলাদেশের অন্যতম সেরা আইটি প্রশিক্ষণ প্ল্যাটফর্ম। 
              আমরা শিক্ষার্থীদের স্বপ্ন পূরণে সাহায্য করি।
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                আমাদের গল্প
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  ২০২০ সালে Creative Canvas IT প্রতিষ্ঠিত হয়েছিল একটি সহজ লক্ষ্য নিয়ে - 
                  বাংলাদেশের তরুণদের জন্য বিশ্বমানের আইটি শিক্ষা নিশ্চিত করা।
                </p>
                <p>
                  আমাদের প্রতিষ্ঠাতা রাহুল আহমেদ, যিনি Google এবং Microsoft এ কাজ করেছেন, 
                  অনুভব করেছিলেন যে বাংলাদেশে মানসম্মত আইটি শিক্ষার অভাব রয়েছে।
                </p>
                <p>
                  আজ আমরা গর্বিত যে ১০,০০০+ শিক্ষার্থী আমাদের মাধ্যমে সফল ক্যারিয়ার গড়েছেন। 
                  আমরা শুধু কোর্সই শেখাই না, বরং শিক্ষার্থীদের স্বপ্ন পূরণে সাহায্য করি।
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">আমাদের মিশন</h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                বাংলাদেশের প্রতিটি তরুণের কাছে মানসম্মত আইটি শিক্ষা পৌঁছে দেওয়া এবং 
                তাদেরকে বিশ্বমানের প্রফেশনাল হিসেবে গড়ে তোলা।
              </p>
              <h3 className="text-2xl font-bold mb-4">আমাদের ভিশন</h3>
              <p className="text-blue-100 leading-relaxed">
                ২০৩০ সালের মধ্যে বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং সফল আইটি শিক্ষা প্ল্যাটফর্ম হওয়া।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              আমাদের মূল্যবোধ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              আমাদের প্রতিটি কাজে এই মূল্যবোধগুলো আমাদের পথপ্রদর্শক হিসেবে কাজ করে
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              আমাদের দল
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              আমাদের সফলতার পিছনে রয়েছে একদল দক্ষ এবং অভিজ্ঞ পেশাদার
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {member.image}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              কেন Creative Canvas IT?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              আমরা কেন আপনার সেরা পছন্দ হবো তার কিছু কারণ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">প্রমাণিত সাফল্য</h3>
              <p className="text-gray-600">
                ১০,০০০+ শিক্ষার্থীর সফল ক্যারিয়ার আমাদের সাফল্যের প্রমাণ
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">বিশেষজ্ঞ মেন্টর</h3>
              <p className="text-gray-600">
                বিশ্বমানের অভিজ্ঞতা নিয়ে আমাদের বিশেষজ্ঞ মেন্টররা
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ব্যবহারিক শিক্ষা</h3>
              <p className="text-gray-600">
                শুধু তত্ত্ব নয়, বাস্তব জীবনে কাজে লাগবে এমন শিক্ষা
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            আপনার ক্যারিয়ার গড়ার যাত্রা শুরু করুন
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            আমাদের সাথে যোগ দিন এবং আপনার স্বপ্নের ক্যারিয়ার গড়ুন। 
            আজই আপনার কোর্স বেছে নিন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              কোর্স দেখুন
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              আমাদের সাথে যোগাযোগ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
