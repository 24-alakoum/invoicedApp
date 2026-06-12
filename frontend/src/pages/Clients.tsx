import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatFCFA } from '@/lib/currency';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  siret?: string;
  createdAt: string;
  invoices: { id: string; total: number; status: string }[];
}

function ClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', siret: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom est obligatoire.'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { onSaved(); onClose(); }
      else setError('Erreur lors de la création.');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Nouveau Client</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Nom / Raison sociale *</label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: SARL Diallo & Associés" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@entreprise.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+226 70 00 00 00" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Adresse</label>
              <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Quartier, Ville, Pays" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">NINEA / RCCM</label>
              <Input value={form.siret} onChange={e => setForm({...form, siret: e.target.value})} placeholder="Numéro d'identification fiscale" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Créer le client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadClients = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/clients')
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalCA = (c: Client) => c.invoices?.reduce((s, inv) => s + inv.total, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {showModal && <ClientModal onClose={() => setShowModal(false)} onSaved={loadClients} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users size={24} className="text-primary" /> Clients
          </h1>
          <p className="text-muted-foreground mt-1">Gérez votre base de clients</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" /> Nouveau client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-3xl font-bold text-foreground">{clients.length}</span>
            <span className="text-sm text-muted-foreground mt-1">Total clients</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-3xl font-bold text-primary">
              {clients.filter(c => (c.invoices?.length ?? 0) > 0).length}
            </span>
            <span className="text-sm text-muted-foreground mt-1">Avec factures</span>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              {formatFCFA(clients.reduce((s, c) => s + totalCA(c), 0))}
            </span>
            <span className="text-sm text-muted-foreground mt-1">CA total généré</span>
          </CardContent>
        </Card>
      </div>

      {/* Search + List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Tous les clients ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8 h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <Users size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Aucun client trouvé.</p>
              <Button variant="outline" className="mt-4" size="sm" onClick={() => setShowModal(true)}>
                <Plus size={14} className="mr-1" /> Ajouter le premier client
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(client => (
                <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    {/* Avatar initiales */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{client.name}</div>
                      <div className="flex gap-3 mt-0.5">
                        {client.email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail size={11} /> {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone size={11} /> {client.phone}
                          </span>
                        )}
                        {client.address && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin size={11} /> {client.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Factures</div>
                      <div className="font-semibold text-sm flex items-center gap-1 justify-end">
                        <FileText size={13} className="text-muted-foreground" />
                        {client.invoices?.length ?? 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">CA Total</div>
                      <div className="font-semibold text-sm font-mono text-primary">{formatFCFA(totalCA(client))}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Depuis le<br />
                      <span className="font-medium text-foreground">{new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
