import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/env'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
  folder: z.enum(['downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
  signal: z.instanceof(AbortSignal).optional(),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  const { folder, fileName, contentType, contentStream, signal } =
    uploadFileToStorageInput.parse(input)

  signal?.throwIfAborted()

  const fileExtension = extname(fileName)
  const fileNameWithoutExtension = basename(fileName, fileExtension)
  const sanitizedFileName = fileNameWithoutExtension.replace(
    /[^a-zA-Z0-9]/g,
    ''
  )
  const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension)

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  const abortUpload = () => {
    if (!contentStream.readableEnded) {
      void upload.abort()
    }
  }

  signal?.addEventListener('abort', abortUpload, { once: true })

  try {
    await upload.done()
  } finally {
    signal?.removeEventListener('abort', abortUpload)
  }

  if (signal?.aborted) {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: env.CLOUDFLARE_BUCKET,
        Key: uniqueFileName,
      })
    )

    signal.throwIfAborted()
  }

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}
