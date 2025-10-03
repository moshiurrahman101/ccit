'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Star, Users, Award, MessageCircle, BookOpen, Linkedin, Github, Search, Loader2 } from 'lucide-react';

interface Mentor {
  _id: string;
  name: string;
  designation: string;
  experience: number;
  expertise: string[];
  skills: string[];
  avatar: string;
  bio: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
  };
  teachingExperience: number;
  rating?: number;
  students?: number;
  courses?: number;
  achievements?: string[];
}

interface MentorsResponse {
  mentors: Mentor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMentors: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMentors: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchMentors = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentors/public?page=${page}&limit=12&search=${encodeURIComponent(search)}`);
      const data: MentorsResponse = await response.json();
      
      if (response.ok) {
        setMentors(data.mentors);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMentors(1, searchTerm);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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

      {/* Search Section */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="মেন্টর খুঁজুন... (নাম, দক্ষতা, বা বিশেষত্ব)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'খুঁজুন'}
            </Button>
          </form>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">মেন্টর লোড হচ্ছে...</p>
              </div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">কোনো মেন্টর পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentors.map((mentor) => (
              <Card key={mentor._id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                    {mentor.avatar ? (
                      <img 
                        src={mentor.avatar} 
                        alt={mentor.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      getInitials(mentor.name)
                    )}
                  </div>
                  
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {mentor.name}
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {mentor.designation}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {mentor.experience} বছর অভিজ্ঞতা
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {mentor.bio ? 
                      (mentor.bio.length > 150 ? 
                        `${mentor.bio.substring(0, 150)}...` : 
                        mentor.bio
                      ) : 
                      'একজন অভিজ্ঞ মেন্টর যিনি শিক্ষার্থীদের ক্যারিয়ার গড়তে সাহায্য করেন।'
                    }
                  </p>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">দক্ষতা:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.skills.length - 4} আরো
                        </Badge>
                      )}
                    </div>
                  </div>


                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.rating || '4.8'}</div>
                      <div className="text-xs text-gray-600">রেটিং</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.students || '0'}</div>
                      <div className="text-xs text-gray-600">শিক্ষার্থী</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{mentor.courses || '0'}</div>
                      <div className="text-xs text-gray-600">কোর্স</div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4 pt-4">
                    {mentor.socialLinks?.linkedin && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center space-x-1"
                        onClick={() => window.open(mentor.socialLinks.linkedin, '_blank')}
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </Button>
                    )}
                    {mentor.socialLinks?.github && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center space-x-1"
                        onClick={() => window.open(mentor.socialLinks.github, '_blank')}
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      onClick={() => window.open(`/mentors/${mentor._id}`, '_blank')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="bengali-text">প্রোফাইল দেখুন</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold py-3 rounded-xl transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <span className="bengali-text">যোগাযোগ করুন</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchMentors(pagination.currentPage - 1, searchTerm)}
                  disabled={!pagination.hasPrev || loading}
                >
                  পূর্ববর্তী
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchMentors(pagination.currentPage + 1, searchTerm)}
                  disabled={!pagination.hasNext || loading}
                >
                  পরবর্তী
                </Button>
              </div>
            </div>
          )}
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
