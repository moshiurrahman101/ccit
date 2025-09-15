'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  Clock,
  MapPin,
  Send
} from 'lucide-react';
import content from '../../homepage.content.json';

export function FooterSection() {
  return (
    <footer className="bg-ccit-primary text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-auto">
                  <Image 
                    src="/logo.png" 
                    alt="Creative Canvas IT" 
                    width={214}
                    height={36}
                    className="h-full w-auto object-contain brightness-0 invert"
                  />
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed max-w-md">
                {content.footer.company.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">{content.footer.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">{content.footer.contact.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-white/70" />
                  <span className="text-white/90">{content.footer.contact.hours}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">কুইক লিংক</h3>
              <div className="space-y-3">
                {content.navigation.quickLinks.map((link, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">কোর্স</h3>
              <div className="space-y-3">
                {content.navigation.courses.map((course, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                  >
                    {course}
                  </Link>
                ))}
              </div>
            </div>

            {/* Others & Newsletter */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">অন্যান্য</h3>
              <div className="space-y-3 mb-6">
                {content.navigation.others.map((item, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Newsletter */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-3">নিউজলেটার</h4>
                <p className="text-white/80 text-sm mb-4">নতুন কোর্স ও অফার সম্পর্কে জানতে সাবস্ক্রাইব করুন</p>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    placeholder="ইমেইল দিন"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Button size="sm" className="bg-white text-ccit-primary hover:bg-white/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Community */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  {content.footer.community.title}
                </h4>
                <div className="flex space-x-4">
                  {content.footer.community.social.map((social, index) => (
                    <Link
                      key={index}
                      href="#"
                      className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {social === 'LinkedIn' && <Linkedin className="w-6 h-6 text-white" />}
                      {social === 'Facebook' && <Facebook className="w-6 h-6 text-white" />}
                      {social === 'Instagram' && <Instagram className="w-6 h-6 text-white" />}
                      {social === 'X (Twitter)' && <Twitter className="w-6 h-6 text-white" />}
                      {social === 'WhatsApp' && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>}
                      {social === 'YouTube' && <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Y</div>}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Back to Top Button */}
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                উপরে যান
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 bg-ccit-accent-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <p className="text-white/80 text-sm">
                {content.footer.copyright}
              </p>
              
              <div className="flex flex-wrap gap-6 text-sm">
                {content.footer.sitemap.map((item, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
