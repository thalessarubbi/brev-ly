import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { getLinkByShortUrl } from '../../api/get-link-by-short-url'
import { incrementLinkAccessCount } from '../../api/increment-link-access-count'
import logoIcon from '../../assets/logo-icon.svg'
import { PageTitle } from '../../components/page-title'
import { NotFound } from '../404'

export function ShortUrl() {
  const { shortUrl = '' } = useParams()
  const hasRedirected = useRef(false)

  const { data: link, isError } = useQuery({
    queryKey: ['link', shortUrl],
    queryFn: () => getLinkByShortUrl(shortUrl),
  })

  useEffect(() => {
    if (!link || hasRedirected.current) return
    hasRedirected.current = true

    incrementLinkAccessCount(link.id)
      .catch(() => {})
      .finally(() => window.location.replace(link.originalUrl))
  }, [link])

  if (isError) return <NotFound />

  return (
    <>
      <PageTitle title="Redirecionando" />

      <div className="flex min-h-dvh items-center justify-center bg-gray-200 px-3">
        <main className="flex w-full max-w-145 flex-col items-center gap-6 rounded-lg bg-gray-100 px-5 py-12 text-center md:px-12 md:py-16">
          <img src={logoIcon} alt="" className="size-12" />
          <h1 className="text-xl text-gray-600">Redirecionando...</h1>
          <div className="flex flex-col gap-1 text-md text-gray-500">
            <p>O link será aberto automaticamente em alguns instantes.</p>
            <p>
              Não foi redirecionado?{' '}
              {link && (
                <a href={link.originalUrl} className="text-blue-base underline">
                  Acesse aqui
                </a>
              )}
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
