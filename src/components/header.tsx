'use client';

import Link from 'next/link';
import { ShoppingCart, Store, Shield } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreSelector } from './store-selector';

export function Header() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
          <Store className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">AL RABEE SUPERMARKET</span>
          <span className="sm:hidden">AL RABEE</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <StoreSelector />

          <Link href="/admin">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-green-700">
              <Shield className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
