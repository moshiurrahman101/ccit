'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AnalyticsProps {
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
}

export function Analytics({ 
  googleTagManagerId, 
  googleAnalyticsId, 
  facebookPixelId, 
  hotjarId 
}: AnalyticsProps) {
  useEffect(() => {
    // Initialize any client-side analytics here
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (googleAnalyticsId) {
        window.gtag = window.gtag || function() {
          (window.gtag as any).q = (window.gtag as any).q || [];
          (window.gtag as any).q.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', googleAnalyticsId);
      }

      // Facebook Pixel
      if (facebookPixelId) {
        (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', null, null, null);
        (window as any).fbq('init', facebookPixelId);
        (window as any).fbq('track', 'PageView');
      }

      // Hotjar
      if (hotjarId) {
        (function(h: any, o: any, t: any, j: any, a: any, r: any) {
          h.hj = h.hj || function() {
            (h.hj.q = h.hj.q || []).push(arguments);
          };
          h._hjSettings = { hjid: hotjarId, hjsv: 6 };
          a = o.getElementsByTagName('head')[0];
          r = o.createElement('script');
          r.async = 1;
          r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
          a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=', null, null);
      }
    }
  }, [googleAnalyticsId, facebookPixelId, hotjarId]);

  return (
    <>
      {/* Google Tag Manager */}
      {googleTagManagerId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${googleTagManagerId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

// Declare global types for TypeScript
declare global {
  interface Window {
    gtag: any;
    fbq: any;
    hj: any;
    dataLayer: any[];
  }
}
