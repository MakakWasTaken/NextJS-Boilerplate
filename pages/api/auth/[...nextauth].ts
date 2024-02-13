import { PrismaAdapter } from '@auth/prisma-adapter'
import { compareSync } from 'bcryptjs'
import Cookies from 'cookies'
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions, SessionOptions, User } from 'next-auth'
import { decode, encode } from 'next-auth/jwt'
import AzureADProvider from 'next-auth/providers/azure-ad'
import Credentials from 'next-auth/providers/credentials'
import { v4 } from 'uuid'
import { prisma } from '../_base'
import { Role } from '#models/Role'

const adapter = PrismaAdapter(prisma)

adapter.createUser = async (
  user: User & { provider: string; teamId: string },
) => {
  // Remove the provider from the user, otherwise prisma will throw an error complaining about too much information.
  const { ...restUser } = user

  // Custom implementation of creating a user
  const userResponse = await prisma.user.create({
    data: {
      ...restUser,
      // Handled implicitly
      role: undefined,
      teamId: undefined,
    },
    include: {
      role: true,
    },
  })

  const teamResponse = await prisma.team.upsert({
    where: {
      id: user.teamId,
    },
    create: {
      id: user.teamId,
      roles: {
        create: {
          role: Role.Owner,
          userId: userResponse.id,
        },
      },
      users: {
        connect: {
          id: userResponse.id,
        },
      },
    },
    update: {
      id: user.teamId,
      roles: {
        connectOrCreate: {
          where: {
            userId: userResponse.id,
          },
          create: {
            role: Role.Member,
            userId: userResponse.id,
          },
        },
      },
      users: {
        connect: {
          id: userResponse.id,
        },
      },
    },
    include: {
      roles: true,
    },
  })

  const myRole = teamResponse.roles.find(
    (role) =>
      role.userId === userResponse.id && role.teamId === teamResponse.id,
  )

  if (!myRole) {
    throw new Error('Could not find role')
  }

  userResponse.teamId = teamResponse.id
  userResponse.role = myRole

  return userResponse
}

const session: Partial<SessionOptions> = {
  strategy: 'database',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
}

export const authOptions = (
  req: NextApiRequest,
  res: NextApiResponse,
): NextAuthOptions => ({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? '',
      tenantId: process.env.AZURE_TENANT_ID ?? '',
      profile: async (profile) => {
        // Create the user in prisma
        const user: User & { provider: string } = {
          id: profile.oid,
          email: profile.email,
          name: profile.name,
          emailVerified: new Date(),
          image: null,
          role: null,
          notificationSettings: '{}',
          teamId: profile.tid,
          provider: 'azure-ad',
        }

        // Upsert team
        await prisma.team.upsert({
          where: {
            id: profile.tid,
          },
          create: {
            id: profile.tid,
          },
          update: {},
        })

        return user
      },
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) {
          throw new Error('You need to provide both an email and a password')
        }
        if (
          (process.env.CI === 'true' ||
            process.env.NODE_ENV === 'development') &&
          email.endsWith('test@example.com') &&
          password === 'test'
        ) {
          const id = email.split('@')[0]
          const user = await prisma.user.upsert({
            where: {
              id,
            },
            create: {
              id,
              email,
              name: 'John Doe',
              team: {
                connectOrCreate: {
                  where: {
                    id: 'test',
                  },
                  create: {
                    id: 'test',
                  },
                },
              },
            },
            update: {
              name: 'John Doe',
            },
            include: {
              role: true,
            },
          })
          const role = await prisma.teamRole.upsert({
            where: {
              teamId: 'test',
              userId: id,
            },
            create: {
              role: email.startsWith('owner') ? Role.Owner : Role.Member,
              teamId: 'test',
              userId: id,
            },
            update: {},
          })
          user.role = role
          return user
        }

        const user: any = await prisma.user.findUnique({
          where: { email },
        })
        if (!user?.password) {
          throw new Error('Invalid credentials')
        }
        if (compareSync(password, user.password)) {
          user.provider = 'email'
          // We do not want to transfer the password hash at any point. So set it to null
          user.password = null
          return user
        }
        throw new Error('Invalid credentials')
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      // Check if this sign in callback is being called in the credentials authentication flow. If so, use the next-auth adapter to create a session entry in the database (SignIn is called after authorize so we can safely assume the user is valid and already authenticated).
      const nextauth = req.query.nextauth as string
      if (
        typeof nextauth === 'string' &&
        nextauth?.includes('callback') &&
        nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        if (user) {
          const sessionToken = v4()
          const sessionExpiry = new Date(
            Date.now() + (session.maxAge ?? 24 * 60 * 60) * 1000,
          )

          await adapter.createSession?.({
            sessionToken: sessionToken,
            userId: user.id,
            expires: sessionExpiry,
          })

          const cookies = new Cookies(req, res)
          cookies.set('next-auth.session-token', sessionToken, {
            expires: sessionExpiry,
          })
        }
      }

      return true
    },
    session: async ({ session, token, trigger, newSession }) => {
      const email = token?.email || session?.user?.email
      if (email) {
        if (trigger === 'update') {
          const { name, image, notificationSettings } =
            newSession as Partial<User>
          await prisma.user.update({
            data: {
              name,
              image,
              notificationSettings,
            },
            where: {
              email,
            },
          })
        }
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            emailVerified: true,
            role: true,
            email: true,
            image: true,
            notificationSettings: true,
            teamId: true,
            accounts: true,
            team: {
              include: {
                roles: true,
              },
            },
          },
        })
        if (user) {
          if (user.teamId && user.team && !user.role) {
            // If the role does not exist, create a new one.
            const role = await prisma.teamRole.upsert({
              where: {
                userId: user.id,
              },
              create: {
                role: Role.Member,
                userId: user.id,
                teamId: user.teamId,
              },
              update: {
                role: Role.Member,
              },
            })
            user.role = role
          }
          user.accounts = []
          session.user = user
        }
      }
      return session
    },
  },
  jwt: {
    encode: (params) => {
      const nextauth = req.query.nextauth as string
      if (
        typeof nextauth === 'string' &&
        nextauth?.includes('callback') &&
        nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        const cookies = new Cookies(req, res)
        const cookie = cookies.get('next-auth.session-token')
        if (cookie) {
          return cookie
        }
        return ''
      }
      // Revert to default behaviour when not in the credentials provider callback flow
      return encode(params)
    },
    decode: async (params) => {
      const nextauth = req.query.nextauth as string
      if (
        typeof nextauth === 'string' &&
        nextauth?.includes('callback') &&
        nextauth?.includes('credentials') &&
        req.method === 'POST'
      ) {
        return null
      }
      // Revert to default behaviour when not in the credentials provider callback flow
      return decode(params)
    },
  },
  adapter: adapter as any,
  session,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    signOut: '/auth/signout',
    newUser: '/auth/signup',
  },
})

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, authOptions(req, res))
}

export default handler
