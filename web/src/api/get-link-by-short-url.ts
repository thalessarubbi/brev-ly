import { api } from '../lib/axios'

type GetLinkByShortUrlResponse = { id: string; originalUrl: string }

export async function getLinkByShortUrl(shortUrl: string) {
  const response = await api.get<GetLinkByShortUrlResponse>(
    `/links/${shortUrl}`
  )
  return response.data
}
