import * as React from "react"

export type WallpaperType = "all" | "scene" | "video" | "web" | "application"
export type SortBy = "name" | "size" | "recent"
export type SortOrder = "asc" | "desc"

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: WallpaperType
  setFilterType: (type: WallpaperType) => void
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  availableTags: string[]
  setAvailableTags: (tags: string[]) => void
  sortBy: SortBy
  setSortBy: (sort: SortBy) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<WallpaperType>("all")
  const [filterTags, setFilterTags] = React.useState<string[]>([])
  const [availableTags, setAvailableTags] = React.useState<string[]>([])
  const [sortBy, setSortBy] = React.useState<SortBy>("name")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc")

  const toggleTag = React.useCallback((tag: string) => {
    setFilterTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      filterType,
      setFilterType,
      filterTags,
      setFilterTags,
      toggleTag,
      availableTags,
      setAvailableTags,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
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

