import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Award, MessageCircle, BookOpen, Linkedin, Github } from 'lucide-react';

const mentors = [
  {
    id: 1,
    name: "রাহুল আহমেদ",
    title: "Full Stack Developer & Tech Lead",
    experience: "৮ বছর",
    speciality: ["React", "Node.js", "MongoDB", "JavaScript"],
    rating: 4.9,
    students: 2500,
    courses: 12,
    avatar: "R",
    bio: "৮ বছরের অভিজ্ঞতা নিয়ে একজন সফল Full Stack Developer। Google, Microsoft সহ বড় কোম্পানিতে কাজ করেছেন।",
    achievements: ["Google Developer Expert", "Microsoft MVP", "Best Mentor Award 2023"],
    linkedin: "#",
    github: "#"
  },
  {
    id: 2,
    name: "সুমাইয়া খান",
    title: "Digital Marketing Specialist",
    experience: "৬ বছর",
    speciality: ["SEO", "Social Media", "Google Ads", "Analytics"],
    rating: 4.8,
    students: 1800,
    courses: 8,
    avatar: "S",
    bio: "ডিজিটাল মার্কেটিংয়ে বিশেষজ্ঞ। বিভিন্ন মাল্টিন্যাশনাল কোম্পানির মার্কেটিং ক্যাম্পেইন পরিচালনা করেছেন।",
    achievements: ["Facebook Blueprint Certified", "Google Ads Certified", "Top Performer 2022"],
    linkedin: "#",
    github: "#"
  },
  {
    id: 3,
    name: "আরিফ হোসেন",
    title: "UI/UX Designer & Creative Director",
    experience: "৭ বছর",
    speciality: ["Figma", "Adobe Creative Suite", "Prototyping", "Design Systems"],
    rating: 4.9,
    students: 2200,
    courses: 15,
    avatar: "A",
    bio: "ক্রিয়েটিভ ডিজাইনার হিসেবে বিশ্বব্যাপী পরিচিত। Apple, Samsung সহ প্রিমিয়াম ব্র্যান্ডের জন্য ডিজাইন করেছেন।",
    achievements: ["Adobe Certified Expert", "Design Excellence Award", "Creative Director of the Year"],
    linkedin: "#",
    github: "#"
  },
  {
    id: 4,
    name: "ফাতেমা খাতুন",
    title: "Data Scientist & AI Researcher",
    experience: "৫ বছর",
    speciality: ["Python", "Machine Learning", "Deep Learning", "Data Analysis"],
    rating: 4.9,
    students: 1600,
    courses: 10,
    avatar: "F",
    bio: "Data Science এবং AI গবেষণায় বিশেষজ্ঞ। MIT থেকে PhD সম্পন্ন করেছেন এবং বিভিন্ন AI প্রজেক্টে কাজ করেছেন।",
    achievements: ["MIT PhD", "AI Research Award", "Data Science Excellence"],
    linkedin: "#",
    github: "#"
  },
  {
    id: 5,
    name: "করিম উদ্দিন",
    title: "Mobile App Developer",
    experience: "৬ বছর",
    speciality: ["React Native", "Flutter", "iOS", "Android"],
    rating: 4.8,
    students: 1900,
    courses: 9,
    avatar: "K",
    bio: "মোবাইল অ্যাপ ডেভেলপমেন্টে বিশেষজ্ঞ। Play Store এবং App Store এ ১০০+ অ্যাপ পাবলিশ করেছেন।",
    achievements: ["App Store Featured", "Play Store Top Developer", "Mobile Innovation Award"],
    linkedin: "#",
    github: "#"
  },
  {
    id: 6,
    name: "নাসির আহমেদ",
    title: "Cybersecurity Expert",
    experience: "৯ বছর",
    speciality: ["Ethical Hacking", "Network Security", "Penetration Testing", "Security Auditing"],
    rating: 4.9,
    students: 1400,
    courses: 11,
    avatar: "N",
    bio: "সাইবার সিকিউরিটিতে বিশ্বমানের বিশেষজ্ঞ। বিভিন্ন সরকারি এবং বেসরকারি প্রতিষ্ঠানের সিকিউরিটি পরামর্শক।",
    achievements: ["CEH Certified", "CISSP Certified", "Security Expert of the Year"],
    linkedin: "#",
    github: "#"
  }
];

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              আমাদের বিশেষজ্ঞ মেন্টর
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              বিশ্বমানের অভিজ্ঞতা নিয়ে আমাদের বিশেষজ্ঞ মেন্টররা 
              আপনার ক্যারিয়ার গড়ার পথে সবসময় পাশে থাকবেন।
            </p>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                    {mentor.avatar}
                  </div>
                  
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {mentor.name}
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {mentor.title}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {mentor.experience} অভিজ্ঞতা
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Specialities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">বিশেষত্ব:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.speciality.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.rating}</div>
                      <div className="text-xs text-gray-600">রেটিং</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.students}</div>
                      <div className="text-xs text-gray-600">শিক্ষার্থী</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.courses}</div>
                      <div className="text-xs text-gray-600">কোর্স</div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">অর্জন:</h4>
                    <div className="space-y-1">
                      {mentor.achievements.map((achievement) => (
                        <div key={achievement} className="flex items-center space-x-2 text-sm">
                          <Award className="w-3 h-3 text-yellow-500" />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center space-x-1">
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </Button>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    মেন্টরের সাথে যোগাযোগ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Mentors */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              কেন আমাদের মেন্টর বেছে নিবেন?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              আমাদের মেন্টররা শুধু কোর্সই শেখান না, তারা আপনার ক্যারিয়ার গড়ার পথে 
              একজন বিশ্বস্ত গাইড হিসেবে কাজ করেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">বিশ্বমানের অভিজ্ঞতা</h3>
              <p className="text-gray-300">বড় কোম্পানিতে কাজ করা অভিজ্ঞ মেন্টর</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">ব্যক্তিগত মনোযোগ</h3>
              <p className="text-gray-300">প্রতিটি শিক্ষার্থীকে ব্যক্তিগত মনোযোগ</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-300">যেকোনো সময় সাহায্য এবং পরামর্শ</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">প্রমাণিত পদ্ধতি</h3>
              <p className="text-gray-300">সফল ক্যারিয়ার গড়ার প্রমাণিত পদ্ধতি</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Mentor */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            আমাদের মেন্টর হয়ে যান
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            আপনার অভিজ্ঞতা এবং জ্ঞান শেয়ার করে অন্যের ক্যারিয়ার গড়তে সাহায্য করুন।
            আমাদের মেন্টর পরিবারের অংশ হন।
          </p>
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
            মেন্টর হওয়ার আবেদন করুন
          </Button>
        </div>
      </section>
    </div>
  );
}
