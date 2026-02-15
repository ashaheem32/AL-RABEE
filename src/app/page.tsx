'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { categories } from '@/lib/mock-data';
import { Star } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [showTopSelling, setShowTopSelling] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
  }, [searchTerm, category, showDiscountOnly, showTopSelling]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category !== 'All') params.append('category', category);
      if (showDiscountOnly) params.append('discountOnly', 'true');
      if (showTopSelling) params.append('topSelling', 'true');

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true');
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.data.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setShowDiscountOnly(false);
    setShowTopSelling(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-green-700 to-green-600 text-white p-6 sm:p-8 md:p-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Welcome to AL RABEE
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90">
            Fresh groceries delivered to your car. Shop online, pick up curbside.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        {!showDiscountOnly && !showTopSelling && !searchTerm && category === 'All' && featuredProducts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters
            searchTerm={searchTerm}
            category={category}
            showDiscountOnly={showDiscountOnly}
            showTopSelling={showTopSelling}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategory}
            onDiscountToggle={() => setShowDiscountOnly(!showDiscountOnly)}
            onTopSellingToggle={() => setShowTopSelling(!showTopSelling)}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-5">
            {category !== 'All'
              ? category
              : showDiscountOnly
              ? 'Discount Items'
              : showTopSelling
              ? 'Top Selling Items'
              : 'All Products'}
            {!loading && <span className="text-sm font-normal text-muted-foreground ml-2">({products.length} items)</span>}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
