import React from 'react';
import { User, UserRole, Federation } from '../types';
import { LogOut, User as UserIcon, Shield, Menu, X, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  currentView: string;
  federations: Federation[];
  selectedFederation: string;
  onSelectFederation: (id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, onNavigate, onLogout, currentView, 
  federations, selectedFederation, onSelectFederation 
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavItem = ({ view, label }: { view: string; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md transition-colors font-medium text-sm ${
        currentView === view
          ? 'bg-blue-700 text-white shadow-md'
          : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center cursor-pointer min-w-fit group" onClick={() => onNavigate('home')}>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 hidden sm:block leading-none">
                  Handball Chubut
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-widest hidden sm:block">FECHUBA</span>
              </div>
            </div>

            {/* Federation Selector (Desktop) */}
            <div className="hidden md:flex items-center ml-8 mr-4">
              <div className="relative group">
                <select
                  value={selectedFederation}
                  onChange={(e) => onSelectFederation(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-4 pr-9 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="all">Todas las Asociaciones</option>
                  {federations.map(fed => (
                    <option key={fed.id} value={fed.id}>{fed.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-green-600" size={14} />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <NavItem view="home" label="Inicio" />
              <NavItem view="calendar" label="Fixture" />
              <NavItem view="standings" label="Tablas" />
              <NavItem view="scorers" label="Goleadores" />
              <NavItem view="teams" label="Equipos" />
              {user && user.role === UserRole.ADMIN && (
                <NavItem view="admin" label="Admin" />
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4 ml-auto">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
                >
                  <UserIcon size={16} />
                  Ingresar
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               {/* Mobile Fed Selector (Mini) */}
               <div className="mr-3">
                 <select
                    value={selectedFederation}
                    onChange={(e) => onSelectFederation(e.target.value)}
                    className="bg-slate-100 border-none text-xs font-semibold rounded-md py-1 px-2 w-28 truncate text-blue-800"
                  >
                    <option value="all">FeChuBa (Todas)</option>
                    {federations.map(fed => (
                      <option key={fed.id} value={fed.id}>{fed.shortName}</option>
                    ))}
                  </select>
               </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 hover:text-green-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2">
              <NavItem view="home" label="Inicio" />
              <NavItem view="calendar" label="Fixture" />
              <NavItem view="standings" label="Tablas de Posiciones" />
              <NavItem view="scorers" label="Goleadores" />
              <NavItem view="teams" label="Equipos" />
              {user?.role === UserRole.ADMIN && (
                <NavItem view="admin" label="Panel Admin" />
              )}
            </div>
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{user.name}</span>
                  <button onClick={onLogout} className="text-red-600 font-medium text-sm">Cerrar Sesión</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
                >
                  Ingresar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-gradient-to-br from-blue-600 to-green-500 rounded flex items-center justify-center">
                 <span className="text-white font-bold text-xs">H</span>
              </div>
              <h3 className="text-white font-bold text-lg">FeChuBa</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Federación Chubutense de Balonmano.<br/>
              Nucleando a la Asociación del Valle, Asociación Comodorense y Asociación Cordillerana.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-green-400 transition-colors">Noticias</button></li>
              <li><button onClick={() => onNavigate('standings')} className="hover:text-green-400 transition-colors">Torneos</button></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Reglamento FeChuBa</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <p className="text-sm">info@handballchubut.com.ar</p>
            <p className="text-sm mt-2">Chubut, Argentina</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs flex justify-between items-center">
          <span>&copy; 2024 Federación Chubutense de Balonmano.</span>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};