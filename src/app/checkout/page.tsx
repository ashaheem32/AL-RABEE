'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Car,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatOMR } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, curbsideDelivery, carDetails, selectedStore, getTotal, clearCart } =
    useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cashAmount, setCashAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const total = getTotal();
  const tax = total * 0.05;
  const grandTotal = total + tax;
  const cashTendered = parseFloat(cashAmount) || 0;
  const change = cashTendered - grandTotal;

  if (items.length === 0 && !orderComplete) {
    router.push('/');
    return null;
  }

  if (!selectedStore && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a store before checking out.{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push('/')}
              >
                Go back to store selection
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cash' && change < 0) {
      alert('Insufficient cash amount. Please enter more.');
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newOrderId = `ORD-${Date.now()}`;
    setOrderId(newOrderId);
    setOrderComplete(true);
    setProcessing(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-green-600">
                    Order Placed Successfully!
                  </h1>
                  <p className="text-muted-foreground">
                    Your order #{orderId} has been confirmed
                  </p>

                  {curbsideDelivery && (
                    <Alert className="bg-green-50 border-green-200 text-left">
                      <Car className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Curbside Pickup Selected</strong>
                        <br />
                        Car Number: <strong>{carDetails.carNumber}</strong>
                        {carDetails.driverName && (
                          <>
                            <br />
                            Driver: <strong>{carDetails.driverName}</strong>
                          </>
                        )}
                        <br />
                        Please pull up to the designated curbside area. Our staff
                        will deliver your items to your vehicle.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4 space-y-2 text-left">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-semibold capitalize">
                        {paymentMethod}
                      </span>
                    </div>
                    {paymentMethod === 'cash' && (
                      <>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-semibold">
                            {formatOMR(grandTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Cash Tendered</span>
                          <span className="font-semibold">
                            {formatOMR(cashTendered)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-t font-semibold text-green-600">
                          <span>Change</span>
                          <span>{formatOMR(change)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-6">
                    <Button
                      onClick={() => {
                        clearCart();
                        router.push('/');
                      }}
                      className="w-full bg-green-700 hover:bg-green-800"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Car className="h-6 w-6 text-green-700" />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {curbsideDelivery
                        ? 'Curbside Pickup'
                        : 'In-Store Pickup'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {curbsideDelivery
                        ? "We'll deliver items to your vehicle"
                        : 'Pick up your items inside the store'}
                    </p>
                    {curbsideDelivery && carDetails.carNumber && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Car:</span>{' '}
                        <span className="font-medium">{carDetails.carNumber}</span>
                        {carDetails.driverName && (
                          <>
                            {' '}<span className="text-muted-foreground">| Driver:</span>{' '}
                            <span className="font-medium">{carDetails.driverName}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant={curbsideDelivery ? 'default' : 'secondary'}
                    className={curbsideDelivery ? 'bg-green-700' : ''}
                  >
                    {curbsideDelivery ? 'Curbside' : 'In-Store'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'card' | 'cash') =>
                    setPaymentMethod(value)
                  }
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Card Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with credit or debit card
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <Banknote className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Cash Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Pay with cash on pickup
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'cash' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="cashAmount">Cash Amount Tendered (OMR)</Label>
                      <Input
                        id="cashAmount"
                        type="number"
                        step="0.001"
                        min={grandTotal}
                        placeholder={`Minimum ${formatOMR(grandTotal)}`}
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the amount of cash you&apos;ll provide
                      </p>
                    </div>

                    {cashAmount && cashTendered >= grandTotal && (
                      <Alert className="bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Change to return: {formatOMR(change)}</strong>
                          <br />
                          Our staff will provide the change when delivering your
                          items.
                        </AlertDescription>
                      </Alert>
                    )}

                    {cashAmount && cashTendered < grandTotal && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Insufficient amount. You need at least{' '}
                          {formatOMR(grandTotal)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatOMR(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (5%)</span>
                    <span className="font-semibold">{formatOMR(tax)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-green-700">{formatOMR(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full h-12 text-lg bg-green-700 hover:bg-green-800"
                  disabled={
                    processing ||
                    (paymentMethod === 'cash' && change < 0) ||
                    (paymentMethod === 'cash' && !cashAmount)
                  }
                >
                  {processing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatOMR(grandTotal)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
