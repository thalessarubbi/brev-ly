import { CopyIcon } from '@phosphor-icons/react'
import { PageTitle } from '../../components/page-title'
import { Button } from '../../components/ui/button'
import { IconButton } from '../../components/ui/icon-button'
import { Input } from '../../components/ui/input'

export function Home() {
  return (
    <>
      <PageTitle title="Home" />
      <h1>Home</h1>
      <Button variant="secondary">Botão de teste</Button>
      <IconButton aria-label="Copiar link">
        <CopyIcon />
      </IconButton>
      <Input label="Título" />
    </>
  )
}
