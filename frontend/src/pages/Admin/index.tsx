import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { LogOut, Plus, Settings, X, Save, Trash2, UploadCloud, Image as ImageIcon, FileText } from 'lucide-react';

const BRANDS = ['Ferrari', 'Porsche', 'Lamborghini', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Audi'];

export function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio'>('posts');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ title: '', brand: BRANDS[0], description: '', content: '' });

  useEffect(() => { if (!isCreating) fetchItems(); }, [isCreating, activeTab]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}`);
      if (response.ok) { const data = await response.json(); setItems(data); }
    } catch (error) { console.error("Erro ao buscar dados:", error); } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { setMessage('Erro: A fotografia de capa é obrigatória.'); return; }

    setIsSubmitting(true);
    setMessage('Sincronizando mídia...');

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${activeTab}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('editoriais').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('editoriais').getPublicUrl(fileName);
      const finalImageUrl = publicUrlData.publicUrl;

      let payload = activeTab === 'posts'
        ? { ...formData, image_url: finalImageUrl }
        : { title: formData.title, brand: formData.brand, description: formData.description, images: [finalImageUrl] };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao publicar.');

      setMessage('Sincronização concluída com sucesso!');
      setTimeout(() => {
        setIsCreating(false); setMessage(''); setFormData({ title: '', brand: BRANDS[0], description: '', content: '' }); setImageFile(null);
      }, 2000);

    } catch (error) { console.error(error); setMessage('Erro crítico de conexão.'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apagar permanentemente este registro?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}/${id}`, { method: 'DELETE' });
      if (response.ok) setItems(items.filter(item => item.id !== id));
    } catch (error) { console.error("Falha ao deletar:", error); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-black text-white border-b-4 border-[#EF3340] sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Settings size={16} className="text-[#EF3340]" />
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase">Central Admin</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#EF3340] transition-colors">
            <LogOut size={14} /> <span className="hidden md:inline">Desconectar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 w-full max-w-5xl">
        {!isCreating ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 border-b border-gray-300 pb-6 gap-6">
              <div className="w-full">
                <h1 className="text-3xl md:text-4xl font-luxury tracking-tight text-black mb-6">Controle de Acervo</h1>
                <div className="flex gap-4 md:gap-8 overflow-x-auto w-full">
                  <button onClick={() => setActiveTab('posts')} className={`flex whitespace-nowrap items-center gap-2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold pb-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-[#EF3340] text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <FileText size={14} /> Blog
                  </button>
                  <button onClick={() => setActiveTab('portfolio')} className={`flex whitespace-nowrap items-center gap-2 text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-bold pb-2 border-b-2 transition-all ${activeTab === 'portfolio' ? 'border-[#EF3340] text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <ImageIcon size={14} /> Portfólio
                  </button>
                </div>
              </div>
              <button onClick={() => setIsCreating(true)} className="flex w-full md:w-auto items-center justify-center gap-2 bg-black text-white px-6 py-4 hover:bg-[#EF3340] transition-colors duration-300 group">
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Novo Arquivo</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200">
              {isLoading ? (
                <div className="p-8 md:p-12 text-center text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-gray-400">Lendo banco de dados...</div>
              ) : items.length === 0 ? (
                <div className="p-8 md:p-12 text-center flex flex-col items-center">
                  <span className="h-[1px] w-12 bg-gray-300 mb-6" />
                  <p className="text-[9px] md:text-[11px] tracking-[0.2em] uppercase text-gray-400">Nenhum registro encontrado.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {items.map(item => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 border-b border-gray-100 group hover:bg-gray-50 transition-colors gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] tracking-[0.3em] uppercase text-[#EF3340] font-bold mb-1">{item.brand} — {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        <h3 className="text-lg font-luxury text-black">{item.title}</h3>
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-[#EF3340] self-end md:self-auto transition-colors p-2 bg-gray-100 md:bg-transparent rounded md:rounded-none"><Trash2 size={16} strokeWidth={1.5} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-200 p-6 md:p-16 relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-400 hover:text-black transition-colors p-2">
              <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
            <div className="mb-8 md:mb-12 pt-6 md:pt-0">
              <span className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[#EF3340] font-bold mb-3 md:mb-4 block">{activeTab === 'posts' ? 'Redação Editorial' : 'Curadoria Visual'}</span>
              <h2 className="text-3xl md:text-5xl font-luxury">Nova Publicação</h2>
            </div>
            {message && <div className={`mb-6 p-4 border text-[9px] md:text-[10px] tracking-widest font-bold uppercase ${message.includes('Erro') ? 'border-[#EF3340] text-[#EF3340]' : 'border-black text-black'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-2 relative">
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="block w-full pt-4 pb-2 text-xl md:text-2xl font-luxury text-black bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition-colors" placeholder="Título da Obra" />
                </div>
                <div className="relative">
                  <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="block w-full pt-4 pb-2 text-xs md:text-sm text-black uppercase tracking-widest bg-transparent border-b border-gray-300 focus:outline-none focus:border-black cursor-pointer">
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative pt-2">
                <label className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-black font-bold mb-4 block border-b border-black pb-2">Fotografia de Capa</label>
                <div className="mt-4 border-2 border-dashed border-gray-300 p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer text-center">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={28} className="text-gray-400 mb-3 md:mb-4" />
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600 px-4">{imageFile ? imageFile.name : 'Toque para selecionar imagem'}</span>
                </div>
              </div>

              <div className="relative">
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="block w-full pt-4 pb-2 text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition-colors resize-none" placeholder="Breve contexto..." />
              </div>

              {activeTab === 'posts' && (
                <div className="relative pt-2">
                  <label className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-black font-bold mb-4 block border-b border-black pb-2">Corpo do Editorial</label>
                  <textarea required rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="block w-full p-4 text-sm md:text-base text-gray-800 bg-gray-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black transition-colors" placeholder="Escreva a matéria..." />
                </div>
              )}

              <div className="flex justify-end pt-4 md:pt-8">
                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto flex items-center justify-center gap-4 bg-black text-white px-8 py-4 hover:bg-[#EF3340] transition-colors duration-500 disabled:opacity-50">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase">{isSubmitting ? 'Processando...' : 'Publicar'}</span>
                  <Save size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}