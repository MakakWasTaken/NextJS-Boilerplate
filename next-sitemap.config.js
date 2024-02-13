const locales = ['en', 'da']

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  sourceDir: 'build',
  exclude: [
    '*/app',
    '*/app/*',
    ...locales.map((locale) => `*/${locale}/*`),
    ...locales.map((locale) => `*/${locale}`),
  ],
  generateRobotsTxt: true,
}

module.exports = config
