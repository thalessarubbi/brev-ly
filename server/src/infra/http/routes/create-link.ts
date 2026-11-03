import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { createLink, createLinkInput } from '@/app/functions/create-link'
import { isRight, unwrapEither } from '../../../../shared/either'

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create short link',
        description: 'Create a new shortened link',
        consumes: ['application/json'],
        body: createLinkInput,
        response: {
          201: z.object({
            linkId: z.uuid(),
          }),
          400: z
            .object({ message: z.string(), issues: z.array(z.unknown()) })
            .describe('Validation error'),
          409: z
            .object({ message: z.string() })
            .describe('Shortened link already exists'),
        },
      },
    },
    async (request, reply) => {
      const { originalUrl, shortUrl } = request.body

      const result = await createLink({
        originalUrl,
        shortUrl,
      })

      if (isRight(result)) {
        const { linkId } = unwrapEither(result)

        return reply.status(201).send({ linkId })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'ShortUrlAlreadyExistsError':
          return reply.status(409).send({ message: error.message })
      }
    }
  )
}
