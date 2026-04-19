import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Crosshair, Image as ImageIcon, FileText, MessageCircle, X, Send } from 'lucide-react';
import { supabase } from '../services/supabase';

interface FeedItem {
  id: string;
  title: string;
  brand: string;
  image_url: string;
  type: 'post' | 'portfolio';
  created_at: string;
}

export function Home() {
  const [latestFeed, setLatestFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cnpj: '',
    message: ''
  });

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const [postsRes, portfolioRes] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('portfolio').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        let postsData = postsRes.data || [];
        let portfolioData = portfolioRes.data || [];

        const formattedPosts: FeedItem[] = postsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          image_url: item.image_url,
          type: 'post',
          created_at: item.created_at
        }));

        const formattedPortfolio: FeedItem[] = portfolioData.map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          image_url: item.images && item.images.length > 0 ? item.images[0] : '',
          type: 'portfolio',
          created_at: item.created_at
        }));

        const allItems = [...formattedPosts, ...formattedPortfolio];
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setLatestFeed(allItems.slice(0, 3));
      } catch (error) {
        console.error("Erro ao buscar feed central:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, []);

  // --- FUNÇÕES DE MÁSCARA AUTOMÁTICA ---
  const formatCNPJ = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 14) v = v.substring(0, 14);

    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    return v;
  };

  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);

    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  };

  // --- Lógica de Envio do WhatsApp e CRM ---
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. SALVAR NO BANCO DE DADOS (NOVO CRM)
    try {
      await supabase.from('bookings').insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        doc_type: docType,
        document: formData.cnpj,
        message: formData.message
      }]);
    } catch (err) {
      console.error("Erro ao registrar agendamento no banco:", err);
    }

    // 2. ABRIR WHATSAPP
    const WHATSAPP_NUMBER = "5562991100118";

    let text = `*Agendamento de Ensaio - TorqueGyn* 📸\n\n`;
    text += `*Nome:* ${formData.name}\n`;
    text += `*Telefone:* ${formData.phone}\n`;
    text += `*E-mail:* ${formData.email}\n`;
    text += `*Documento:* ${docType}\n`;

    if (docType === 'CNPJ') {
      text += `*CNPJ:* ${formData.cnpj}\n`;
    }

    text += `\n*Mensagem:*\n${formData.message}`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');

    setIsModalOpen(false);
    setFormData({ name: '', phone: '', email: '', cnpj: '', message: '' });
  };

  return (
    <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">

      {/* Fundo Texturizado */}
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-[10%] -left-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/15 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] -right-[10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="relative flex flex-col justify-center px-6 pt-16 pb-20 md:pt-24 md:pb-32 min-h-[85vh] md:min-h-[90vh] border-b border-white/10 overflow-hidden">
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

          <div className="animate-slide-up flex flex-col md:flex-row gap-4 w-full md:w-auto" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/portfolio"
              className="flex md:inline-flex justify-center items-center gap-4 border border-white/20 glass-dark px-8 py-5 text-[11px] font-display font-bold tracking-[0.3em] uppercase hover:border-neon-red hover:text-neon-red hover:shadow-neon-red transition-all duration-500 group bg-black/40 w-full md:w-auto"
            >
              <Zap size={16} className="group-hover:animate-pulse" />
              <span>Acessar Portifólio</span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex md:inline-flex justify-center items-center gap-4 border border-neon-cyan/50 bg-neon-cyan/10 px-8 py-5 text-[11px] font-display font-bold tracking-[0.3em] uppercase text-neon-cyan hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-500 group w-full md:w-auto"
            >
              <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
              <span>Agende Suas Fotos</span>
            </button>
          </div>
        </div>
      </section>

      {/* RADAR */}
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
              {latestFeed.map((item) => (
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

                    <div className="absolute top-4 left-4 glass-dark px-4 py-2 rounded-full flex items-center gap-2 bg-black/80 border border-white/10 shadow-xl">
                      {item.type === 'post' ? (
                        <FileText size={12} className="text-[#EF3340]" />
                      ) : (
                        <ImageIcon size={12} className="text-neon-cyan" />
                      )}
                      <span className={`text-[9px] tracking-[0.2em] font-display font-bold uppercase ${item.type === 'post' ? 'text-[#EF3340]' : 'text-neon-cyan'}`}>
                        {item.type === 'post' ? 'Editorial' : 'Portifólio'}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fade-in py-10">
          <div className="glass-dark bg-black/95 border border-white/10 p-6 md:p-10 rounded-2xl max-w-lg w-full relative overflow-y-auto max-h-full shadow-2xl">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="mb-8">
              <span className="text-[9px] tracking-[0.3em] uppercase text-neon-cyan font-bold mb-3 block flex items-center gap-2">
                <MessageCircle size={14} /> Atendimento Premium
              </span>
              <h2 className="text-2xl md:text-3xl font-luxury text-white italic">Agende Suas Fotos</h2>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">
                Preencha os dados abaixo para darmos início ao seu projeto visual.
              </p>
            </div>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
                  placeholder="Nome Completo *"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    maxLength={15}
                    className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
                    placeholder="Seu WhatsApp *"
                  />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
                    placeholder="E-mail *"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[8px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-3 block">Tipo de Cliente</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDocType('CPF')}
                    className={`flex-1 py-2 text-[10px] tracking-[0.2em] uppercase font-bold rounded transition-all border ${docType === 'CPF'
                      ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                      : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    Pessoa Física
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('CNPJ')}
                    className={`flex-1 py-2 text-[10px] tracking-[0.2em] uppercase font-bold rounded transition-all border ${docType === 'CNPJ'
                      ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                      : 'border-white/10 text-gray-500 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    Pessoa Jurídica
                  </button>
                </div>
              </div>

              {docType === 'CNPJ' && (
                <div className="relative animate-fade-in">
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                    maxLength={18}
                    className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
                    placeholder="CNPJ *"
                  />
                </div>
              )}

              <div className="relative pt-2">
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="block w-full p-4 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-cyan focus:bg-white/10 transition-colors placeholder:text-gray-600 resize-none"
                  placeholder="Fale um pouco sobre o projeto e o veículo... *"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-neon-cyan text-black px-8 py-4 hover:bg-[#00d5e6] transition-all duration-300 rounded font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] group"
                >
                  <span className="text-[10px] tracking-[0.3em] uppercase">Confirmar e Ir para o WhatsApp</span>
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}