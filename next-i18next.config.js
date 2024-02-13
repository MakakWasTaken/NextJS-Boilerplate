// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: false,
  i18n: {
    locales: ['default', 'en', 'da'],
    defaultLocale: 'default',
    localeDetection: false,
  },
  preload: false,
}
