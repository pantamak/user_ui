"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Tag,
  Share2,
  TrendingUp,
  Eye,
  Phone,
  Mail,
  X,
  SlidersHorizontal,
  Sparkles,
  MessageCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setShowSuggestions(false)
    // Products will automatically refetch due to useEffect dependency
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length > 2 && searchSuggestions?.products) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }  }

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
    setCurrentPage(1)
  }

  const removeFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith("Search:")) {
      setSearchQuery("")
    } else if (categories?.some((c) => c.label === filterToRemove)) {
      setSelectedCategory("all")
    } else if (cities?.some((c) => c.name === filterToRemove)) {
      setSelectedCity("all")
    } else if (filterToRemove.includes("FCFA")) {
      setPriceRange([0, 50000])
    }
  }

  // Main loading state - show when all critical data is loading
  const isMainLoading = productsLoading && categoriesLoading && citiesLoading

  // Error state - show when we have critical errors and no data
  const hasError = (productsError && !products.length) || (categoriesError && !categories?.length) || (citiesError && !cities?.length)

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group relative overflow-hidden hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={
              product.featured_image_url.startsWith("http")
                ? product.featured_image_url
                : `https://shop.pantamak.com${product.featured_image_url}`
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=300&width=300"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 rounded-md p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
              onClick={() => viewProduct(product)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 rounded-md p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.is_on_sale && product.discount_percentage > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-sm animate-pulse">
                -{product.discount_percentage}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <Badge variant="outline" className="text-xs">
            {product.brand}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{product.shop?.city || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">{product.shop?.name || 'Unknown Shop'}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white/50 backdrop-blur-sm border-0 hover:bg-green-50"
            onClick={() => handleContactSeller(product, "phone")}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => viewProduct(product)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="mb-4 hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={
                product.featured_image_url.startsWith("http")
                  ? product.featured_image_url
                  : `https://shop.pantamak.com${product.featured_image_url}`
              }
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=128&width=128"
              }}
            />
            {product.is_on_sale && product.discount_percentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">-{product.discount_percentage}%</Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-xl line-clamp-1">{product.name}</h3>
                  <Badge variant="outline" className="ml-2">
                    {product.brand}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {product.shop?.city || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {product.shop?.name || 'Unknown Shop'}
                  </div>
                </div>

                {/* Seller Contact Info */}
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <h4 className="font-semibold text-sm mb-2 text-gray-700">Seller Contact</h4>
                  <div className="space-y-1 text-sm">
                    {product.shop?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{product.shop.phone}</span>
                      </div>
                    )}
                    {product.shop?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{product.shop.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</div>
                {product.compare_at_price && (
                  <div className="text-sm text-muted-foreground line-through mb-4">
                    {formatPrice(product.compare_at_price)}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContactSeller(product, "phone")}
                    className="bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call Seller
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => viewProduct(product)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </h3>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Category</h4>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-0 shadow-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label} ({category.count})
              </SelectItem>
            )) || (
              <SelectItem value="loading" disabled>Loading categories...</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="font-semibold mb-3">City</h4>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-0 shadow-sm">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities?.map((city) => (
              <SelectItem key={city.name} value={city.name}>
                {city.name} ({city.product_count})
              </SelectItem>
            )) || (
              <SelectItem value="loading" disabled>Loading cities...</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="font-semibold mb-4">Price Range</h4>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} max={50000} min={0} step={500} className="mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="font-medium">{formatPrice(priceRange[0])}</span>
            <span className="font-medium">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full bg-white/50 backdrop-blur-sm border-0 shadow-sm hover:bg-white/80"
      >
        Clear All Filters
      </Button>
    </div>
  )

  const ProductQuickView = () => (
    <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {selectedProduct && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={
                    selectedProduct.featured_image_url.startsWith("http")
                      ? selectedProduct.featured_image_url
                      : `https://shop.pantamak.com${selectedProduct.featured_image_url}`
                  }
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedProduct.brand}</Badge>
                  <Badge variant="secondary">{selectedProduct.category}</Badge>
                </div>

                <p className="text-muted-foreground leading-relaxed">{selectedProduct.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedProduct.shop?.city || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>{selectedProduct.shop?.name || 'Unknown Shop'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(selectedProduct.price)}</span>
                  {selectedProduct.compare_at_price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(selectedProduct.compare_at_price)}
                    </span>
                  )}
                </div>

                {/* Seller Contact Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Contact Seller</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Tag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedProduct.shop?.name || 'Unknown Shop'}</p>
                        <p className="text-sm text-gray-600">Shop in {selectedProduct.shop?.city || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedProduct.shop?.phone || 'No phone'}</p>
                        <p className="text-sm text-gray-600">Call for inquiries</p>
                      </div>
                    </div>

                    {selectedProduct.shop?.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{selectedProduct.shop.email}</p>
                          <p className="text-sm text-gray-600">Send email inquiry</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleContactSeller(selectedProduct, "phone")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    {selectedProduct.shop?.email && (
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleContactSeller(selectedProduct, "email")}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <CardContent className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ErrorState = () => (
    <ConnectionError
      message={productsError || "Unable to connect to the server. Please check your internet connection and try again."}
      onRetry={retryAll}
      isRetrying={productsLoading}
      showOfflineMessage={isOffline}
    />
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <OfflineIndicator />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="https://shop.pantamak.com/static/img/logo.png"
                    alt="Pantamak Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                    Pantamak
                  </h1>
                  <p className="text-xs text-muted-foreground">Connecting Buyers & Sellers</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden bg-white/50 backdrop-blur-sm border-0"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    ref={searchRef}
                    placeholder="Search products, shops, or brands..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border-0 shadow-sm rounded-lg text-lg focus:bg-white transition-all duration-300"
                    onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />

                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions?.products && searchSuggestions.products.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-md border border-gray-100 z-50">
                      {searchSuggestions.products.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          onClick={() => {
                            setSearchQuery(product.name)
                            setShowSuggestions(false)
                            searchRef.current?.blur()
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{formatPrice(product.price)}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm rounded-lg"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Inline Error for Categories/Cities */}
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

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                    onClick={() => removeFilter(filter)}
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

          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <Card className="p-6 bg-white/60 backdrop-blur-sm border-0 shadow-md sticky top-24">
                <FilterSidebar />
              </Card>
            </aside>

            {/* Mobile Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetContent side="left" className="w-80 bg-white/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1">
              {/* Show main loading state when everything is loading */}
              {isMainLoading ? (
                <LoadingSkeleton />
              ) : hasError ? (
                <ErrorState />
              ) : (
                <>
                  {/* Controls */}
                  <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className="lg:hidden bg-white/50 backdrop-blur-sm border-0"
                        onClick={() => setIsFilterOpen(true)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Newest
                            </div>
                          </SelectItem>
                          <SelectItem value="featured">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Featured
                            </div>
                          </SelectItem>
                          <SelectItem value="price_asc">Price: Low to High</SelectItem>
                          <SelectItem value="price_desc">Price: High to Low</SelectItem>
                          <SelectItem value="name_asc">Name: A to Z</SelectItem>
                          <SelectItem value="name_desc">Name: Z to A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={
                          viewMode === "grid"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600"
                            : "bg-white/50 backdrop-blur-sm border-0"
                        }
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={
                          viewMode === "list"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600"
                            : "bg-white/50 backdrop-blur-sm border-0"
                        }
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Products Loading State */}
                  {productsLoading && products.length === 0 ? (
                    <LoadingSkeleton />
                  ) : products.length === 0 ? (
                    <EmptyState
                      title="No products found"
                      description="Try adjusting your search or filters to find what you're looking for."
                      action={
                        <Button onClick={clearFilters} variant="outline" className="bg-white/50 backdrop-blur-sm border-0">
                          Clear All Filters
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      <div className="mb-4 text-sm text-muted-foreground">
                        Showing {products.length} products
                        {productsLoading && " (updating...)"}
                      </div>

                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
                        <div>
                          {products.map((product) => (
                            <ProductListItem key={product.id} product={product} />
                          ))}
                        </div>
                      )}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || productsLoading}
                            className="bg-white/50 backdrop-blur-sm border-0"
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                              const page = i + 1
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  disabled={productsLoading}
                                  className={
                                    currentPage === page
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                      : "bg-white/50 backdrop-blur-sm border-0"
                                  }
                                >
                                  {page}
                                </Button>
                              )
                            })}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || productsLoading}
                            className="bg-white/50 backdrop-blur-sm border-0"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Product Quick View Modal */}
        <ProductQuickView />
      </div>
    </ErrorBoundary>
  )
}
