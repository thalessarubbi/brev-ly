import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { makeShortUrl } from '@/test/factories/make-link'
import { createLink } from './create-link'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists'

describe('createLink', () => {
  afterAll(async () => {
    await pg.end()
  })

  it('should create a link', async () => {
    const shortUrl = makeShortUrl()

    const sut = await createLink({
      originalUrl: 'https://example.com',
      shortUrl,
    })

    expect(isRight(sut)).toBe(true)

    const { linkId } = unwrapEither(sut) as { linkId: string }

    const [link] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.id, linkId))

    expect(link).toMatchObject({
      originalUrl: 'https://example.com',
      shortUrl,
      accessCount: 0,
    })
  })

  it('should accept a short URL with numbers and hyphens', async () => {
    const sut = await createLink({
      originalUrl: 'https://example.com',
      shortUrl: `${makeShortUrl()}-2`,
    })

    expect(isRight(sut)).toBe(true)
  })

  it.each([
    ['uppercase letters', 'My-Link'],
    ['spaces', 'my link'],
    ['special characters', 'my_link!'],
    ['an empty string', ''],
  ])(
    'should not create a link with %s in the short URL',
    async (_, shortUrl) => {
      const sut = createLink({ originalUrl: 'https://example.com', shortUrl })

      await expect(sut).rejects.toThrow(ZodError)
    }
  )

  it('should not create a link with an existing short URL', async () => {
    const shortUrl = makeShortUrl()

    await createLink({ originalUrl: 'https://example.com', shortUrl })

    const sut = await createLink({
      originalUrl: 'https://example.com',
      shortUrl,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ShortUrlAlreadyExistsError)

    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))

    expect(links).toHaveLength(1)
  })

  it('should not create a link with an invalid original URL', async () => {
    const sut = createLink({
      originalUrl: 'not-a-url',
      shortUrl: makeShortUrl(),
    })

    await expect(sut).rejects.toThrow(ZodError)
  })
})
