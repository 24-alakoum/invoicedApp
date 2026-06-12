import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownRight, DollarSign, Clock,
  FileText, CheckCircle, TrendingUp, Users
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatFCFA } from '@/lib/currency';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  dueDate: string;
  client: { name: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildMonthlyData(invoices: Invoice[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('fr-FR', { month: 'short' });
    months[key] = 0;
  }
  invoices
    .filter(inv => inv.status === 'PAID' || inv.status === 'PENDING')
    .forEach(inv => {
      const d = new Date(inv.createdAt);
      const key = d.toLocaleString('fr-FR', { month: 'short' });
      if (key in months) months[key] += inv.total;
    });
  return Object.entries(months).map(([mois, CA]) => ({ mois, CA }));
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT:   { label: 'Brouillon',  className: 'bg-zinc-100 text-zinc-600' },
  PENDING: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  PAID:    { label: 'Payée',      className: 'bg-emerald-100 text-emerald-700' },
  OVERDUE: { label: 'En retard',  className: 'bg-red-100 text-red-700' },
};

// ─── Custom Tooltip Recharts ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">{formatFCFA(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/invoices')
      .then(r => r.json())
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthlyInvoices = invoices.filter(inv => {
    const d = new Date(inv.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const caMensuel = monthlyInvoices
    .filter(inv => inv.status === 'PAID' || inv.status === 'PENDING')
    .reduce((s, inv) => s + inv.total, 0);

  const enAttente = invoices
    .filter(inv => inv.status === 'PENDING')
    .reduce((s, inv) => s + inv.total, 0);

  const enRetard = invoices
    .filter(inv => inv.status === 'OVERDUE')
    .reduce((s, inv) => s + inv.total, 0);

  const payeesMois = monthlyInvoices.filter(inv => inv.status === 'PAID').length;

  const clients = new Set(invoices.map(inv => inv.client?.name)).size;

  const monthlyData = buildMonthlyData(invoices);

  const recent = invoices.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Aperçu de votre activité — devise XOF (FCFA)</p>
        </div>
        <Button asChild>
          <Link to="/invoices/new">
            <FileText size={16} className="mr-2" />
            Nouvelle facture
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Mensuel</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {loading ? '…' : formatFCFA(caMensuel)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp size={12} className="text-emerald-500 mr-1" />
              Ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {loading ? '…' : formatFCFA(enAttente)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(i => i.status === 'PENDING').length} facture(s) envoyée(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ArrowDownRight size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {loading ? '…' : formatFCFA(enRetard)}
            </div>
            <p className="text-xs text-red-500 font-medium mt-1">
              {invoices.filter(i => i.status === 'OVERDUE').length > 0
                ? `${invoices.filter(i => i.status === 'OVERDUE').length} à relancer`
                : 'Aucune en retard ✓'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées ce mois</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : payeesMois}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clients} client(s) au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Évolution du Chiffre d'Affaires (6 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="CA"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#colorCA)"
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} className="text-muted-foreground" />
              Dernières factures
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : recent.length === 0 ? (
              <div className="text-center py-6">
                <FileText size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Aucune facture</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/invoices/new">Créer la première</Link>
                </Button>
              </div>
            ) : (
              recent.map((inv) => {
                const s = statusConfig[inv.status] ?? { label: inv.status, className: 'bg-zinc-100 text-zinc-600' };
                return (
                  <div key={inv.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{inv.client?.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{inv.number}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                      <span className="font-semibold text-xs font-mono">{formatFCFA(inv.total)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.className}`}>{s.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{invoices.length}</div>
              <div className="text-sm text-indigo-600">Total factures</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">
                {invoices.filter(i => i.status === 'PAID').length}
              </div>
              <div className="text-sm text-emerald-600">Factures payées</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-700">{clients}</div>
              <div className="text-sm text-violet-600">Clients actifs</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
