import { Logo } from '../../components/logo'
import { NewLinkForm } from '../../components/new-link-form'
import { PageTitle } from '../../components/page-title'

export function Home() {
  return (
    <>
      <PageTitle title="Home" />

      <div className="min-h-dvh bg-gray-200">
        <main className="mx-auto flex max-w-245 flex-col gap-6 px-3 py-8 md:gap-8 md:py-22">
          <Logo className="w-24 self-center md:self-start" />
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
            <NewLinkForm />
            {/* THA-21: Meus links (md:flex-1) */}
          </div>
        </main>
      </div>
    </>
  )
}
