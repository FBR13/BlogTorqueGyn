import { useState } from 'react';
import { ArrowRight, Crosshair } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Credenciais inválidas. Tente novamente.');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Efeitos de Fundo */}
      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-neon-red/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-md glass-dark p-10 md:p-16 rounded-2xl relative">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Crosshair size={14} className="text-neon-red animate-spin-slow" />
            <span className="text-[10px] tracking-[0.4em] font-display font-bold uppercase text-neon-red text-glow-red">
              Acesso Restrito
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-white">Central</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-neon-red text-neon-red bg-neon-red/10 text-[10px] font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="relative group">
            <input 
              type="email" id="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-gray-600 appearance-none focus:outline-none focus:border-neon-cyan focus:ring-0 peer transition-colors"
            />
            <label htmlFor="email" className="absolute text-[10px] font-display font-bold tracking-[0.2em] uppercase text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-neon-cyan">
              Credencial (E-mail)
            </label>
          </div>

          <div className="relative group">
            <input 
              type="password" id="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="block w-full pt-4 pb-2 text-sm text-white bg-transparent border-b border-gray-600 appearance-none focus:outline-none focus:border-neon-cyan focus:ring-0 peer transition-colors"
            />
            <label htmlFor="password" className="absolute text-[10px] font-display font-bold tracking-[0.2em] uppercase text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-neon-cyan">
              Código de Segurança
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-between border border-white/20 hover:border-neon-red bg-black/50 text-white px-6 py-4 mt-12 hover:text-neon-red hover:shadow-neon-red transition-all duration-500 group disabled:opacity-50">
            <span className="text-[10px] font-display font-bold tracking-[0.3em] uppercase">
              {loading ? 'Autenticando...' : 'Desbloquear'}
            </span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}