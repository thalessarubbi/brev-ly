import { api } from '../lib/axios'

type CreateLinkBody = { originalUrl: string; shortUrl: string }
type CreateLinkResponse = { linkId: string }

export async function createLink(body: CreateLinkBody) {
  const response = await api.post<CreateLinkResponse>('/links', body)
  return response.data
}
