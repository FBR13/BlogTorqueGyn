import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Post { id: string; title: string; brand: string; image_url: string; created_at: string; }

export function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
                const data = await response.json();
                setPosts(data);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen relative z-0">
            <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_20%_at_50%_0%,#000_20%,transparent_100%)] opacity-40"></div>

            <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6 border-b border-white/10">
                <div className="container mx-auto">
                    <span className="text-[10px] font-display tracking-[0.4em] uppercase font-bold text-neon-cyan text-glow-cyan mb-4 md:mb-6 block">
                        TorqueGyn Magazine
                    </span>
                    <h1 className="text-5xl md:text-[120px] font-luxury leading-[0.85] italic tracking-tighter mb-8 text-white">
                        O Acervo <br />
                        <span className="not-italic font-display font-black uppercase text-4xl md:text-8xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">Editorial</span>
                    </h1>
                </div>
            </section>

            <section className="container mx-auto px-6 py-16 md:py-20">
                {loading ? (
                    <div className="h-[40vh] md:h-[60vh] flex items-center justify-center">
                        <span className="text-[10px] tracking-widest uppercase font-display text-gray-500 animate-pulse">Lendo arquivos...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-20 md:gap-32">
                        {posts.map((post, index) => (
                            <article key={post.id} className={`group flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>

                                <Link to={`/blog/${post.id}`} className="w-full md:w-7/12 overflow-hidden aspect-[16/9] md:aspect-[16/9] bg-gray-900 relative reveal-image rounded-xl border border-white/10 glass-dark hover-glitch block">
                                    <img src={post.image_url} className="w-full h-full object-cover transition-transform duration-[2s] scale-110 group-hover:scale-100 filter grayscale group-hover:grayscale-0" alt={post.title} />
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 glass-dark bg-black/80 px-3 md:px-4 py-1 md:py-2 rounded-full text-white text-[9px] md:text-[10px] tracking-[0.3em] font-display font-bold group-hover:text-neon-cyan transition-colors">
                                        ED.{String(index + 1).padStart(3, '0')}
                                    </div>
                                </Link>

                                <div className="w-full md:w-5/12 space-y-4 md:space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="h-[1px] w-8 md:w-12 bg-neon-red" />
                                        <span className="text-[9px] md:text-[10px] font-display tracking-widest font-black uppercase text-gray-400 group-hover:text-neon-red transition-colors">{post.brand}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight text-white group-hover:text-gray-300 transition-colors">
                                        {post.title}
                                    </h2>
                                    <Link to={`/blog/${post.id}`} className="pt-4 md:pt-8 text-[9px] md:text-[10px] font-display font-bold tracking-[0.3em] uppercase border-b border-white/30 pb-2 hover:text-neon-red hover:border-neon-red hover:shadow-neon-red transition-all inline-flex items-center gap-4 group/btn">
                                        <span>Ler Matéria</span>
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}