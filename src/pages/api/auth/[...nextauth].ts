import { PrismaAdapter } from '@next-auth/prisma-adapter'
import chalk from 'chalk'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'

// Prisma adapter for NextAuth, optional and can be removed
import { env } from 'env/server.mjs'
import { prisma } from 'server/db/client'

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      console.log(chalk.bgYellow('session:session'), JSON.stringify(session))
      console.log(chalk.bgYellow('session:user'), JSON.stringify(user))

      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: 'b+MSzD8S5mMgPiCWuGMGJK85OyDqDD7+PS/F66HwXmI=',
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text', placeholder: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findFirst({ where: { email: credentials?.email } })
        console.log(chalk.bgBlue('authorize:credentials'), JSON.stringify(credentials))
        console.log(chalk.bgBlue('authorize:user'), JSON.stringify(user))

        return credentials?.password === user?.code ? user : null
      },
    }),
  ],
}

export default NextAuth(authOptions)
