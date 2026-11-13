import { PassThrough, type Readable } from 'node:stream'
import { text } from 'node:stream/consumers'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { r2 } from './client'
import { uploadFileToStorage } from './upload-file-to-storage'

const upload = vi.hoisted(() => ({
  body: undefined as Readable | undefined,
  done: vi.fn<() => Promise<unknown>>(),
  abort: vi.fn<() => Promise<void>>(),
}))

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class {
    constructor(options: { params: { Body: Readable } }) {
      upload.body = options.params.Body
    }

    done() {
      return upload.done()
    }

    abort() {
      return upload.abort()
    }
  },
}))

vi.mock('./client', () => ({
  r2: { send: vi.fn() },
}))

const r2SendMock = vi.mocked(r2.send)

function makeInput(signal?: AbortSignal) {
  const contentStream = new PassThrough()
  contentStream.end('ID,URL original\n')

  return {
    folder: 'downloads' as const,
    fileName: 'report.csv',
    contentType: 'text/csv',
    contentStream,
    signal,
  }
}

describe('uploadFileToStorage', () => {
  beforeEach(() => {
    upload.body = undefined
    upload.done.mockReset()
    upload.abort.mockReset()
    r2SendMock.mockReset()
  })

  it('should return the key and public URL of the uploaded file', async () => {
    upload.done.mockImplementation(async () => {
      await text(upload.body as Readable)
    })

    const result = await uploadFileToStorage(makeInput())

    expect(result.key).toMatch(/^downloads\/.+-report\.csv$/)
    expect(result.url).toBe(`https://pub-test.r2.dev/${result.key}`)
    expect(r2SendMock).not.toHaveBeenCalled()
  })

  it('should abort the upload when aborted before the content is fully read', async () => {
    const controller = new AbortController()

    upload.done.mockImplementation(
      () =>
        new Promise((_, reject) => {
          upload.abort.mockImplementation(async () => {
            reject(
              Object.assign(new Error('Upload aborted.'), {
                name: 'AbortError',
              })
            )
          })

          controller.abort()
        })
    )

    await expect(
      uploadFileToStorage(makeInput(controller.signal))
    ).rejects.toMatchObject({ name: 'AbortError' })

    expect(upload.abort).toHaveBeenCalledOnce()
    expect(r2SendMock).not.toHaveBeenCalled()
  })

  it('should delete the file when aborted after the content is fully read', async () => {
    const controller = new AbortController()

    upload.done.mockImplementation(async () => {
      await text(upload.body as Readable)
      controller.abort()
    })

    await expect(
      uploadFileToStorage(makeInput(controller.signal))
    ).rejects.toMatchObject({ name: 'AbortError' })

    expect(upload.abort).not.toHaveBeenCalled()
    expect(r2SendMock).toHaveBeenCalledOnce()

    const [command] = r2SendMock.mock.calls[0]
    expect(command).toBeInstanceOf(DeleteObjectCommand)
    expect((command as DeleteObjectCommand).input).toEqual({
      Bucket: 'brevly-test',
      Key: expect.stringMatching(/^downloads\/.+-report\.csv$/),
    })
  })
})
