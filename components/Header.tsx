import React from 'react'
import { Search, Filter, Grid, List, MapPin, Bell, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  setIsFilterOpen: (open: boolean) => void
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
}

export function Header({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  setIsFilterOpen,
  showSuggestions,
  setShowSuggestions
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-pantamak-blue-600 via-primary to-pantamak-purple-600 shadow-lg">
      <div className="container-padding">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Image
                src="/pantamak-logo.png"
                alt="Pantamak"
                width={32}
                height={32}
                className="rounded-sm"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-white">Pantamak</h1>
              <p className="text-xs text-white/80">Connecting Buyers & Sellers</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products, shops, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-muted focus:bg-background transition-all duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className="relative text-white hover:bg-white/20 border-white/30 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center space-x-1 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-7 px-2 transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Grid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-7 px-2 transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <List className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/20 border-white/30 transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white border-2 border-white/20">
                3
              </Badge>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 border-white/30 transition-all duration-200"
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/20 border-white/30 transition-all duration-200"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
