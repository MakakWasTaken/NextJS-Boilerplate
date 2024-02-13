import { Box, Tab, Tabs, Typography } from '@mui/material'
import { GetStaticProps } from 'next'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { FC, useState, useContext, useEffect } from 'react'
import CustomTabPanel from '#components/Settings/CustomTabPanel'
import ProfilePage from '#components/Settings/Profile'
import TeamPage from '#components/Settings/Team/'
import { Role } from '#models/Role'

const SettingsPage: FC = () => {
  // Translations
  const { t } = useTranslation('settings')

  // User
  const { data: session } = useSession({
    required: true,
  })

  const router = useRouter()

  const [tab, setTab] = useState(Number(router.query.tab) || 0)

  const handleTabChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: number,
  ) => {
    setTab(value)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: { sm: 0, md: 8 },
          width: { xs: '100%', sm: '100%', md: '80%', lg: '60%' },
          minHeight: '500px',
          backgroundColor: (theme) => theme.palette.background.paper,
          padding: { sm: 1, md: 4 },
          borderRadius: 4,
          gap: 3,
        }}
      >
        <Typography variant="h4">{t('settings')}</Typography>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label={t('profile')} id="profile-tab" />
          <Tab label={t('team')} id="team-tab" className="settings-team-tab" />
        </Tabs>
        <CustomTabPanel value={tab} index={0}>
          <ProfilePage />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
          <TeamPage />
        </CustomTabPanel>
      </Box>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: locale
      ? {
          ...(await serverSideTranslations(locale, [
            'settings',
            'header',
            'footer',
          ])),
          // Will be passed to the page component as props
        }
      : {},
  }
}

export default SettingsPage
