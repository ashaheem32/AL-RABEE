export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  discount?: number;
  isTopSelling: boolean;
  isFeatured: boolean;
  location: {
    aisle: string;
    section: string;
  };
  inventory: {
    store: number;
    warehouse: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CarDetails {
  carNumber: string;
  driverName?: string;
}

export interface Order {
  id: string;
  storeId: string;
  items: CartItem[];
  total: number;
  curbsideDelivery: boolean;
  carDetails?: CarDetails;
  paymentMethod: 'card' | 'cash';
  cashTendered?: number;
  change?: number;
  createdAt: string;
}
