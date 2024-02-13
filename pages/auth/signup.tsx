import Link from '#components/Link'
import { api } from '#network/index'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { User } from '@prisma/client'
import { GetStaticProps } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter as useNavigation, useSearchParams } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

export const SigninPage: FC = () => {
  // States
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Layout
  const [showPassword, setShowPassword] = useState(false)
  const changePasswordVisibility = () => setShowPassword((prev) => !prev)

  // Translations
  const { t } = useTranslation('auth')

  // Verification
  const { status } = useSession()
  const navigation = useNavigation()
  const searchParams = useSearchParams()

  const { data: teamInvite, isLoading: isInviteLoading } = useSWR(
    searchParams.has('id') ? `team/invite/${searchParams.get('id')}` : null,
  )

  if (status === 'authenticated') {
    navigation.push('/')
  }

  useEffect(() => {
    if (teamInvite) {
      setName(teamInvite.name ?? '')
      setEmail(teamInvite.email)
    }
  }, [teamInvite])

  const submit = async () => {
    try {
      // Create the account
      await api.post<User>('database/user/create', {
        name,
        email,
        password,
      })

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
    } catch (err) {
      toast.error(err.message || err)
    }
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
      <NextSeo title={t('sign_up')} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '350px' },
            minHeight: { sm: '100%', md: '500px' },
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: 2,
            textAlign: 'center',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
            }}
          >
            {t('sign_up')}
          </Typography>
          {isInviteLoading ? (
            <>
              <TextField
                value={name}
                onChange={(event): void => {
                  setName(event.target.value)
                }}
                margin="dense"
                id={'name'}
                label={t('name')}
                fullWidth
                variant="outlined"
                autoComplete="name"
              />
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
                autoComplete="new-password"
                type={showPassword ? 'text' : 'password'}
                InputProps={{
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
            </>
          ) : null}
          <Button
            sx={{
              marginTop: 'auto',
            }}
            variant="contained"
            type="submit"
            disabled={isInviteLoading}
          >
            {t('sign_up')}
          </Button>
          <Link
            href="/auth/signin"
            sx={{ mt: 1, p: 1, textDecoration: 'none' }}
          >
            {t('already_account')}
          </Link>
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
