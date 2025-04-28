// TODO allow iframes
import type { NextConfig } from "next";

// Define Supabase URL for CSP
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : '';
const supabaseWsUrl = supabaseUrl ? supabaseUrl.replace(/^http/, 'ws') : '';

// Define DEFAULT CSP directives (now including frame-src for resources)
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', supabaseHostname],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    supabaseUrl,
    supabaseUrl.replace('/auth/v1', ''),
    supabaseWsUrl
  ],
  // Apply frame-src globally
  'frame-src': ["'self'", 'https://*.google.com', 'https://www.youtube.com'], 
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

// Format DEFAULT directives into a single string
const cspHeader = Object.entries(cspDirectives)
  .map(([key, value]) => `${key} ${value.join(' ')}`)
  .join('; ');

// Define DEFAULT security headers (using the updated global CSP)
const defaultSecurityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: cspHeader // This now includes the necessary frame-src
  }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply default headers to all paths (including /resources now)
        source: '/:path*', // Simplified source to catch all paths
        headers: defaultSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
