import { api } from '../lib/axios'

export async function deleteLink(linkId: string) {
  await api.delete(`/links/${linkId}`)
}
