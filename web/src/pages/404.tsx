import { Link } from 'react-router'
import notFoundImage from '../assets/404.svg'
import { PageTitle } from '../components/page-title'

export function NotFound() {
  return (
    <>
      <PageTitle title="Link não encontrado" />

      <div className="flex min-h-dvh items-center justify-center bg-gray-200 px-3">
        <main className="flex w-full max-w-145 flex-col items-center gap-6 rounded-lg bg-gray-100 px-5 py-12 text-center md:px-12 md:py-16">
          <img src={notFoundImage} alt="404" className="w-41 md:w-48.5" />
          <h1 className="text-xl text-gray-600">Link não encontrado</h1>
          <p className="text-md text-gray-500">
            O link que você está tentando acessar não existe, foi removido ou é
            uma URL inválida. Saiba mais em{' '}
            <Link to="/" className="text-blue-base underline">
              brev.ly
            </Link>
            .
          </p>
        </main>
      </div>
    </>
  )
}
