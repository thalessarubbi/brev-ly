import { api } from '../lib/axios'

type ExportLinksResponse = { reportUrl: string }

export async function exportLinks() {
  const response = await api.post<ExportLinksResponse>('/links/exports')
  return response.data
}
