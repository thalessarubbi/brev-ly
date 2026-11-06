import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createLink } from '../api/create-link'
import { queryClient } from '../lib/query-client'
import { Button } from './ui/button'
import { Input } from './ui/input'

const newLinkFormSchema = z.object({
  originalUrl: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
    message: 'Informe uma URL válida, começando com https://.',
  }),
  shortUrl: z
    .string()
    .min(3, 'Use pelo menos 3 caracteres.')
    .max(20, 'Use no máximo 20 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens.'),
})

type NewLinkFormData = z.infer<typeof newLinkFormSchema>

export function NewLinkForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<NewLinkFormData>({
    resolver: zodResolver(newLinkFormSchema),
  })

  const { mutateAsync: createLinkFn, isPending } = useMutation({
    mutationFn: createLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['links'] }),
  })

  async function handleCreateLink(data: NewLinkFormData) {
    try {
      await createLinkFn(data)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('shortUrl', { message: 'Essa URL encurtada já existe.' })
        return
      }
      setError('root', {
        message: 'Não foi possível salvar o link. Tente novamente.',
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleCreateLink)}
      className="flex flex-col gap-5 rounded-lg bg-gray-100 p-6 md:w-95 shrink-0 md:gap-6 md:p-8"
    >
      <h2 className="text-lg text-gray-600">Novo link</h2>
      <div className="flex flex-col gap-4">
        <Input
          label="Link original"
          placeholder="https://www.exemplo.com.br"
          error={errors.originalUrl?.message}
          {...register('originalUrl')}
        />
        <Input
          label="Link encurtado"
          prefix="brev.ly/"
          error={errors.shortUrl?.message}
          {...register('shortUrl')}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar link'}
      </Button>
      {errors.root && (
        <p className="text-sm text-danger">{errors.root.message}</p>
      )}
    </form>
  )
}
