import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const type = searchParams.get('type') || 'page';
    const title = searchParams.get('title') || 'Creative Canvas IT';
    const description = searchParams.get('description') || 'Learn Programming & Web Development';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const date = searchParams.get('date') || '';
    const tags = searchParams.get('tags') || '';
    
    // Get content from database or API
    let contentData = null;
    if (type === 'blog' || type === 'course') {
      try {
        const contentId = searchParams.get('id');
        if (contentId) {
          // In a real implementation, you would fetch from your database
          // For now, we'll use the provided parameters
          contentData = {
            title,
            description,
            category,
            author,
            date,
            tags: tags.split(',').map(t => t.trim()).filter(t => t)
          };
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    }

    // Theme selection based on content type
    const themes = {
      blog: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accent: '#4f46e5',
        icon: '📝'
      },
      course: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        accent: '#dc2626',
        icon: '🎓'
      },
      page: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        accent: '#0369a1',
        icon: '🎨'
      },
      default: {
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        accent: '#be185d',
        icon: '🚀'
      }
    };

    const selectedTheme = themes[type as keyof typeof themes] || themes.default;

    return new ImageResponse(
      (
        <div
          style={{
            background: selectedTheme.gradient,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: '900px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header with icon and category */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                fontSize: '24px',
                color: selectedTheme.accent,
                fontWeight: '600',
              }}
            >
              <span>{selectedTheme.icon}</span>
              <span>Creative Canvas IT</span>
              {category && (
                <>
                  <span style={{ color: '#6b7280' }}>•</span>
                  <span style={{ color: '#6b7280', fontSize: '18px' }}>{category}</span>
                </>
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: type === 'blog' ? '48px' : '52px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '22px',
                color: '#6b7280',
                marginBottom: '30px',
                lineHeight: 1.4,
                maxWidth: '700px',
                textAlign: 'center',
              }}
            >
              {description}
            </div>

            {/* Tags */}
            {tags && (
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '16px',
                  color: selectedTheme.accent,
                  fontWeight: '500',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: '30px',
                }}
              >
                {tags.split(',').slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${selectedTheme.accent}20`,
                    }}
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Footer with author and date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '16px',
                color: '#9ca3af',
                marginTop: '20px',
              }}
            >
              {author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span>
                  <span>{author}</span>
                </div>
              )}
              {date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📅</span>
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌐</span>
                <span>creativecanvasit.com</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating auto OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
