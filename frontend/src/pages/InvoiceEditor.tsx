import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/currency';
import './InvoiceEditor.css';

const TAX_RATE = 0.18; // TVA 18% (taux courant en Afrique de l'Ouest)

export default function InvoiceEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([
    { id: 1, description: 'Développement Web', quantity: 1, price: 500000 },
  ]);
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const saveInvoice = async (status: 'DRAFT' | 'PENDING') => {
    if (!client.name.trim()) {
      toast({ title: '⚠️ Champ requis', description: 'Veuillez saisir le nom du client.', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          items,
          status,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.previewUrl) {
          toast({
            title: '📧 Facture envoyée !',
            description: (
              <span>
                L'email a été envoyé.{' '}
                <a href={data.previewUrl} target="_blank" rel="noreferrer" className="underline font-semibold">
                  Voir l'aperçu →
                </a>
              </span>
            ),
          });
        } else {
          toast({ title: '✅ Brouillon sauvegardé', description: `La facture a été enregistrée.` });
        }
        navigate('/invoices');
      } else {
        toast({ title: '❌ Erreur', description: 'La facture n\'a pas pu être sauvegardée.', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: '❌ Erreur réseau', description: 'Impossible de contacter le serveur.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-editor-layout">
      {/* LEFT COLUMN: FORM */}
      <div className="editor-form-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nouvelle Facture</h1>
          <div className="flex gap-2">
            <Button onClick={() => saveInvoice('DRAFT')} disabled={loading} variant="secondary">
              {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} className="mr-2" />} Brouillon
            </Button>
            <Button onClick={() => saveInvoice('PENDING')} disabled={loading}>
              {loading ? <Loader className="animate-spin" size={16} /> : <Send size={16} className="mr-2" />} Créer & Envoyer
            </Button>
          </div>
        </div>

        <Card className="flex flex-col gap-6 p-6">
          {/* Client Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Informations Client</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nom du client *</label>
                <Input
                  value={client.name}
                  onChange={(e) => setClient({...client, name: e.target.value})}
                  placeholder="Ex: Société Kaboré & Frères"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({...client, email: e.target.value})}
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Téléphone</label>
                <Input
                  value={client.phone}
                  onChange={(e) => setClient({...client, phone: e.target.value})}
                  placeholder="+226 00 00 00 00"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Adresse</label>
                <Input
                  value={client.address}
                  onChange={(e) => setClient({...client, address: e.target.value})}
                  placeholder="Quartier, Ville, Pays"
                />
              </div>
            </div>
          </div>

          <hr className="border-border my-2" />

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lignes de facturation</h3>
              <Button onClick={addItem} variant="outline" size="sm" className="h-8">
                <Plus size={14} className="mr-1" /> Ajouter une ligne
              </Button>
            </div>

            {/* Header labels */}
            <div className="grid grid-cols-[1fr_80px_120px_40px] gap-3 px-3 mb-1">
              <span className="text-xs text-muted-foreground font-medium">Description</span>
              <span className="text-xs text-muted-foreground font-medium text-center">Qté</span>
              <span className="text-xs text-muted-foreground font-medium text-right">Prix (FCFA)</span>
              <span></span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_120px_40px] gap-3 items-center bg-muted/50 p-3 rounded-md">
                  <Input
                    placeholder="Ex: Création de site web"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    className="text-center"
                    placeholder="1"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    className="text-right"
                    placeholder="0"
                    min={0}
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  />
                  <Button onClick={() => removeItem(item.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="editor-preview-col">
        <div className="preview-sticky-container">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex justify-between">
            Aperçu en direct
            <Badge variant="secondary">XOF · FCFA</Badge>
          </h2>

          <div className="invoice-paper">
            <div className="paper-header">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>FACTURE</h2>
                <p className="text-sm text-muted mt-1">N° FA-{new Date().getFullYear()}-XXXX</p>
                <p className="text-xs text-muted mt-1">Date : {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">FacturePME PRO</div>
                <p className="text-sm text-secondary">hello@facturepme.com</p>
                <p className="text-xs text-muted mt-1">Devise : XOF (FCFA)</p>
              </div>
            </div>

            <div className="paper-client mt-8">
              <p className="text-sm text-muted mb-1">Facturé à :</p>
              <h3 className="font-bold">{client.name || 'Nom du client'}</h3>
              {client.email && <p className="text-sm text-secondary">{client.email}</p>}
              {client.phone && <p className="text-sm text-secondary">{client.phone}</p>}
              {client.address && <p className="text-sm text-secondary">{client.address}</p>}
            </div>

            <div className="paper-items mt-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="py-2 text-sm text-secondary">Description</th>
                    <th className="py-2 text-sm text-secondary text-center">Qté</th>
                    <th className="py-2 text-sm text-secondary text-right">P.U.</th>
                    <th className="py-2 text-sm text-secondary text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b" style={{ borderColor: 'var(--bg-color)' }}>
                      <td className="py-3 text-sm">{item.description || '...'}</td>
                      <td className="py-3 text-sm text-center">{item.quantity}</td>
                      <td className="py-3 text-sm text-right text-mono">{formatFCFA(item.price)}</td>
                      <td className="py-3 text-sm text-right text-mono font-semibold">{formatFCFA(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paper-totals mt-8 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-secondary">Sous-total HT</span>
                  <span className="text-mono">{formatFCFA(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-secondary">TVA (18%)</span>
                  <span className="text-mono">{formatFCFA(tax)}</span>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t font-bold text-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <span>Total TTC</span>
                  <span className="text-mono">{formatFCFA(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
