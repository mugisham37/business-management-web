import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['graphql', 'zustand'],
  },

  // Turbopack configuration (empty to silence warnings)
  turbopack: {},

  // TypeScript configuration
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },

  // Image optimization
  images: {
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Add domains for external images if needed
    domains: [],
    // Enable responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable lazy loading by default
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Security headers
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Enhanced permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(self), picture-in-picture=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: isDevelopment 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' localhost:* 127.0.0.1:*; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; connect-src 'self' localhost:* 127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'strict-dynamic'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' fonts.gstatic.com data:; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; report-uri /api/csp-report;"
          },
          // HSTS (only in production)
          ...(isDevelopment ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }]),
          // Cross-Origin policies
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: isDevelopment ? 'unsafe-none' : 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: isDevelopment ? 'unsafe-none' : 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: isDevelopment ? 'cross-origin' : 'same-origin',
          },
          // Expect-CT (only in production)
          ...(isDevelopment ? [] : [{
            key: 'Expect-CT',
            value: 'max-age=86400, enforce, report-uri="/api/expect-ct-report"',
          }]),
        ],
      },
    ];
  },

  // Webpack configuration for advanced code splitting
  webpack: (config, { dev, isServer, webpack }) => {
    // Optimize bundle in production
    if (!dev && !isServer) {
      // Advanced code splitting configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          // Apollo GraphQL chunk
          apollo: {
            test: /[\\/]node_modules[\\/]@apollo[\\/]/,
            name: 'apollo',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          
          // GraphQL chunk
          graphql: {
            test: /[\\/]node_modules[\\/](graphql|graphql-ws)[\\/]/,
            name: 'graphql',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          
          // State management chunk
          state: {
            test: /[\\/]node_modules[\\/](zustand|immer)[\\/]/,
            name: 'state',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          
          // Utilities chunk
          utils: {
            test: /[\\/]node_modules[\\/](clsx|class-variance-authority|zod|jose)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          
          // Default vendor chunk for remaining node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: false,
          },
          
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: false,
          },
        },
      };

      // Module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
      
      // Enable module ids optimization
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize lodash imports
      'lodash': 'lodash-es',
    };

    return config;
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for better UX
  async redirects() {
    return [
      // Redirect root to dashboard for authenticated users
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'auth-token',
          },
        ],
      },
    ];
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return [
      // Add rewrites as needed for API proxying
    ];
  },
};

export default nextConfig;
