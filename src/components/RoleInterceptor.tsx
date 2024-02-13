import { Role } from '#src/models/Role'
import { Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { FC, PropsWithChildren, useEffect, useMemo } from 'react'

export interface RoleInterceptorProps {
  role: Role
  href?: string
}

const RoleInterceptor: FC<PropsWithChildren<RoleInterceptorProps>> = ({
  children,
  role,
  href,
}) => {
  const { data: session } = useSession()

  const hasHighEnoughRole = useMemo(() => {
    if (session !== undefined) {
      if (session?.user.role && session.user.role.role <= role) {
        return true
      }
      return false
    }
  }, [role, session])

  useEffect(() => {
    if (href && session !== undefined && !hasHighEnoughRole) {
      // If we have a href, are authenticated and our role is not high enough.
      // Redirect to the href.
      redirect(href)
    }
  }, [href, session, hasHighEnoughRole])

  return !hasHighEnoughRole ? (
    <Typography
      sx={{
        fontSize: 22,
        textAlign: 'center',
        mt: 25,
      }}
    >
      You do not have the required permission
    </Typography>
  ) : (
    children
  )
}

export default RoleInterceptor
