import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export function AppShell({ children, title, action }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {action && <div>{action}</div>}
          </div>
        </header>
      )}
      <main className="max-w-lg mx-auto px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
