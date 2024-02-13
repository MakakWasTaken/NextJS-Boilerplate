import { Box } from '@mui/material'
import React, { FC, PropsWithChildren } from 'react'

const MDXWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        margin: 10,
      }}
    >
      {children}
    </Box>
  )
}

export default MDXWrapper
