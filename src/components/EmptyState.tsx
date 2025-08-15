'use client'

interface EmptyStateProps {
  view: 'pending' | 'callbacks'
}

export function EmptyState({ view }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        {view === 'pending' ? 'No New Customers' : 'No Callbacks Today'}
      </h2>
      <p className="text-neutral-600 text-center max-w-md">
        {view === 'pending'
          ? 'All customers have been contacted. Check back later for new leads.'
          : 'No callbacks scheduled for today. Switch to "New Customers" to continue working.'}
      </p>
    </div>
  )
}