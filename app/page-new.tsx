"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, X, AlertCircle, RefreshCw, Star, MapPin, Eye, Share2, Sparkles, MessageCircle } from "lucide-react"
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
      const category = categories?.find((c) => c.slug === selectedCategory)
      if (category) filters.push(category.name)
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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    // Add to recently viewed (limit to 10 items)
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      return [product, ...filtered].slice(0, 10)
    })
  }

  const handleAddToWishlist = (product: Product) => {
    // Implement wishlist functionality
    console.log('Added to wishlist:', product.name)
  }

  const handleShare = (product: Product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support native sharing
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedCity("all")
    setPriceRange([0, 50000])
    setSortBy("newest")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Loading and error states
  const isMainLoading = productsLoading && !products.length
  const hasError = productsError && !products.length

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <OfflineIndicator isOffline={isOffline} />

        {/* Enhanced Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setIsFilterOpen={setIsFilterOpen}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
        />

        {/* Main Content */}
        <div className="container-padding py-6">
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
                    onClick={clearFilters}
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

          {/* Enhanced Filter Sidebar */}
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
          />

          {/* Loading State */}
          {isMainLoading && <LoadingSkeleton />}

          {/* Error State */}
          {hasError && (
            <div className="text-center py-12">
              <ConnectionError
                error={productsError}
                onRetry={retryProducts}
                showDetails={true}
              />
            </div>
          )}

          {/* Products Grid/List */}
          {!isMainLoading && !hasError && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {products.length > 0
                      ? `${products.length} ${products.length === 1 ? 'Product' : 'Products'} Found`
                      : 'No Products Found'
                    }
                  </h2>
                  {searchQuery && (
                    <Badge variant="outline" className="text-primary">
                      for "{searchQuery}"
                    </Badge>
                  )}
                </div>
              </div>

              {/* Products */}
              {products.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  action={{
                    label: "Clear Filters",
                    onClick: clearFilters
                  }}
                />
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard
                        product={product}
                        viewMode={viewMode}
                        onProductClick={handleProductClick}
                        onAddToWishlist={handleAddToWishlist}
                        onShare={handleShare}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          size="sm"
                        >
                          {page}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Product Detail Modal */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={selectedProduct.images?.[0] || '/placeholder.jpg'}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <Image
                            src={image}
                            alt={`${selectedProduct.name} ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedProduct.average_rating || '4.5'}</span>
                      <span className="text-muted-foreground">({selectedProduct.review_count || '12'} reviews)</span>
                    </div>

                    <div className="text-3xl font-bold text-primary mb-4">
                      {selectedProduct.currency} {selectedProduct.price?.toLocaleString()}
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Shop Information */}
                  {selectedProduct.shop && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Seller Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Shop:</strong> {selectedProduct.shop.name}</div>
                        {selectedProduct.shop.city && (
                          <div><strong>Location:</strong> {selectedProduct.shop.city}</div>
                        )}
                        {selectedProduct.shop.phone && (
                          <div><strong>Phone:</strong> {selectedProduct.shop.phone}</div>
                        )}
                        {selectedProduct.shop.email && (
                          <div><strong>Email:</strong> {selectedProduct.shop.email}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => handleContactSeller(selectedProduct, "phone")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Seller
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => handleContactSeller(selectedProduct, "email")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Seller
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => handleShare(selectedProduct)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Product
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ErrorBoundary>
  )
}
