'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  PackageX,
  Tag,
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Store,
  LogOut,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { categories } from '@/lib/mock-data';
import { formatOMR } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Stats {
  total: number;
  outOfStock: number;
  lowStock: number;
  withOffers: number;
}

type SortKey = 'name' | 'category' | 'price' | 'storeStock' | 'totalStock' | 'discount';
type SortDir = 'asc' | 'desc';

const PRODUCT_CATEGORIES = categories.filter(c => c !== 'All');

const DEFAULT_FORM: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  discount: '',
  isTopSelling: false,
  isFeatured: false,
  aisle: '',
  section: '',
  storeStock: '',
  warehouseStock: '',
};

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  discount: string;
  isTopSelling: boolean;
  isFeatured: boolean;
  aisle: string;
  section: string;
  storeStock: string;
  warehouseStock: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, outOfStock: 0, lowStock: 0, withOffers: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState<'all' | 'out' | 'low'>('all');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [stockEditProduct, setStockEditProduct] = useState<Product | null>(null);
  const [offerProduct, setOfferProduct] = useState<Product | null>(null);

  // Forms
  const [form, setForm] = useState<ProductForm>({ ...DEFAULT_FORM });
  const [stockForm, setStockForm] = useState({ storeStock: '', warehouseStock: '' });
  const [offerForm, setOfferForm] = useState('');
  const [saving, setSaving] = useState(false);

  // ─── Auth check ─────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/auth/check', { cache: 'no-store' })
      .then(res => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setAuthChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  // ─── Fetch ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ─── Sorting ────────────────────────────────────────────────────
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
  }

  // ─── Filtered & sorted ─────────────────────────────────────────
  const displayed = products
    .filter(p => {
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      if (filterStock === 'out' && p.inventory.store + p.inventory.warehouse > 0) return false;
      if (filterStock === 'low') {
        const t = p.inventory.store + p.inventory.warehouse;
        if (t === 0 || t >= 50) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
        case 'price': cmp = a.price - b.price; break;
        case 'storeStock': cmp = a.inventory.store - b.inventory.store; break;
        case 'totalStock': cmp = (a.inventory.store + a.inventory.warehouse) - (b.inventory.store + b.inventory.warehouse); break;
        case 'discount': cmp = (a.discount ?? 0) - (b.discount ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // ─── Helpers ────────────────────────────────────────────────────
  function resetForm() { setForm({ ...DEFAULT_FORM }); }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image: p.image,
      discount: p.discount ? String(p.discount) : '',
      isTopSelling: p.isTopSelling,
      isFeatured: p.isFeatured,
      aisle: p.location.aisle,
      section: p.location.section,
      storeStock: String(p.inventory.store),
      warehouseStock: String(p.inventory.warehouse),
    });
    setEditProduct(p);
  }

  function openStockEdit(p: Product) {
    setStockForm({
      storeStock: String(p.inventory.store),
      warehouseStock: String(p.inventory.warehouse),
    });
    setStockEditProduct(p);
  }

  function openOfferEdit(p: Product) {
    setOfferForm(p.discount ? String(p.discount) : '');
    setOfferProduct(p);
  }

  // ─── API calls ─────────────────────────────────────────────────
  async function handleSaveProduct() {
    setSaving(true);
    try {
      const isEdit = !!editProduct;
      const url = isEdit ? `/api/admin/products/${editProduct!.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
        discount: form.discount ? Number(form.discount) : null,
        isTopSelling: form.isTopSelling,
        isFeatured: form.isFeatured,
        aisle: form.aisle,
        section: form.section,
        storeStock: Number(form.storeStock || 0),
        warehouseStock: Number(form.warehouseStock || 0),
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setShowAddDialog(false);
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleStockUpdate() {
    if (!stockEditProduct) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${stockEditProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeStock: Number(stockForm.storeStock),
          warehouseStock: Number(stockForm.warehouseStock),
        }),
      });
      setStockEditProduct(null);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }

  async function handleOfferUpdate() {
    if (!offerProduct) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${offerProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discount: offerForm ? Number(offerForm) : null,
        }),
      });
      setOfferProduct(null);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }

  async function toggleOutOfStock(p: Product) {
    const isOut = p.inventory.store + p.inventory.warehouse === 0;
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isOut
          ? { storeStock: 10, warehouseStock: 50 }
          : { storeStock: 0, warehouseStock: 0 }
      ),
    });
    fetchProducts();
  }

  // ─── Stock status helper ────────────────────────────────────────
  function stockBadge(p: Product) {
    const total = p.inventory.store + p.inventory.warehouse;
    if (total === 0) return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    if (total < 50) return <Badge className="bg-amber-500 text-white text-xs">Low Stock</Badge>;
    return <Badge className="bg-green-600 text-white text-xs">In Stock</Badge>;
  }

  // ─── Auth guard ──────────────────────────────────────────────────
  if (authChecking || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-green-700">
              <Store className="h-6 w-6" />
              <span className="hidden sm:inline">AL RABEE SUPERMARKET</span>
              <span className="sm:hidden">AL RABEE</span>
            </Link>
            <Badge variant="outline" className="text-xs font-medium border-green-600 text-green-700">Admin</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchProducts} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStock('all')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStock('out')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <PackageX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStock('low')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-amber-600">{stats.lowStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Active Offers</CardTitle>
              <Tag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-blue-600">{stats.withOffers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            className="bg-green-700 hover:bg-green-800 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Filter pills */}
        {(filterStock !== 'all' || filterCategory !== 'All') && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {filterStock !== 'all' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilterStock('all')}>
                {filterStock === 'out' ? 'Out of Stock' : 'Low Stock'} &times;
              </Badge>
            )}
            {filterCategory !== 'All' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilterCategory('All')}>
                {filterCategory} &times;
              </Badge>
            )}
          </div>
        )}

        {/* Product Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No products match your filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      Name <SortIcon col="name" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('category')}>
                      Category <SortIcon col="category" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('price')}>
                      Price <SortIcon col="price" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('discount')}>
                      Offer <SortIcon col="discount" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right hidden sm:table-cell" onClick={() => toggleSort('storeStock')}>
                      Store <SortIcon col="storeStock" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none text-right hidden sm:table-cell" onClick={() => toggleSort('totalStock')}>
                      Warehouse <SortIcon col="totalStock" />
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.map(p => {
                    const isOut = p.inventory.store + p.inventory.warehouse === 0;
                    return (
                      <TableRow key={p.id} className={isOut ? 'bg-red-50/60' : ''}>
                        <TableCell>
                          <div className="relative h-10 w-10 rounded overflow-hidden bg-gray-100">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{p.category}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">{p.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatOMR(p.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.discount ? (
                            <button onClick={() => openOfferEdit(p)} className="cursor-pointer">
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
                                {p.discount}% OFF
                              </Badge>
                            </button>
                          ) : (
                            <button
                              onClick={() => openOfferEdit(p)}
                              className="text-xs text-muted-foreground hover:text-blue-600 cursor-pointer"
                            >
                              + Add
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell font-mono text-sm">
                          <button onClick={() => openStockEdit(p)} className="hover:text-green-700 cursor-pointer">
                            {p.inventory.store}
                          </button>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell font-mono text-sm">
                          <button onClick={() => openStockEdit(p)} className="hover:text-green-700 cursor-pointer">
                            {p.inventory.warehouse}
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          <button onClick={() => toggleOutOfStock(p)} className="cursor-pointer">
                            {stockBadge(p)}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(p)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground mt-2 text-right">
          Showing {displayed.length} of {stats.total} products
        </div>
      </main>

      {/* ────────────── Add / Edit Product Dialog ────────────── */}
      <Dialog open={showAddDialog || !!editProduct} onOpenChange={open => { if (!open) { setShowAddDialog(false); setEditProduct(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editProduct ? 'Update product details below.' : 'Fill in the details to add a new product to the store.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fresh Apples" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the product" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (OMR) *</Label>
                <Input id="price" type="number" step="0.001" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" min="0" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input id="image" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeStock">Store Stock</Label>
                <Input id="storeStock" type="number" min="0" value={form.storeStock} onChange={e => setForm(f => ({ ...f, storeStock: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseStock">Warehouse Stock</Label>
                <Input id="warehouseStock" type="number" min="0" value={form.warehouseStock} onChange={e => setForm(f => ({ ...f, warehouseStock: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aisle">Aisle</Label>
                <Input id="aisle" value={form.aisle} onChange={e => setForm(f => ({ ...f, aisle: e.target.value }))} placeholder="e.g. A1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="e.g. Produce" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="topSelling" checked={form.isTopSelling} onCheckedChange={c => setForm(f => ({ ...f, isTopSelling: c }))} />
                <Label htmlFor="topSelling">Top Selling</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="featured" checked={form.isFeatured} onCheckedChange={c => setForm(f => ({ ...f, isFeatured: c }))} />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditProduct(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800"
              disabled={saving || !form.name || !form.price || !form.category || !form.image}
              onClick={handleSaveProduct}
            >
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────── Delete Confirmation ────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={saving} onClick={handleDeleteProduct}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────── Quick Stock Update Dialog ────────────── */}
      <Dialog open={!!stockEditProduct} onOpenChange={open => { if (!open) setStockEditProduct(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Adjust inventory for <strong>{stockEditProduct?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editStoreStock">Store Stock</Label>
              <Input
                id="editStoreStock"
                type="number"
                min="0"
                value={stockForm.storeStock}
                onChange={e => setStockForm(f => ({ ...f, storeStock: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editWarehouseStock">Warehouse Stock</Label>
              <Input
                id="editWarehouseStock"
                type="number"
                min="0"
                value={stockForm.warehouseStock}
                onChange={e => setStockForm(f => ({ ...f, warehouseStock: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockEditProduct(null)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" disabled={saving} onClick={handleStockUpdate}>
              {saving ? 'Saving...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────── Offer / Discount Dialog ────────────── */}
      <Dialog open={!!offerProduct} onOpenChange={open => { if (!open) setOfferProduct(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Offer</DialogTitle>
            <DialogDescription>
              Set a discount percentage for <strong>{offerProduct?.name}</strong>. Leave blank or set to 0 to remove the offer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="offerDiscount">Discount (%)</Label>
            <Input
              id="offerDiscount"
              type="number"
              min="0"
              max="100"
              value={offerForm}
              onChange={e => setOfferForm(e.target.value)}
              placeholder="e.g. 15"
            />
            {offerForm && Number(offerForm) > 0 && offerProduct && (
              <p className="text-sm text-muted-foreground">
                Price after discount: {formatOMR(offerProduct.price * (1 - Number(offerForm) / 100))}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferProduct(null)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800" disabled={saving} onClick={handleOfferUpdate}>
              {saving ? 'Saving...' : offerForm && Number(offerForm) > 0 ? 'Set Offer' : 'Remove Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
