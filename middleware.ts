import acceptLanguage from 'accept-language'
import { NextRequest, NextResponse } from 'next/server'

acceptLanguage.languages(['en', 'da'])

const PUBLIC_FILE = /\.(.*)$/

const middleware = async (req: NextRequest) => {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/build') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname) // File names can include dots
  ) {
    return
  }

  if (req.nextUrl.locale === 'default') {
    const acceptLanguageHeader = req.headers.get('accept-language')
    const acceptedLanguage = acceptLanguage.get(acceptLanguageHeader) || 'da'

    const locale =
      req.cookies.get('NEXT_LOCALE')?.value || acceptedLanguage || 'da'

    const response = NextResponse.redirect(
      new URL(
        `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
        req.url,
      ),
    )

    // Set the locale cookie for the next request
    response.cookies.set('NEXT_LOCALE', locale)

    return response
  }
}

export default middleware
