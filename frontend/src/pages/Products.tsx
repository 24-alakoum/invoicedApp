import React, { useState } from 'react';
import { Package, Plus, Pencil, Trash2, X, Tag, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/currency';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
}

// Produits stockés en local (localStorage) — pas besoin de base de données pour ça
const STORAGE_KEY = 'facturepme_products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

const defaultProducts: Product[] = [
  { id: 1, name: 'Développement Web', description: 'Création de site vitrine ou e-commerce', price: 500000, unit: 'forfait', category: 'Développement' },
  { id: 2, name: 'Maintenance mensuelle', description: 'Maintenance et support technique mensuel', price: 75000, unit: 'mois', category: 'Maintenance' },
  { id: 3, name: 'Design graphique', description: 'Identité visuelle, logo, charte graphique', price: 150000, unit: 'forfait', category: 'Design' },
  { id: 4, name: 'Formation informatique', description: 'Formation en présentiel ou distanciel', price: 25000, unit: 'heure', category: 'Formation' },
];

const categories = ['Développement', 'Design', 'Formation', 'Maintenance', 'Conseil', 'Autre'];

function ProductModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product;
  onClose: () => void;
  onSave: (p: Omit<Product, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    unit: initial?.unit ?? 'forfait',
    category: initial?.category ?? 'Développement',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{initial ? 'Modifier le produit' : 'Nouveau produit / service'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Nom *</label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Développement application mobile"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Courte description du produit ou service"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Prix unitaire (FCFA)</label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Unité</label>
              <Input
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                placeholder="forfait, heure, mois, pièce…"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Catégorie</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.category === cat
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit">{initial ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const categoryColors: Record<string, string> = {
  'Développement': 'bg-blue-100 text-blue-700',
  'Design':        'bg-violet-100 text-violet-700',
  'Formation':     'bg-amber-100 text-amber-700',
  'Maintenance':   'bg-emerald-100 text-emerald-700',
  'Conseil':       'bg-rose-100 text-rose-700',
  'Autre':         'bg-zinc-100 text-zinc-600',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [modal, setModal] = useState<{ open: boolean; item?: Product }>({ open: false });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (data: Omit<Product, 'id'>) => {
    let updated: Product[];
    if (modal.item) {
      updated = products.map(p => p.id === modal.item!.id ? { ...modal.item!, ...data } : p);
    } else {
      const newId = Math.max(0, ...products.map(p => p.id)) + 1;
      updated = [...products, { id: newId, ...data }];
    }
    setProducts(updated);
    saveProducts(updated);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  const usedCategories = [...new Set(products.map(p => p.category))];

  return (
    <div className="flex flex-col gap-6">
      {modal.open && (
        <ProductModal
          initial={modal.item}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package size={24} className="text-primary" /> Produits & Services
          </h1>
          <p className="text-muted-foreground mt-1">Votre catalogue de prestations</p>
        </div>
        <Button onClick={() => setModal({ open: true })}>
          <Plus size={16} className="mr-2" /> Nouveau produit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-3xl font-bold">{products.length}</span>
            <span className="text-sm text-muted-foreground mt-1">Total produits</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-3xl font-bold text-primary">{usedCategories.length}</span>
            <span className="text-sm text-muted-foreground mt-1">Catégories</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-xl font-bold text-emerald-600 font-mono">
              {formatFCFA(
                products.length > 0
                  ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
                  : 0
              )}
            </span>
            <span className="text-sm text-muted-foreground mt-1">Prix moyen</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative w-64">
          <Package size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-8 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setFilterCat('')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            !filterCat ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary'
          }`}
        >
          Tous
        </button>
        {usedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterCat === cat ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Products */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Aucun produit trouvé.</p>
          <Button variant="outline" className="mt-4" size="sm" onClick={() => setModal({ open: true })}>
            <Plus size={14} className="mr-1" /> Ajouter un produit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <Card key={product.id} className="group hover:shadow-md transition-shadow border-border">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[product.category] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {product.category}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ open: true, item: product })}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash size={12} />
                    <span>par {product.unit}</span>
                  </div>
                  <span className="font-bold font-mono text-primary text-sm">{formatFCFA(product.price)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
