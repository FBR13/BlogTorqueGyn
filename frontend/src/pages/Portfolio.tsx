import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioItem { id: string; title: string; description: string; images: string[]; brand: string; }

// ==========================================
// COMPONENTE DO CARROSSEL INTELIGENTE (SEM TRAVADAS)
// ==========================================
function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sistema de Autoplay (Troca a cada 4 segundos)
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-display tracking-widest uppercase">Mídia Indisponível</div>;
  }

  return (
    <div className="relative w-full h-full group/carousel overflow-hidden">
      
      {/* O SEGREDO DO CROSSFADE: Carregamos TODAS as imagens e alternamos a visibilidade */}
      {images.map((imgSrc, idx) => (
        <img
          key={idx}
          src={imgSrc}
          alt={`${title} - vista ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-in-out grayscale group-hover/carousel:grayscale-0 ${
            idx === currentIndex 
              ? 'opacity-100 z-10 scale-100' // Imagem ativa (Visível e tamanho normal)
              : 'opacity-0 z-0 scale-105'    // Imagem inativa (Invisível e com leve zoom)
          }`}
        />
      ))}

      {/* Controles: Só aparecem se tiver mais de 1 foto */}
      {images.length > 1 && (
        <>
          {/* Setas Laterais (Escondidas até passar o mouse) */}
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500 z-20">
            <button onClick={prevImage} className="p-3 rounded-full glass-dark bg-black/60 text-white hover:text-neon-cyan hover:border-neon-cyan transition-all hover:scale-110">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="p-3 rounded-full glass-dark bg-black/60 text-white hover:text-neon-cyan hover:border-neon-cyan transition-all hover:scale-110">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Bolinhas Indicadoras (Rastreador de Posição) */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'bg-neon-cyan w-6 shadow-neon-cyan' : 'bg-white/30 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// PÁGINA PRINCIPAL DO PORTFÓLIO
// ==========================================
export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`);
        const data = await response.json();
        setItems(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchPortfolio();
  }, []);

  return (
    // Estrutura Base idêntica à Home
    <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">
      
      {/* Fundo Texturizado (Copiado exatamente da Home) */}
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/15 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

      {/* Título da Página */}
      <div className="pt-32 md:pt-40 pb-12 md:pb-16 px-6 border-b border-white/10 text-center relative overflow-hidden z-10">
        <h1 className="text-4xl md:text-8xl font-display font-bold tracking-tighter text-white">
          GALERIA <span className="font-luxury italic text-gray-500 font-light lowercase">Visual</span>
        </h1>
      </div>

      {loading ? (
        <div className="h-[40vh] md:h-[50vh] flex items-center justify-center z-10 relative">
          <span className="text-[10px] font-display tracking-[0.4em] uppercase text-neon-cyan animate-pulse">Sincronizando...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-32 md:py-40 text-center flex flex-col items-center z-10 relative">
          <span className="h-[1px] w-24 bg-white/20 mb-8" />
          <p className="text-[10px] md:text-[11px] font-display tracking-[0.25em] uppercase text-gray-500">O acervo visual está vazio.</p>
        </div>
      ) : (
        <div className="flex flex-col container mx-auto px-6 py-16 md:py-20 gap-16 md:gap-24 z-10 relative">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center group">
              <div className="md:col-span-4 p-6 md:p-8 glass-dark rounded-2xl relative overflow-hidden hover:border-neon-cyan transition-colors duration-500 bg-black/60">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="font-display text-6xl md:text-8xl font-black text-white">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="relative z-10">
                  <span className="text-[9px] font-display tracking-[0.4em] uppercase text-neon-cyan mb-3 md:mb-4 block">{item.brand}</span>
                  <h2 className="text-xl md:text-2xl font-display font-bold leading-tight text-white mb-4 md:mb-6">{item.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">{item.description}</p>
                </div>
              </div>

              {/* Retirei a classe "hover-glitch" daqui para não conflitar com a transição do carrossel */}
              <div className="md:col-span-8 overflow-hidden rounded-2xl relative aspect-video border border-white/10 glass-dark bg-black/60">
                <ImageCarousel images={item.images} title={item.title} />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}