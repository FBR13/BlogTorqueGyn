import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { PostDetail } from './pages/PostDetail';
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // 1. Procura o crachá do visitante. Se não tiver, cria um novo e salva no navegador!
    let sessionId = localStorage.getItem('torque_session');
    if (!sessionId) {
      sessionId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('torque_session', sessionId);
    }

    const recordView = async () => {
      try {
        // 2. Envia o caminho da página E a identificação única do usuário para o banco
        await supabase.from('page_views').insert([{
          path: location.pathname,
          session_id: sessionId
        }]);
      } catch (error) {
        console.error('Erro de telemetria:', error);
      }
    };

    recordView();
  }, [location]);

  return null;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsTracker />
        <Header />
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
      </Router>
    </AuthProvider>
  );
}

export default App;