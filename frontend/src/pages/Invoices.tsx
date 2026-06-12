import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatFCFA } from '@/lib/currency';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  DRAFT:   { label: 'Brouillon',  variant: 'secondary',    className: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100' },
  PENDING: { label: 'En attente', variant: 'secondary',    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  PAID:    { label: 'Payée',      variant: 'default',      className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  OVERDUE: { label: 'En retard',  variant: 'destructive',  className: '' },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoices`)
      .then(res => res.json())
      .then(data => setInvoices(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = invoices.filter(inv =>
    inv.number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-1">Gérez l'ensemble de vos factures</p>
        </div>
        <Button asChild>
          <Link to="/invoices/new">
            <Plus size={16} className="mr-2" /> Nouvelle facture
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total factures', value: invoices.length, color: 'text-foreground' },
          { label: 'En attente',     value: invoices.filter(i => i.status === 'PENDING').length, color: 'text-amber-600' },
          { label: 'Payées',         value: invoices.filter(i => i.status === 'PAID').length,    color: 'text-emerald-600' },
        ].map(stat => (
          <Card key={stat.label} className="py-4">
            <CardContent className="flex flex-col items-center justify-center pt-0">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Toutes les factures</CardTitle>
            <div className="relative w-60">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Numéro</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Échéance</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Montant TTC</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Loader size={20} className="inline animate-spin mr-2" />Chargement…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <FileText size={36} className="mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground">Aucune facture trouvée.</p>
                      <Button asChild variant="outline" className="mt-4" size="sm">
                        <Link to="/invoices/new"><Plus size={14} className="mr-1" /> Créer une facture</Link>
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filtered.map(inv => {
                    const s = statusConfig[inv.status] ?? { label: inv.status, variant: 'secondary', className: '' };
                    return (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold font-mono text-primary">{inv.number}</td>
                        <td className="px-6 py-4 font-medium">{inv.client?.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-right font-mono font-semibold">
                          {formatFCFA(inv.total)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={s.variant} className={s.className}>{s.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => navigate(`/invoices/${inv.id}`)}
                          >
                            <Eye size={15} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mini spinner for loading state
function Loader({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
