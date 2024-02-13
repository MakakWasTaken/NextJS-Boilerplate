import { Box, CircularProgress, Typography } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

interface LoadingWrapperProps {
  loading: boolean
  label?: string
}

const LoadingWrapper: FC<PropsWithChildren<LoadingWrapperProps>> = ({
  children,
  loading,
  label,
}) => {
  return loading ? (
    <Box
      sx={{
        height: 'calc(100vh - 75px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <CircularProgress />
      {label && <Typography sx={{ mt: 2 }}>{label}</Typography>}
    </Box>
  ) : (
    children
  )
}

export default LoadingWrapper
