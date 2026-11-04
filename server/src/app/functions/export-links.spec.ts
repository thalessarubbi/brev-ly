import { text } from 'node:stream/consumers'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { isRight, unwrapEither } from '@/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { exportLinks } from './export-links'

vi.mock('@/infra/storage/upload-file-to-storage', () => ({
  uploadFileToStorage: vi.fn(),
}))

const uploadFileToStorageMock = vi.mocked(uploadFileToStorage)

let uploadedCsv: string

describe('exportLinks', () => {
  beforeEach(async () => {
    await db.delete(schema.links)

    uploadedCsv = ''

    uploadFileToStorageMock.mockReset()
    uploadFileToStorageMock.mockImplementation(async ({ contentStream }) => {
      uploadedCsv = await text(contentStream)

      return {
        key: 'downloads/report.csv',
        url: 'https://pub-test.r2.dev/downloads/report.csv',
      }
    })
  })

  afterAll(async () => {
    await pg.end()
  })

  function csvRows() {
    return uploadedCsv.trim().split('\n').slice(1)
  }

  it('should return the public URL of the exported CSV', async () => {
    await makeLink()

    const sut = await exportLinks()

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      reportUrl: 'https://pub-test.r2.dev/downloads/report.csv',
    })
  })

  it('should upload a CSV file to the downloads folder', async () => {
    await makeLink()

    await exportLinks()

    expect(uploadFileToStorageMock).toHaveBeenCalledOnce()
    expect(uploadFileToStorageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'downloads',
        contentType: 'text/csv',
        fileName: expect.stringMatching(/\.csv$/),
      })
    )
  })

  it('should export every link field, newest first', async () => {
    const oldest = await makeLink({
      accessCount: 3,
      createdAt: new Date('2026-01-01T15:30:00Z'),
    })
    const newest = await makeLink({
      accessCount: 7,
      createdAt: new Date('2026-01-02T15:30:00Z'),
    })

    await exportLinks()

    const [firstRow, secondRow] = csvRows().map(row => row.split(','))

    expect(firstRow).toEqual([
      newest.id,
      newest.originalUrl,
      newest.shortUrl,
      '7',
      '02/01/2026 12:30:00',
    ])
    expect(secondRow).toEqual([
      oldest.id,
      oldest.originalUrl,
      oldest.shortUrl,
      '3',
      '01/01/2026 12:30:00',
    ])
  })

  it('should format the creation date in São Paulo time', async () => {
    await makeLink({ createdAt: new Date('2026-03-01T01:05:00Z') })

    await exportLinks()

    const [row] = csvRows().map(r => r.split(','))

    expect(row.at(-1)).toBe('28/02/2026 22:05:00')
  })

  it('should export only the header when there are no links', async () => {
    await exportLinks()

    expect(uploadedCsv.trim().split('\n')).toHaveLength(1)
    expect(csvRows()).toHaveLength(0)
  })

  it('should export all links across multiple cursor batches', async () => {
    await db.insert(schema.links).values(
      Array.from({ length: 1200 }, (_, index) => ({
        originalUrl: 'https://example.com',
        shortUrl: `batch-${index}`,
      }))
    )

    await exportLinks()

    expect(csvRows()).toHaveLength(1200)
  })
})
