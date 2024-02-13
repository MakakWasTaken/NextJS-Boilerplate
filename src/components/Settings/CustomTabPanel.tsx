import { Box } from '@mui/material'
import { FC } from 'react'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export const CustomTabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}

export default CustomTabPanel
