import chalk from 'chalk'
import { z } from 'zod'

import { env } from 'env/server.mjs'
import { pusher } from 'server/pusher'
import { randomString } from 'utils/string'

import { createRouter } from './context'

export const exampleRouter = createRouter()
  .query('hello', {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? 'world'}`,
      }
    },
  })
  .query('getAll', {
    async resolve({ ctx }) {
      return await ctx.prisma.example.findMany()
    },
  })
  .mutation('qrlogin', {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      const code = randomString(10).toUpperCase()

      await ctx.prisma.user.update({ data: { code }, where: { email: '7jagjag@gmail.com' } })

      pusher.trigger('test-login-qr', 'login:' + input, {
        message: '7jagjag@gmail.com:' + code,
      })
    },
  })
  .mutation('qr', {
    resolve: async () => randomString(10).toUpperCase(),
  })
  .mutation('phone', {
    input: z.string(),
    resolve: async ({ ctx, input }) => {
      const code = randomString(10).toUpperCase()
      const user = await ctx.prisma.user.findFirstOrThrow({ where: { phone: input } })
      await ctx.prisma.user.update({ data: { code, codeExpiresAt: new Date() }, where: { id: user.id } })

      const accountId = env.TWILIO_ACCOUNT_ID

      const details = {
        To: 'whatsapp:' + input,
        From: 'whatsapp:+' + env.TWILIO_FROM,
        MessagingServiceSid: env.TWILIO_MSID,
        Body: code,
      }

      const formBody = Object.keys(details).map((f) => {
        const field = f as keyof typeof details

        return encodeURIComponent(field) + '=' + encodeURIComponent(details[field])
      })

      const opts = {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + env.TWILIO_BASIC_AUTH,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: formBody.join('&'),
      }

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountId}/Messages.json`, opts)
      console.log(chalk.bgRed('twilio'), res.status)

      return 'ok'
    },
  })
