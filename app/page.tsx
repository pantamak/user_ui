"use client"

import React, { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, X, AlertCircle, RefreshCw, Star, MapPin, Eye, Share2, Sparkles, MessageCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import Image from "next/image"
import {
  useProducts,
  useCategories,
  useCities,
  useSearchSuggestions,
  useOfflineStatus
} from "@/hooks/usePantamak"
import {
  ErrorBoundary,
  ConnectionError,
  LoadingSkeleton,
  EmptyState,
  InlineError,
  OfflineIndicator
} from "@/components/ErrorBoundary"
import { Product, Category, City } from "@/lib/api"
import { Header } from "@/components/Header"
import { ProductCard } from "@/components/ProductCard"
import { FilterSidebar } from "@/components/FilterSidebar"

export default function PantamakBrowser() {
  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const searchRef = useRef<HTMLInputElement>(null)
  const isOffline = useOfflineStatus()

  // Build API parameters
  const apiParams = {
    page: currentPage,
    per_page: 20,
    ...(searchQuery && { query: searchQuery }),
    ...(selectedCategory !== "all" && { category: selectedCategory }),
    ...(selectedCity !== "all" && { city: selectedCity }),
    min_price: priceRange[0],
    max_price: priceRange[1],
    sort_by: sortBy,
  }

  // API hooks
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    retry: retryProducts
  } = useProducts(apiParams)

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories
  } = useCategories('products')

  const {
    data: cities,
    loading: citiesLoading,
    error: citiesError,
    retry: retryCities
  } = useCities()

  const {
    suggestions: searchSuggestions
  } = useSearchSuggestions(searchQuery, 300)

  // Extract data
  const products: Product[] = productsData?.products || []
  const totalPages = productsData?.pagination?.pages || 1

  // Update active filters when filters change
  useEffect(() => {
    const filters: string[] = []
    if (searchQuery) filters.push(`Search: "${searchQuery}"`)
    if (selectedCategory !== "all") {
      const category = categories?.find((c) => c.value === selectedCategory)
      if (category) filters.push(category.label)
    }
    if (selectedCity !== "all") filters.push(selectedCity)
    if (priceRange[0] > 0 || priceRange[1] < 50000) {
      filters.push(`${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`)
    }
    setActiveFilters(filters)
  }, [searchQuery, selectedCategory, selectedCity, priceRange, categories])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedCity, priceRange, sortBy])

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA"
  }

  const handleContactSeller = (product: Product, method: "phone" | "email") => {
    if (method === "phone" && product.shop?.phone) {
      window.open(`tel:${product.shop.phone}`, "_self")
    } else if (method === "email" && product.shop?.email) {
      window.open(`mailto:${product.shop.email}?subject=Inquiry about ${product.name}`, "_self")
    }
  }

  const retryAll = () => {
    retryProducts()
    retryCategories()
    retryCities()
  }

  const viewProduct = (product: Product) => {
    setSelectedProduct(product)
    // Add to recently viewed (limit to 10 items)
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      return [product, ...filtered].slice(0, 10)
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedCity("all")
    setPriceRange([0, 50000])
    setSortBy("newest")
  }

  const handleAddToWishlist = (product: Product) => {
    // TODO: Implement wishlist functionality
    console.log("Added to wishlist:", product.name)
  }

  const handleShare = (product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Loading and error states
  const isMainLoading = productsLoading && !products.length
  const hasError = productsError && !products.length
  const isEmpty = !productsLoading && !productsError && products.length === 0

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="transition-smooth"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex space-x-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={index} className="px-3 py-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className="transition-smooth"
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="transition-smooth"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Offline Indicator */}
        {isOffline && <OfflineIndicator />}

        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setIsFilterOpen={setIsFilterOpen}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
        />

        {/* Main Layout with Sidebar */}
        <div className="flex min-h-screen">
          {/* Desktop Sidebar - visible on lg and above */}
          <div className="hidden lg:block">
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              categories={categories || []}
              cities={cities || []}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              variant="sidebar"
            />
          </div>

          {/* Mobile Filter Sheet - visible on mobile and tablet */}
          <div className="lg:hidden">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              categories={categories || []}
              cities={cities || []}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              variant="sheet"
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 container-padding pt-6">
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                  {activeFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                    >
                      {filter}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}

            {/* Error States */}
            {(categoriesError && !categories?.length) && (
              <InlineError
                error={`Failed to load categories: ${categoriesError}`}
                onRetry={retryCategories}
                className="mb-4"
              />
            )}

            {(citiesError && !cities?.length) && (
              <InlineError
                error={`Failed to load cities: ${citiesError}`}
                onRetry={retryCities}
                className="mb-4"
              />
            )}

            {/* Loading State */}
            {isMainLoading && <LoadingSkeleton />}

            {/* Error State */}
            {hasError && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Failed to load products</h3>
                <p className="text-muted-foreground mb-4">{productsError}</p>
                <Button onClick={retryAll} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {isEmpty && (
              <EmptyState
                title="No products found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={
                  <Button onClick={clearFilters} variant="outline">
                    Clear filters
                  </Button>
                }
              />
            )}

            {/* Products Grid/List */}
            {products.length > 0 && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {products.length} of {productsData?.pagination?.total || 0} products
                  </p>

                  {productsLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  )}
                </div>

                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onProductClick={viewProduct}
                      onAddToWishlist={handleAddToWishlist}
                      onShare={handleShare}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination />
              </>
            )}
          </main>
        </div>

        {/* Product Detail Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={selectedProduct.featured_image_url}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary mb-2">
                        {formatPrice(selectedProduct.price)}
                      </p>
                      {selectedProduct.compare_at_price && selectedProduct.compare_at_price > selectedProduct.price && (
                        <p className="text-lg text-muted-foreground line-through">
                          {formatPrice(selectedProduct.compare_at_price)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.5</span>
                      <span className="text-muted-foreground">
                        (12 reviews)
                      </span>
                    </div>

                    <p className="text-muted-foreground">{selectedProduct.description}</p>

                    {selectedProduct.shop && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Seller Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProduct.shop.name}</span>
                          </div>
                          {selectedProduct.shop.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedProduct.shop.phone}</span>
                            </div>
                          )}
                          {selectedProduct.shop.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedProduct.shop.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => handleContactSeller(selectedProduct, "phone")}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Seller
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleContactSeller(selectedProduct, "email")}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
