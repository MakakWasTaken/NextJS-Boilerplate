import { Add } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SpeedDial,
  TextField,
  useMediaQuery,
} from '@mui/material'
import { TeamInvite, User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { FC, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KeyedMutator } from 'swr'
import { v4 } from 'uuid'
import { Role } from '#models/Role'
import theme from '#src/misc/theme'
import { api } from '#network/index'

const emailRegex = /^[\w-\.]+\@([\w-]+\.)+[\w-]{2,4}$/

interface AddMemberDialogProps {
  invites: TeamInvite[]
  members: User[]
  mutate: KeyedMutator<
    {
      id: string
      name: string | null
      email: string
      teamId: string
    }[]
  >
}

const AddMemberDialog: FC<AddMemberDialogProps> = ({
  members,
  invites,
  mutate,
}) => {
  // Translations
  const { t } = useTranslation('settings')

  // Layout
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  // Data
  const { data: session } = useSession()

  // States
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)

  // Stop
  if (!session || (session.user.role && session.user.role.role > Role.Admin)) {
    // The user does not have enough permission anyways.
    return null
  }

  // Functions
  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async () => {
    try {
      // Validate data
      if (!name) {
        throw new Error('Name is not defined')
      }
      if (!email) {
        throw new Error('Email is not defined')
      }
      if (!emailRegex.test(email)) {
        throw new Error('Email is not valid')
      }

      // Create the invitation.
      toast.promise(
        api.post<TeamInvite>('database/team/invite', {
          id: v4(),

          name,
          email,

          teamId: '', // Overwritten by server
        }),
        {
          loading: `${t('creating')} ${t('team_invite')}`,
          error: (err) => err.message || err,
          success: () => {
            mutate()

            handleClose()

            return `${t('succesfully_updated')} ${t('team_invite')}`
          },
        },
      )
    } catch (err) {
      toast.error(err.message ?? err)
    }
  }

  const emailError = useMemo((): string | undefined => {
    if (email ? !emailRegex.test(email) : false) {
      return 'Email is not valid'
    }
    if (
      invites.some((invite) => invite.email === email) ||
      members.some((member) => member.email === email)
    ) {
      return 'Email already exists on team'
    }
    return undefined
  }, [email, invites, members])

  return (
    <>
      <Dialog
        className="add-member-popup"
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{t('add_member')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('add_member_dialog_description')}
          </DialogContentText>
          <TextField
            className="add-member-name-insert"
            value={name}
            onChange={(event): void => {
              setName(event.target.value)
            }}
            autoCapitalize="words"
            margin="dense"
            id={'name'}
            label={t('name')}
            fullWidth
            variant="outlined"
            // AutoComplete disabled because it is not the user's own name
            autoComplete="off"
          />
          <TextField
            className="add-member-email-insert"
            value={email}
            onChange={(event): void => {
              setEmail(event.target.value)
            }}
            type="email"
            margin="dense"
            id={'email'}
            label={t('email')}
            fullWidth
            error={emailError !== undefined}
            helperText={emailError}
            variant="outlined"
            // AutoComplete disabled because it is not the user's own email
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button id="close-addmember-popup" onClick={handleClose}>
            {t('close')}
          </Button>
          <Button
            className="addmember-popup-add-button"
            onClick={handleSubmit}
            variant="contained"
          >
            {t('add')}
          </Button>
        </DialogActions>
      </Dialog>
      <SpeedDial
        className="add-members-speed-dial-icon"
        id="addmembers_dial"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        ariaLabel={'Add Member'}
        icon={<Add />}
        onClick={() => setOpen(true)}
      />
    </>
  )
}

export default AddMemberDialog
