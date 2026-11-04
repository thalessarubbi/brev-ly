import { count, desc } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/shared/either'

export const GetLinksInput = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

type GetLinksInput = z.input<typeof GetLinksInput>

type GetLinksOutput = {
  links: {
    id: string
    originalUrl: string
    shortUrl: string
    accessCount: number
    createdAt: Date
  }[]
  total: number
}

export async function getLinks(
  input: GetLinksInput
): Promise<Either<never, GetLinksOutput>> {
  const { page, pageSize } = GetLinksInput.parse(input)

  const [links, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .orderBy(desc(schema.links.createdAt), desc(schema.links.id))
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db.select({ total: count(schema.links.id) }).from(schema.links),
  ])

  return makeRight({ links, total })
}
