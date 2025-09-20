'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star, Users, Award, MessageCircle, BookOpen, Linkedin, Github, Mail, Phone, MapPin, Calendar, Clock, GraduationCap, FileText, Code, Globe, Loader2 } from 'lucide-react';

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
    website?: string;
    twitter?: string;
  };
  teachingExperience: number;
  rating?: number;
  students?: number;
  courses?: number;
  achievements?: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages: string[];
  availability: {
    timezone: string;
    workingHours: string;
    availableDays: string[];
  };
  teachingStyle?: string;
  phone?: string;
  email?: string;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchMentor(params.id as string);
    }
  }, [params.id]);

  const fetchMentor = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentors/public/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setMentor(data.mentor);
      } else {
        setError(data.error || 'মেন্টর পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Error fetching mentor:', error);
      setError('নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDays = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      'monday': 'সোমবার',
      'tuesday': 'মঙ্গলবার',
      'wednesday': 'বুধবার',
      'thursday': 'বৃহস্পতিবার',
      'friday': 'শুক্রবার',
      'saturday': 'শনিবার',
      'sunday': 'রবিবার'
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">মেন্টর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">মেন্টর পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/mentors')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            মেন্টর তালিকায় ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/mentors')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </Button>
          </div>

          {/* Mentor Header */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {mentor.avatar ? (
                  <img 
                    src={mentor.avatar} 
                    alt={mentor.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  getInitials(mentor.name)
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentor.name}</h1>
              <p className="text-xl text-blue-600 font-medium mb-4">{mentor.designation}</p>
              <p className="text-gray-700 mb-6 leading-relaxed">{mentor.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mentor.rating || '4.8'}</div>
                  <div className="text-sm text-gray-600">রেটিং</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mentor.students || '0'}</div>
                  <div className="text-sm text-gray-600">শিক্ষার্থী</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mentor.courses || '0'}</div>
                  <div className="text-sm text-gray-600">কোর্স</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mentor.experience}</div>
                  <div className="text-sm text-gray-600">বছর অভিজ্ঞতা</div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  মেন্টরের সাথে যোগাযোগ
                </Button>
                {mentor.socialLinks?.linkedin && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(mentor.socialLinks.linkedin, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {mentor.socialLinks?.github && (
                  <Button 
                    variant="outline"
                    onClick={() => window.open(mentor.socialLinks.github, '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  দক্ষতা ও বিশেষজ্ঞতা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">প্রযুক্তিগত দক্ষতা</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>


                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">বিশেষজ্ঞতা</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((exp) => (
                      <Badge key={exp} variant="default" className="text-sm bg-blue-100 text-blue-800">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            {mentor.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    শিক্ষাগত যোগ্যতা
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentor.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {edu.degree.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {mentor.certifications.length > 0 && (
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  সার্টিফিকেশন
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentor.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                          <p className="text-gray-600">{cert.issuer}</p>
                          <p className="text-sm text-gray-500">{cert.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teaching Style */}
            {mentor.teachingStyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    শিক্ষাদান পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{mentor.teachingStyle}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>যোগাযোগের তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{mentor.email}</span>
                  </div>
                )}
                {mentor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{mentor.phone}</span>
                  </div>
                )}
                {mentor.socialLinks?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <a 
                      href={mentor.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ওয়েবসাইট
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  উপলব্ধতা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">কাজের সময়</h4>
                  <p className="text-sm text-gray-600">{mentor.availability.workingHours}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">উপলব্ধ দিন</h4>
                  <p className="text-sm text-gray-600">{formatDays(mentor.availability.availableDays)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">টাইমজোন</h4>
                  <p className="text-sm text-gray-600">{mentor.availability.timezone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            {mentor.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>ভাষা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {mentor.achievements && mentor.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    অর্জন
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mentor.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
