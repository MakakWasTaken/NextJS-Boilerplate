import { Role } from '#models/Role'
import { prisma } from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
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

    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else if (req.method === 'PUT') {
      await handlePUT(req, res, session)
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
 * Get team
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handleGET = async (
  _req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const response = await prisma.team.findFirst({
    where: {
      users: {
        some: {
          id: session.user?.id,
        },
      },
    },
  })

  res.json(response)
}

/**
 * Team
 *
 * @param req
 * @param res
 * @param session
 */
const handlePUT = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  if (session.user.role && session.user.role.role > Role.Admin) {
    return res
      .status(403)
      .json({ ok: false, message: 'You do not have permission' })
  }

  if (!session.user.teamId) {
    return res
      .status(403)
      .json({ ok: false, message: 'You do not have permission' })
  }

  const response = await prisma.team.update({
    where: {
      id: session.user.teamId,
    },
    data: {
      // TODO: Replace with updateable fields
    },
  })

  return res.json(response)
}

export default handle
