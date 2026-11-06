import { WarningIcon } from '@phosphor-icons/react'
import { type ComponentProps, useId } from 'react'
import { tv } from 'tailwind-variants'

const input = tv({
  slots: {
    label:
      'text-xs uppercase text-gray-500 transition-colors group-focus-within:font-bold group-focus-within:text-blue-base',
    box: 'flex h-12 items-center rounded-lg border border-gray-300 px-4 transition-colors focus-within:border-[1.5px] focus-within:border-blue-base',
    prefix: 'text-md font-normal text-gray-400',
    field:
      'min-w-0 flex-1 bg-transparent text-md font-normal text-gray-600 caret-blue-base outline-none placeholder:text-gray-400',
  },
  variants: {
    error: {
      true: {
        label: 'font-bold text-danger group-focus-within:text-danger',
        box: 'border-[1.5px] border-danger focus-within:border-danger',
      },
    },
  },
})

type InputProps = ComponentProps<'input'> & {
  label: string
  error?: string
}

export function Input({
  label,
  error,
  prefix,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const styles = input({ error: Boolean(error) })

  return (
    <div className="group flex flex-col gap-2">
      <label htmlFor={inputId} className={styles.label()}>
        {label}
      </label>

      <div className={styles.box()}>
        {prefix && <span className={styles.prefix()}>{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={styles.field({ className })}
          {...props}
        />
      </div>

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
