import { EmotionJSX } from '@emotion/react/types/jsx-namespace'
import createEmotionServer from '@emotion/server/create-instance'
import { getInitColorSchemeScript } from '@mui/material/styles'
import { AppType } from 'next/app'
import Document, {
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document'
import * as React from 'react'
import createEmotionCache from '../src/misc/createEmotionCache'
import { theme } from '../src/misc/theme'
import { MyAppProps } from './_app'

interface MyDocumentProps extends DocumentProps {
  emotionStyleTags: React.JSX.Element[]
}

export const MyDocument = ({
  emotionStyleTags,
}: MyDocumentProps): React.JSX.Element => {
  return (
    <Html
      lang="en"
      style={{
        overflowX: 'hidden', // Prevents overscrolling on all pages
      }}
    >
      <Head>
        <meta name="theme-color" content={theme.palette.primary.main} />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="emotion-insertion-point" content="" />
        {emotionStyleTags}
      </Head>
      <body
        style={{
          overflowX: 'hidden', // Prevents overscrolling on all pages
        }}
      >
        {getInitColorSchemeScript()}
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (
  ctx: DocumentContext,
): Promise<
  DocumentInitialProps & {
    emotionStyleTags: EmotionJSX.Element[]
    isAPIPath: boolean
  }
> => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache()
  const emotionServer = createEmotionServer(cache)

  ctx.renderPage = (): DocumentInitialProps | Promise<DocumentInitialProps> =>
    originalRenderPage({
      enhanceApp:
        (
          App: React.ComponentType<React.ComponentProps<AppType> & MyAppProps>,
        ) =>
        (props): React.JSX.Element => {
          return <App emotionCache={cache} {...props} />
        },
    })

  const initialProps = await Document.getInitialProps(ctx)
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = emotionServer.extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: This is the recommended method from @mui
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  const isAPIPath = ctx.req?.url?.includes('/api') ?? false

  return {
    ...initialProps,
    emotionStyleTags,
    isAPIPath,
  }
}

export default MyDocument
