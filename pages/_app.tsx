import { CacheProvider, EmotionCache } from '@emotion/react'
import { MDXProvider } from '@mdx-js/react'
import { Box, CssBaseline, useMediaQuery } from '@mui/material'
import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { LicenseInfo } from '@mui/x-license-pro'
import { initGA } from 'green-analytics-js'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { AppProps } from 'next/app'
import { FC, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { SWRConfig } from 'swr'
import AuthWrapper from '#components/AuthWrapper'
import MDXWrapper from '#components/MDXWrapper'
import { api } from '#network/index'
import { Footer } from '#src/components/Footer'
import { Header } from '#src/components/Header'
import createEmotionCache from '#src/misc/createEmotionCache'
import theme, { darkTheme } from '#src/misc/theme'

LicenseInfo.setLicenseKey(
  '03b6a17b47d57f5cbe9923ac8699cac8Tz03MzYxNSxFPTE3MjQ5MTc2NzgwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=',
)

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
  session?: Session
}

const MyApp: FC<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  useEffect(() => {
    try {
      initGA('GA_TOKEN')
    } catch (err: any) {
      console.error('Failed to start green-analytics: ', err)
    }
  }, [])

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <CacheProvider value={emotionCache}>
      <NextSeo
        themeColor={prefersDarkMode ? '##1f1f1f' : '#fbfbfd'}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'initial-scale=1, width=device-width',
          },
        ]}
        additionalLinkTags={[
          {
            rel: 'apple-touch-icon',
            href: '/icon-192x192.png',
            sizes: '192x192',
          },
        ]}
        titleTemplate="%s | Name"
      />
      <ThemeProvider theme={prefersDarkMode ? darkTheme : theme}>
        <SessionProvider session={pageProps.session}>
          <SWRConfig
            value={{
              fetcher: async (args) => {
                if (typeof args === 'string') {
                  const response = await api.get(`/database/${args}`)
                  return response.data
                }
                const { url, ...rest } = args

                const response = await api.get(`/database/${url}`, {
                  params: rest,
                })
                return response.data
              },
              errorRetryCount: 1, // only retry once, then throw error
              onErrorRetry: (error, key: string) => {
                const matches = /#url:"(\w*)"/g.exec(key)
                let formattedKey = key
                if (matches !== null && matches.length > 1) {
                  formattedKey = matches[1]
                }
                toast.error(
                  `${formattedKey} failed with error: ${
                    error?.response?.data?.message || error?.message || error
                  }`,
                )
              },
              revalidateOnFocus: false,
            }}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline enableColorScheme />

            <Header />

            <Box sx={{ minHeight: 'calc(100vh - 72.5px)' }}>
              <MDXProvider components={{ wrapper: MDXWrapper }}>
                <AuthWrapper>
                  <Component {...pageProps} />
                </AuthWrapper>
              </MDXProvider>
            </Box>
            <Footer />
            <Toaster
              richColors
              closeButton
              theme={prefersDarkMode ? 'dark' : 'light'}
            />
          </SWRConfig>
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default appWithTranslation(MyApp)
