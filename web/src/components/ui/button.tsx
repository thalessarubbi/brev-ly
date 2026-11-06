import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none',

  variants: {
    variant: {
      primary:
        'h-12 w-full px-5 rounded-lg bg-blue-base text-md text-white hover:bg-blue-dark',
      secondary:
        'h-8 px-2 gap-1.5 rounded-sm bg-gray-200 text-sm font-semibold text-gray-500 border border-transparent hover:border-blue-base',
    },
  },

  defaultVariants: {
    variant: 'primary',
  },
})

export function Button({
  variant,
  className,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={buttonVariants({ variant, className })} {...props} />
  )
}
