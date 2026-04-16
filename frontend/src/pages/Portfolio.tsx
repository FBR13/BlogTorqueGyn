import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Send, User, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface PortfolioItem { id: string; title: string; description: string; images: string[]; brand: string; }

// ==========================================
// 1. COMPONENTE DE AVALIAÇÃO (RATING FORM)
// ==========================================
function RatingForm({ portfolioId }: { portfolioId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Por favor, selecione uma nota nas estrelas.');

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('portfolio_ratings').insert([{
        portfolio_id: portfolioId,
        rating_value: rating,
        reviewer_name: name || 'Anônimo',
        review_text: comment
      }]);

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 3000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      alert("Houve um erro ao enviar sua avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-8 border-t border-white/10 pt-6 animate-fade-in flex flex-col items-center justify-center text-center gap-2">
        <CheckCircle className="text-neon-cyan" size={24} />
        <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-white">Avaliação Registrada!</span>
        <p className="text-xs text-gray-500">Obrigado pelo seu feedback.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 border border-white/20 glass-dark bg-black/40 text-white px-4 py-3 hover:border-neon-cyan hover:text-neon-cyan transition-all duration-300 group"
        >
          <Star size={14} className="group-hover:fill-neon-cyan" />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Avaliar Projeto</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="animate-slide-up space-y-6">
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-500">Sua Nota</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  strokeWidth={1.5}
                  className={`cursor-pointer transition-all duration-300 ${star <= (hoveredRating || rating)
                      ? 'text-neon-cyan fill-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-110'
                      : 'text-gray-600 hover:text-gray-400'
                    }`}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
              <User size={14} className="text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-8 py-2 text-xs text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
              placeholder="Sua Identificação"
            />
          </div>

          <div className="relative group">
            <div className="absolute top-2 left-0 flex items-start pl-0 pointer-events-none">
              <MessageSquare size={14} className="text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
            </div>
            <textarea
              required
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="block w-full pl-8 py-2 text-xs text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors resize-none placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
              placeholder="Deixe seu comentário..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 border border-white/10 text-gray-400 text-[9px] font-bold tracking-[0.2em] uppercase py-3 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan text-[9px] font-bold tracking-[0.2em] uppercase py-3 hover:bg-neon-cyan hover:text-black transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar'}
              <Send size={12} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ==========================================
// 2. COMPONENTE DO CARROSSEL
// ==========================================
function ImageCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 4000);
    return () => clearInterval(interval);
  }, [images]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!images || images.length === 0) return <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-display tracking-widest uppercase">Mídia Indisponível</div>;

  return (
    <div className="relative w-full h-full group/carousel overflow-hidden">
      {images.map((imgSrc, idx) => (
        <img
          key={idx}
          src={imgSrc}
          alt={`${title} - vista ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] ease-in-out grayscale group-hover/carousel:grayscale-0 ${idx === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
            }`}
        />
      ))}
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500 z-20">
            <button onClick={prevImage} className="p-3 rounded-full glass-dark bg-black/60 text-white hover:text-neon-cyan hover:border-neon-cyan transition-all hover:scale-110"><ChevronLeft size={20} /></button>
            <button onClick={nextImage} className="p-3 rounded-full glass-dark bg-black/60 text-white hover:text-neon-cyan hover:border-neon-cyan transition-all hover:scale-110"><ChevronRight size={20} /></button>
          </div>
          <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-neon-cyan w-6 shadow-neon-cyan' : 'bg-white/30 w-2'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 3. PÁGINA PRINCIPAL DO PORTFÓLIO
// ==========================================
export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para guardar as médias de avaliação de cada projeto
  const [ratingsAvg, setRatingsAvg] = useState<Record<string, { avg: number, count: number }>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Puxa os dados do portfólio
        const portfolioRes = await fetch(`${import.meta.env.VITE_API_URL}/portfolio`);
        const portfolioData = await portfolioRes.json();
        setItems(portfolioData);

        // 2. Puxa todas as avaliações para montar as estrelas
        const { data: ratingsData } = await supabase.from('portfolio_ratings').select('portfolio_id, rating_value');

        if (ratingsData) {
          // Calcula a média e a quantidade de votos para cada carro
          const grouped = ratingsData.reduce((acc: any, curr: any) => {
            if (!acc[curr.portfolio_id]) acc[curr.portfolio_id] = { sum: 0, count: 0 };
            acc[curr.portfolio_id].sum += curr.rating_value;
            acc[curr.portfolio_id].count += 1;
            return acc;
          }, {});

          const finalAverages: any = {};
          for (const key in grouped) {
            finalAverages[key] = {
              avg: Math.round(grouped[key].sum / grouped[key].count), // Arredonda para a estrela mais próxima
              count: grouped[key].count
            };
          }
          setRatingsAvg(finalAverages);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/15 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

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
          {items.map((item, index) => {
            const itemRating = ratingsAvg[item.id]; // Pega a nota deste carro específico

            return (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch group">

                {/* CAIXA DE TEXTO E AVALIAÇÃO */}
                <div className="md:col-span-4 p-6 md:p-8 glass-dark rounded-2xl relative overflow-hidden hover:border-neon-cyan transition-colors duration-500 bg-black/60 flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="font-display text-6xl md:text-8xl font-black text-white">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <span className="text-[9px] font-display tracking-[0.4em] uppercase text-neon-cyan mb-3 md:mb-4 block">{item.brand}</span>
                    <h2 className="text-xl md:text-2xl font-display font-bold leading-tight text-white mb-2">{item.title}</h2>

                    {/* EXIBIÇÃO DA MÉDIA DE ESTRELAS */}
                    <div className="flex items-center gap-1 mb-4 md:mb-6">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={12}
                          strokeWidth={2}
                          className={`${itemRating && itemRating.avg >= star ? 'text-neon-cyan fill-neon-cyan' : 'text-gray-700'} transition-colors`}
                        />
                      ))}
                      <span className="text-[9px] font-bold tracking-widest text-gray-500 ml-2">
                        ({itemRating ? itemRating.count : 0} votos)
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed font-light text-justify flex-1">{item.description}</p>

                    <RatingForm portfolioId={item.id} />
                  </div>
                </div>

                {/* CAIXA DA FOTO */}
                <div className="md:col-span-8 overflow-hidden rounded-2xl relative min-h-[300px] h-full w-full border border-white/10 glass-dark bg-black/60">
                  <ImageCarousel images={item.images} title={item.title} />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}