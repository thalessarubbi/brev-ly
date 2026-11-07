import {
  CheckIcon,
  CopyIcon,
  SpinnerIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { deleteLink } from '../api/delete-link'
import type { Link } from '../api/get-links'
import { env } from '../env'
import { queryClient } from '../lib/query-client'
import { IconButton } from './ui/icon-button'
import { useToast } from './ui/toast'

export function LinkItem({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false)
  const shortLinkUrl = `${env.VITE_FRONTEND_URL}/${link.shortUrl}`
  const toast = useToast()

  const { mutateAsync: deleteLinkFn, isPending: isDeleting } = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortLinkUrl)
      setCopied(true)
      toast('Link copiado.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Não foi possível copiar o link.', 'error')
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Você realmente quer apagar o link ${link.shortUrl}?`))
      return

    try {
      await deleteLinkFn(link.id)
      toast('Link apagado.')
    } catch {
      toast('Não foi possível apagar o link. Tente novamente.', 'error')
    }
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

        <IconButton
          aria-label="Excluir link"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <SpinnerIcon className="size-4 animate-spin" />
          ) : (
            <TrashIcon className="size-4" />
          )}
        </IconButton>
      </div>
    </li>
  )
}
