import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import type {
  CompatibilityStatus,
  WallpaperFilterType,
  SortBy,
  SortOrder,
} from "../../shared/constants"

export type { WallpaperFilterType, SortBy, SortOrder }

// --- Search query context (search input only) ---

interface SearchQueryContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchQueryContext = createContext<SearchQueryContextType | undefined>(undefined)

// --- Sort context ---

interface SortContextType {
  sortBy: SortBy
  setSortBy: (sort: SortBy) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
}

const SortContext = createContext<SortContextType | undefined>(undefined)

// --- Filter context ---

interface FilterContextType {
  filterType: WallpaperFilterType
  setFilterType: (type: WallpaperFilterType) => void
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  availableTags: string[]
  setAvailableTags: (tags: string[]) => void
  filterCompatibility: CompatibilityStatus[]
  setFilterCompatibility: (statuses: CompatibilityStatus[]) => void
  toggleFilterCompatibility: (status: CompatibilityStatus) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

// --- Combined provider ---

export function SearchProvider({ children }: { children: ReactNode }) {
  const { data: settings } = trpc.settings.get.useQuery()
  const updateSettings = trpc.settings.update.useMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<WallpaperFilterType>("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [filterCompatibility, setFilterCompatibility] = useState<CompatibilityStatus[]>([])
  const [initialized, setInitialized] = useState(false)

  // Load persisted preferences on mount
  useEffect(() => {
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
  const persist = useCallback((partial: Record<string, unknown>) => {
    updateSettings.mutate(partial)
  }, [updateSettings])

  // --- Search query handlers ---

  const searchQueryValue = useMemo(() => ({
    searchQuery,
    setSearchQuery,
  }), [searchQuery])

  // --- Sort handlers ---

  const handleSetSortBy = useCallback((sort: SortBy) => {
    setSortBy(sort)
    persist({ sortBy: sort })
  }, [persist])

  const handleSetSortOrder = useCallback((order: SortOrder) => {
    setSortOrder(order)
    persist({ sortOrder: order })
  }, [persist])

  const sortValue = useMemo(() => ({
    sortBy,
    setSortBy: handleSetSortBy,
    sortOrder,
    setSortOrder: handleSetSortOrder,
  }), [sortBy, sortOrder, handleSetSortBy, handleSetSortOrder])

  // --- Filter handlers ---

  const handleSetFilterType = useCallback((type: WallpaperFilterType) => {
    setFilterType(type)
    persist({ filterType: type })
  }, [persist])

  const handleSetFilterTags = useCallback((tags: string[]) => {
    setFilterTags(tags)
    persist({ filterTags: tags })
  }, [persist])

  const handleToggleTag = useCallback((tag: string) => {
    setFilterTags(prev => {
      const next = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      persist({ filterTags: next })
      return next
    })
  }, [persist])

  const handleSetFilterCompatibility = useCallback((statuses: CompatibilityStatus[]) => {
    setFilterCompatibility(statuses)
    persist({ filterCompatibility: statuses })
  }, [persist])

  const handleToggleFilterCompatibility = useCallback((status: CompatibilityStatus) => {
    setFilterCompatibility(prev => {
      const next = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
      persist({ filterCompatibility: next })
      return next
    })
  }, [persist])

  const filterValue = useMemo(() => ({
    filterType,
    setFilterType: handleSetFilterType,
    filterTags,
    setFilterTags: handleSetFilterTags,
    toggleTag: handleToggleTag,
    availableTags,
    setAvailableTags,
    filterCompatibility,
    setFilterCompatibility: handleSetFilterCompatibility,
    toggleFilterCompatibility: handleToggleFilterCompatibility,
  }), [filterType, filterTags, availableTags, filterCompatibility, handleSetFilterType, handleSetFilterTags, handleToggleTag, handleSetFilterCompatibility, handleToggleFilterCompatibility])

  return (
    <SearchQueryContext.Provider value={searchQueryValue}>
      <SortContext.Provider value={sortValue}>
        <FilterContext.Provider value={filterValue}>
          {children}
        </FilterContext.Provider>
      </SortContext.Provider>
    </SearchQueryContext.Provider>
  )
}

// --- Hooks ---

export function useSearchQuery() {
  const context = useContext(SearchQueryContext)
  if (!context) {
    throw new Error("useSearchQuery must be used within SearchProvider")
  }
  return context
}

export function useSort() {
  const context = useContext(SortContext)
  if (!context) {
    throw new Error("useSort must be used within SearchProvider")
  }
  return context
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilter must be used within SearchProvider")
  }
  return context
}

// Convenience hook that combines all three (for WallpaperGrid)
export function useSearch() {
  return {
    ...useSearchQuery(),
    ...useSort(),
    ...useFilter(),
  }
}

