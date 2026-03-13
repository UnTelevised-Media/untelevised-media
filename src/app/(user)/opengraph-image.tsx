// src/app/(user)/opengraph-image.tsx
// Default OG image for all pages without a specific opengraph-image
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'UnTelevised Media — Independent Journalism';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
          }}
        />

        {/* Live indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 999,
            padding: '8px 20px',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#ef4444',
            }}
          />
          <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
            INDEPENDENT MEDIA
          </span>
        </div>

        {/* Logo + Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: 'white',
              border: '3px solid rgba(239, 68, 68, 0.5)',
            }}
          >
            U
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: 'white',
                fontSize: 60,
                fontWeight: 900,
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              UnTelevised
            </span>
            <span style={{ color: '#94a3b8', fontSize: 24, fontWeight: 400, marginTop: 4 }}>
              Media
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: '#64748b',
            fontSize: 22,
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Breaking news, live events, and investigative reporting mainstream media won't cover.
        </p>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            color: '#475569',
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          untelevised.media
        </div>
      </div>
    ),
    { ...size },
  );
}
