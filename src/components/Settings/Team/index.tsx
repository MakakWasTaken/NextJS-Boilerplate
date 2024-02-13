import { Delete, Logout } from '@mui/icons-material'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid-pro'
import { Team, TeamInvite, TeamRole, User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { FC, useMemo } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import CustomDataGrid from '#components/DataGrid'
import { Role, getRoleName } from '#models/Role'
import AddMemberDialog from './AddMemberDialog'
import { api } from '#network/index'

interface TeamMemberRow {
  id: string
  name: string | null
  email: string
  role: Role | null
  type: 'Member' | 'Invite'
}

const TeamPage: FC = () => {
  // Translations
  const { t } = useTranslation('settings')

  // Data
  const { data: session } = useSession()
  const { data: teamInvites, mutate: updateTeamInvites } =
    useSWR<TeamInvite[]>('teaminvite')

  const {
    data: team,
    isLoading: teamLoading,
    mutate: updateTeam,
  } = useSWR<Team>('team')
  const { data: teamMembers, mutate: updateTeamMembers } =
    useSWR<(User & { role: TeamRole | null })[]>('team/member')

  // Columns
  const columns: GridColDef<TeamMemberRow>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: t('id'),
        hideable: true,
      },
      {
        field: 'name',
        headerName: t('name'),
        flex: 0.4,
        minWidth: 120,
      },
      {
        field: 'email',
        headerName: t('email'),
        flex: 0.6,
        minWidth: 130,
      },
      {
        field: 'role',
        headerName: t('role'),
        type: 'singleSelect',
        valueOptions: [Role.Member, Role.Admin, Role.Owner].map((option) => ({
          value: option,
          label: t(getRoleName(option)),
        })),
      },
      {
        field: 'type',
        headerName: t('type'),
      },
      {
        field: 'actions',
        headerName: t('actions'),
        type: 'actions',
        getActions: (params) =>
          // If the role is not owner, or if it is owner
          (params.row.role !== Role.Owner ||
            params.row.id === session?.user.id) &&
          ((session?.user.role && session.user.role.role <= Role.Admin) ||
            (params.row.role &&
              session?.user.role &&
              params.row.role < session.user.role.role))
            ? [
                <GridActionsCellItem
                  label="Delete"
                  icon={
                    params.row.id === session?.user.id ? (
                      <Tooltip title={t('leave')}>
                        <Logout color="error" />
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('delete')}>
                        <Delete color="error" />
                      </Tooltip>
                    )
                  }
                  onClick={() => deleteMember(params.row)}
                />,
              ]
            : [],
      },
    ],
    [t, session],
  )

  // Memos
  const tableData = useMemo(() => {
    if (teamInvites && teamMembers) {
      // Combine members and invitations.
      const finalMembers: TeamMemberRow[] = []
      for (const invite of teamInvites) {
        finalMembers.push({
          id: invite.id,
          email: invite.email,
          name: invite.name,
          role: null,
          type: 'Invite',
        })
      }
      for (const member of teamMembers) {
        finalMembers.push({
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role?.role ?? Role.Member,
          type: 'Member',
        })
      }

      return finalMembers
    }
    return []
  }, [teamInvites, teamMembers])

  // Functions
  const deleteMember = (row: TeamMemberRow) => {
    try {
      if (row.type === 'Member') {
        // Member
        toast.promise(api.delete(`database/team/member/${row.id}`), {
          loading: `${t('deleting')} ${t('team_member')}`,
          error: (err) => err.message ?? err,
          success: () => {
            updateTeamMembers()

            return `${t('succesfully_deleted')} ${t('team_member')}`
          },
        })
      } else {
        // Invite
        toast.promise(api.delete(`database/team/invite/${row.id}`), {
          loading: `${t('deleting')} ${t('team_invite')}`,
          error: (err) => err.message ?? err,
          success: () => {
            updateTeamInvites()

            return `${t('succesfully_deleted')} ${t('team_invite')}`
          },
        })
      }
    } catch (err) {
      toast.error(err.message || err)
    }
  }

  const somethingIsChanged = useMemo(() => {
    if (!team) {
      return false
    }
    return false
  }, [team])

  const save = async () => {
    if (!somethingIsChanged) {
      toast.error('Nothing has changed, so there is nothing to save.')
      return
    }

    toast.promise(api.put('database/team', {}), {
      loading: `${t('updating')} ${t('team')}..`,
      error: (err) => err.message || err,
      success: (_data) => {
        // Update the local team
        updateTeam()

        return `${t('succesfully')} ${t('updated')} ${t('team')}`
      },
    })
  }

  const processRowUpdate = (
    newRow: TeamMemberRow,
    oldRow: TeamMemberRow,
  ): TeamMemberRow => {
    // Update the registration number of the user.

    toast.promise(
      api.put('database/user', {
        id: oldRow.id,
      }),
      {
        loading: `${t('updating')} ${t('user')}`,
        error: (err) => err.message || err,
        success: () => {
          updateTeamMembers()

          return `${t('successfully_updated')} ${t('user')}`
        },
      },
    )

    return newRow
  }

  return (
    <>
      <NextSeo title={t('team')} description={t('team_description')} />
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Box className="team-settings-general-section">
          <Typography sx={{ marginBlock: 2 }} variant="h5">
            {t('general')}
          </Typography>
          {/* Add customization fields here */}
          {somethingIsChanged && (
            <Button
              sx={{
                mt: 2,
              }}
              fullWidth
              variant="contained"
              onClick={save}
              disabled={
                !session?.user.role || session?.user.role.role > Role.Admin
              }
            >
              {t('save')}
            </Button>
          )}
        </Box>
        <Typography sx={{ marginBlock: 2 }} variant="h5">
          {t('members')}
        </Typography>
        <CustomDataGrid
          className="members-data-grid"
          hideFooter
          disableColumnMenu
          isCellEditable={() =>
            !!session?.user.role && session?.user.role.role <= Role.Admin
          }
          rows={tableData}
          loading={teamLoading}
          columns={columns}
          processRowUpdate={processRowUpdate}
          sx={{
            mt: 3,
            minHeight: '200px',
            pb: 10,
          }}
        />
        {session?.user.role && session.user.role.role < Role.Member && (
          <AddMemberDialog
            invites={teamInvites ?? []}
            members={teamMembers ?? []}
            mutate={updateTeamInvites}
          />
        )}
      </Box>
    </>
  )
}

export default TeamPage
