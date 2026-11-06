import { api } from '../lib/axios'

export async function incrementLinkAccessCount(linkId: string) {
  await api.patch(`/links/${linkId}/access`)
}
