'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, User, Plus, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
}

interface MentorSearchProps {
  value?: string;
  onChange: (mentorId: string, mentor: Mentor) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function MentorSearch({
  value,
  onChange,
  label = 'ইনস্ট্রাক্টর নির্বাচন করুন',
  placeholder = 'ইনস্ট্রাক্টরের নাম দিয়ে খুঁজুন...',
  className = ''
}: MentorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noMentors, setNoMentors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch mentors based on search term
  useEffect(() => {
    const fetchMentors = async () => {
      if (searchTerm.length < 2) {
        setMentors([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}&role=mentor&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setMentors(data.users || []);
          setShowDropdown(true);
          setNoMentors(data.users?.length === 0);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
        toast.error('মেন্টর লোড করতে সমস্যা হয়েছে');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchMentors, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSearchTerm(mentor.name);
    setShowDropdown(false);
    onChange(mentor._id, mentor);
  };

  const handleClear = () => {
    setSelectedMentor(null);
    setSearchTerm('');
    onChange('', {} as Mentor);
  };

  const handleCreateMentor = () => {
    router.push('/dashboard/users?create=mentor');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-white border-gray-300"
            onFocus={() => {
              if (mentors.length > 0) setShowDropdown(true);
            }}
          />
          {selectedMentor && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">খুঁজছি...</span>
              </div>
            ) : mentors.length > 0 ? (
              <div className="py-1">
                {mentors.map((mentor) => (
                  <button
                    key={mentor._id}
                    onClick={() => handleMentorSelect(mentor)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {mentor.avatar ? (
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mentor.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {mentor.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {mentor.role}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : noMentors ? (
              <div className="p-4 text-center">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">কোনো মেন্টর পাওয়া যায়নি</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateMentor}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  নতুন মেন্টর তৈরি করুন
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {selectedMentor && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {selectedMentor.avatar ? (
              <img
                src={selectedMentor.avatar}
                alt={selectedMentor.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {selectedMentor.name}
            </p>
            <p className="text-xs text-gray-500">
              {selectedMentor.email}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedMentor.role}
          </Badge>
        </div>
      )}
    </div>
  );
}
