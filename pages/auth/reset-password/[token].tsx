import { APIResponse } from '#models/APIResponse'
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
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const ResetPasswordPage: FC = () => {
  // Translations
  const { t } = useTranslation('auth')

  // Query params
  const router = useRouter()
  const navigation = useNavigation()

  // States
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Layout
  const [showPassword, setShowPassword] = useState(false)
  const changePasswordVisibility = () => setShowPassword((prev) => !prev)

  const storedEmail = useMemo(() => {
    return localStorage.getItem('reset-password-email')
  }, [])

  const token = useMemo(() => {
    return router.query.token as string
  }, [router])

  if (!token) {
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
        <Typography>Token is not valid</Typography>
      </Box>
    )
  }

  const submit = () => {
    if (!storedEmail && !email) {
      toast.error('Email is not valid')
      return
    }
    toast.promise(api.post<APIResponse>('auth/verify-reset-password', {email: storedEmail ?? email, token, newPassword}), {
      loading: 'Reseting password..',
      error: (err) => err.message || err,
      success: (response) => {
        const data = response.data
        localStorage.removeItem('reset-password-email')
        navigation.push('/auth/sigin')
        return data.message
      },
    })
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
      <NextSeo title={t('reset_password')} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '350px' },
            height: { sm: '100%', md: '400px' },
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
            }}
          >
            {t('reset_password')}
          </Typography>
          {!storedEmail && (
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
          )}
          <TextField
            value={newPassword}
            onChange={(event): void => {
              setNewPassword(event.target.value)
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
          <Button
            sx={{
              marginTop: 'auto',
            }}
            variant="contained"
            type="submit"
          >
            {t('reset_password')}
          </Button>
          <Button
            href="/auth/signin"
            sx={{ mt: 1, p: 1, textDecoration: 'none' }}
          >
            {t('sign_in')}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
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

export default ResetPasswordPage
