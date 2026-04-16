import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { LogOut, Plus, Settings, X, Save, Trash2, Edit2, UploadCloud, Image as ImageIcon, FileText, Activity, ChevronDown, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const BRANDS = ['Ferrari', 'Porsche', 'Lamborghini', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Audi'];

function ImageManager({ item, tab, onUpdate }: { item: any, tab: string, onUpdate: (id: string, newImages: string[]) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const images = tab === 'portfolio' ? (item.images || []) : (item.image_url ? [item.image_url] : []);

  const next = () => { if (images.length > 0) setCurrentIndex(p => (p + 1) % images.length); };
  const prev = () => { if (images.length > 0) setCurrentIndex(p => (p === 0 ? images.length - 1 : p - 1)); };

  const handleFastUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      let uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${tab}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('editoriais').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('editoriais').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      const updatedImages = tab === 'portfolio' ? [...images, ...uploadedUrls] : [uploadedUrls[0]];

      // ATUALIZADO: Usando Supabase direto!
      const payload = tab === 'portfolio' ? { images: updatedImages } : { image_url: updatedImages[0] };
      const { error } = await supabase.from(tab).update(payload).eq('id', item.id);
      if (error) throw error;

      onUpdate(item.id, updatedImages);
      if (tab === 'portfolio') setCurrentIndex(images.length);

    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar imagens.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Remover ESTA imagem específica do carrossel?")) return;
    try {
      const updatedImages = images.filter((_: any, idx: number) => idx !== currentIndex);

      // ATUALIZADO: Usando Supabase direto!
      const payload = tab === 'portfolio' ? { images: updatedImages } : { image_url: null };
      const { error } = await supabase.from(tab).update(payload).eq('id', item.id);
      if (error) throw error;

      onUpdate(item.id, updatedImages);
      setCurrentIndex(0);
    } catch (error) {
      console.error(error);
      alert("Erro ao remover imagem.");
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-24 h-16 md:w-32 md:h-20 bg-white/5 rounded-lg flex items-center justify-center relative border border-white/10 shrink-0">
        <input type="file" id={`upload-${item.id}`} multiple={tab === 'portfolio'} accept="image/*" className="hidden" onChange={handleFastUpload} />
        <label htmlFor={`upload-${item.id}`} className="cursor-pointer text-gray-500 hover:text-neon-cyan flex flex-col items-center transition-colors w-full h-full justify-center">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </label>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden border border-white/10 group/carousel bg-black shrink-0">
      <img src={images[currentIndex]} className="w-full h-full object-cover transition-opacity duration-300" alt="thumb" />

      {isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
          <Loader2 size={16} className="text-neon-cyan animate-spin" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 flex items-center justify-between px-1">
        {images.length > 1 ? <button onClick={prev} className="p-0.5 glass-dark bg-black/80 rounded-full hover:text-neon-cyan"><ChevronLeft size={14} /></button> : <div />}
        {images.length > 1 ? <button onClick={next} className="p-0.5 glass-dark bg-black/80 rounded-full hover:text-neon-cyan"><ChevronRight size={14} /></button> : <div />}
      </div>

      <div className="absolute top-1 right-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-30 flex gap-1">
        {tab === 'portfolio' && (
          <button onClick={handleRemoveImage} title="Apagar esta foto" className="p-1 rounded-full bg-black/80 hover:bg-neon-red text-white transition-colors">
            <Trash2 size={10} />
          </button>
        )}
        <label title="Adicionar fotos" className="p-1 rounded-full bg-black/80 hover:bg-neon-cyan hover:text-black text-white cursor-pointer transition-colors">
          <input type="file" multiple={tab === 'portfolio'} accept="image/*" className="hidden" onChange={handleFastUpload} />
          {tab === 'posts' ? <Edit2 size={10} /> : <Plus size={10} />}
        </label>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] text-white font-bold z-20 tracking-widest">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

export function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio' | 'metrics'>('posts');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ title: '', brand: BRANDS[0], description: '', content: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const fastFileInputRef = useRef<HTMLInputElement>(null);
  const [isFastUploading, setIsFastUploading] = useState(false);

  const [pageViews, setPageViews] = useState<any[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({ totalRatings: 0, average: 0 });

  useEffect(() => {
    if (!isCreating && activeTab !== 'metrics') fetchItems();
    if (activeTab === 'metrics') fetchMetrics();
  }, [isCreating, activeTab]);

  // ATUALIZADO: Puxando direto do Supabase
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from(activeTab).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setItems(data);
    } catch (error) { console.error("Erro ao buscar dados:", error); } finally { setIsLoading(false); }
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const { data: viewsData } = await supabase.from('page_views').select('path, session_id');
      if (viewsData) {
        const uniqueViews: Record<string, Set<string>> = {};
        viewsData.forEach((view: any) => {
          let route = view.path;
          if (route.startsWith('/blog/')) route = '/blog (Leituras)';
          if (!uniqueViews[route]) uniqueViews[route] = new Set();
          if (view.session_id) uniqueViews[route].add(view.session_id);
          else uniqueViews[route].add(Math.random().toString());
        });
        const chartData = Object.keys(uniqueViews).map(path => {
          let name = 'Outros';
          if (path === '/') name = 'Home';
          if (path === '/portfolio') name = 'Portfólio';
          if (path === '/blog') name = 'Editorial (Radar)';
          if (path === '/blog (Leituras)') name = 'Matérias (Lidas)';
          if (path === '/admin') name = 'Painel Admin';
          return { name, acessos: uniqueViews[path].size };
        });
        chartData.sort((a, b) => b.acessos - a.acessos);
        setPageViews(chartData);
      }
      const { data: ratingsData } = await supabase.from('portfolio_ratings').select('rating_value');
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating_value, 0);
        setPortfolioStats({ totalRatings: ratingsData.length, average: (sum / ratingsData.length) });
      }
    } catch (error) { console.error("Erro nas métricas:", error); } finally { setIsLoading(false); }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      brand: item.brand || BRANDS[0],
      description: item.description || '',
      content: item.content || ''
    });
    setEditingImages(item.images || []);
    setCurrentCarouselIndex(0);
    setImageFiles([]);
    setIsCreating(true);
  };

  const nextEditImg = () => setCurrentCarouselIndex(p => (p + 1) % editingImages.length);
  const prevEditImg = () => setCurrentCarouselIndex(p => (p === 0 ? editingImages.length - 1 : p - 1));

  const removeExistingImage = (idxToRemove: number) => {
    if (!window.confirm("Apagar esta imagem?")) return;
    setEditingImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
    if (currentCarouselIndex >= idxToRemove && currentCarouselIndex > 0) {
      setCurrentCarouselIndex(p => p - 1);
    }
  };

  const handleFastUploadInEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingId) return;

    setIsFastUploading(true);
    setMessage("Sincronizando novas fotos no servidor...");

    try {
      let uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${activeTab}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('editoriais').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('editoriais').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      const updatedImages = [...editingImages, ...uploadedUrls];
      setEditingImages(updatedImages);
      setCurrentCarouselIndex(editingImages.length);
      setMessage("Fotos adicionadas! Salve o formulário para confirmar as alterações.");

    } catch (error) {
      console.error(error);
      setMessage("Erro ao adicionar fotos rápidas.");
    } finally {
      setIsFastUploading(false);
      if (fastFileInputRef.current) fastFileInputRef.current.value = '';
    }
  };

  // ATUALIZADO: Salvar, Editar e Criar 100% no Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && imageFiles.length === 0) {
      setMessage('Erro: A fotografia é obrigatória para novas publicações.');
      return;
    }

    if (editingId && activeTab === 'portfolio' && editingImages.length === 0 && imageFiles.length === 0) {
      setMessage('Erro: O portfólio precisa de pelo menos uma imagem.');
      return;
    }

    setIsSubmitting(true);
    setMessage(editingId ? 'Atualizando registro no servidor...' : 'Sincronizando mídia(s) no servidor...');

    try {
      let finalNewImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${activeTab}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('editoriais').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('editoriais').getPublicUrl(fileName);
          finalNewImageUrls.push(publicUrlData.publicUrl);
        }
      }

      let payload: any = activeTab === 'posts'
        ? { ...formData }
        : { title: formData.title, brand: formData.brand, description: formData.description };

      if (activeTab === 'portfolio') {
        if (editingId) payload.images = [...editingImages, ...finalNewImageUrls];
        else payload.images = finalNewImageUrls;
      }
      else if (activeTab === 'posts' && finalNewImageUrls.length > 0) {
        payload.image_url = finalNewImageUrls[0];
      }

      // COMUNICAÇÃO DIRETA COM O SUPABASE AQUI!
      if (editingId) {
        const { error } = await supabase.from(activeTab).update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(activeTab).insert([payload]);
        if (error) throw error;
      }

      setMessage(editingId ? 'Registro atualizado com sucesso!' : 'Sincronização concluída com sucesso!');
      setTimeout(() => handleCloseForm(), 2000);

    } catch (error) {
      console.error(error);
      setMessage('Erro crítico de conexão com o banco de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (id: string) => setDeletingId(id);

  // ATUALIZADO: Deletar usando Supabase
  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from(activeTab).delete().eq('id', deletingId);
      if (error) throw error;

      setItems(items.filter(item => item.id !== deletingId));
    } catch (error) {
      console.error("Falha ao deletar:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', brand: BRANDS[0], description: '', content: '' });
    setEditingImages([]);
    setImageFiles([]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative z-0 selection:bg-neon-red selection:text-white">
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] opacity-40 pointer-events-none"></div>

      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fade-in">
          <div className="glass-dark bg-black/90 border border-neon-red/50 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,51,64,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-red/20 rounded-full blur-[50px] -z-10 pointer-events-none"></div>
            <AlertTriangle size={48} strokeWidth={1.5} className="text-neon-red mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-luxury text-white mb-2">Excluir Registro?</h3>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Esta ação é permanente. O arquivo será removido do banco de dados e não poderá ser recuperado. Deseja continuar?
            </p>
            <div className="flex gap-4">
              <button onClick={cancelDelete} className="flex-1 py-3 text-[9px] tracking-[0.2em] uppercase font-bold text-gray-400 border border-white/10 hover:bg-white/5 transition-colors rounded">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 text-[9px] tracking-[0.2em] uppercase font-bold text-black bg-neon-red hover:bg-[#ff4a57] transition-all shadow-[0_0_15px_rgba(239,51,64,0.4)] hover:shadow-[0_0_25px_rgba(239,51,64,0.6)] rounded">Excluir</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Settings size={16} className="text-neon-red animate-spin-slow" />
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase text-white">Central Admin</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-neon-red transition-colors">
            <LogOut size={14} /> <span className="hidden md:inline">Desconectar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 w-full max-w-5xl relative z-10">
        {!isCreating ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 border-b border-white/10 pb-6 gap-6">
              <div className="w-full">
                <h1 className="text-3xl md:text-4xl font-luxury tracking-tight text-white italic mb-6">Controle de Acervo</h1>

                <div className="flex gap-4 md:gap-8 overflow-x-auto w-full">
                  <button onClick={() => setActiveTab('portfolio')} className={`flex whitespace-nowrap items-center gap-2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold pb-3 border-b-2 transition-all ${activeTab === 'portfolio' ? 'border-neon-cyan text-white text-glow-cyan' : 'border-transparent text-gray-500 hover:text-white'}`}>
                    <ImageIcon size={14} /> Portifólio
                  </button>

                  <button onClick={() => setActiveTab('posts')} className={`flex whitespace-nowrap items-center gap-2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold pb-3 border-b-2 transition-all ${activeTab === 'posts' ? 'border-neon-red text-white text-glow-red' : 'border-transparent text-gray-500 hover:text-white'}`}>
                    <FileText size={14} /> Editorial
                  </button>

                  <button onClick={() => setActiveTab('metrics')} className={`flex whitespace-nowrap items-center gap-2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold pb-3 border-b-2 transition-all ${activeTab === 'metrics' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-white'}`}>
                    <Activity size={14} /> Telemetria
                  </button>
                </div>
              </div>

              {activeTab !== 'metrics' && (
                <button onClick={() => setIsCreating(true)} className="flex w-full md:w-auto items-center justify-center gap-3 border border-white/20 glass-dark bg-black/40 text-white px-6 py-4 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan transition-all duration-500 group">
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Novo Arquivo</span>
                </button>
              )}
            </div>

            {activeTab === 'metrics' ? (
              <div className="space-y-8 animate-fade-in">
                {isLoading ? (
                  <div className="p-12 text-center text-[10px] tracking-widest text-gray-500 uppercase animate-pulse">Processando Dados...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-dark bg-black/60 border border-white/10 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 rounded-full blur-[50px]"></div>
                        <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-neon-cyan mb-2">Tráfego Total (Visitantes Únicos)</h3>
                        <p className="text-5xl font-display font-bold text-white">{pageViews.reduce((acc, curr) => acc + curr.acessos, 0)}</p>
                      </div>
                      <div className="glass-dark bg-black/60 border border-white/10 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-red/10 rounded-full blur-[50px]"></div>
                        <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-neon-red mb-2">Avaliação Média do Portfólio</h3>
                        <div className="flex items-end gap-2">
                          <p className="text-5xl font-display font-bold text-white">{portfolioStats.average.toFixed(1)}</p>
                          <span className="text-xs tracking-widest text-gray-500 mb-2">/ 5.0 ({portfolioStats.totalRatings} votos)</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-dark bg-black/60 border border-white/10 p-6 md:p-8 rounded-xl">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 border-b border-white/10 pb-4 mb-8">Visitantes por Página</h3>

                      <div className="h-72 w-full min-w-full">
                        <ResponsiveContainer width="99%" height="100%">
                          <BarChart data={pageViews} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(0, 240, 255, 0.05)' }} contentStyle={{ backgroundColor: '#070709', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#00F0FF', fontWeight: 'bold', fontSize: '14px' }} labelStyle={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }} />
                            <Bar dataKey="acessos" fill="#00F0FF" radius={[4, 4, 0, 0]} name="Visitantes Únicos" barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="glass-dark bg-black/60 border border-white/10 rounded-xl overflow-hidden">
                {isLoading ? (
                  <div className="p-8 md:p-12 text-center text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-gray-500 animate-pulse">Lendo banco de dados...</div>
                ) : items.length === 0 ? (
                  <div className="p-8 md:p-12 text-center flex flex-col items-center">
                    <span className="h-[1px] w-12 bg-white/20 mb-6" />
                    <p className="text-[9px] md:text-[11px] tracking-[0.2em] uppercase text-gray-500">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {items.map(item => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 border-b border-white/5 group hover:bg-white/5 transition-colors gap-4">

                        <div className="flex items-center gap-4 flex-1">
                          <ImageManager item={item} tab={activeTab} onUpdate={(id, newImages) => {
                            setItems(prev => prev.map(i => {
                              if (i.id === id) {
                                return activeTab === 'portfolio' ? { ...i, images: newImages } : { ...i, image_url: newImages[0] };
                              }
                              return i;
                            }));
                          }} />

                          <div className="flex flex-col">
                            <span className="text-[8px] tracking-[0.3em] uppercase text-gray-500 group-hover:text-neon-cyan transition-colors font-bold mb-1">{item.brand} — {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                            <h3 className="text-lg font-luxury text-white group-hover:text-gray-300 transition-colors">{item.title}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto mt-4 md:mt-0">
                          <button onClick={() => handleEdit(item)} className="text-gray-500 hover:text-neon-cyan transition-colors p-2 bg-white/5 md:bg-transparent rounded md:rounded-none hover:bg-neon-cyan/10">
                            <Edit2 size={16} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => requestDelete(item.id)} className="text-gray-500 hover:text-neon-red transition-colors p-2 bg-white/5 md:bg-transparent rounded md:rounded-none hover:bg-neon-red/10">
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="glass-dark bg-black/80 border border-white/10 rounded-xl p-6 md:p-16 relative">
            <button onClick={handleCloseForm} className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-500 hover:text-neon-red transition-colors p-2"><X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} /></button>
            <div className="mb-8 md:mb-12 pt-6 md:pt-0">
              <span className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-neon-cyan font-bold mb-3 md:mb-4 block">{activeTab === 'posts' ? 'Redação Editorial' : 'Curadoria Visual'}</span>
              <h2 className="text-3xl md:text-5xl font-luxury text-white italic">{editingId ? 'Editar Publicação' : 'Nova Publicação'}</h2>
            </div>

            {message && <div className={`mb-6 p-4 border text-[9px] md:text-[10px] tracking-widest font-bold uppercase text-center ${message.includes('Erro') ? 'border-neon-red bg-neon-red/10 text-neon-red' : 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-2 relative">
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="block w-full pt-4 pb-2 text-xl md:text-2xl font-luxury text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600" placeholder="Título da Obra" />
                </div>
                <div className="relative">
                  <div className="block w-full pt-5 pb-2 text-xs md:text-sm text-white uppercase tracking-widest bg-transparent border-b border-white/20 hover:border-neon-cyan transition-colors cursor-pointer flex justify-between items-center group" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <span>{formData.brand}</span>
                    <ChevronDown size={16} className={`text-gray-500 group-hover:text-neon-cyan transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-neon-cyan' : ''}`} />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 glass-dark bg-black/95 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl animate-fade-in">
                      {BRANDS.map(b => (
                        <div key={b} onClick={() => { setFormData({ ...formData, brand: b }); setIsDropdownOpen(false); }} className={`px-4 py-4 text-[10px] md:text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 ${formData.brand === b ? 'bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                          {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative pt-2 space-y-4">
                <label className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-gray-500 font-bold block border-b border-white/10 pb-2">
                  {editingId ? 'Gerenciar Portifólio' : 'Fotografia (Obrigatória)'}
                </label>

                {editingId && editingImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-2 relative aspect-video rounded-lg overflow-hidden border border-white/10 group bg-black/60 glass-dark">
                      <img src={editingImages[currentCarouselIndex]} className="w-full h-full object-cover" alt="Thumb editar" />
                      <button type="button" onClick={() => removeExistingImage(currentCarouselIndex)} title="Apagar esta foto" className="absolute top-2 right-2 p-2 rounded-full bg-black/80 hover:bg-neon-red text-white opacity-0 group-hover:opacity-100 transition-opacity z-30">
                        <Trash2 size={12} />
                      </button>
                      {editingImages.length > 1 && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                            <button type="button" onClick={prevEditImg} className="pointer-events-auto p-1.5 glass-dark bg-black/80 rounded-full hover:text-neon-cyan"><ChevronLeft size={16} /></button>
                            <button type="button" onClick={nextEditImg} className="pointer-events-auto p-1.5 glass-dark bg-black/80 rounded-full hover:text-neon-cyan"><ChevronRight size={16} /></button>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[8px] text-white font-bold z-20 tracking-widest">
                            {currentCarouselIndex + 1}/{editingImages.length}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <input type="file" multiple accept="image/*" className="hidden" ref={fastFileInputRef} onChange={handleFastUploadInEdit} id="fast-upload" />
                      <button type="button" onClick={() => fastFileInputRef.current?.click()} disabled={isFastUploading} className="w-full h-full aspect-video md:aspect-auto border-2 border-dashed border-white/10 rounded-lg hover:border-neon-cyan hover:bg-white/5 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-neon-cyan gap-2 group p-6">
                        {isFastUploading ? <Loader2 size={24} className="animate-spin text-neon-cyan" /> : <UploadCloud size={24} className="group-hover:scale-110 transition-transform" />}
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{isFastUploading ? 'Sincronizando...' : 'Adicionar Mais Fotos'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 border border-dashed border-white/20 p-6 md:p-8 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-neon-cyan transition-colors duration-300 relative cursor-pointer text-center rounded-xl">
                    <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud size={28} className="text-neon-cyan mb-3 md:mb-4" />
                    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 px-4">
                      {imageFiles.length > 0 ? <span className="text-white">{imageFiles.length} arquivo(s) selecionado(s)</span> : 'Toque para selecionar imagem (ou imagens)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-cyan transition-colors resize-none placeholder:text-gray-600" placeholder="Breve contexto..." />
              </div>

              {activeTab === 'posts' && (
                <div className="relative pt-2">
                  <label className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-gray-500 font-bold mb-4 block border-b border-white/10 pb-2">Corpo do Editorial</label>
                  <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="block w-full p-6 text-sm md:text-base text-gray-300 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-cyan focus:bg-white/10 transition-colors placeholder:text-gray-600" placeholder="Escreva a matéria detalhada..." />
                </div>
              )}

              <div className="flex justify-end pt-4 md:pt-8">
                <button type="submit" disabled={isSubmitting || isFastUploading} className="w-full md:w-auto flex items-center justify-center gap-4 border border-white/20 bg-black text-white px-8 py-5 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan transition-all duration-500 disabled:opacity-50 group">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase">{isSubmitting ? 'Processando...' : (editingId ? 'Atualizar Publicação' : 'Autenticar Publicação')}</span>
                  <Save size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}