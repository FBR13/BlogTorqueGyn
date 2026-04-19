import { useState } from 'react';
import { ArrowRight, Crosshair, Lock, Mail } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-6 py-20 relative overflow-hidden bg-black z-0">

      <div className="absolute inset-0 z-[-2] bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-neon-red/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-md glass-dark bg-black/80 border border-white/10 p-8 md:p-12 rounded-2xl relative shadow-2xl animate-fade-in">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-neon-red to-transparent"></div>

        <div className="flex flex-col items-center text-center mb-10 mt-2">
          <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-neon-red/20 bg-neon-red/5">
            <Crosshair size={12} className="text-neon-red animate-spin-slow" />
            <span className="text-[8px] tracking-[0.4em] font-bold uppercase text-neon-red text-glow-red">
              Acesso Restrito
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-white mb-2">Central</h1>
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500 font-bold">Identificação Necessária</p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-neon-red/50 text-neon-red bg-neon-red/10 text-[9px] font-bold uppercase tracking-widest text-center rounded flex items-center justify-center gap-2">
            <Crosshair size={12} /> {error}
          </div>
        )}

        <form className="space-y-8" onSubmit={handleLogin}>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
              <Mail size={14} className="text-gray-500 group-focus-within:text-neon-red transition-colors" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ WebkitBoxShadow: '0 0 0 30px transparent inset', WebkitTextFillColor: 'white', transition: 'background-color 5000s ease-in-out 0s' }}
              className="block w-full pl-8 py-3 text-xs text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-red transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest"
              placeholder="Credencial (E-mail)"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
              <Lock size={14} className="text-gray-500 group-focus-within:text-neon-red transition-colors" />
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ WebkitBoxShadow: '0 0 0 30px transparent inset', WebkitTextFillColor: 'white', transition: 'background-color 5000s ease-in-out 0s' }}
              className="block w-full pl-8 py-3 text-xs text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-neon-red transition-colors placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-widest tracking-widest"
              placeholder="Código de Segurança"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-neon-red/10 border border-neon-red/50 text-neon-red px-8 py-4 hover:bg-neon-red hover:text-black transition-all duration-500 rounded font-bold shadow-[0_0_15px_rgba(239,51,64,0.1)] hover:shadow-[0_0_25px_rgba(239,51,64,0.4)] group disabled:opacity-50"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase">
                {loading ? 'Autenticando...' : 'Desbloquear'}
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}