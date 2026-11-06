import { WarningIcon } from '@phosphor-icons/react'
import { type ComponentProps, useId } from 'react'
import { tv } from 'tailwind-variants'

const input = tv({
  slots: {
    label:
      'text-xs uppercase text-gray-500 transition-colors group-focus-within:font-bold group-focus-within:text-blue-base',
    field:
      'h-12 w-full rounded-lg border border-gray-300 px-4 text-md font-normal text-gray-600 caret-blue-base outline-none placeholder:text-gray-400 focus:border-[1.5px] focus:border-blue-base',
  },
  variants: {
    error: {
      true: {
        label: 'font-bold text-danger group-focus-within:text-danger',
        field: 'border-[1.5px] border-danger focus:border-danger',
      },
    },
  },
})

type InputProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const styles = input({ error: Boolean(error) })

  return (
    <div className="group flex flex-col gap-2">
      <label htmlFor={inputId} className={styles.label()}>
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={styles.field({ className })}
        {...props}
      />

      {error && (
        <p
          id={errorId}
          className="flex items-center gap-2 text-sm text-gray-500"
        >
          <WarningIcon size={16} className="text-danger" />
          {error}
        </p>
      )}
    </div>
  )
}
