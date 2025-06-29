import React from 'react'
import { X, Star, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Category, City } from '@/lib/api'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  cities: City[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedCity: string
  setSelectedCity: (city: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  sortBy: string
  setSortBy: (sort: string) => void
  activeFilters: string[]
  setActiveFilters: (filters: string[]) => void
  variant?: 'sheet' | 'sidebar' // New prop to control rendering mode
}

const ratingOptions = [
  { value: '4', label: '4+ Stars', count: 156 },
  { value: '3', label: '3+ Stars', count: 289 },
  { value: '2', label: '2+ Stars', count: 423 },
  { value: '1', label: '1+ Stars', count: 567 },
]

const conditionOptions = [
  { value: 'new', label: 'New', count: 234 },
  { value: 'like-new', label: 'Like New', count: 145 },
  { value: 'good', label: 'Good', count: 312 },
  { value: 'fair', label: 'Fair', count: 89 },
]

export function FilterSidebar({
  isOpen,
  onClose,
  categories,
  cities,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  activeFilters,
  setActiveFilters,
  variant = 'sheet'
}: FilterSidebarProps) {
  const [selectedRatings, setSelectedRatings] = React.useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>([])

  const clearAllFilters = () => {
    setSelectedCategory('all')
    setSelectedCity('all')
    setPriceRange([0, 50000])
    setSortBy('newest')
    setSelectedRatings([])
    setSelectedConditions([])
    setActiveFilters([])
  }

  const handleRatingChange = (rating: string, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, rating])
    } else {
      setSelectedRatings(selectedRatings.filter(r => r !== rating))
    }
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition])
    } else {
      setSelectedConditions(selectedConditions.filter(c => c !== condition))
    }
  }

  const totalActiveFilters = activeFilters.length + selectedRatings.length + selectedConditions.length

  // Filter content component
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="font-medium">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <h3 className="font-medium">Category</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
                <span className="ml-auto text-muted-foreground text-xs">
                  ({category.count || 0})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-3">
        <h3 className="font-medium flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </h3>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities?.map((city) => (
              <SelectItem key={city.name} value={city.name}>
                {city.name}
                <span className="ml-auto text-muted-foreground text-xs">
                  ({city.product_count || 0})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium">Price Range (XAF)</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={50000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{priceRange[0].toLocaleString()}</span>
            <span>{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-medium flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>Customer Rating</span>
        </h3>
        <div className="space-y-2">
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${option.value}`}
                checked={selectedRatings.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleRatingChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`rating-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                {option.label}
              </label>
              <span className="text-xs text-muted-foreground">({option.count})</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Condition */}
      <div className="space-y-3">
        <h3 className="font-medium">Condition</h3>
        <div className="space-y-2">
          {conditionOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${option.value}`}
                checked={selectedConditions.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleConditionChange(option.value, checked as boolean)
                }
              />
              <label
                htmlFor={`condition-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
              >
                {option.label}
              </label>
              <span className="text-xs text-muted-foreground">({option.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Mobile Sheet Mode
  if (variant === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                {totalActiveFilters > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalActiveFilters}
                  </Badge>
                )}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          </SheetHeader>

          <div className="px-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <FilterContent />
            <div className="h-6" /> {/* Bottom spacing */}
          </div>

          {/* Apply Button */}
          <div className="p-6 border-t bg-background">
            <Button
              className="w-full"
              onClick={onClose}
              size="lg"
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Sidebar Mode
  return (
    <div className="w-80 bg-card border-r border-border h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filters</span>
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalActiveFilters}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <FilterContent />
      </div>
    </div>
  )

}
