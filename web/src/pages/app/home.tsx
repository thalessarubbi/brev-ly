import { LinksList } from '../../components/links-list'
import { Logo } from '../../components/logo'
import { NewLinkForm } from '../../components/new-link-form'
import { PageTitle } from '../../components/page-title'

export function Home() {
  return (
    <>
      <PageTitle title="Home" />

      <div className="h-dvh overflow-hidden bg-gray-200">
        <main className="mx-auto flex h-full max-w-245 flex-col gap-6 px-3 py-8 md:gap-8 md:py-22">
          <Logo className="w-24 self-center md:self-start" />
          <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-start md:gap-5">
            <NewLinkForm />
            <LinksList />
          </div>
        </main>
      </div>
    </>
  )
}
