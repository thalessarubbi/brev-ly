import { CheckIcon, CopyIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { Link } from '../api/get-links'
import { env } from '../env'
import { IconButton } from './ui/icon-button'

export function LinkItem({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false)
  const shortLinkUrl = `${env.VITE_FRONTEND_URL}/${link.shortUrl}`

  async function handleCopy() {
    await navigator.clipboard.writeText(shortLinkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li className="flex items-center gap-4 border-t border-gray-200 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <a
          href={shortLinkUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-md text-blue-base"
        >
          brev.ly/{link.shortUrl}
        </a>
        <span className="truncate text-sm text-gray-500">
          {link.originalUrl}
        </span>
      </div>

      <span className="shrink-0 text-sm text-gray-500">
        {link.accessCount} {link.accessCount === 1 ? 'acesso' : 'acessos'}
      </span>

      <div className="flex shrink-0 gap-1">
        <IconButton
          aria-label={copied ? 'Link copiado' : 'Copiar link'}
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </IconButton>

        <IconButton aria-label="Excluir link">
          <TrashIcon className="size-4" />
        </IconButton>
      </div>
    </li>
  )
}
