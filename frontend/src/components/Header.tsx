import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  // Trava o scroll da página quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Editorial', path: '/blog' },
    { name: 'Portfólio', path: '/portfolio' }
  ];

  return (
    <header className="w-full sticky top-0 left-0 glass-dark border-b border-white/10 z-50">
      <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-6">

        {/* Logo */}
        <Link to="/" className="flex flex-col group z-[60]" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="text-3xl md:text-4xl font-display font-black tracking-tighter uppercase leading-none text-white group-hover:text-neon-red transition-colors duration-500 group-hover:text-glow-red">
            TG
          </span>
          <span className="text-[8px] md:text-[9px] font-display tracking-[0.4em] text-gray-500 leading-none mt-2 uppercase group-hover:text-gray-300 transition-colors">
            Torque Gyn
          </span>
        </Link>

        {/* =========================================
            NAVEGAÇÃO DESKTOP
            ========================================= */}
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

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/login"
            className="flex items-center gap-4 text-[10px] font-display font-bold tracking-[0.2em] uppercase border border-white/20 bg-white/5 px-6 py-3 hover:border-neon-red hover:text-neon-red hover:shadow-neon-red transition-all duration-500 group"
          >
            <span>Acesso Restrito</span>
            <LogIn size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* =========================================
            BOTÃO MOBILE (HAMBURGUER / FECHAR)
            ========================================= */}
        <button 
          className="md:hidden text-white hover:text-neon-red transition-colors z-[60]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>

      </div>

      {/* =========================================
          OVERLAY DO MENU MOBILE
          ========================================= */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-10 z-50 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        <div className="flex flex-col items-center gap-8 w-full px-6">
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

        <Link
          to="/login"
          onClick={() => setIsMobileMenuOpen(false)}
          className="mt-8 flex items-center justify-center gap-4 text-xs font-display font-bold tracking-[0.2em] uppercase border border-neon-red/50 bg-neon-red/10 text-neon-red px-10 py-5 w-[80%] hover:bg-neon-red hover:text-white transition-all"
        >
          <span>Acesso Restrito</span>
          <LogIn size={16} />
        </Link>
      </div>
    </header>
  );
}