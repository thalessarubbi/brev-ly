import { afterAll, describe, expect, it } from 'vitest'
import { pg } from '@/infra/db'
import { makeLink, makeShortUrl } from '@/test/factories/make-link'
import { isLeft, isRight, unwrapEither } from '../../../shared/either'
import { LinkNotFoundError } from './errors/link-not-found'
import { getLinkByShortUrl } from './get-link-by-short-url'

describe('getLinkByShortUrl', () => {
  afterAll(async () => {
    await pg.end()
  })

  it('should get the original URL of a short URL', async () => {
    const link = await makeLink({ originalUrl: 'https://rocketseat.com.br' })

    const sut = await getLinkByShortUrl({ shortUrl: link.shortUrl })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      id: link.id,
      originalUrl: 'https://rocketseat.com.br',
    })
  })

  it('should not get a link with a non-existing short URL', async () => {
    const sut = await getLinkByShortUrl({ shortUrl: makeShortUrl() })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should not get a link by a partial short URL', async () => {
    const link = await makeLink()

    const sut = await getLinkByShortUrl({
      shortUrl: link.shortUrl.slice(0, -2),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })
})
