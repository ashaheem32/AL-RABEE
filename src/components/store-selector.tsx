'use client';

import { useState, useEffect } from 'react';
import { Store } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Clock } from 'lucide-react';

export function StoreSelector() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { selectedStore, setSelectedStore } = useCartStore();

  useEffect(() => {
    if (!selectedStore) {
      setIsOpen(true);
    }
    fetchStores();
  }, [selectedStore]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stores');
      const data = await response.json();
      if (data.success) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (storeId: string) => {
    setSelectedStore(storeId);
    setIsOpen(false);
  };

  const selectedStoreData = stores.find((s) => s.id === selectedStore);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs sm:text-sm max-w-[200px] truncate"
      >
        <MapPin className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">
          {selectedStoreData ? selectedStoreData.name.replace('AL RABEE SUPERMARKET - ', '') : 'Select Store'}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Your Store</DialogTitle>
            <DialogDescription>
              Choose the AL RABEE branch where you&apos;d like to shop
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4 mt-4">
              {stores.map((store) => (
                <Card
                  key={store.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedStore === store.id
                      ? 'border-green-600 border-2 bg-green-50'
                      : ''
                  }`}
                  onClick={() => handleSelectStore(store.id)}
                >
                  <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
