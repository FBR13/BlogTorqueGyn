import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../services/supabase';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
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

  const handleShare = async () => {
    const postUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TorqueGyn | ${post.title}`,
          text: post.description,
          url: postUrl,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado ou falhou:', error);
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

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
    <>
      <Helmet>
        <title>TorqueGyn | {post.title}</title>
        <meta name="description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={post.image_url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={post.image_url} />
      </Helmet>

      <div className="bg-black min-h-screen selection:bg-neon-red selection:text-white relative z-0 pb-20">
        <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] opacity-40 pointer-events-none fixed"></div>

        <div className="w-full min-h-[50vh] md:min-h-[70vh] relative overflow-hidden border-b border-white/10 flex flex-col justify-end pt-32 pb-8 md:pb-16">
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover z-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="flex items-center justify-between mb-8">
              <Link to="/blog" className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-neon-red transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Editorial
              </Link>
              <button onClick={handleShare} className="glass-dark p-2 md:p-3 rounded-full bg-black/50 border border-white/20 hover:border-neon-red hover:bg-neon-red/20 transition-all shadow-xl group">
                <Share2 size={16} className="text-white group-hover:text-neon-red transition-colors" />
              </button>
            </div>
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

        <article className="container mx-auto px-6 pt-12 md:pt-20 max-w-3xl relative z-10">
          <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-light prose-h2:font-display prose-h2:text-3xl prose-h2:text-white prose-h2:mt-12 prose-h3:font-display prose-h3:text-xl prose-h3:text-white prose-a:text-neon-red hover:prose-a:text-white prose-strong:text-white prose-strong:font-bold prose-blockquote:border-neon-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:not-italic prose-ul:text-gray-300 prose-li:marker:text-neon-red text-justify">

            {/* 🚀 LÓGICA HÍBRIDA AQUI */}
            {post.content && post.content.includes('<p>') ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div className="whitespace-pre-wrap">
                {post.content?.split('\n').map((paragraph: string, idx: number) => (
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
            )}

          </div>
        </article>
      </div>
    </>
  );
}