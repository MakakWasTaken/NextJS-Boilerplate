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
    // Handle depending on the method.
    if (req.method === 'GET') {
      await handleGET(req, res, session)
    } else if (req.method === 'DELETE') {
      await handleDELETE(req, res, session)
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
const handleGET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  let response = await prisma.user.findFirst({
    where: {
      id: req.query.id as string,
      teamId: session.user.teamId ?? '',
    },
    include: {
      role: true,
    },
  })

  if (response) {
    response.password = null
  }

  res.json(response)
}

/**
 * Delete handler
 *
 * @param req The next request, holding information about the request
 * @param res The next response, allows the server to respond.
 */
const handleDELETE = async (
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

  const roleFilters = [
    {
      role: {
        role: {
          not: {
            equals: Role.Owner,
          },
        },
      },
    },
  ]

  if (session.user.role?.role !== Role.Owner) {
    // If we are not the owner, we are not allowed to delete Admins as well
    roleFilters.push({
      role: {
        role: {
          not: {
            equals: Role.Admin,
          },
        },
      },
    })
  }

  const response = await prisma.user.delete({
    where: {
      id: req.query.id as string,
      teamId: session.user.teamId ?? '',
      OR: [
        {
          AND: roleFilters,
        },
        {
          role: null,
        },
      ],
    },
  })

  if (response) {
    response.password = null
  }

  res.json(response)
}

export default handle
