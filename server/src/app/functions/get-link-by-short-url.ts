import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '../../../shared/either'
import { LinkNotFoundError } from './errors/link-not-found'

const GetLinkByShortUrlInput = z.object({
  shortUrl: z.string(),
})

type GetLinkByShortUrl = z.input<typeof GetLinkByShortUrlInput>

type GetLinkByShortUrlOutput = {
  id: string
  originalUrl: string
}

export async function getLinkByShortUrl(
  input: GetLinkByShortUrl
): Promise<Either<LinkNotFoundError, GetLinkByShortUrlOutput>> {
  const { shortUrl } = GetLinkByShortUrlInput.parse(input)

  const [link] = await db
    .select({
      id: schema.links.id,
      originalUrl: schema.links.originalUrl,
    })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))

  if (!link) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(link)
}
