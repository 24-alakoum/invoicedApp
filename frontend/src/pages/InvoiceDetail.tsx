import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Printer, Send, CheckCircle, Clock,
  FileText, Mail, Phone, MapPin, Calendar, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/currency';

interface InvoiceDetail {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  currency: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT:   { label: 'Brouillon',  className: 'bg-zinc-100 text-zinc-700',    icon: <FileText size={14} /> },
  PENDING: { label: 'En attente', className: 'bg-amber-100 text-amber-700',   icon: <Clock size={14} /> },
  PAID:    { label: 'Payée',      className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={14} /> },
  OVERDUE: { label: 'En retard',  className: 'bg-red-100 text-red-700',       icon: <AlertCircle size={14} /> },
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoices/${id}`)
      .then(r => r.json())
      .then(data => setInvoice(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const markAs = async (status: string) => {
    if (!invoice) return;
    setMarking(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
        toast({ title: '✅ Statut mis à jour', description: `Facture marquée comme "${statusConfig[status]?.label}"` });
      }
    } catch {
      toast({ title: '❌ Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Chargement de la facture…
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <FileText size={48} className="mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Facture introuvable</h2>
        <Button asChild variant="outline"><Link to="/invoices"><ArrowLeft size={16} className="mr-2" /> Retour</Link></Button>
      </div>
    );
  }

  const s = statusConfig[invoice.status] ?? { label: invoice.status, className: 'bg-zinc-100 text-zinc-700', icon: null };
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING';

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-mono">{invoice.number}</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${s.className}`}>
                {s.icon} {s.label}
              </span>
              {isOverdue && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Échéance dépassée
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">Créée le {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={15} className="mr-2" /> Imprimer
          </Button>
          {invoice.status === 'DRAFT' && (
            <Button size="sm" onClick={() => markAs('PENDING')} disabled={marking}>
              <Send size={15} className="mr-2" /> Envoyer
            </Button>
          )}
          {invoice.status === 'PENDING' && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => markAs('PAID')} disabled={marking}>
              <CheckCircle size={15} className="mr-2" /> Marquer payée
            </Button>
          )}
          {(invoice.status === 'PENDING' || invoice.status === 'DRAFT') && (
            <Button size="sm" variant="destructive" onClick={() => markAs('OVERDUE')} disabled={marking}>
              <AlertCircle size={15} className="mr-2" /> En retard
            </Button>
          )}
        </div>
      </div>

      {/* Main Invoice Card */}
      <Card className="print:shadow-none">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">FACTURE</div>
              <div className="text-muted-foreground text-sm">N° {invoice.number}</div>
              <div className="text-muted-foreground text-sm mt-1">Devise : XOF (FCFA)</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">FacturePME PRO</div>
              <div className="text-muted-foreground text-sm mt-1">hello@facturepme.com</div>
            </div>
          </div>

          {/* Client + Dates */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Facturé à</div>
              <div className="font-bold text-lg">{invoice.client.name}</div>
              {invoice.client.email && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Mail size={13} /> {invoice.client.email}
                </div>
              )}
              {invoice.client.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Phone size={13} /> {invoice.client.phone}
                </div>
              )}
              {invoice.client.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin size={13} /> {invoice.client.address}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex flex-col gap-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date d'émission</div>
                  <div className="flex items-center gap-1 justify-end mt-1 text-sm font-medium">
                    <Calendar size={13} className="text-muted-foreground" />
                    {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Échéance</div>
                  <div className={`flex items-center gap-1 justify-end mt-1 text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    <Calendar size={13} className="text-muted-foreground" />
                    {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Qté</th>
                <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">Prix unitaire</th>
                <th className="text-right py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map(item => (
                <tr key={item.id}>
                  <td className="py-4 font-medium">{item.description}</td>
                  <td className="py-4 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="py-4 text-right font-mono">{formatFCFA(item.unitPrice)}</td>
                  <td className="py-4 text-right font-mono font-semibold">{formatFCFA(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-mono">{formatFCFA(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">TVA ({invoice.taxRate}%)</span>
                <span className="font-mono">{formatFCFA(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-3 mt-2 border-t-2 border-primary/30 font-bold text-lg">
                <span>Total TTC</span>
                <span className="font-mono text-primary">{formatFCFA(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</div>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
