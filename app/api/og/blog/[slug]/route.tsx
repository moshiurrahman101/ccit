import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

// export const runtime = 'edge'; // Removed to allow MongoDB access

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    // Fetch blog post from database
    let blogPost = null;
    try {
      const { db } = await connectToDatabase();
      blogPost = await db.collection('blogs').findOne({ slug });
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }

    // Fallback content if blog post not found
    if (!blogPost) {
      blogPost = {
        title: 'Blog Post - Creative Canvas IT',
        description: 'Learn programming and web development with Creative Canvas IT.',
        category: 'Programming',
        author: 'Creative Canvas IT Team',
        tags: ['programming', 'web development'],
        createdAt: new Date().toISOString()
      };
    }

    // Extract blog data
    const title = blogPost?.title || 'Blog Post';
    const description = blogPost?.description || (blogPost as any)?.excerpt || 'Learn programming with Creative Canvas IT';
    const category = blogPost?.category || 'Programming';
    const author = blogPost?.author || 'Creative Canvas IT Team';
    const tags = blogPost?.tags || [];
    const date = blogPost?.createdAt || (blogPost as any)?.publishedAt || new Date().toISOString();

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                fontSize: '24px',
                color: '#4f46e5',
                fontWeight: '600',
              }}
            >
              <span>📝</span>
              <span>Creative Canvas IT</span>
              <span style={{ color: '#6b7280' }}>•</span>
              <span style={{ color: '#6b7280', fontSize: '18px' }}>{category}</span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '46px',
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
            {tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '16px',
                  color: '#4f46e5',
                  fontWeight: '500',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: '30px',
                }}
              >
                {tags.slice(0, 4).map((tag: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid #4f46e520',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
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
    console.error('Error generating blog OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
