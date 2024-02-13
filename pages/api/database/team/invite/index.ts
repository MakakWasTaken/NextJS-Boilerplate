import { Role } from '#models/Role'
import { prisma } from '#pages/api/_base'
import { sendInvitationEmail } from '#pages/api/_mailer'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import { TeamInvite } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Handle auth check.
    const session = await getServerSession(req, res, authOptions(req, res))

    if (!session) {
      return res.status(401).json({
        ok: false,
        message: 'Not authenticated',
      })
    }

    if (!session.user.teamId) {
      return res.status(400).json({
        ok: false,
        message: 'You need to be a part of a team',
      })
    }

    if (req.method === 'POST') {
      await handlePOST(req, res, session)
    } else if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else {
      throw new Error(
        `HTTP ${req.method} method is not supported at this route.`,
      )
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || err,
    })
  }
}

/**
 * Create handler
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handlePOST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  // If role is higher (Closer to 0 is better), access denied.
  if (session.user.role && session.user.role.role > Role.Admin) {
    return res.status(403).json({
      ok: false,
      message: "You don't have a high enough role",
    })
  }

  const invite = req.body as TeamInvite

  // Prisma will do most of the validation
  const response = await prisma.teamInvite.create({
    data: { ...invite, teamId: session.user.teamId ?? '' },
  })

  // After the team invitation has been created, send the email to the user.
  await sendInvitationEmail(invite)

  return res.json(response)
}

/**
 * Get all handler
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handleGET = async (
  _req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const response = await prisma.teamInvite.findMany({
    where: {
      teamId: session.user.teamId ?? '',
    },
  })

  res.json(response)
}

export default handle
