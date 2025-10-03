'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Target, Heart, Lightbulb, Shield, Globe, BookOpen } from 'lucide-react';

const stats = [
  { icon: Users, value: "১৫০+", label: "সফল শিক্ষার্থী" },
  { icon: BookOpen, value: "৫+", label: "প্রফেশনাল কোর্স" },
  { icon: Award, value: "৯৮%", label: "সন্তুষ্টি হার" },
  { icon: Globe, value: "১", label: "দেশে সেবা" }
];

const values = [
  {
    icon: Target,
    title: "গুণগত মান",
    description: "সর্বোচ্চ মান বজায় রেখে কোর্স তৈরি করা।"
  },
  {
    icon: Heart,
    title: "স্বচ্ছতা",
    description: "মিথ্যা প্রতিশ্রুতি নয়, বরং বাস্তবমুখী ফলাফল।"
  },
  {
    icon: Lightbulb,
    title: "দক্ষতা উন্নয়ন",
    description: "শুধু শেখানো নয়, ক্যারিয়ারে প্রয়োগযোগ্য দক্ষতা তৈরি।"
  },
  {
    icon: Shield,
    title: "শিক্ষার্থী-কেন্দ্রিকতা",
    description: "প্রতিটি শিক্ষার্থীকে আলাদা গুরুত্ব দিয়ে গড়ে তোলা।"
  },
  {
    icon: Globe,
    title: "অবিরত শেখা",
    description: "নতুন প্রযুক্তি ও আপডেট নিয়ে সর্বদা এগিয়ে থাকা।"
  }
];

const team = [
  {
    name: "মোঃ ইকবাল হোসেন",
    role: "Senior Graphic Designer | Founder & CEO",
    image: "/founder.png",
    bio: "তিনি একজন অভিজ্ঞ গ্রাফিক ডিজাইনার এবং ট্রেইনার, যার আছে ৫+ বছরের অভিজ্ঞতা। শিক্ষাদানে তার মূল ফোকাস হলো—শিক্ষার্থীদের হাতে-কলমে প্র্যাকটিক্যাল দক্ষতা তৈরি করা এবং তাদেরকে বাস্তব প্রজেক্টে যুক্ত করা।"
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
              Creative Canvas IT প্রতিষ্ঠিত হয় ২০২৩ সালে, একটি স্বপ্ন নিয়ে—বাংলাদেশের তরুণ প্রজন্মকে ডিজিটাল দক্ষতায় এগিয়ে নিয়ে যাওয়া।
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
                  Creative Canvas IT প্রতিষ্ঠিত হয় ২০২৩ সালে, একটি স্বপ্ন নিয়ে—বাংলাদেশের তরুণ প্রজন্মকে ডিজিটাল দক্ষতায় এগিয়ে নিয়ে যাওয়া। শুরু থেকে আজ পর্যন্ত আমরা ১৫০+ শিক্ষার্থীকে প্রশিক্ষণ দিয়েছি এবং তাদের ফ্রিল্যান্সিং, চাকরি ও উদ্যোক্তা হিসেবে গড়ে উঠতে সহায়তা করেছি।
                </p>
                <p>
                  আমাদের প্রতিটি কোর্স বাস্তব অভিজ্ঞতার সাথে সামঞ্জস্যপূর্ণ, যাতে শিক্ষার্থীরা শেখার পাশাপাশি নিজেদের পোর্টফোলিও তৈরি করতে পারে।
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">আমাদের মিশন</h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                আমাদের লক্ষ্য হচ্ছে সহজে শেখার উপযোগী কোর্স ও বাস্তবভিত্তিক প্রজেক্টের মাধ্যমে শিক্ষার্থীদের এমনভাবে তৈরি করা, যাতে তারা গ্লোবাল মার্কেটপ্লেসে কাজ করতে সক্ষম হয় এবং দেশের ডিজিটাল অর্থনীতিতে অবদান রাখতে পারে।
              </p>
              <h3 className="text-2xl font-bold mb-4">আমাদের ভিশন</h3>
              <p className="text-blue-100 leading-relaxed">
                Creative Canvas IT-এর ভিশন হলো—বাংলাদেশের সবচেয়ে বিশ্বস্ত ও মানসম্মত অনলাইন স্কিল লার্নিং প্ল্যাটফর্মে পরিণত হওয়া, যেখানে শিক্ষার্থী, ফ্রিল্যান্সার ও চাকরিপ্রত্যাশীরা সমানভাবে দক্ষতা অর্জন করে সাফল্যের পথে এগিয়ে যেতে পারবে।
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

          <div className="max-w-2xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initial if image fails to load
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-2xl font-bold hidden">
                      {member.name.charAt(0)}
                    </div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">ভবিষ্যতের জন্য নিজেকে প্রস্তুত করুন</h3>
              <p className="text-gray-600">
                Creative Canvas IT শুধুমাত্র বর্তমানের স্কিল শেখানোতেই সীমাবদ্ধ নয়, বরং শিক্ষার্থীদেরকে ভবিষ্যতের জন্যও প্রস্তুত করতে প্রতিশ্রুতিবদ্ধ। আমরা নিয়মিত আমাদের কোর্সগুলিকে আপডেট করি এবং শিক্ষার্থীদেরকে সর্বশেষ ট্রেন্ড ও কৌশল শেখাই, যাতে তারা সবসময় এগিয়ে থাকতে পারে।
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">কেন Creative Canvas IT আলাদা?</h3>
              <p className="text-gray-600">
                Creative Canvas IT শিক্ষার মাধ্যমে কেবল নতুন কিছু শেখায় না, বরং বাস্তব জীবনের পরিস্থিতিতে কীভাবে সফল হওয়া যায় তার একটি পূর্ণাঙ্গ দিকনির্দেশনা প্রদান করে। আমাদের কোর্সগুলো এমনভাবে ডিজাইন করা হয়েছে যাতে শিক্ষার্থীরা প্রথমে মূল ধারণাগুলো আয়ত্ত করতে পারে এবং ধাপে ধাপে আরও জটিল বিষয়গুলো শিখতে পারে।
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">বাস্তবভিত্তিক শিক্ষা</h3>
              <p className="text-gray-600">
                আমাদের প্রতিটি কোর্স বাস্তব অভিজ্ঞতার সাথে সামঞ্জস্যপূর্ণ, যাতে শিক্ষার্থীরা শেখার পাশাপাশি নিজেদের পোর্টফোলিও তৈরি করতে পারে।
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
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
              কোর্স দেখুন
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              আমাদের সাথে যোগাযোগ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
