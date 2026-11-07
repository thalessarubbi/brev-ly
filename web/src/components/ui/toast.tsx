import {
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import * as Toast from '@radix-ui/react-toast'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

type ToastVariant = 'success' | 'error'
type ToastMessage = { id: string; title: string; variant: ToastVariant }
type ShowToast = (title: string, variant?: ToastVariant) => void

const ToastContext = createContext<ShowToast | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback<ShowToast>((title, variant = 'success') => {
    setToasts(current => [
      ...current,
      { id: crypto.randomUUID(), title, variant },
    ])
  }, [])

  function removeToast(id: string) {
    setToasts(current => current.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={showToast}>
      <Toast.Provider swipeDirection="right" duration={4000}>
        {children}

        {toasts.map(toast => (
          <Toast.Root
            key={toast.id}
            onOpenChange={open => !open && removeToast(toast.id)}
            className="flex items-center gap-3 rounded-lg bg-gray-100 p-4 shadow-lg data-[swipe=end]:hidden data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
          >
            {toast.variant === 'success' ? (
              <CheckCircleIcon className="size-5 shrink-0 text-success" />
            ) : (
              <WarningCircleIcon className="size-5 shrink-0 text-danger" />
            )}
            <Toast.Title className="flex-1 text-sm text-gray-600">
              {toast.title}
            </Toast.Title>
            <Toast.Close
              aria-label="Fechar"
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="size-4" />
            </Toast.Close>
          </Toast.Root>
        ))}

        <Toast.Viewport className="fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useToast must be used within ToastProvider')
  return showToast
}
