import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              color: '#dc2626',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            📚 Programming Courses
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Master Programming Skills
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
            Explore our range of programming courses designed for all skill levels. From beginner to advanced.
          </div>

          {/* Course Types */}
          <div
            style={{
              display: 'flex',
              gap: '30px',
              fontSize: '20px',
              color: '#dc2626',
              fontWeight: '600',
            }}
          >
            <span>⚛️ React</span>
            <span>🐍 Python</span>
            <span>🟢 Node.js</span>
            <span>🎨 UI/UX</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
