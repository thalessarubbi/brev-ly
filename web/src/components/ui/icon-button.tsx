import type { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'

const iconButton = tv({
  base: 'flex size-8 items-center justify-center rounded-sm bg-gray-200 text-gray-600 border border-transparent cursor-pointer transition-colors hover:border-blue-base disabled:opacity-50 disabled:pointer-events-none',
})

type IconButtonProps = ComponentProps<'button'> & {
  'aria-label': string
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button type="button" className={iconButton({ className })} {...props} />
  )
}
