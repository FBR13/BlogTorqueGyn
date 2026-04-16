import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Crosshair, Image as ImageIcon, FileText } from 'lucide-react';

// O "tipo" agora aceita tanto Posts quanto Portfólios
interface FeedItem {
  id: string;
  title: string;
  brand: string;
  image_url: string;
  type: 'post' | 'portfolio';
  created_at: string; // Precisamos da data para organizar
}

export function Home() {
  const [latestFeed, setLatestFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        // 1. Busca os dados nas duas rotas simultaneamente
        const [postsRes, portfolioRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/posts`),
          fetch(`${import.meta.env.VITE_API_URL}/portfolio`)
        ]);

        let postsData = [];
        let portfolioData = [];

        if (postsRes.ok) postsData = await postsRes.json();
        if (portfolioRes.ok) portfolioData = await portfolioRes.json();

        // 2. Transforma os Posts para o formato do Feed
        const formattedPosts: FeedItem[] = postsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          image_url: item.image_url,
          type: 'post',
          created_at: item.created_at
        }));

        // 3. Transforma o Portfólio para o formato do Feed (pegando a foto 0)
        const formattedPortfolio: FeedItem[] = portfolioData.map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          image_url: item.images && item.images.length > 0 ? item.images[0] : '', // Previne erro se não tiver foto
          type: 'portfolio',
          created_at: item.created_at
        }));

        // 4. Junta tudo num liquidificador
        const allItems = [...formattedPosts, ...formattedPortfolio];

        // 5. Organiza por data (do mais novo pro mais velho)
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // 6. Salva apenas os 3 primeiros!
        setLatestFeed(allItems.slice(0, 3));
      } catch (error) {
        console.error("Erro ao buscar feed central:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, []);

  return (
    <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">

      {/* Fundo Texturizado */}
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/15 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="relative flex flex-col justify-center px-6 py-20 md:py-32 min-h-[85vh] md:min-h-[90vh] border-b border-white/10 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6 md:mb-8 animate-fade-in">
            <Crosshair size={16} className="text-neon-red animate-spin-slow" />
            <span className="text-[10px] tracking-[0.4em] font-display font-bold uppercase text-neon-red text-glow-red">
              Motor Ligado
            </span>
          </div>

          <h1 className="text-5xl md:text-[90px] leading-[1.1] text-white mb-6 md:mb-8 animate-slide-up">
            <span className="font-display font-bold tracking-tighter uppercase block text-shadow-xl">
              A Estética da
            </span>
            <span className="font-luxury italic text-gray-400 font-light block transform -translate-y-1 md:-translate-y-2">
              Performance
            </span>
            <span className="font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
              Absoluta.
            </span>
          </h1>

          <p className="text-sm md:text-lg text-gray-400 max-w-xl leading-relaxed font-light mb-10 md:mb-12 animate-slide-up border-l-2 border-neon-red pl-4 md:pl-6" style={{ animationDelay: '0.2s' }}>
            Documentamos os projetos mais audaciosos e a mecânica de precisão. Onde a engenharia brutal encontra o design de alta costura.
          </p>

          <div className="animate-slide-up w-full md:w-auto" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/portfolio"
              className="flex md:inline-flex justify-center items-center gap-4 border border-white/20 glass-dark px-8 py-5 text-[11px] font-display font-bold tracking-[0.3em] uppercase hover:border-neon-red hover:text-neon-red hover:shadow-neon-red transition-all duration-500 group bg-black/40 w-full md:w-auto"
            >
              <Zap size={16} className="group-hover:animate-pulse" />
              <span>Acessar Portifólio</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* RADAR (MIX DE BLOG E PORTFOLIO) */}
      <section className="py-20 md:py-32 px-6 relative z-10">
        <div className="container mx-auto">

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-20 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-neon-cyan font-display font-bold block mb-4 text-glow-cyan">
                Radar Digital
              </span>
              <h2 className="text-4xl md:text-5xl font-luxury font-light text-white italic">
                Últimas Publicações
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="text-[10px] tracking-widest uppercase font-display text-gray-500 flex items-center gap-4">
              <div className="w-2 h-2 bg-neon-red rounded-full animate-ping"></div>
              Sincronizando feed...
            </div>
          ) : latestFeed.length === 0 ? (
            <div className="text-[10px] tracking-widest uppercase font-display text-gray-500">
              O acervo ainda está vazio.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {latestFeed.map((item, index) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.type === 'post' ? `/blog/${item.id}` : '/portfolio'}
                  className="group block cursor-pointer glass-dark rounded-xl p-4 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-glass hover-glitch bg-black/60 flex flex-col h-full"
                >
                  <div className="relative overflow-hidden aspect-[4/5] bg-black mb-6 rounded-lg border border-white/5 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px] tracking-widest">SEM IMAGEM</div>
                    )}

                    {/* Etiqueta de Identificação (Editorial vs Acervo Visual) */}
                    <div className="absolute top-4 left-4 glass-dark px-4 py-2 rounded-full flex items-center gap-2 bg-black/80 border border-white/10 shadow-xl">
                      {item.type === 'post' ? (
                        <FileText size={12} className="text-[#EF3340]" />
                      ) : (
                        <ImageIcon size={12} className="text-neon-cyan" />
                      )}
                      <span className={`text-[9px] tracking-[0.2em] font-display font-bold uppercase ${item.type === 'post' ? 'text-[#EF3340]' : 'text-neon-cyan'}`}>
                        {item.type === 'post' ? 'Editorial' : 'Acervo Visual'}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-[1px] bg-white/30 group-hover:w-12 group-hover:bg-white transition-all duration-500" />
                      <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-500 group-hover:text-white transition-colors">{item.brand}</span>
                    </div>
                    <h3 className="text-xl font-display leading-snug text-white group-hover:text-gray-300 transition-colors line-clamp-2 mt-auto">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}