import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

const sampleMentors = [
  {
    name: 'Dr. Ahmed Hassan',
    email: 'ahmed.hassan@ccit.com',
    phone: '01712345678',
    bio: 'Senior Software Engineer with 8+ years of experience in full-stack development and team leadership.',
    designation: 'Senior Software Engineer',
    experience: 8,
    expertise: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    skills: ['Full-Stack Development', 'System Architecture', 'Team Leadership', 'Mentoring'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ahmed-hassan',
      github: 'https://github.com/ahmed-hassan'
    },
    teachingExperience: 3,
    rating: 4.8,
    studentsCount: 150,
    coursesCount: 12,
    achievements: ['Microsoft MVP', 'AWS Certified', 'Best Mentor Award 2023'],
    isActive: true
  },
  {
    name: 'Fatima Rahman',
    email: 'fatima.rahman@ccit.com',
    phone: '01712345679',
    bio: 'UI/UX Designer and Frontend Developer with expertise in modern design systems and user experience.',
    designation: 'Lead UI/UX Designer',
    experience: 6,
    expertise: ['UI/UX Design', 'Figma', 'React', 'CSS', 'Design Systems'],
    skills: ['User Research', 'Prototyping', 'Frontend Development', 'Design Thinking'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/fatima-rahman',
      github: 'https://github.com/fatima-rahman'
    },
    teachingExperience: 2,
    rating: 4.9,
    studentsCount: 120,
    coursesCount: 8,
    achievements: ['Design Excellence Award', 'Adobe Certified Expert'],
    isActive: true
  },
  {
    name: 'Mohammad Ali',
    email: 'mohammad.ali@ccit.com',
    phone: '01712345680',
    bio: 'Data Scientist and Machine Learning Engineer with expertise in AI and data analytics.',
    designation: 'Senior Data Scientist',
    experience: 7,
    expertise: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'Pandas'],
    skills: ['Data Analysis', 'Statistical Modeling', 'AI Research', 'Data Visualization'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mohammad-ali',
      github: 'https://github.com/mohammad-ali'
    },
    teachingExperience: 4,
    rating: 4.7,
    studentsCount: 200,
    coursesCount: 15,
    achievements: ['Kaggle Grandmaster', 'Google AI Research Award'],
    isActive: true
  },
  {
    name: 'Sara Ahmed',
    email: 'sara.ahmed@ccit.com',
    phone: '01712345681',
    bio: 'Mobile App Developer specializing in React Native and Flutter with 5+ years of experience.',
    designation: 'Mobile App Developer',
    experience: 5,
    expertise: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript'],
    skills: ['Cross-Platform Development', 'App Store Optimization', 'Mobile UI/UX'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sara-ahmed',
      github: 'https://github.com/sara-ahmed'
    },
    teachingExperience: 2,
    rating: 4.6,
    studentsCount: 80,
    coursesCount: 6,
    achievements: ['App Store Featured App', 'Flutter Community Contributor'],
    isActive: true
  },
  {
    name: 'Dr. Karim Uddin',
    email: 'karim.uddin@ccit.com',
    phone: '01712345682',
    bio: 'Cybersecurity Expert and Ethical Hacker with extensive experience in security consulting.',
    designation: 'Cybersecurity Consultant',
    experience: 10,
    expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Penetration Testing'],
    skills: ['Security Auditing', 'Risk Assessment', 'Incident Response', 'Security Training'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/karim-uddin',
      github: 'https://github.com/karim-uddin'
    },
    teachingExperience: 6,
    rating: 4.9,
    studentsCount: 300,
    coursesCount: 20,
    achievements: ['CISSP Certified', 'CEH Master', 'Security Researcher of the Year'],
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing mentors
    await Mentor.deleteMany({});
    console.log('Cleared existing mentors');

    // Insert sample mentors
    const mentors = await Mentor.insertMany(sampleMentors);
    console.log(`Inserted ${mentors.length} mentors`);

    return NextResponse.json({
      message: 'Mentors seeded successfully',
      count: mentors.length
    });

  } catch (error) {
    console.error('Error seeding mentors:', error);
    return NextResponse.json(
      { error: 'Failed to seed mentors' },
      { status: 500 }
    );
  }
}
