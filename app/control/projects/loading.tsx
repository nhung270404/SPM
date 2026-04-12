import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* Header Loading */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32" /> {/* Title */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" /> {/* Button */}
          <Skeleton className="h-9 w-64 rounded-md hidden md:block" /> {/* Search */}
          <Skeleton className="h-9 w-24 rounded-md" /> {/* Filter */}
          <Skeleton className="h-9 w-32 rounded-md" /> {/* Add Btn */}
        </div>
      </div>

      {/* Grid Card Loading */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}