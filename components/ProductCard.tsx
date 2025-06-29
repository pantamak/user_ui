import React from 'react'
import { Heart, Star, MapPin, Eye, Share2, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
  onProductClick: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
  onShare?: (product: Product) => void
}

export function ProductCard({
  product,
  viewMode,
  onProductClick,
  onAddToWishlist,
  onShare
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false)
  const [imageLoading, setImageLoading] = React.useState(true)

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    onAddToWishlist?.(product)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(product)
  }

  if (viewMode === 'list') {
    return (
      <Card
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
        onClick={() => onProductClick(product)}
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={product.featured_image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoading(false)}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            {/* Overlay Actions */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 backdrop-blur-sm bg-background/80"
                onClick={handleWishlist}
              >
                <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-7 w-7 backdrop-blur-sm bg-background/80"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Badges */}
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 bg-pantamak-orange-500 text-white">
                Featured
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {product.price?.toLocaleString()} FCFA
                </p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-sm text-muted-foreground line-through">
                    {product.compare_at_price.toLocaleString()} FCFA
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {product.shop && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{product.shop.city || product.shop.name}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>4.5</span>
                  <span className="text-muted-foreground">(12)</span>
                </div>
              </div>

              <Button size="sm" className="ml-auto">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in"
      onClick={() => onProductClick(product)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.featured_image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setImageLoading(false)}
        />
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 backdrop-blur-sm bg-background/80"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 backdrop-blur-sm bg-background/80"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* View Count */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-xs text-white bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
          <Eye className="h-3 w-3" />
          <span>0</span>
        </div>

        {/* Badges */}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-pantamak-orange-500 text-white">
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.5</span>
            <span className="text-xs text-muted-foreground">(12)</span>
          </div>

          {product.shop && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{product.shop.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {product.price?.toLocaleString()} FCFA
            </p>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="text-sm text-muted-foreground line-through">
                {product.compare_at_price.toLocaleString()} FCFA
              </p>
            )}
          </div>

          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ShoppingCart className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
