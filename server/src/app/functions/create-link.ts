import z from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '../../../shared/either'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists'

export const createLinkInput = z.object({
  originalUrl: z.url().meta({ example: 'https://example.com' }),
  shortUrl: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9-]+$/, 'Use only lowercase letters, numbers and hyphens')
    .meta({ example: 'my-link' }),
})

type CreateLinkInput = z.input<typeof createLinkInput>

export async function createLink(
  input: CreateLinkInput
): Promise<Either<ShortUrlAlreadyExistsError, { linkId: string }>> {
  const { originalUrl, shortUrl } = createLinkInput.parse(input)

  const [link] = await db
    .insert(schema.links)
    .values({ originalUrl, shortUrl })
    .onConflictDoNothing({ target: schema.links.shortUrl })
    .returning()

  if (!link) {
    return makeLeft(new ShortUrlAlreadyExistsError())
  }

  return makeRight({ linkId: link.id })
}
