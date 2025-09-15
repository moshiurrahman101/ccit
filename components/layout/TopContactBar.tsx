'use client';

import { Phone, Mail, Clock } from 'lucide-react';

export function TopContactBar() {
  return (
    <div className="bg-blue-900 text-white py-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm space-y-1 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>০১৬০৩৭১৮৩৭৯</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>creativecanvasit@gmail.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>শনি - বৃহস্পতি: ৬:০০PM - ১১:০০PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}