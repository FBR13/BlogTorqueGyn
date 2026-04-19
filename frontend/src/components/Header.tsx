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
        <header className="w-full fixed top-0 left-0 bg-gradient-to-b from-black via-black/90 to-transparent z-50 transition-all duration-300 pb-2">
            {/* ALTURA REDUZIDA AQUI: h-16 md:h-20 */}
            <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-6 relative z-10 bg-transparent">

                <Link to="/" className="flex items-center group" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                        src="/favicon.png"
                        alt="TorqueGyn"
                        className="h-10 md:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-105 group-hover:brightness-125"
                    />
                </Link>

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
                    {user ? (
                        <Link to="/admin" title="Painel Admin" className="text-neon-cyan/70 hover:text-neon-cyan p-2 transition-all duration-300 group">
                            <LayoutDashboard size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-all duration-300" />
                        </Link>
                    ) : (
                        <Link to="/login" title="Acesso Restrito" className="text-white/20 hover:text-neon-red p-2 transition-all duration-300 group">
                            <User size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-all duration-300" />
                        </Link>
                    )}

                    <button
                        className="md:hidden text-white hover:text-neon-red transition-colors p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
                    </button>
                </div>
            </div>

            {/* Fundo preto sólido corrigido para não ter gap no mobile */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out origin-top ${isMobileMenuOpen ? 'max-h-[300px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}
            >
                <div className="flex flex-col items-center w-full px-8 pb-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-[11px] font-display font-bold tracking-[0.3em] uppercase w-full text-center py-5 border-b border-white/5 ${isActive(link.path) ? 'text-neon-cyan text-glow-cyan' : 'text-gray-400 hover:text-white'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}