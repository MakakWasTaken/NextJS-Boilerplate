import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 } from 'uuid'
import rateLimit from '#src/misc/rateLimit'
import { prisma } from '../_base'
import { sendEmail } from '../_mailer'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const forwarded = req.headers['x-forwarded-for']
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(/, /)[0]
        : req.socket.remoteAddress

    if (!ip) {
      res.status(500).json({
        ok: false,
        message: 'Could not get IP Address',
      })
      return
    }

    await limiter.check(res, 10, ip) // 10 requests per minute
  } catch {
    res.status(429).json({ ok: false, message: 'Rate limit exceeded' })
  }

  try {
    if (req.method === 'POST') {
      await handlePOST(req, res)
    }
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || err,
    })
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const email = req.body.email as string

  if (!email) {
    res.status(400).json({
      ok: false,
      message: 'email is missing',
    })
    return
  }

  // Check if a user exists
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  })

  if (!user) {
    res.status(200).json({
      ok: true,
      message: 'Reset link succesfully sent if email exists',
    })
    return
  }

  // Delete any old tokens
  await prisma.resetPasswordToken.deleteMany({
    where: {
      email,
    },
  })

  // Create a new PasswordResetToken, and send an email with the reset link.
  const createResponse = await prisma.resetPasswordToken.create({
    data: {
      email,
      token: v4(),
      expires: DateTime.utc().plus({ minutes: 30 }).toJSDate(), // 30 minutes
    },
  })

  // Send email with link to reset the password
  const sendEmailResponse = await sendEmail({
    to: email,
    subject: `Reset password for ${process.env.COMPANY_NAME}`,
    plainText: `Use the following link to reset your password for ${process.env.COMPANY_NAME}: ${process.env.NEXTAUTH_URL}/auth/reset-password/${createResponse.token}`,
  })

  if (sendEmailResponse.rejected.length) {
    throw new Error(JSON.stringify(sendEmailResponse.rejected))
  }

  res.status(200).json({
    ok: true,
    message: 'Reset link succesfully sent if email exists',
  })
}

export default handler
