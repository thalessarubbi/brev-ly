import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { desc, sql } from 'drizzle-orm'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import type { Either } from '@/shared/either'
import { makeRight } from '@/shared/either'

type ExportLinksInput = {
  signal?: AbortSignal
}

type ExportLinksOutput = {
  reportUrl: string
}

export async function exportLinks({
  signal,
}: ExportLinksInput = {}): Promise<Either<never, ExportLinksOutput>> {
  signal?.throwIfAborted()

  const { sql: query, params } = db
    .select({
      id: schema.links.id,
      originalUrl: schema.links.originalUrl,
      shortUrl: schema.links.shortUrl,
      accessCount: schema.links.accessCount,
      createdAt:
        sql<string>`to_char(${schema.links.createdAt} at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS')`.as(
          'created_at'
        ),
    })
    .from(schema.links)
    .orderBy(desc(schema.links.createdAt))
    .toSQL()

  const cursor = pg.unsafe(query, params as string[]).cursor(500)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'original_url', header: 'URL original' },
      { key: 'short_url', header: 'URL curta' },
      { key: 'access_count', header: 'Contagem de acessos' },
      { key: 'created_at', header: 'Criado em' },
    ],
  })

  const uploadToStorageStream = new PassThrough()

  const failure = new AbortController()
  const exportSignal = signal
    ? AbortSignal.any([signal, failure.signal])
    : failure.signal

  const abortOnFailure = (error: unknown): never => {
    failure.abort(error)
    throw error
  }

  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }

        callback()
      },
    }),
    csv,
    uploadToStorageStream,
    { signal: exportSignal }
  ).catch(abortOnFailure)

  const uploadToStorage = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-links.csv`,
    contentStream: uploadToStorageStream,
    signal: exportSignal,
  }).catch(abortOnFailure)

  const [upload] = await Promise.allSettled([
    uploadToStorage,
    convertToCSVPipeline,
  ])

  signal?.throwIfAborted()

  if (failure.signal.aborted || upload.status === 'rejected') {
    throw failure.signal.reason
  }

  return makeRight({ reportUrl: upload.value.url })
}
