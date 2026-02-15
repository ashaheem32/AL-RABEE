'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Car,
  Package,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatOMR } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    curbsideDelivery,
    carDetails,
    updateQuantity,
    removeItem,
    clearCart,
    setCurbsideDelivery,
    setCarDetails,
    getTotal,
  } = useCartStore();

  const total = getTotal();
  const tax = total * 0.05; // 5% VAT in Oman
  const grandTotal = total + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={() => router.push('/')} className="bg-green-700 hover:bg-green-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive"
              >
                Clear Cart
              </Button>
            </div>

            {items.map((item) => {
              const finalPrice = item.product.discount
                ? item.product.price * (1 - item.product.discount / 100)
                : item.product.price;

              return (
                <Card key={item.product.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm sm:text-lg line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {item.product.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.product.id)}
                            className="text-destructive h-8 w-8 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{item.product.category}</Badge>
                          {item.product.discount && (
                            <Badge variant="destructive" className="text-xs">
                              {item.product.discount}% OFF
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-base sm:text-lg font-bold text-green-700">
                              {formatOMR(finalPrice * item.quantity)}
                            </p>
                            {item.product.discount && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatOMR(item.product.price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Curbside Delivery Option */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Car className="h-5 w-5 text-green-700 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Curbside Pickup</h4>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll bring your order to your vehicle
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="curbside" className="cursor-pointer text-sm">
                        Enable curbside pickup
                      </Label>
                      <Switch
                        id="curbside"
                        checked={curbsideDelivery}
                        onCheckedChange={setCurbsideDelivery}
                      />
                    </div>

                    {/* Car Details Form */}
                    {curbsideDelivery && (
                      <div className="mt-4 pt-3 border-t border-green-200 space-y-3">
                        <div>
                          <Label htmlFor="carNumber" className="text-sm font-medium">
                            Car Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="carNumber"
                            placeholder="e.g. 12345 / AB"
                            value={carDetails.carNumber}
                            onChange={(e) => setCarDetails({ carNumber: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="driverName" className="text-sm font-medium">
                            Driver Name <span className="text-muted-foreground text-xs">(optional)</span>
                          </Label>
                          <Input
                            id="driverName"
                            placeholder="Your name"
                            value={carDetails.driverName || ''}
                            onChange={(e) => setCarDetails({ driverName: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatOMR(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (5%)</span>
                    <span className="font-semibold">{formatOMR(tax)}</span>
                  </div>
                  {curbsideDelivery && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Curbside Service</span>
                      <span className="font-semibold">FREE</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-green-700">{formatOMR(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => router.push('/checkout')}
                  className="w-full h-12 text-lg bg-green-700 hover:bg-green-800"
                  disabled={curbsideDelivery && !carDetails.carNumber.trim()}
                >
                  Proceed to Checkout
                </Button>
                {curbsideDelivery && !carDetails.carNumber.trim() && (
                  <p className="text-xs text-red-500 text-center">
                    Please enter your car number for curbside pickup
                  </p>
                )}

                {/* Items Info */}
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{items.length} item(s) in cart</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
