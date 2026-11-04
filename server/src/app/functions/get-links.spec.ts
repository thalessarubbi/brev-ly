import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { getLinks } from './get-links'

describe('getLinks', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  afterAll(async () => {
    await pg.end()
  })

  it('should list links ordered by newest first', async () => {
    const oldest = await makeLink({ createdAt: new Date('2026-01-01') })
    const middle = await makeLink({ createdAt: new Date('2026-01-02') })
    const newest = await makeLink({ createdAt: new Date('2026-01-03') })

    const sut = await getLinks({})

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      links: [
        expect.objectContaining({ id: newest.id }),
        expect.objectContaining({ id: middle.id }),
        expect.objectContaining({ id: oldest.id }),
      ],
      total: 3,
    })
  })

  it('should return all link fields', async () => {
    const link = await makeLink()

    const sut = await getLinks({})

    expect(unwrapEither(sut)).toEqual({
      links: [
        {
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: link.shortUrl,
          accessCount: 0,
          createdAt: link.createdAt,
        },
      ],
      total: 1,
    })
  })

  it('should paginate links', async () => {
    const oldest = await makeLink({ createdAt: new Date('2026-01-01') })
    await makeLink({ createdAt: new Date('2026-01-02') })
    await makeLink({ createdAt: new Date('2026-01-03') })

    const sut = await getLinks({ page: 2, pageSize: 2 })

    expect(unwrapEither(sut)).toEqual({
      links: [expect.objectContaining({ id: oldest.id })],
      total: 3,
    })
  })

  it('should return 20 links per page by default', async () => {
    await Promise.all(Array.from({ length: 21 }, () => makeLink()))

    const sut = await getLinks({})
    const { links, total } = unwrapEither(sut)

    expect(links).toHaveLength(20)
    expect(total).toBe(21)
  })

  it('should return an empty list when there are no links', async () => {
    const sut = await getLinks({})

    expect(unwrapEither(sut)).toEqual({ links: [], total: 0 })
  })

  it('should coerce string pagination params', async () => {
    await makeLink()

    const sut = await getLinks({ page: '1', pageSize: '1' })

    expect(unwrapEither(sut).links).toHaveLength(1)
  })

  it('should not list links with a page lower than 1', async () => {
    const sut = getLinks({ page: 0 })

    await expect(sut).rejects.toThrow(ZodError)
  })

  it('should not list links with a page size greater than 100', async () => {
    const sut = getLinks({ pageSize: 101 })

    await expect(sut).rejects.toThrow(ZodError)
  })
})
