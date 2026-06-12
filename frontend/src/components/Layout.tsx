import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Box, Settings, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/',          icon: LayoutDashboard, label: 'Tableau de bord', group: 'main' },
  { to: '/invoices',  icon: FileText,         label: 'Factures',        group: 'main' },
  { to: '/clients',   icon: Users,            label: 'Clients',         group: 'main' },
  { to: '/products',  icon: Box,              label: 'Produits & Services', group: 'main' },
  { to: '/assistant', icon: Sparkles,         label: 'Assistant IA',    group: 'ai'   },
  { to: '/settings',  icon: Settings,         label: 'Paramètres',      group: 'sys'  },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans">
      {/* ── SIDEBAR ── */}
      <aside className="flex flex-col w-64 min-w-[16rem] bg-white border-r border-border shadow-sm">
        
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            F
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight text-foreground">FacturePME</span>
            <span className="text-[10px] font-semibold tracking-widest text-violet-500 uppercase">Pro AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {['main', 'ai', 'sys'].map(group => {
            const links = navLinks.filter(l => l.group === group);
            return (
              <div key={group} className={group !== 'main' ? 'pt-3 mt-3 border-t border-border' : ''}>
                {links.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to ||
                    (link.to !== '/' && location.pathname.startsWith(link.to));
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      )}
                    >
                      <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-400'} />
                      {link.label}
                      {link.group === 'ai' && !isActive && (
                        <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                          Beta
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              A
            </div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-sm font-semibold text-foreground truncate">Admin</span>
              <span className="text-xs text-muted-foreground">Plan Premium · XOF</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
