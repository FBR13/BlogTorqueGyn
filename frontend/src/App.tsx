import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { X, ArrowUp } from 'lucide-react';

const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const PostDetail = lazy(() => import('./pages/PostDetail').then(module => ({ default: module.PostDetail })));
const Portfolio = lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    let sessionId = localStorage.getItem('torque_session');
    if (!sessionId) {
      sessionId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('torque_session', sessionId);
    }

    const recordView = async () => {
      try {
        await supabase.from('page_views').insert([{
          path: location.pathname,
          session_id: sessionId
        }]);
      } catch (error) {
        console.error('Erro de telemetria:', error);
      }
    };

    recordView();

    // BÔNUS: Sempre que mudar de página, o site rola pro topo automaticamente
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

// ==========================================
// BOTÃO VOLTAR AO TOPO (Global)
// ==========================================
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Se a pessoa rolar mais de 300 pixels para baixo, o botão aparece
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-6 md:right-8 z-[90] p-3 rounded-full glass-dark bg-black/80 border border-white/20 text-gray-400 hover:text-neon-cyan hover:border-neon-cyan hover:shadow-neon-cyan transition-all duration-300 animate-fade-in group backdrop-blur-sm"
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
    </button>
  );
}

// ==========================================
// AVISO DE COOKIES
// ==========================================
function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('torque_cookies_accepted');
    if (!hasAccepted) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('torque_cookies_accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] animate-slide-up p-4 pointer-events-none">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-dark bg-black/90 border border-neon-cyan/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,240,255,0.1)] flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
          <div className="flex-1">
            <h4 className="text-white font-display font-bold text-sm tracking-widest uppercase mb-2">Cookies & Privacidade</h4>
            <p className="text-gray-400 text-xs font-light leading-relaxed">
              Utilizamos cookies para métricas de performance e para aprimorar sua experiência. Ao continuar navegando, você concorda com nossas políticas de privacidade.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none whitespace-nowrap bg-neon-cyan/10 border border-neon-cyan text-neon-cyan px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neon-cyan hover:text-black transition-all"
            >
              Aceitar e Continuar
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-3 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Loading Global
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-neon-red border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsTracker />
        <CookieBanner />
        <ScrollToTopButton /> {/* <-- Nosso botão fixo rolando o site adicionado aqui! */}

        {/* HEADER NO TOPO */}
        <Header />

        {/* CONTEÚDO DAS PÁGINAS */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
            />
          </Routes>
        </Suspense>

        {/* FOOTER NO FINAL DE TUDO */}
        <Footer />

      </Router>
    </AuthProvider>
  );
}

export default App;