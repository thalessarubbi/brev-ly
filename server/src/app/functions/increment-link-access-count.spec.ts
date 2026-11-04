import { uuidv7 } from 'uuidv7'
import { afterAll, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { pg } from '@/infra/db'
import { makeLink } from '@/test/factories/make-link'
import { isLeft, isRight, unwrapEither } from '../../../shared/either'
import { LinkNotFoundError } from './errors/link-not-found'
import { incrementLinkAccessCount } from './increment-link-access-count'

describe('incrementLinkAccessCount', () => {
  afterAll(async () => {
    await pg.end()
  })

  it('should increment the access count of a link', async () => {
    const link = await makeLink()

    const sut = await incrementLinkAccessCount({ linkId: link.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({ id: link.id, accessCount: 1 })
  })

  it('should increment the access count on every call', async () => {
    const link = await makeLink()

    await incrementLinkAccessCount({ linkId: link.id })
    const sut = await incrementLinkAccessCount({ linkId: link.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({ id: link.id, accessCount: 2 })
  })

  it('should not increment the access count of a non-existing link', async () => {
    const sut = await incrementLinkAccessCount({ linkId: uuidv7() })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should not increment the access count with an invalid id', async () => {
    const sut = incrementLinkAccessCount({ linkId: 'invalid-id' })

    await expect(sut).rejects.toThrow(ZodError)
  })
})
