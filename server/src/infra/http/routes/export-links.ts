import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { exportLinks } from '@/app/functions/export-links'
import { unwrapEither } from '@/shared/either'

export const exportLinksRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links/exports',
    {
      schema: {
        summary: 'Export links',
        description: 'Exports links as CSV',
        tags: ['Links'],
        response: {
          201: z.object({
            reportUrl: z.url(),
          }),
        },
      },
    },

    async (_request, reply) => {
      const controller = new AbortController()

      reply.raw.on('close', () => {
        if (!reply.raw.writableFinished) {
          controller.abort()
        }
      })

      const result = await exportLinks({ signal: controller.signal }).catch(
        (error: unknown) => {
          if (controller.signal.aborted) {
            return null
          }

          throw error
        }
      )

      if (!result) {
        reply.hijack()
        return
      }

      const { reportUrl } = unwrapEither(result)

      return reply.status(201).send({ reportUrl })
    }
  )
}
