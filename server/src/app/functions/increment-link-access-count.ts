import { eq, sql } from 'drizzle-orm'
import z from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { LinkNotFoundError } from './errors/link-not-found'

const IncrementLinkAccessCountInput = z.object({
  linkId: z.uuid(),
})

type IncrementLinkAccessCountInput = z.input<
  typeof IncrementLinkAccessCountInput
>

type IncrementLinkAccessCountOutput = {
  id: string
  accessCount: number
}

export async function incrementLinkAccessCount(
  input: IncrementLinkAccessCountInput
): Promise<Either<LinkNotFoundError, IncrementLinkAccessCountOutput>> {
  const { linkId } = IncrementLinkAccessCountInput.parse(input)

  const [link] = await db
    .update(schema.links)
    .set({
      accessCount: sql`${schema.links.accessCount} + 1`,
    })
    .where(eq(schema.links.id, linkId))
    .returning({ id: schema.links.id, accessCount: schema.links.accessCount })

  if (!link) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(link)
}
