import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User } from 'lucide-react';
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
        { name: 'Blog', path: '/blog' }
    ];

    return (
        <>
            {/* HEADER PADRÃO */}
            <header className="w-full fixed top-0 left-0 bg-gradient-to-b from-black via-black/90 to-transparent z-50 transition-all duration-300 pb-2">
                <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-6 relative z-10 bg-transparent">

                    <Link to="/" className="flex items-center group" onClick={() => setIsMobileMenuOpen(false)}>
                        <img
                            src="/favicon.png"
                            alt="TorqueGyn"
                            className="h-10 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105 group-hover:brightness-125"
                        />
                    </Link>

                    {/* Navegação Desktop */}
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

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* O ÍCONE FURTIVO */}
                        {user ? (
                            <Link to="/admin" title="Painel Admin" className="text-neon-cyan/70 hover:text-neon-cyan p-2 transition-all duration-300 group">
                                <LayoutDashboard size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-all duration-300" />
                            </Link>
                        ) : (
                            <Link to="/login" title="Acesso Restrito" className="text-white/20 hover:text-neon-red p-2 transition-all duration-300 group">
                                <User size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-all duration-300" />
                            </Link>
                        )}

                        {/* Botão Hamburger (Abre o Overlay) */}
                        <button
                            className="md:hidden text-white hover:text-neon-red transition-colors p-2"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={26} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* OVERLAY MOBILE NATIVO (FULL SCREEN) */}
            <div
                className={`md:hidden fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl transition-all duration-500 ease-in-out flex flex-col ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Topo do Menu (Espelha o Header original para dar continuidade) */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-white/10 bg-black">
                    <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                        <img src="/favicon.png" alt="TorqueGyn" className="h-10 w-auto object-contain" />
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-neon-cyan/70 p-2">
                                <LayoutDashboard size={20} strokeWidth={1.5} />
                            </Link>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white/20 p-2">
                                <User size={20} strokeWidth={1.5} />
                            </Link>
                        )}
                        <button
                            className="text-white hover:text-neon-red p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={26} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Links Centrais com Animação em Cascata */}
                <div className="flex flex-col items-center justify-center flex-1 px-8 gap-2">
                    {navLinks.map((link, index) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ transitionDelay: `${isMobileMenuOpen ? index * 100 : 0}ms` }}
                            className={`text-sm font-display font-bold tracking-[0.4em] uppercase w-full text-center py-6 border-b border-white/5 transition-all duration-500 transform ${
                                isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            } ${
                                isActive(link.path) ? 'text-neon-cyan text-glow-cyan' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}