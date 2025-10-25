'use client';

import { useState } from 'react';
import { Star, TrendingUp, Quote, ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewCardProps {
  name: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  earning?: string;
  avatar?: string;
  isFeatured?: boolean;
}

export function ReviewCard({
  name,
  role,
  company,
  rating,
  review,
  earning,
  avatar,
  isFeatured
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxChars = 150;

  // Extract first letter from name for avatar initials
  const initials = name.charAt(0).toUpperCase();

  const shouldShowExpand = review.length > maxChars;
  const displayText = isExpanded 
    ? review 
    : review.slice(0, maxChars) + (shouldShowExpand ? '...' : '');

  return (
    <div className={`group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isFeatured ? 'ring-2 ring-yellow-400/50' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        {avatar && avatar.trim() ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl">${initials}</div>`;
                }
              }}
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Quote Icon and Review Text */}
          <div className="relative mb-6">
            <Quote className="w-8 h-8 text-white/30 mb-2" />
            <p className="text-white/90 leading-relaxed text-base italic">
              &ldquo;{displayText}&rdquo;
              {shouldShowExpand && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-white/70 hover:text-white underline text-sm font-semibold"
                >
                  {isExpanded ? (
                    <>
                      কম দেখুন <ChevronUp className="inline w-4 h-4" />
                    </>
                  ) : (
                    <>
                      আরও পড়ুন <ChevronDown className="inline w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </p>
          </div>

          {/* Author Info */}
          <div className="space-y-2">
            <div>
              <h4 className="text-xl font-bold text-white">{name}</h4>
              <p className="text-white/70">
                {role}
                {company && <span className="ml-2 text-white/50">at {company}</span>}
              </p>
            </div>
            
            {/* Rating Stars */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            
            {/* Earning Badge */}
            {earning && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 mt-3">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-semibold text-sm">{earning}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          Featured
        </div>
      )}
    </div>
  );
}
