import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Share2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface BlogPost {
  id: string;
  title: string;
  brand: string;
  description: string;
  image_url: string;
  created_at: string;
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Erro ao buscar editoriais:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleShare = async (e: React.MouseEvent, post: BlogPost) => {
    e.preventDefault();
    const postUrl = `${window.location.origin}/blog/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TorqueGyn | ${post.title}`,
          text: post.description,
          url: postUrl,
        });
      } catch (error) {
        console.log('Compartilhamento falhou:', error);
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      alert('Link copiado!');
    }
  };

  // 🚀 A MÁGICA DE LIMPEZA DE TEXTO: Remove tags HTML e lixo do Quill (como &nbsp;) para o preview
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="bg-black min-h-screen flex flex-col selection:bg-neon-red selection:text-white relative z-0">
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)] opacity-60"></div>
      <div className="absolute top-[10%] -right-[10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-neon-red/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="pt-32 md:pt-40 pb-12 md:pb-16 px-6 border-b border-white/10 text-center relative overflow-hidden z-10">
        <h1 className="text-4xl md:text-8xl font-display font-bold tracking-tighter text-white">
          RADAR <span className="font-luxury italic text-gray-500 font-light lowercase">Editorial</span>
        </h1>
        <p className="text-gray-400 mt-6 max-w-xl mx-auto text-sm md:text-base font-light tracking-wide">
          Análises profundas e bastidores da engenharia automotiva.
        </p>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center z-10 relative">
          <span className="text-[10px] font-display tracking-[0.4em] uppercase text-neon-red animate-pulse">Sincronizando...</span>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-16 md:py-20 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group block glass-dark rounded-xl p-4 hover:border-neon-red/50 transition-all duration-500 hover:-translate-y-2 bg-black/60 flex flex-col h-full relative"
              >
                <button
                  onClick={(e) => handleShare(e, post)}
                  className="absolute top-6 right-6 z-20 glass-dark p-2 rounded-full bg-black/80 border border-white/10 hover:border-neon-red transition-all shadow-xl"
                >
                  <Share2 size={16} className="text-gray-400" />
                </button>

                <div className="relative overflow-hidden aspect-video md:aspect-[4/5] bg-black mb-6 rounded-lg border border-white/5 shrink-0">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px] tracking-widest">SEM IMAGEM</div>
                  )}
                  <div className="absolute top-4 left-4 glass-dark px-4 py-2 rounded-full flex items-center gap-2">
                    <FileText size={12} className="text-neon-red" />
                    <span className="text-[9px] font-bold uppercase text-neon-red">Ler Matéria</span>
                  </div>
                </div>

                <div className="px-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-gray-500">{post.brand}</span>
                    <span className="text-[8px] uppercase text-gray-600">{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h3 className="text-xl font-display text-white group-hover:text-neon-red transition-colors line-clamp-2 mb-3">{post.title}</h3>

                  <div className="text-sm text-gray-400 font-light line-clamp-3 mb-6 flex-1">
                    {stripHtml(post.description)}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 mt-auto">
                    Acessar Conteúdo <ArrowRight size={14} className="group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}