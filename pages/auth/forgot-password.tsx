import { APIResponse } from '#models/APIResponse'
import { api } from '#network/index'
import { Button, TextField, Typography } from '@mui/material'
import { Box } from '@mui/material'
import { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter as useNavigation } from 'next/navigation'
import { FC, useState } from 'react'
import { toast } from 'sonner'

export const SigninPage: FC = () => {
  // States
  const [email, setEmail] = useState('')

  // Translation
  const { t } = useTranslation('auth')

  // Verification
  const { status } = useSession()
  const navigation = useNavigation()

  if (status === 'authenticated') {
    navigation.push('/')
  }

  const submit = async () => {
    if (!email) {
      toast.error('Email is not valid')
      return
    }

    toast.promise(api.post<APIResponse>('auth/reset-password', {email}), {
      loading: 'Sending link..',
      error: (err) => err.message || err,
      success: (response) => {
        const data = response.data
        localStorage.setItem('reset-password-email', email)

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
      <NextSeo title={t('forgot_password')} />
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
            {t('forgot_password')}
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
          <Button
            sx={{
              marginTop: 'auto',
            }}
            variant="contained"
            type="submit"
          >
            {t('send_email')}
          </Button>
          <Button
            href="/auth/signin"
            sx={{ mt: 1, p: 1, textDecoration: 'none' }}
          >
            {t('back')}
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
