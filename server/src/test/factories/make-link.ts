import { faker } from '@faker-js/faker'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

type LinkInsert = typeof schema.links.$inferInsert

export function makeShortUrl() {
  return faker.string.alphanumeric({ length: 10, casing: 'lower' })
}

export async function makeLink(overrides?: Partial<LinkInsert>) {
  const originalUrl = faker.internet.url()

  const [link] = await db
    .insert(schema.links)
    .values({
      originalUrl,
      shortUrl: makeShortUrl(),
      ...overrides,
    })
    .returning()

  return link
}
