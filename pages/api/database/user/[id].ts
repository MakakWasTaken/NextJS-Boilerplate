import { Role } from '#models/Role'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth'
import { prisma } from '../../_base'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

  if (req.method === 'PUT') {
    await handlePUT(req, res, session)
  } else {
    throw new Error(`HTTP ${req.method} method is not supported at this route.`)
  }
}

// PUT /api/user/:id
async function handlePUT(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) {
  const id = req.query.id as string

  if (session.user.role && session.user.role.role > Role.Admin) {
    return res
      .status(403)
      .json({ ok: false, message: 'You do not have permission to do this.' })
  }

  const response = await prisma.user.update({
    data: {},
    where: {
      id,
      teamId: session.user.teamId ?? '',
    },
  })

  return res.json(response)
}
