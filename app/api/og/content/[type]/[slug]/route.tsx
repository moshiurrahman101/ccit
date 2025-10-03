import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

// export const runtime = 'edge'; // Removed to allow MongoDB access

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { type, slug } = resolvedParams;
    
    // Fetch content from database based on type and slug
    let content = null;
    let collectionName = '';
    
    try {
      const { db } = await connectToDatabase();
      
      switch (type) {
        case 'blog':
          collectionName = 'blogs';
          content = await db.collection(collectionName).findOne({ slug });
          break;
        case 'course':
          collectionName = 'courses';
          content = await db.collection(collectionName).findOne({ slug });
          break;
        case 'batch':
          collectionName = 'batches';
          content = await db.collection(collectionName).findOne({ slug });
          break;
        default:
          return new Response('Invalid content type', { status: 400 });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Fallback to default content
      content = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} - Creative Canvas IT`,
        description: 'Learn programming and web development with Creative Canvas IT.',
        category: type,
        author: 'Creative Canvas IT Team'
      };
    }

    if (!content) {
      return new Response('Content not found', { status: 404 });
    }

    // Extract content data
    const title = content?.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - Creative Canvas IT`;
    const description = content?.description || (content as any)?.excerpt || 'Learn programming and web development with Creative Canvas IT.';
    const category = content?.category || type;
    const author = content?.author || (content as any)?.instructor || 'Creative Canvas IT Team';
    const tags = (content as any)?.tags || (content as any)?.keywords || '';
    const date = (content as any)?.createdAt || (content as any)?.publishedAt || new Date().toISOString();

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
      batch: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        accent: '#0369a1',
        icon: '👥'
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
              <span style={{ color: '#6b7280' }}>•</span>
              <span style={{ color: '#6b7280', fontSize: '18px' }}>{category}</span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: type === 'blog' ? '46px' : '50px',
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
                fontSize: '20px',
                color: '#6b7280',
                marginBottom: '30px',
                lineHeight: 1.4,
                maxWidth: '700px',
                textAlign: 'center',
              }}
            >
              {description.length > 150 ? description.substring(0, 150) + '...' : description}
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
                {(Array.isArray(tags) ? tags : tags.split(',')).slice(0, 4).map((tag: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${selectedTheme.accent}20`,
                    }}
                  >
                    #{typeof tag === 'string' ? tag.trim() : tag}
                  </span>
                ))}
              </div>
            )}

            {/* Additional info for courses */}
            {type === 'course' && (content as any).price && (
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: selectedTheme.accent,
                  marginBottom: '20px',
                }}
              >
                ৳{(content as any).price}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span>
                <span>{author}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅</span>
                <span>{new Date(date).toLocaleDateString()}</span>
              </div>
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
    console.error('Error generating content OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
