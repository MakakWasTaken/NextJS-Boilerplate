import { TeamInvite } from '@prisma/client'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? '',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendInvitationEmail = async (teamInvite: TeamInvite) => {
  const emailMessage: Mail.Options = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USERNAME}>`,

    subject: `Invitation to join ${process.env.COMPANY_NAME}`,
    text: `You have been invited to join ${process.env.COMPANY_NAME}. You can sign up at ${process.env.NEXTAUTH_URL}/auth/signup?id=${teamInvite.id}`,
    
    to: teamInvite.email,
  }

  const result = await transporter.sendMail(emailMessage)

  return result
}

export const sendEmail = async ({
  to,
  subject,
  plainText,
  html,
}: {
  to: string | string[]
  subject: string
  plainText: string
  html?: string
}) => {
  const emailMessage: Mail.Options = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USERNAME}>`,
    subject,
    text: plainText,
    html,
    to: Array.isArray(to)
        ? to.map((toEmail) => toEmail).join(', ')
        : to,
    }

  const result = await transporter.sendMail(emailMessage)

  return result
}
