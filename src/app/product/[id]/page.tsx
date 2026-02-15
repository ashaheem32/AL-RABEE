'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';
import { formatOMR } from '@/lib/utils';
import {
  ShoppingCart,
  ArrowLeft,
  MapPin,
  Package,
  Warehouse,
  TrendingUp,
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const totalStock = product.inventory.store + product.inventory.warehouse;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-4 py-2">
                {product.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline">{product.category}</Badge>
                {product.isTopSelling && (
                  <Badge className="bg-orange-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top Seller
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-purple-500">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-green-700">
                {formatOMR(finalPrice)}
              </span>
              {product.discount && (
                <>
                  <span className="text-xl sm:text-2xl text-muted-foreground line-through">
                    {formatOMR(product.price)}
                  </span>
                  <Badge variant="destructive" className="text-sm">
                    Save {formatOMR(product.price - finalPrice)}
                  </Badge>
                </>
              )}
            </div>

            {/* Inventory Status */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Store Stock
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold">
                    {product.inventory.store}
                  </p>
                  <p className="text-xs text-muted-foreground">units in-store</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Warehouse
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold">
                    {product.inventory.warehouse}
                  </p>
                  <p className="text-xs text-muted-foreground">units available</p>
                </CardContent>
              </Card>
            </div>

            {/* Item Locator */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Item Location
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground">Aisle</span>
                    <p className="font-semibold">{product.location.aisle}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Section</span>
                    <p className="font-semibold">{product.location.section}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-medium text-sm">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                  disabled={quantity >= totalStock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg bg-green-700 hover:bg-green-800"
              disabled={totalStock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
