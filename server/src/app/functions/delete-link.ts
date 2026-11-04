import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { LinkNotFoundError } from './errors/link-not-found'

export const DeleteLinkInput = z.object({
  linkId: z.uuid(),
})

type DeleteLinkInput = z.input<typeof DeleteLinkInput>

type DeleteLinkOutput = {
  id: string
}

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<LinkNotFoundError, DeleteLinkOutput>> {
  const { linkId } = DeleteLinkInput.parse(input)

  const [link] = await db
    .delete(schema.links)
    .where(eq(schema.links.id, linkId))
    .returning({ id: schema.links.id })

  if (!link) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(link)
}
