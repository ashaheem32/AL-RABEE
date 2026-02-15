'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Tag, TrendingUp } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  category: string;
  showDiscountOnly: boolean;
  showTopSelling: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDiscountToggle: () => void;
  onTopSellingToggle: () => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  searchTerm,
  category,
  showDiscountOnly,
  showTopSelling,
  onSearchChange,
  onCategoryChange,
  onDiscountToggle,
  onTopSellingToggle,
  onClearFilters,
}: ProductFiltersProps) {
  const hasActiveFilters =
    searchTerm || category !== 'All' || showDiscountOnly || showTopSelling;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showDiscountOnly ? 'default' : 'outline'}
            size="sm"
            onClick={onDiscountToggle}
            className={`gap-1.5 ${showDiscountOnly ? 'bg-green-700 hover:bg-green-800' : ''}`}
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Discount</span>
          </Button>

          <Button
            variant={showTopSelling ? 'default' : 'outline'}
            size="sm"
            onClick={onTopSellingToggle}
            className={`gap-1.5 ${showTopSelling ? 'bg-green-700 hover:bg-green-800' : ''}`}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Top Selling</span>
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {category !== 'All' && (
            <Badge variant="secondary" className="gap-1">
              {category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onCategoryChange('All')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
