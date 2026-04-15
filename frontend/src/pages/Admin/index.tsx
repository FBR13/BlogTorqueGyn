import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { LogOut, Plus, Settings, X, Save, Trash2, UploadCloud, Image as ImageIcon, FileText } from 'lucide-react';

const BRANDS = ['Ferrari', 'Porsche', 'Lamborghini', 'Mercedes-Benz', 'BMW', 'Volkswagen', 'Audi'];

export function Admin() {
  const { user, signOut } = useAuth();

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio'>('posts');

  // Estados Globais
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Estado do Formulário (Serve para os dois)
  const [formData, setFormData] = useState({
    title: '', brand: BRANDS[0], description: '', content: ''
  });

  useEffect(() => {
    if (!isCreating) fetchItems();
  }, [isCreating, activeTab]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage('Erro: A fotografia de capa é obrigatória.');
      return;
    }

    setIsSubmitting(true);
    setMessage('Sincronizando mídia com o servidor de alta performance...');

    try {
      // 1. Upload da Imagem
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${activeTab}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('editoriais').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('editoriais').getPublicUrl(fileName);
      const finalImageUrl = publicUrlData.publicUrl;

      // 2. Monta o objeto baseando-se na aba ativa
      let payload;
      if (activeTab === 'posts') {
        payload = { ...formData, image_url: finalImageUrl };
      } else {
        // Portfólio usa um array de imagens no banco
        payload = {
          title: formData.title,
          brand: formData.brand,
          description: formData.description,
          images: [finalImageUrl]
        };
      }

      // 3. Salva no banco de dados
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao publicar.');

      setMessage('Sincronização concluída com sucesso!');
      setTimeout(() => {
        setIsCreating(false);
        setMessage('');
        setFormData({ title: '', brand: BRANDS[0], description: '', content: '' });
        setImageFile(null);
      }, 2000);

    } catch (error) {
      console.error(error);
      setMessage('Erro crítico de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apagar permanentemente este registro?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${activeTab}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Falha ao deletar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <header className="bg-black text-white border-b-4 border-[#EF3340] sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Settings size={18} className="text-[#EF3340]" />
            <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Central de Comando</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:text-[#EF3340] transition-colors">
            <LogOut size={14} /> Desconectar
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12">
        {!isCreating ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-gray-300 pb-4 gap-6">
              <div>
                <h1 className="text-4xl font-luxury tracking-tight text-black mb-6">Controle de Acervo</h1>

                {/* Abas Minimalistas */}
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold pb-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-[#EF3340] text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                  >
                    <FileText size={14} /> Editoriais (Blog)
                  </button>
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold pb-2 border-b-2 transition-all ${activeTab === 'portfolio' ? 'border-[#EF3340] text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                  >
                    <ImageIcon size={14} /> Acervo Visual (Portfólio)
                  </button>
                </div>
              </div>

              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-[#EF3340] transition-colors duration-300 group">
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                  Novo {activeTab === 'posts' ? 'Editorial' : 'Projeto Visual'}
                </span>
              </button>
            </div>

            <div className="bg-white border border-gray-200">
              {isLoading ? (
                <div className="p-12 text-center text-[10px] tracking-[0.3em] uppercase text-gray-400">Lendo banco de dados...</div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <span className="h-[1px] w-12 bg-gray-300 mb-6" />
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400">Nenhum registro encontrado nesta categoria.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 px-8 py-6 border-b border-gray-100 items-center group hover:bg-gray-50 transition-colors">
                      <div className="col-span-2 text-[10px] tracking-widest text-gray-500">{new Date(item.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="col-span-8 pr-4">
                        <span className="text-[9px] tracking-[0.3em] uppercase text-[#EF3340] block mb-1">{item.brand}</span>
                        <h3 className="text-xl font-luxury text-black truncate">{item.title}</h3>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-[#EF3340] transition-colors"><Trash2 size={18} strokeWidth={1.5} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Formulário Híbrido (Serve para Blog e Portfólio) */
          <div className="bg-white border border-gray-200 p-8 md:p-16 relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
              <X size={24} strokeWidth={1.5} />
            </button>

            <div className="mb-12">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#EF3340] font-bold mb-4 block">
                {activeTab === 'posts' ? 'Redação Editorial' : 'Curadoria Visual'}
              </span>
              <h2 className="text-5xl font-luxury">Nova Publicação</h2>
            </div>

            {message && (
              <div className={`mb-8 p-4 border text-[10px] tracking-widest font-bold uppercase ${message.includes('Erro') ? 'border-[#EF3340] text-[#EF3340]' : 'border-black text-black'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 relative group">
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="block w-full pt-4 pb-2 text-2xl font-luxury text-black bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition-colors" placeholder="Título da Obra" />
                </div>
                <div className="relative group">
                  <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="block w-full pt-4 pb-2 text-sm text-black uppercase tracking-widest bg-transparent border-b border-gray-300 focus:outline-none focus:border-black cursor-pointer">
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative pt-4">
                <label className="text-[9px] tracking-[0.2em] uppercase text-black font-bold mb-4 block border-b border-black pb-2">Fotografia de Capa</label>
                <div className="mt-4 border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={32} className="text-gray-400 mb-4" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600">
                    {imageFile ? imageFile.name : 'Selecione a imagem original (High-Res)'}
                  </span>
                </div>
              </div>

              <div className="relative group">
                <textarea required rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="block w-full pt-4 pb-2 text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition-colors resize-none" placeholder="Breve contexto do projeto..." />
              </div>

              {/* Só mostra o corpo do texto se estiver na aba de Blog (Posts) */}
              {activeTab === 'posts' && (
                <div className="relative group pt-4">
                  <label className="text-[9px] tracking-[0.2em] uppercase text-black font-bold mb-4 block border-b border-black pb-2">Corpo do Editorial</label>
                  <textarea required rows={10} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="block w-full p-4 text-base text-gray-800 bg-gray-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black transition-colors" placeholder="Escreva a matéria completa..." />
                </div>
              )}

              <div className="flex justify-end pt-8">
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-4 bg-black text-white px-10 py-4 hover:bg-[#EF3340] transition-colors duration-500 disabled:opacity-50">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase">{isSubmitting ? 'Processando...' : 'Autorizar Publicação'}</span>
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