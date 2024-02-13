import { Role } from '#models/Role'
import { hashSync } from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../_base'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    await handlePOST(req, res)
  } else {
    throw new Error(`HTTP ${req.method} method is not supported at this route.`)
  }
}

// POST /api/user
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { email, name, password } = req.body
  if (!email || !name || !password) {
    res.status(400).json({
      ok: false,
      message: 'Some required information is needed to create account.',
    })
    return
  }

  // Check that an invitation is present for this email.
  const teamInvitation = await prisma.teamInvite.findFirst({
    where: { email },
  })

  if (!teamInvitation) {
    return res.status(400).json({
      ok: false,
      message:
        'This user has not been invited. Please contact the operator of the plant to get an invitation.',
    })
  }

  // Hash the password
  const hash = hashSync(password, 10)

  // Create the user
  const response = await prisma.user.create({
    data: {
      role: {
        create: {
          role: Role.Member,
          teamId: teamInvitation.teamId,
        },
      },
      email,
      name,
      password: hash,
      teamId: teamInvitation.teamId,
    },
  })

  // Remove invitation
  await prisma.teamInvite.deleteMany({
    where: {
      email,
      teamId: teamInvitation.teamId,
    },
  })

  response.password = null
  return res.json(response)
}
