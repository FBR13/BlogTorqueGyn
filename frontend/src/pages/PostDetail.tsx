import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { supabase } from '../services/supabase';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // BUSCA DIRETA NO SUPABASE
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("Erro ao buscar matéria:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative z-0">
         <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-40 pointer-events-none"></div>
        <span className="text-[10px] font-display tracking-[0.4em] uppercase text-neon-red animate-pulse">Descriptografando...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative z-0 text-center px-6">
        <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-40 pointer-events-none"></div>
        <h1 className="text-4xl font-display font-bold text-white mb-4">Registro Não Encontrado</h1>
        <p className="text-gray-400 mb-8">Esta matéria foi removida ou o link é inválido.</p>
        <Link to="/blog" className="text-[10px] tracking-widest uppercase text-neon-red border border-neon-red px-6 py-3 hover:bg-neon-red hover:text-black transition-colors">Voltar ao Radar</Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen selection:bg-neon-red selection:text-white relative z-0 pb-20">
      {/* Fundo Texturizado */}
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] opacity-40 pointer-events-none fixed"></div>

      {/* Capa do Post */}
      <div className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden border-b border-white/10">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 container mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-neon-red transition-colors mb-6 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Editorial
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="glass-dark px-3 py-1.5 rounded-full flex items-center gap-2 bg-black/60 border border-white/10">
              <FileText size={10} className="text-neon-red" />
              <span className="text-[8px] tracking-[0.2em] font-bold uppercase text-neon-red">{post.brand}</span>
            </span>
            <span className="flex items-center gap-1 text-[9px] tracking-[0.2em] uppercase text-gray-400">
              <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-6xl font-display font-bold text-white max-w-4xl leading-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Corpo do Texto */}
      <article className="container mx-auto px-6 pt-12 md:pt-20 max-w-3xl relative z-10">
        <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-light prose-h2:font-display prose-h2:text-2xl prose-h2:text-white prose-a:text-neon-red hover:prose-a:text-white prose-strong:text-white prose-strong:font-bold prose-blockquote:border-neon-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:not-italic prose-blockquote:text-gray-300 text-justify">
          {/* Se você tiver Markdown, use um renderizador. Se for texto puro, dividimos por quebra de linha */}
          {post.content.split('\n').map((paragraph: string, idx: number) => (
            paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
          ))}
        </div>
      </article>
    </div>
  );
}