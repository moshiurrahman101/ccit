"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Pause,
  Star,
  Users,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Automatically play video after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.log("Autoplay blocked by browser:", err);
          setIsPlaying(false);
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
  
    if (videoRef.current.paused) {
      videoRef.current.muted = false;   // 🔊 Unmute when user clicks Play
      videoRef.current.volume = 0.5;    // Medium level sound
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-indigo-200/40 rounded-full blur-lg animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-300/30 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-lg">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-blue-700 font-semibold bengali-text text-sm sm:text-base">
                বাংলাদেশের বিশ্বস্ত আইটি প্রশিক্ষণ প্ল্যাটফর্ম
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bengali-heading">
                <span className="block text-gray-900">Creative Canvas IT</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  অনলাইন প্রশিক্ষণ প্ল্যাটফর্ম
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl bengali-text">
                Creative Canvas IT-এ আমরা বিশ্বাস করি—প্র্যাকটিস করলে দক্ষতা
                আসে। ২০২৩ থেকে শুরু করে আজ পর্যন্ত ১৫০+ শিক্ষার্থীকে হাতে-কলমে
                শেখিয়েছি। আমাদের কোর্সে লাইভ ডেমো, রেকর্ডেড ক্লাস,
                বাস্তবপ্রজেক্ট এবং জব-কানেক্টর সাপোর্ট আছে।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-glow"
                onClick={() => (window.location.href = "/courses")}
              >
                কোর্স দেখুন
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold backdrop-blur-md bg-white/80"
                onClick={() => (window.location.href = "/batches")}
              >
                <BookOpen className="mr-2 w-5 h-5" />
                ব্যাচ দেখুন
              </Button>
            </div>
          </div>

          {/* Right Content - Video Section */}
          <div className="relative">
            <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="relative z-10">
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
                  {/* Actual Video */}
                  <video
                    ref={videoRef}
                    src="/videos/intro.mp4"
                    className="w-full h-full object-cover"
                    playsInline
                    muted // required for autoplay
                    loop
                    preload="auto"
                  />

                  {/* Overlay Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transform transition-transform">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-orange-600" />
                      ) : (
                        <Play className="w-6 h-6 text-orange-600 ml-1" />
                      )}
                    </div>
                  </button>

                </div>
              </div>

              {/* Stats */}
              <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                  <Users className="w-3 h-3 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-900">
                    ১৫০+
                  </div>
                  <div className="text-xs text-gray-600">দেখেছেন</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                  <Star className="w-3 h-3 text-yellow-500 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-900">
                    ৪.৯/৫
                  </div>
                  <div className="text-xs text-gray-600">রেটিং</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/60 backdrop-blur-md">
                  <TrendingUp className="w-3 h-3 text-green-500 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-900">৯৮%</div>
                  <div className="text-xs text-gray-600">সন্তুষ্টি</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-float"></div>
            <div
              className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-400/20 rounded-full blur-xl animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
