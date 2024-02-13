import { Role } from '#models/Role'
import { prisma } from '#pages/api/_base'
import { authOptions } from '#pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

export const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Handle depending on the method.
    if (req.method === 'GET') {
      await handleGET(req, res)
    } else if (req.method === 'DELETE') {
      await handleDELETE(req, res)
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
 * Get specific handler
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await prisma.teamInvite.findFirst({
    where: {
      id: req.query.id as string,
    },
  })

  res.json(response)
}

/**
 * Delete handler
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
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
  // If role is higher (Closer to 0 is better), access denied.
  if (session.user.role && session.user.role.role > Role.Admin) {
    return res.status(403).json({
      ok: false,
      message: "You don't have a high enough role",
    })
  }

  const response = await prisma.teamInvite.delete({
    where: {
      id: req.query.id as string,
      teamId: session.user.teamId ?? '',
    },
  })

  res.json(response)
}

export default handle
