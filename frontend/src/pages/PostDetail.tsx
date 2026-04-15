import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Post {
  id: string; title: string; brand: string; description: string; content: string; image_url: string; created_at: string;
}

export function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar matéria');
        const data = await response.json();
        setPost(data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[10px] font-display tracking-[0.3em] uppercase text-gray-500 animate-pulse">Descriptografando...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6">
        <h1 className="text-4xl font-display text-white">Erro 404</h1>
        <Link to="/blog" className="text-[10px] font-display tracking-widest uppercase border-b border-white/30 pb-1 hover:text-neon-red hover:border-neon-red transition-colors">
          Voltar ao Radar
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen pb-32">
      {/* Capa */}
      <header className="relative w-full h-[70vh] md:h-[85vh] bg-black">
        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto max-w-4xl">
            <Link to="/blog" className="inline-flex items-center gap-4 text-white/50 hover:text-white transition-colors mb-8 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
              <span className="text-[10px] font-display tracking-[0.3em] uppercase font-bold">Retornar</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-display tracking-[0.4em] uppercase text-neon-cyan text-glow-cyan font-bold">
                {post.brand}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[10px] font-display tracking-[0.2em] uppercase text-white/50">
                {new Date(post.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light max-w-3xl leading-relaxed border-l-2 border-neon-red pl-6">
              {post.description}
            </p>
          </div>
        </div>
      </header>

      {/* Leitura */}
      <div className="container mx-auto px-6 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-gray-300 font-light leading-[2.2] tracking-wide">
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-10 text-[17px] md:text-[19px]">
                  {index === 0 ? (
                    <span className="float-left text-7xl font-luxury italic leading-[0.8] pr-4 pt-2 text-neon-red text-shadow-xl">
                      {paragraph.charAt(0)}
                    </span>
                  ) : null}
                  {index === 0 ? paragraph.slice(1) : paragraph}
                </p>
              ) : null
            ))}
          </div>
          
          <div className="mt-32 pt-12 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] font-display tracking-[0.4em] font-bold uppercase text-gray-600">Fim do Registro</span>
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse text-glow-cyan"></span>
          </div>
        </div>
      </div>
    </article>
  );
}