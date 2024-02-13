import { Box, CircularProgress } from '@mui/material'
import { setPerson } from 'green-analytics-js'
import { useSession } from 'next-auth/react'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { FC, PropsWithChildren } from 'react'

const AuthWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const navigation = useNavigation()

  if (status === 'loading') {
    // loading
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 25,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (
    // Dont redirect if /auth/ path.
    !router.pathname.includes('/auth/') &&
    // No need to be signed in when accessing privacy/cookies
    !router.pathname.includes('/privacy') &&
    !router.pathname.includes('/cookies')
  ) {
    if (status === 'unauthenticated') {
      // If the user is unauthenticated, redirect them to the signin flow.
      navigation.push(`/auth/signin?callbackUrl=${router.pathname}`)
      return
    }
    if (status === 'authenticated') {
      setPerson({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? undefined,
        properties: {
          teamId: session.user.teamId,
          role: session.user.role,
        },
      })
    }
  }

  return <>{children}</>
}

export default AuthWrapper
