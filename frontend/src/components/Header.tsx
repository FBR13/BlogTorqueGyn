import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu } from 'lucide-react';

export function Header() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="w-full sticky top-0 left-0 glass-dark border-b border-white/10 z-50">
            <div className="container mx-auto flex h-24 items-center justify-between px-6">

                {/* Logo: Recriando a essência da sua imagem (Geométrica e Forte) */}
                <Link to="/" className="flex flex-col group">
                    <span className="text-4xl font-display font-black tracking-tighter uppercase leading-none text-white group-hover:text-neon-red transition-colors duration-500 group-hover:text-glow-red">
                        TG
                    </span>
                    <span className="text-[9px] font-display tracking-[0.4em] text-gray-500 leading-none mt-2 uppercase group-hover:text-gray-300 transition-colors">
                        Torque Gyn
                    </span>
                </Link>

                {/* Navegação Minimalista Cyberpunk */}
                <nav className="hidden md:flex items-center gap-12">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'Editorial', path: '/blog' },
                        { name: 'Portfólio', path: '/portfolio' }
                    ].map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-[10px] font-display font-bold tracking-[0.25em] uppercase relative py-2 group ${isActive(link.path) ? 'text-white' : 'text-gray-500 hover:text-neon-cyan transition-colors duration-300'}`}
                        >
                            {link.name}
                            {/* Hairline Animada (Linha que acende) */}
                            <span className={`absolute bottom-0 left-0 h-[1px] bg-neon-cyan transition-all duration-500 ease-in-out ${isActive(link.path) ? 'w-full shadow-neon-cyan' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                    ))}
                </nav>

                {/* Ações (Login Estruturado com Glow) */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/login"
                        className="hidden md:flex items-center gap-4 text-[10px] font-display font-bold tracking-[0.2em] uppercase border border-white/20 bg-white/5 px-6 py-3 hover:border-neon-red hover:text-neon-red hover:shadow-neon-red transition-all duration-500 group"
                    >
                        <span>Acesso Restrito</span>
                        <LogIn size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>

                    {/* Menu Mobile */}
                    <button className="md:hidden text-white hover:text-neon-red transition-colors">
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                </div>

            </div>
        </header>
    );
}