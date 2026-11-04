import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { incrementLinkAccessCount } from '@/app/functions/increment-link-access-count'
import { isRight, unwrapEither } from '../../../../shared/either'

export const incrementLinkAccessCountRoute: FastifyPluginAsyncZod =
  async server => {
    server.patch(
      '/links/:linkId/access',
      {
        schema: {
          summary: 'Increment link access count',
          description: 'Increments the access count number of a link',
          tags: ['Links'],
          params: z.object({
            linkId: z
              .uuid()
              .meta({ example: '019a4f2e-7c1b-7a3d-9e2f-1b2c3d4e5f60' }),
          }),
          response: {
            204: z.null().describe('Access count incremented'),
            404: z.object({ message: z.string() }).describe('Link not found'),
          },
        },
      },
      async (request, reply) => {
        const { linkId } = request.params

        const result = await incrementLinkAccessCount({
          linkId,
        })

        if (isRight(result)) {
          return reply.status(204).send(null)
        }

        const error = unwrapEither(result)

        return reply.status(404).send({ message: error.message })
      }
    )
  }
