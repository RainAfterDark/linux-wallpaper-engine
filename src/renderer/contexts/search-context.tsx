import * as React from "react"
import { trpc } from "@/lib/trpc"
import type {
  CompatibilityStatus,
  WallpaperFilterType,
  SortBy,
  SortOrder,
} from "../../shared/constants"

export type { WallpaperFilterType, SortBy, SortOrder }

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: WallpaperFilterType
  setFilterType: (type: WallpaperFilterType) => void
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  availableTags: string[]
  setAvailableTags: (tags: string[]) => void
  sortBy: SortBy
  setSortBy: (sort: SortBy) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  filterCompatibility: CompatibilityStatus[]
  setFilterCompatibility: (statuses: CompatibilityStatus[]) => void
  toggleFilterCompatibility: (status: CompatibilityStatus) => void
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = trpc.settings.get.useQuery()
  const updateSettings = trpc.settings.update.useMutation()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<WallpaperFilterType>("all")
  const [filterTags, setFilterTags] = React.useState<string[]>([])
  const [availableTags, setAvailableTags] = React.useState<string[]>([])
  const [sortBy, setSortBy] = React.useState<SortBy>("name")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")
  const [filterCompatibility, setFilterCompatibility] = React.useState<CompatibilityStatus[]>([])
  const [initialized, setInitialized] = React.useState(false)

  // Load persisted preferences on mount
  React.useEffect(() => {
    if (settings && !initialized) {
      setFilterType(settings.filterType)
      setFilterTags(settings.filterTags)
      setFilterCompatibility(settings.filterCompatibility)
      setSortBy(settings.sortBy)
      setSortOrder(settings.sortOrder)
      setInitialized(true)
    }
  }, [settings, initialized])

  // Persist filter/sort changes
  const persist = React.useCallback((partial: Record<string, unknown>) => {
    updateSettings.mutate(partial)
  }, [updateSettings])

  const handleSetFilterType = React.useCallback((type: WallpaperFilterType) => {
    setFilterType(type)
    persist({ filterType: type })
  }, [persist])

  const handleSetFilterTags = React.useCallback((tags: string[]) => {
    setFilterTags(tags)
    persist({ filterTags: tags })
  }, [persist])

  const handleToggleTag = React.useCallback((tag: string) => {
    setFilterTags(prev => {
      const next = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      persist({ filterTags: next })
      return next
    })
  }, [persist])

  const handleSetSortBy = React.useCallback((sort: SortBy) => {
    setSortBy(sort)
    persist({ sortBy: sort })
  }, [persist])

  const handleSetSortOrder = React.useCallback((order: SortOrder) => {
    setSortOrder(order)
    persist({ sortOrder: order })
  }, [persist])

  const handleSetFilterCompatibility = React.useCallback((statuses: CompatibilityStatus[]) => {
    setFilterCompatibility(statuses)
    persist({ filterCompatibility: statuses })
  }, [persist])

  const handleToggleFilterCompatibility = React.useCallback((status: CompatibilityStatus) => {
    setFilterCompatibility(prev => {
      const next = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
      persist({ filterCompatibility: next })
      return next
    })
  }, [persist])

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      filterType,
      setFilterType: handleSetFilterType,
      filterTags,
      setFilterTags: handleSetFilterTags,
      toggleTag: handleToggleTag,
      availableTags,
      setAvailableTags,
      sortBy,
      setSortBy: handleSetSortBy,
      sortOrder,
      setSortOrder: handleSetSortOrder,
      filterCompatibility,
      setFilterCompatibility: handleSetFilterCompatibility,
      toggleFilterCompatibility: handleToggleFilterCompatibility,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider")
  }
  return context
}

