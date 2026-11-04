import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { GetLinksInput, getLinks } from '@/app/functions/get-links'
import { unwrapEither } from '@/shared/either'

export const getLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'Get links',
        description: 'Gets the list of links',
        tags: ['Links'],
        querystring: GetLinksInput,
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: z.uuid(),
                originalUrl: z.url(),
                shortUrl: z.string().meta({ example: 'my-link' }),
                accessCount: z.number(),
                createdAt: z.date(),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },

    async (request, reply) => {
      const { page, pageSize } = request.query

      const result = await getLinks({
        page,
        pageSize,
      })

      const { total, links } = unwrapEither(result)

      return reply.status(200).send({ links, total })
    }
  )
}
