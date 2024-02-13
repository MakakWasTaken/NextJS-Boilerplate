import { hashSync } from 'bcryptjs'
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
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
  const token = req.body.token as string
  const newPassword = req.body.newPassword as string

  if (!email) {
    res.status(400).json({
      ok: false,
      message: 'email is missing',
    })
    return
  }
  if (!token) {
    res.status(400).json({
      ok: false,
      message: 'token is missing',
    })
    return
  }
  if (!newPassword) {
    res.status(400).json({
      ok: false,
      message: 'newPassword is missing',
    })
    return
  }

  const tokenResponse = await prisma.resetPasswordToken.findUnique({
    where: {
      email,
      token,
      expires: {
        gt: DateTime.utc().toJSDate(),
      },
    },
  })

  if (!tokenResponse) {
    res.status(400).json({
      ok: false,
      message: 'Invalid token',
    })
    return
  }

  // Update the user's password.
  // Hash the password
  const hash = hashSync(newPassword, 10)

  // Use updateMany to get the number of updated rows. (Will either be 0 or 1, since email is unique)
  const updateResponse = await prisma.user.updateMany({
    data: {
      password: hash,
    },
    where: {
      email,
    },
  })

  if (!updateResponse.count) {
    res.status(404).json({
      ok: false,
      message: 'User not found',
    })
    return
  }

  // Delete the token
  await prisma.resetPasswordToken.deleteMany({
    where: {
      email,
      // Don't supply the remaining parameters, as we might as well clean up.
    },
  })

  // Send email with link to reset the password
  const sendEmailResponse = await sendEmail({
    to: email,
    subject: 'Password reset succesful',
    plainText: `Your password for ${process.env.COMPANY_NAME} has succesfully been reset. If this was not done by you, please contact us as soon as possible.`,
  })

  if (sendEmailResponse.rejected.length) {
    throw new Error(JSON.stringify(sendEmailResponse.rejected))
  }

  res.status(200).json({
    ok: true,
    message: 'Succesfully updated password',
  })
}

export default handler
