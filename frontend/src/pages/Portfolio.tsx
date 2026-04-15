import { useState, useEffect } from 'react';

interface PortfolioItem {
  id: string; title: string; description: string; images: string[]; brand: string;
}

export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`);
        const data = await response.json();
        setItems(data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchPortfolio();
  }, []);

  return (
    <div className="min-h-screen relative z-0">
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20"></div>
      
      <div className="pt-40 pb-16 px-6 border-b border-white/10 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-white">
          GALERIA <span className="font-luxury italic text-gray-500 font-light lowercase">Visual</span>
        </h1>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <span className="text-[10px] font-display tracking-[0.4em] uppercase text-neon-cyan animate-pulse">Sincronizando...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-40 text-center flex flex-col items-center">
          <span className="h-[1px] w-24 bg-white/20 mb-8" />
          <p className="text-[11px] font-display tracking-[0.25em] uppercase text-gray-500">O acervo visual está vazio.</p>
        </div>
      ) : (
        <div className="flex flex-col container mx-auto px-6 py-20 gap-24">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center group">
              
              <div className="md:col-span-4 p-8 glass-dark rounded-2xl relative overflow-hidden hover:border-neon-cyan transition-colors duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="font-display text-8xl font-black text-white">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="relative z-10">
                  <span className="text-[9px] font-display tracking-[0.4em] uppercase text-neon-cyan mb-4 block">
                    {item.brand}
                  </span>
                  <h2 className="text-2xl font-display font-bold leading-tight text-white mb-6">{item.title}</h2>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 overflow-hidden rounded-2xl relative aspect-video border border-white/10 glass-dark hover-glitch">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s] ease-out filter grayscale group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-display tracking-widest uppercase">
                    Mídia Indisponível
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}