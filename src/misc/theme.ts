import { red } from '@mui/material/colors'
import createTheme, { ThemeOptions } from '@mui/material/styles/createTheme'
import { Cabin } from 'next/font/google'

export const roboto = Cabin({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const defaultThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#3c3',
    },
    secondary: {
      main: '#33c',
    },
    error: {
      main: red.A400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          background: '#eee',
        },
        ':root': {
          colorScheme: 'light',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '13px',
          padding: '8px 16px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          // Controls default (unchecked) color for the thumb
          color: '#ccc',
        },
        colorPrimary: (props) => ({
          '&.Mui-checked': {
            // Controls checked color for the thumb
            color: props.theme.palette.primary.main,
          },
        }),
        track: {
          // Controls default (unchecked) color for the track
          opacity: 0.2,
          backgroundColor: '#fff',
          '.Mui-checked.Mui-checked + &': {
            // Controls checked color for the track
            opacity: 0.7,
            backgroundColor: (props: any) => {
              return props.theme.palette.secondary.main
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
}

// Create a theme instance.
export const theme = createTheme(defaultThemeOptions)

export const darkTheme = createTheme({
  ...defaultThemeOptions,
  palette: {
    ...defaultThemeOptions.palette,
    mode: 'dark',
    primary: {
      main: '#3c3',
    },
    secondary: {
      main: '#33c',
    },
  },
  components: {
    ...defaultThemeOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          background: '#111',
        },
        ':root': {
          colorScheme: 'dark',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          backgroundColor: '#333 !important',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          backgroundColor: '#191919',
          // Controls default (unchecked) color for the thumb
          color: '#333',
        },
        colorPrimary: (props) => ({
          '&.Mui-checked': {
            // Controls checked color for the thumb
            color: props.theme.palette.secondary.main,
          },
        }),
        track: {
          // Controls default (unchecked) color for the track
          opacity: 0.2,
          backgroundColor: '#191919',
          '.Mui-checked.Mui-checked + &': {
            // Controls checked color for the track
            opacity: 0.7,
            backgroundColor: '#191919',
          },
        },
      },
    },
  },
})

export default theme
