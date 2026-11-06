import { api } from '../lib/axios'

export type Link = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

type GetLinksResponse = { links: Link[]; total: number }

export async function getLinks({ page = 1, pageSize = 20 } = {}) {
  const response = await api.get<GetLinksResponse>('/links', {
    params: { page, pageSize },
  })
  return response.data
}
