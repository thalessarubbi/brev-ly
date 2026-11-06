import {
  DownloadSimpleIcon,
  LinkIcon,
  SpinnerIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { exportLinks } from '../api/export-links'
import { getLinks } from '../api/get-links'
import { LinkItem } from './link-item'
import { Button } from './ui/button'

export function LinksList() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['links'],
    queryFn: ({ pageParam }) => getLinks({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.links.length, 0)
      return loaded < lastPage.total ? allPages.length + 1 : undefined
    },
  })
  const { mutateAsync: exportLinksFn, isPending: isExporting } = useMutation({
    mutationFn: exportLinks,
  })

  const links = data?.pages.flatMap(page => page.links) ?? []

  async function handleExport() {
    try {
      const { reportUrl } = await exportLinksFn()

      const anchor = document.createElement('a')
      anchor.href = reportUrl
      anchor.download = ''
      anchor.click()
    } catch {
      window.alert('Não foi possível gerar o relatório. Tente novamente.')
    }
  }

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-5 rounded-lg bg-gray-100 p-6 md:min-w-0 md:flex-1 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-gray-600">Meus links</h2>
        <Button
          type="button"
          variant="secondary"
          disabled={links.length === 0 || isExporting}
          onClick={handleExport}
        >
          {isExporting ? (
            <SpinnerIcon className="size-4 animate-spin text-gray-600" />
          ) : (
            <DownloadSimpleIcon className="size-4 text-gray-600" />
          )}
          Baixar CSV
        </Button>
      </div>

      <ScrollArea.Root type="scroll" className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea.Viewport className="size-full">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-8 pb-6">
              <SpinnerIcon className="size-8 animate-spin text-gray-400" />
              <p className="text-xs uppercase text-gray-500">
                Carregando links...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-8 pb-6">
              <WarningIcon className="size-8 text-danger" />
              <p className="text-xs uppercase text-gray-500">
                Erro ao carregar os links
              </p>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-8 pb-6">
              <LinkIcon className="size-8 text-gray-400" />
              <p className="text-xs uppercase text-gray-500">
                Ainda não existem links cadastrados
              </p>
            </div>
          ) : (
            <ul className="flex flex-col pr-3">
              {links.map(link => (
                <LinkItem key={link.id} link={link} />
              ))}
            </ul>
          )}
          {hasNextPage && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </Button>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex w-1 touch-none select-none"
        >
          <ScrollArea.Thumb className="flex-1 rounded-full bg-blue-base" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}
