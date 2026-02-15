'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatOMR } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const totalStock = product.inventory.store + product.inventory.warehouse;
  const stockLevel = totalStock < 50 ? 'low' : totalStock < 100 ? 'medium' : 'high';

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
              {product.discount}% OFF
            </Badge>
          )}
          {product.isTopSelling && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        <Link href={`/product/${product.id}`}>
          <div className="mb-2">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-green-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
            {product.category}
          </Badge>
          {stockLevel === 'low' && (
            <Badge variant="destructive" className="text-[10px] sm:text-xs gap-0.5 px-1.5 py-0">
              <AlertTriangle className="h-2.5 w-2.5" />
              Low
            </Badge>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mb-3 mt-auto">
          <span className="text-lg sm:text-xl font-bold text-green-700">{formatOMR(finalPrice)}</span>
          {product.discount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatOMR(product.price)}
            </span>
          )}
        </div>

        <Button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="w-full bg-green-700 hover:bg-green-800 text-sm"
          size="sm"
          disabled={totalStock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
