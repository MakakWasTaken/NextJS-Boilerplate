import Link from '#components/Link'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { GetStaticProps } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter as useNavigation, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'

export const SigninPage: FC = () => {
  // States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Layout
  const [showPassword, setShowPassword] = useState(false)
  const changePasswordVisibility = () => setShowPassword((prev) => !prev)

  // Translation
  const { t } = useTranslation('auth')

  // Verification
  const { status } = useSession()
  const navigation = useNavigation()
  const searchParams = useSearchParams()

  if (status === 'authenticated') {
    navigation.push('/')
  }

  useEffect(() => {
    if (searchParams.has('error')) {
      const error = searchParams.get('error')
      let errorMessage: string | undefined = undefined

      switch (error) {
        case 'CLIENT_SESSION_ERROR':
          errorMessage = 'Context has a problem fetching session data.'
          break
        case 'CLIENT_FETCH_ERROR':
          errorMessage = 'Make sure that NEXTAUTH_URL is correct.'
          break
        case 'OAUTH_V1_GET_ACCESS_TOKEN_ERROR':
        case 'OAUTH_GET_ACCESS_TOKEN_ERROR':
          errorMessage =
            'There was an error getting the access token from the provider'
          break
        case 'OAUTH_GET_PROFILE_ERROR':
          errorMessage = 'Unable to get profile from oauth provider'
          break
        case 'OAUTH_PARSE_PROFILE_ERROR':
          errorMessage =
            'There was an error parsing the profile from the oauth provider'
          break
        case 'OAUTH_CALLBACK_HANDLER_ERROR':
          errorMessage = 'There was an error parsing the JSON request body.'
          break
        case 'SIGNIN_OAUTH_ERROR':
          errorMessage =
            'Redirection to the authorization URL of the OAuth provider failed.'
          break
        case 'OAUTH_CALLBACK_ERROR':
          errorMessage = 'Invalid state returned from the OAuth provider.'
          break
        case 'SIGNIN_EMAIL_ERROR':
          errorMessage = 'Verification with email link failed.'
          break
        case 'CALLBACK_EMAIL_ERROR':
          errorMessage = 'Error during email callback.'
          break
        case 'EMAIL_REQUIRES_ADAPTER_ERROR':
          errorMessage = 'Provider requires adapter'
          break
        case 'CALLBACK_CREDENTIALS_JWT_ERROR':
          errorMessage =
            'The Credentials Provider can only be used if JSON Web Tokens are used for sessions.'
          break
        case 'CALLBACK_CREDENTIALS_HANDLER_ERROR':
          errorMessage =
            'There was no authorize() handler defined on the credential authentication provider.'
          break
        case 'PKCE_ERROR':
          errorMessage = 'PCKE Error'
          break
        case 'INVALID_CALLBACK_URL_ERROR':
          errorMessage = 'Invalid callback url'
          break
      }

      if (errorMessage) {
        toast.error(`${error}: ${errorMessage}`, {
          duration: Infinity,
        })
      } else {
        // Just display the error
        toast.error(error, {
          duration: Infinity,
        })
      }
    }
  }, [searchParams])

  const submit = async () => {
    // Send the credentials to the backend using the signIn method from next-auth
    toast.promise(
      signIn('credentials', {
        email,
        password,
        callbackUrl: searchParams.get('callbackUrl') || '/',
      }),
      {
        loading: 'Loading..',
        error: (err) => err.message || err,
        success: (response) => {
          if (response?.error) {
            toast.error(response.error as string, {
              important: true,
            })
            return 'An error happened when signin in'
          }
          if (response?.ok && response.url) {
            navigation.push(response.url)
          }
          return 'Succesfully signed in'
        },
      },
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <NextSeo title={t('login')} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '350px' },
            minHeight: { sm: '100%', md: '400px' },
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: 2,
            textAlign: 'center',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              color: (theme) =>
                theme.palette.getContrastText(theme.palette.background.paper),
            }}
          >
            {t('login')}
          </Typography>
          <TextField
            value={email}
            onChange={(event): void => {
              setEmail(event.target.value)
            }}
            type="email"
            margin="dense"
            id={'email'}
            label={t('email')}
            fullWidth
            variant="outlined"
            autoComplete="email"
          />
          <TextField
            value={password}
            onChange={(event): void => {
              setPassword(event.target.value)
            }}
            margin="dense"
            id={'password'}
            label={t('password')}
            fullWidth
            variant="outlined"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'} // <-- This is where the magic happens
            InputProps={{
              // <-- This is where the toggle button is added.
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={changePasswordVisibility}
                    onMouseDown={changePasswordVisibility}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            sx={{
              marginTop: 'auto',
            }}
            variant="contained"
            type="submit"
          >
            {t('sign_in')}
          </Button>
          <Link
            href="/auth/forgot-password"
            sx={{
              mt: 1,
              textDecoration: 'none',
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {t('forgot_password')}
          </Link>
          <Link href="/auth/signup" sx={{ mt: 1, textDecoration: 'none' }}>
            {t('no_account')}
          </Link>
          <Button
            onClick={async () => {
              await signIn('azure-ad', {
                redirect: false,
                callbackUrl: searchParams.get('callbackUrl') || '/',
              })
            }}
            sx={{ mt: 1, textDecoration: 'none' }}
          >
            {t('operator_sign_in')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'auth',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default SigninPage
