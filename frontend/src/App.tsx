import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação do Cérebro de Autenticação e Segurança
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Importação dos Componentes Visuais
import { Header } from './components/Header';

// Importação de todas as Páginas
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { PostDetail } from './pages/PostDetail'; // <-- A página que lê a matéria
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

export function App() {
  return (
    <AuthProvider>
      <Router>
        {/* O Header fica fora do <Routes> para aparecer em todas as páginas */}
        <Header />

        <Routes>
          {/* Rotas Públicas */}
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