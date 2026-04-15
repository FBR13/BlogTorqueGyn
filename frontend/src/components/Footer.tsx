import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 relative overflow-hidden z-10">
      
      {/* Efeito de luz de fundo vazando na base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] bg-neon-red/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Logo e Manifesto Curto */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6 group">
              <span className="text-4xl font-display font-black tracking-tighter uppercase text-white group-hover:text-neon-cyan transition-colors duration-500 group-hover:text-glow-cyan">
                TG
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
              Documentamos a engenharia brutal e o design de alta costura. A busca incessante pela performance absoluta no cenário automotivo.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-[10px] font-display tracking-[0.3em] uppercase text-white font-bold mb-6">Navegação</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-[11px] tracking-widest font-display uppercase text-gray-500 hover:text-neon-cyan transition-colors">Home</Link></li>
              <li><Link to="/blog" className="text-[11px] tracking-widest font-display uppercase text-gray-500 hover:text-neon-cyan transition-colors">Editorial</Link></li>
              <li><Link to="/portfolio" className="text-[11px] tracking-widest font-display uppercase text-gray-500 hover:text-neon-cyan transition-colors">Portfólio</Link></li>
            </ul>
          </div>

          {/* Redes Sociais com SVGs Nativos */}
          <div>
            <h3 className="text-[10px] font-display tracking-[0.3em] uppercase text-white font-bold mb-6">Conectar</h3>
            <div className="flex items-center gap-4">
              
              {/* INSTAGRAM */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-red hover:text-neon-red hover:shadow-neon-red hover:-translate-y-1 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* YOUTUBE */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-red hover:text-neon-red hover:shadow-neon-red hover:-translate-y-1 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>

              {/* TWITTER / X */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan hover:-translate-y-1 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>

              {/* E-MAIL */}
              <a href="mailto:contato@torquegyn.com" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan hover:-translate-y-1 transition-all duration-300">
                <Mail size={16} strokeWidth={1.5} />
              </a>

            </div>
          </div>
        </div>

        {/* Rodapé (Copyright) */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[9px] font-display tracking-[0.2em] uppercase text-gray-600">
            © {new Date().getFullYear()} TorqueGyn. Todos os direitos reservados.
          </span>
          <span className="text-[9px] font-display tracking-[0.2em] uppercase text-gray-600 flex items-center gap-3">
            Motor Cyberpunk <div className="w-2 h-2 bg-neon-red rounded-full animate-neon-flicker shadow-neon-red"></div> Ativo
          </span>
        </div>
      </div>
    </footer>
  );
}