import { randomUUID } from 'node:crypto'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

type LinkInsert = typeof schema.links.$inferInsert

export function makeShortUrl() {
  return `test-${randomUUID().slice(0, 8)}`
}

export async function makeLink(overrides?: Partial<LinkInsert>) {
  const [link] = await db
    .insert(schema.links)
    .values({
      originalUrl: 'https://example.com',
      shortUrl: makeShortUrl(),
      ...overrides,
    })
    .returning()

  return link
}
