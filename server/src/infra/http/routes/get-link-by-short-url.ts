import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

import { getLinkByShortUrl } from '@/app/functions/get-link-by-short-url'
import { isRight, unwrapEither } from '@/shared/either'

export const getLinkByShortUrlRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links/:shortUrl',
    {
      schema: {
        summary: 'Get link by short url',
        description: 'Gets the original link of the short url',
        tags: ['Links'],
        params: z.object({
          shortUrl: z.string().meta({ example: 'short-url' }),
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            originalUrl: z.url(),
          }),
          404: z.object({ message: z.string() }).describe('Link not found'),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await getLinkByShortUrl({
        shortUrl,
      })

      if (isRight(result)) {
        const { id, originalUrl } = unwrapEither(result)

        return reply.status(200).send({ id, originalUrl })
      }

      const error = unwrapEither(result)

      return reply.status(404).send({ message: error.message })
    }
  )
}
