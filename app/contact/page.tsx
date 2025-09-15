import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: "ফোন",
    details: ["০১৬০৩৭১৮৩৭৯", "০১৮৪৫২০২১০১"],
    description: "সকাল ১০টা থেকে সন্ধ্যা ৬টা"
  },
  {
    icon: Mail,
    title: "ইমেইল",
    details: ["creativecanvasit@gmail.com", "support@creativecanvasit.com"],
    description: "২৪ ঘন্টার মধ্যে উত্তর"
  },
  {
    icon: MapPin,
    title: "ঠিকানা",
    details: ["ধানমন্ডি, ঢাকা-১২০৫", "বাংলাদেশ"],
    description: "আমাদের অফিসে সরাসরি আসুন"
  },
  {
    icon: Clock,
    title: "অফিস সময়",
    details: ["শনিবার - বৃহস্পতিবার", "সন্ধ্যা ৬টা - রাত ১১টা"],
    description: "সাপ্তাহিক ছুটি: শুক্রবার"
  }
];

const socialLinks = [
  { icon: Facebook, name: "Facebook", url: "#", color: "text-blue-600" },
  { icon: Twitter, name: "Twitter", url: "#", color: "text-blue-400" },
  { icon: Instagram, name: "Instagram", url: "#", color: "text-pink-500" },
  { icon: Linkedin, name: "LinkedIn", url: "#", color: "text-blue-700" }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              আমাদের সাথে যোগাযোগ
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              আপনার কোনো প্রশ্ন আছে? আমাদের সাথে যোগাযোগ করুন। 
              আমরা সবসময় আপনার সাহায্যের জন্য প্রস্তুত।
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{info.title}</h3>
                    <div className="space-y-1 mb-3">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    আমাদের কাছে বার্তা পাঠান
                  </CardTitle>
                  <CardDescription>
                    আপনার প্রশ্ন বা পরামর্শ আমাদের সাথে শেয়ার করুন। 
                    আমরা যত তাড়াতাড়ি সম্ভব আপনার সাথে যোগাযোগ করব।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          আপনার নাম *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="আপনার পূর্ণ নাম"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ইমেইল ঠিকানা *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ফোন নম্বর
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="০১৭১২৩৪৫৬৭৮"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        বিষয় *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">বিষয় নির্বাচন করুন</option>
                        <option value="course">কোর্স সম্পর্কে প্রশ্ন</option>
                        <option value="enrollment">এনরোলমেন্ট</option>
                        <option value="payment">পেমেন্ট সমস্যা</option>
                        <option value="technical">টেকনিক্যাল সহায়তা</option>
                        <option value="other">অন্যান্য</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        আপনার বার্তা *
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="আপনার প্রশ্ন বা পরামর্শ এখানে লিখুন..."
                      ></textarea>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 py-3"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      বার্তা পাঠান
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">মানচিত্র এখানে দেখানো হবে</p>
                      <p className="text-sm text-gray-400 mt-2">ধানমন্ডি, ঢাকা-১২০৫</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    আমাদের সাথে যুক্ত থাকুন
                  </CardTitle>
                  <CardDescription>
                    সামাজিক যোগাযোগ মাধ্যমে আমাদের অনুসরণ করুন এবং আপডেট পান।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="flex items-center space-x-2 hover:bg-gray-50"
                        >
                          <Icon className={`w-5 h-5 ${social.color}`} />
                          <span>{social.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    দ্রুত যোগাযোগ
                  </CardTitle>
                  <CardDescription>
                    জরুরি বিষয়ে সরাসরি কল করুন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Phone className="w-5 h-5 mr-2" />
                      এখনই কল করুন: ০১৬০৩৭১৮৩৭৯
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp এ বার্তা পাঠান
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              প্রায়শই জিজ্ঞাসিত প্রশ্ন
            </h2>
            <p className="text-xl text-gray-600">
              আপনার প্রশ্নের উত্তর এখানে খুঁজে দেখুন
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "কোর্সে এনরোলমেন্ট করার প্রক্রিয়া কী?",
                answer: "আমাদের ওয়েবসাইটে রেজিস্ট্রেশন করুন, পছন্দের কোর্স বেছে নিন, পেমেন্ট করুন এবং কোর্স শুরু করুন।"
              },
              {
                question: "কোর্স সম্পূর্ণ করার পর সার্টিফিকেট পাবো?",
                answer: "হ্যাঁ, কোর্স সম্পূর্ণ করার পর আপনি একটি প্রফেশনাল সার্টিফিকেট পাবেন যা আপনার ক্যারিয়ারে সাহায্য করবে।"
              },
              {
                question: "কোর্সের ফি কত?",
                answer: "আমাদের কোর্সের ফি ৫,০০০৳ থেকে ২০,০০০৳ পর্যন্ত। প্রতিটি কোর্সের জন্য আলাদা ফি নির্ধারিত।"
              },
              {
                question: "কোর্স যদি পছন্দ না হয় তাহলে টাকা ফেরত পাবো?",
                answer: "হ্যাঁ, কোর্স শুরুর ৭ দিনের মধ্যে সন্তুষ্ট না হলে আপনি সম্পূর্ণ টাকা ফেরত পাবেন।"
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
