import { eq } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import { afterAll, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { deleteLink } from './delete-link'
import { LinkNotFoundError } from './errors/link-not-found'

describe('deleteLink', () => {
  afterAll(async () => {
    await pg.end()
  })

  it('should delete a link', async () => {
    const link = await makeLink()

    const sut = await deleteLink({ linkId: link.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({ id: link.id })

    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.id, link.id))

    expect(links).toHaveLength(0)
  })

  it('should only delete the given link', async () => {
    const link = await makeLink()
    const otherLink = await makeLink()

    await deleteLink({ linkId: link.id })

    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.id, otherLink.id))

    expect(links).toHaveLength(1)
  })

  it('should not delete a non-existing link', async () => {
    const sut = await deleteLink({ linkId: uuidv7() })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should not delete a link twice', async () => {
    const link = await makeLink()

    await deleteLink({ linkId: link.id })
    const sut = await deleteLink({ linkId: link.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should not delete a link with an invalid id', async () => {
    const sut = deleteLink({ linkId: 'invalid-id' })

    await expect(sut).rejects.toThrow(ZodError)
  })
})
