import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 relative overflow-hidden z-10">
      
      {/* Efeito de luz de fundo vazando na base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] bg-neon-red/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-8 mb-12">
          <div className="flex gap-12 md:gap-16 order-2 md:order-1 md:w-1/3 justify-center md:justify-start">

            {/* Bloco Jurídico/Legal */}
            <div>
              <h3 className="text-[10px] font-display tracking-[0.3em] uppercase text-white font-bold mb-6 text-center md:text-left">Legal</h3>
              <ul className="space-y-4 text-center md:text-left">
                <li><span className="text-[10px] md:text-[11px] tracking-widest font-display text-gray-600 block">Fotografia Automotiva</span></li>
                <li><span className="text-[10px] md:text-[11px] tracking-widest font-display text-gray-600 block">Base: Goiânia, GO</span></li>
                <li><a href="#" className="text-[10px] md:text-[11px] tracking-widest font-display uppercase text-gray-500 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-[10px] md:text-[11px] tracking-widest font-display uppercase text-gray-500 hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>

          </div>
          <div className="flex flex-col items-center text-center order-1 md:order-2 md:w-1/3">
            <Link to="/" className="inline-block mb-4 group">
              <img
                src="/favicon.png"
                alt="TorqueGyn"
                className="h-16 md:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:brightness-125"
              />
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-light">
              Documentamos a engenharia brutal e o design de alta costura. A busca incessante pela performance absoluta.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end order-3 md:order-3 md:w-1/3">
            <h3 className="text-[10px] font-display tracking-[0.3em] uppercase text-white font-bold mb-6 text-center md:text-right">Conectar</h3>
            <div className="flex items-center justify-center md:justify-end gap-3">
              
              {/* INSTAGRAM */}
              <a href="https://www.instagram.com/new.torquegyn/" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-red hover:text-neon-red hover:shadow-neon-red hover:-translate-y-1 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* TWITTER / X */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan hover:-translate-y-1 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>

              {/* E-MAIL */}
              <a href="mailto:enzoschragle123@gmail.com" className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan hover:-translate-y-1 transition-all duration-300">
                <Mail size={16} strokeWidth={1.5} />
              </a>

            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[9px] font-display tracking-[0.2em] uppercase text-gray-600 text-center md:text-left">
            © {new Date().getFullYear()} TorqueGyn.life. Todos os direitos reservados.
          </span>
          <span className="text-[9px] font-display tracking-[0.2em] uppercase text-gray-600 flex items-center gap-3">
            FBR.Dev <div className="w-2 h-2 bg-neon-red rounded-full animate-neon-flicker shadow-neon-red"></div> Ativo
          </span>
        </div>

      </div>
    </footer>
  );
}