import { User as PrismaUser, TeamRole } from '@prisma/client'
import { Omit } from '@prisma/client/runtime/library'
import 'next-auth'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  // We add role, to convert the number into Role. (Mostly for autocomplete when writing code.)

  type User = Omit<
    PrismaUser & {
      role: TeamRole | null
    },
    'password'
  >

  interface Session {
    expires: string
    user: User
  }
}
