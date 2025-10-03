import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const title = searchParams.get('title') || 'Creative Canvas IT';
    const description = searchParams.get('description') || 'Learn Programming & Web Development';
    const type = searchParams.get('type') || 'default';
    const theme = searchParams.get('theme') || 'blue';
    const logo = searchParams.get('logo') || '🎨';
    const features = searchParams.get('features') || 'Expert Instructors,Practical Projects,Career Support';
    
    // Theme configurations
    const themes = {
      blue: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#4f46e5',
        logoColor: '#4f46e5'
      },
      red: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#dc2626',
        logoColor: '#dc2626'
      },
      green: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#0369a1',
        logoColor: '#0369a1'
      },
      purple: {
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: '#be185d',
        logoColor: '#be185d'
      },
      orange: {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        color: '#ea580c',
        logoColor: '#ea580c'
      }
    };

    const selectedTheme = themes[theme as keyof typeof themes] || themes.blue;
    const featuresList = features.split(',').map(f => f.trim());

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
            {/* Logo/Brand */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: selectedTheme.logoColor,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {logo} Creative Canvas IT
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: type === 'large' ? '56px' : '48px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#6b7280',
                marginBottom: '30px',
                lineHeight: 1.4,
                maxWidth: '700px',
              }}
            >
              {description}
            </div>

            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                fontSize: '20px',
                color: selectedTheme.color,
                fontWeight: '600',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {featuresList.map((feature, index) => {
                const icons = ['🚀', '💻', '🎯', '⚡', '🌟', '💡'];
                const icon = icons[index % icons.length];
                return (
                  <span key={index}>
                    {icon} {feature}
                  </span>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: '40px',
                fontSize: '16px',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>creativecanvasit.com</span>
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
    console.error('Error generating dynamic OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
