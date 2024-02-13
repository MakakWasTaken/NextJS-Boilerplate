import {
  Logout,
  Menu as MenuIcon,
  MoreVert as MoreIcon,
  Settings,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { Role } from '#models/Role'
import Link from '../Link'

export const Header: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { data: session } = useSession()
  const { t } = useTranslation('header')

  const router = useRouter()

  const pages: { name: string; path: string; role?: Role }[] = useMemo(
    () => [{ name: t('home'), path: '/' }],
    [t],
  )

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const isMenuOpen = Boolean(anchorElNav)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = (): void => {
    setAnchorElNav(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuClose = (): void => {
    setMobileMoreAnchorEl(null)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const mobileMenuId = 'primary-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem component="a" href="/settings">
        <Settings />
        <Typography>{t('settings')}</Typography>
      </MenuItem>
      <MenuItem component="a" href="/auth/signout">
        <Logout />
        <Typography>{t('logout')}</Typography>
      </MenuItem>
    </Menu>
  )

  const filteredPages = useMemo(() => {
    return pages.filter(
      (page) =>
        !page.role ||
        (session?.user.role !== undefined &&
          session?.user.role &&
          session.user.role.role <= page.role),
    )
  }, [pages, session])

  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(7px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.65)'
            : 'rgba(0,0,0, 0.65)',
        color: (theme) => theme.palette.text.primary,
        transition: '0.3s ease-in-out',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ margin: '0 15px' }}>
        <Toolbar disableGutters>
          {/* Only visible on mobile */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'space-between',
            }}
          >
            {filteredPages.length > 0 && (
              <>
                <IconButton
                  sx={{
                    width: '40.5px',
                  }}
                  size="large"
                  aria-label="navigation menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={isMenuOpen}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: 'block',
                  }}
                >
                  {filteredPages.map((page) => (
                    <MenuItem
                      key={page.name}
                      {...{ component: 'a', href: page.path }}
                    >
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            <Link
              sx={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
              }}
              href="/"
            >
              <Image height={50} width={150} priority src={'Logo'} alt="Logo" />
            </Link>
            <IconButton
              size="large"
              sx={{ marginRight: '2vh', width: '40.5px' }}
              aria-label="show more"
              aria-haspopup="true"
              aria-controls={mobileMenuId}
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
          {/* Only visible if not mobile */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex' }}>
              <Link href="/" sx={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  height={50}
                  width={150}
                  priority
                  src={'Logo'}
                  alt="Logo"
                />
              </Link>
              {filteredPages.map((page) => (
                <Button
                  key={page.name}
                  href={page.path}
                  sx={{
                    my: 2,
                    mx: 1,
                    textAlign: 'center',
                    color: (theme) =>
                      router.pathname === page.path
                        ? 'white'
                        : theme.palette.text.primary,
                    backgroundColor: (theme) =>
                      router.pathname === page.path
                        ? theme.palette.primary.main
                        : '',
                    display: 'block',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.primary.main,
                      filter: 'brightness(65%)',
                      color: 'white',
                    },
                    transition: '0.4s',
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={t('settings')}>
                <IconButton
                  sx={{
                    width: '40.5px',
                    height: '40.5px',
                  }}
                  href="/settings"
                  size="small"
                  aria-label="Settings"
                  color="inherit"
                >
                  <Settings />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('logout')}>
                <IconButton
                  sx={{
                    width: '40.5px',
                    height: '40.5px',
                  }}
                  href="/auth/signout"
                  size="small"
                  aria-label="Sign out of your account"
                  color="inherit"
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </Box>
      {renderMobileMenu}
    </AppBar>
  )
}

export default Header
