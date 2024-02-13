import { Button, TextField } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React, { FC, useMemo, useState } from 'react'
import { toast } from 'sonner'

const ProfilePage: FC = () => {
  // Translations
  const { t } = useTranslation('settings')

  // Data
  const { data: session, update } = useSession()

  // States
  const [name, setName] = useState(session?.user.name || '')

  const somethingIsChanged = useMemo(() => {
    if (!session) {
      // User is not loaded, so nothing can be changed yet.
      return false
    }

    if (name !== session.user.name) {
      return true
    }

    return false
  }, [name, session])

  const save = async () => {
    if (!somethingIsChanged) {
      toast.error('Nothing has changed, so there is nothing to save.')
      return
    }

    update({
      name,
    })
  }

  return (
    <>
      <NextSeo title={t('profile')} description={t('profile_description')} />
      <TextField
        placeholder={t('name')}
        label={t('name')}
        value={name}
        fullWidth
        sx={{
          flex: 0.5,
        }}
        onChange={(e) => setName(e.target.value)}
      />

      {somethingIsChanged && (
        <Button
          sx={{
            mt: 'auto',
          }}
          fullWidth
          variant="contained"
          onClick={save}
        >
          {t('save')}
        </Button>
      )}
    </>
  )
}

export default ProfilePage
