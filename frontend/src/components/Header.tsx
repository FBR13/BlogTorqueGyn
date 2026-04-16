import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User } from 'lucide-react'; // <-- Trocamos o LogIn pelo User
import { useAuth } from '../context/AuthContext';

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfólio', path: '/portfolio' },
    { name: 'Editorial', path: '/blog' }
  ];

  return (
    <header className="w-full sticky top-0 left-0 bg-black/70 backdrop-blur-xl shadow-2xl z-50">
      <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-6">

        {/* LOGO */}
        <Link to="/" className="flex items-center group z-[60]" onClick={() => setIsMobileMenuOpen(false)}>
          <img 
            src="/favicon.png" 
            alt="TorqueGyn" 
            className="h-15 md:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-105 group-hover:brightness-125" 
          />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[10px] font-display font-bold tracking-[0.25em] uppercase relative py-2 group ${isActive(link.path) ? 'text-white' : 'text-gray-500 hover:text-neon-cyan transition-colors duration-300'}`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 h-[1px] bg-neon-cyan transition-all duration-500 ease-in-out ${isActive(link.path) ? 'w-full shadow-neon-cyan' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          ))}
        </nav>

        {/* =========================================
            AÇÕES DESKTOP (ÍCONES FURTIVOS)
            ========================================= */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <Link
              to="/admin"
              title="Painel Admin"
              className="text-neon-cyan/70 hover:text-neon-cyan p-2 transition-all duration-300 group"
            >
              <LayoutDashboard size={18} strokeWidth={1.5} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] transition-all duration-300" />
            </Link>
          ) : (
            <Link
              to="/login"
              title="Acesso Restrito"
              className="text-white/20 hover:text-neon-red p-2 transition-all duration-300 group"
            >
              <User size={18} strokeWidth={1.5} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(239,51,64,0.8)] transition-all duration-300" />
            </Link>
          )}
        </div>

        {/* BOTÃO HAMBURGUER MOBILE */}
        <button 
          className="md:hidden text-white hover:text-neon-red transition-colors z-[60]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>

      </div>

      {/* =========================================
          OVERLAY MENU MOBILE
          ========================================= */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center z-50 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        <div className="flex flex-col items-center gap-10 w-full px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl font-display font-bold tracking-[0.2em] uppercase w-full text-center py-4 border-b border-white/5 ${
                isActive(link.path) ? 'text-neon-cyan text-glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* AÇÕES MOBILE (ÍCONES FURTIVOS NO RODAPÉ DO MENU) */}
        <div className="absolute bottom-12">
          {user ? (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 text-neon-cyan/50 hover:text-neon-cyan transition-colors flex justify-center"
            >
              <LayoutDashboard size={24} strokeWidth={1.5} />
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-4 text-white/10 hover:text-neon-red transition-colors flex justify-center"
            >
              <User size={24} strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}