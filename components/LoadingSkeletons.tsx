import React from 'react'

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm">
        <div className="h-6 bg-muted rounded w-48 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            {/* Image skeleton */}
            <div className="aspect-square bg-muted animate-pulse" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />

              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                <div className="h-8 bg-muted rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-8 bg-muted rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-24 animate-pulse" />
              <div className="h-3 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="h-10 bg-muted rounded-md animate-pulse" />
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
