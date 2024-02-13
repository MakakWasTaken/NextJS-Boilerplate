import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import { FC } from 'react'

export interface FlagProps {
  isoCountry: string
  label?: string
}

const Flag: FC<FlagProps> = ({ isoCountry, label }) => {
  return (
    <Box sx={{ display: 'flex', my: 1, flexDirection: 'row' }}>
      <Image
        style={{
          borderRadius: '5px',
        }}
        height={20}
        width={40}
        alt={`Flag for the country ${isoCountry}`}
        src={`https://flagcdn.com/w40/${isoCountry}.webp`}
      />
      {label && (
        <Typography sx={{ ml: 2 }} variant="body1">
          {label}
        </Typography>
      )}
    </Box>
  )
}

export default Flag
