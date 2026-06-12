import React, { useState } from 'react';
import { Settings, Building, Palette, Bell, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SETTINGS_KEY = 'facturepme_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

const defaultSettings = {
  companyName: 'FacturePME PRO',
  email: 'hello@facturepme.com',
  phone: '',
  address: '',
  siret: '',
  taxRate: '18',
  currency: 'XOF',
  prefix: 'FA',
  notifEmail: true,
  notifOverdue: true,
  primaryColor: '#6366f1',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'invoice' | 'notifications'>('company');

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (key: string, val: string | boolean) =>
    setSettings((prev: typeof defaultSettings) => ({ ...prev, [key]: val }));

  const tabs = [
    { id: 'company',       label: 'Entreprise',    icon: <Building size={16} /> },
    { id: 'invoice',       label: 'Facturation',   icon: <Settings size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings size={24} className="text-primary" /> Paramètres
          </h1>
          <p className="text-muted-foreground mt-1">Configurez votre application de facturation</p>
        </div>
        <Button onClick={handleSave} className={saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}>
          {saved ? <><Check size={16} className="mr-2" /> Sauvegardé !</> : <><Save size={16} className="mr-2" /> Sauvegarder</>}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building size={18} /> Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Nom de l'entreprise</label>
              <Input value={settings.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Ma Société SARL" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email professionnel</label>
              <Input type="email" value={settings.email} onChange={e => set('email', e.target.value)} placeholder="contact@masociete.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Téléphone</label>
              <Input value={settings.phone} onChange={e => set('phone', e.target.value)} placeholder="+226 70 00 00 00" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Adresse</label>
              <Input value={settings.address} onChange={e => set('address', e.target.value)} placeholder="Quartier, Ville, Pays" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">NINEA / RCCM</label>
              <Input value={settings.siret} onChange={e => set('siret', e.target.value)} placeholder="Numéro d'identification fiscale" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Tab */}
      {activeTab === 'invoice' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paramètres de facturation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Devise</label>
                <div className="flex gap-2">
                  {['XOF', 'EUR', 'USD', 'GNF', 'XAF'].map(cur => (
                    <button
                      key={cur}
                      onClick={() => set('currency', cur)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        settings.currency === cur
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Taux TVA par défaut (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.taxRate}
                  onChange={e => set('taxRate', e.target.value)}
                  className="w-32"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Préfixe des numéros de facture</label>
                <Input
                  value={settings.prefix}
                  onChange={e => set('prefix', e.target.value)}
                  className="w-28"
                  placeholder="FA"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground mt-1">Ex : {settings.prefix || 'FA'}-2024-0001</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                  <Palette size={14} /> Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={e => set('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={e => set('primaryColor', e.target.value)}
                    className="w-32 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell size={18} /> Préférences de notification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { key: 'notifEmail',   label: 'Email de confirmation',     desc: 'Recevoir un email quand une facture est créée' },
              { key: 'notifOverdue', label: 'Alertes de retard',         desc: 'Notification quand une facture dépasse l\'échéance' },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </div>
                <button
                  onClick={() => set(opt.key, !settings[opt.key as keyof typeof defaultSettings])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[opt.key as keyof typeof defaultSettings] ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    settings[opt.key as keyof typeof defaultSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
