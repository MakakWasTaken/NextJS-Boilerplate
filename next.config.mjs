// @ts-check

import withNextBundleAnalyzer from '@next/bundle-analyzer'
import withMDX from '@next/mdx'
import i18nextConfig from './next-i18next.config.js'

const i18n = i18nextConfig.i18n

const mdx = withMDX({
  options: {
    providerImportSource: '@mdx-js/react',
  },
})

const advancedHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
]

/** @type {import('next').NextConfig} */
let config = mdx({
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['@mui/system', '@mui/material', '@mui/icons-material'],
  modularizeImports: {
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
    },
  },
  compiler: {
    styledComponents: true,
  },
  headers: async () => [
    {
      // Apply these headers to all routes in your application.
      source: '/:path*',
      headers: advancedHeaders,
    },
  ],
  i18n,
  images: {
    remotePatterns: [
      {
        hostname: 'flagcdn.com',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
  },
})

config = withNextBundleAnalyzer({
  enabled: process.env.ANALYZE?.toString() === 'true',
})(config)

export default config
