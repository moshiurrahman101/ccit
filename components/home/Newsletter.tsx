'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, Bell, Gift, Star, Shield, CheckCircle, XCircle } from 'lucide-react';

export function Newsletter() {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          source: 'homepage'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(data.message);
        setFormData({ email: '', name: '' });
      } else {
        setSubmitStatus('error');
        setMessage(data.error);
      }
    } catch {
      setSubmitStatus('error');
      setMessage('একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-200/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Icon and Badge */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                <Gift className="w-4 h-4 inline mr-2" />
                বিশেষ অফার
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                নতুন কোর্সের খবর
                <span className="block text-transparent bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text">
                  প্রথমে পান
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                নতুন কোর্স, বিশেষ অফার এবং ফ্রি ওয়েবিনারের খবর প্রথমে জানতে সাবস্ক্রাইব করুন। 
                সাপ্তাহিক টিপস এবং ক্যারিয়ার গাইড পান।
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50">
                <Bell className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">নতুন কোর্স নোটিফিকেশন</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">বিশেষ ছাড়</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50">
                <Mail className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">সাপ্তাহিক টিপস</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">প্রাইভেসি সুরক্ষিত</span>
              </div>
            </div>
          </div>

          {/* Right Content - Newsletter Form */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">নিউজলেটার সাবস্ক্রাইব করুন</h3>
                <p className="text-gray-600">আজই সাবস্ক্রাইব করুন এবং ১০% ছাড় পান</p>
              </div>

              {/* Newsletter Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="আপনার ইমেইল ঠিকানা"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    className="w-full px-6 py-4 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Status Message */}
                {message && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    submitStatus === 'success' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{message}</span>
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      সাবমিট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      সাবস্ক্রাইব করুন
                    </>
                  )}
                </Button>
              </form>

              {/* Trust indicators */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">আপনার তথ্য সুরক্ষিত</span>
                </div>
                <p className="text-xs text-gray-500">
                  যে কোনো সময় আনসাবস্ক্রাইব করতে পারবেন। স্প্যাম করি না।
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">৫,০০০+</div>
            <div className="text-sm text-gray-600">সাবস্ক্রাইবার</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">৯৮%</div>
            <div className="text-sm text-gray-600">সন্তুষ্টি হার</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">সাপ্তাহিক</div>
            <div className="text-sm text-gray-600">আপডেট</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">১০%</div>
            <div className="text-sm text-gray-600">বিশেষ ছাড়</div>
          </div>
        </div>
      </div>
    </section>
  );
}