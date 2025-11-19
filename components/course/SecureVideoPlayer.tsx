'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecureVideoPlayerProps {
  courseId: string;
  videoId: string; // YouTube video ID
  title?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  isPreview?: boolean;
}

export default function SecureVideoPlayer({
  courseId,
  videoId,
  title,
  onProgress,
  onComplete,
  isPreview = false
}: SecureVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        // Wait a bit for container to be ready
        setTimeout(() => {
          if (containerRef.current) {
            initializePlayer();
          }
        }, 100);
      };
    } else {
      // Wait a bit for container to be ready
      setTimeout(() => {
        if (containerRef.current) {
          initializePlayer();
        }
      }, 100);
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [videoId]);

  const initializePlayer = async () => {
    try {
      // For preview videos, authentication is optional
      const token = localStorage.getItem('auth-token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Only add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/recorded-courses/${courseId}/video-access?videoId=${videoId}`,
        {
          headers
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // For preview videos, show a more helpful error message
        if (isPreview) {
          setError(data.error || 'Failed to load preview video. Please try again.');
        } else {
          setError(data.error || 'Access denied');
        }
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      setHasAccess(true);
      const actualVideoId = data.videoId;

      // Wait for container to be available
      if (!containerRef.current) {
        console.error('Container ref not available');
        setError('Video player container not ready');
        setIsLoading(false);
        return;
      }

      // Initialize YouTube player with privacy-enhanced mode
      if (window.YT && window.YT.Player && containerRef.current) {
        const ytPlayer = new window.YT.Player(containerRef.current, {
          videoId: actualVideoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0, // Don't show related videos
            showinfo: 0,
            iv_load_policy: 3, // Hide annotations
            enablejsapi: 1,
            origin: window.location.origin,
            // Privacy settings
            playsinline: 1,
            fs: 1 // Allow fullscreen
          },
          events: {
            onReady: (event: any) => {
              setIsLoading(false);
              setPlayer(event.target);
              // Disable right-click context menu
              if (iframeRef.current) {
                iframeRef.current.addEventListener('contextmenu', (e) => {
                  e.preventDefault();
                  return false;
                });
              }
            },
            onStateChange: (event: any) => {
              // Track progress
              if (event.data === window.YT.PlayerState.PLAYING && onProgress) {
                const interval = setInterval(() => {
                  if (event.target && event.target.getCurrentTime) {
                    const currentTime = event.target.getCurrentTime();
                    const duration = event.target.getDuration();
                    if (duration > 0) {
                      const progress = (currentTime / duration) * 100;
                      onProgress(progress);
                    }
                  }
                }, 1000);

                // Clear interval when paused or ended
                const checkState = setInterval(() => {
                  if (event.target.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                    clearInterval(interval);
                    clearInterval(checkState);
                  }
                }, 1000);
              }

              // Check if video completed
              if (event.data === window.YT.PlayerState.ENDED && onComplete) {
                onComplete();
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              setError('Error loading video. Please try again.');
              setIsLoading(false);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error initializing player:', err);
      setError('Failed to load video player');
      setIsLoading(false);
    }
  };

  // Prevent common extraction methods
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading video player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          {!isPreview && (
            <Button
              onClick={() => window.location.href = `/recorded-courses/${courseId}`}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative" style={{ paddingBottom: '56.25%' }}>
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* YouTube iframe will be inserted here */}
      </div>
      {title && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {/* Security notice */}
      <div className="mt-2 text-xs text-gray-500">
        <p>⚠️ This video is protected. Sharing or downloading is prohibited.</p>
      </div>
    </div>
  );
}

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

