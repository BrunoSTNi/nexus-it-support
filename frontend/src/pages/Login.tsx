import { useState } from 'react';
import './styles/login.css';
import { 
  Sparkles, 
  Network, 
  Lightbulb, 
  Mail, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { loginRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@nexus.local');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginRequest(email, password);
      
      // Salva os dados de autenticação no localStorage
      localStorage.setItem('@nexus_token', result.data.token);
      localStorage.setItem('@nexus_user', JSON.stringify(result.data.user));

      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Lado esquerdo: Branding e Elementos Visuais */}
      <section className="login-brand">
        <div className="brand brand-dark" style={{ color: '#697cf7' }}>
          <div className="bg-blue-600 p-2.5 rounded-xl text-white inline-flex shadow-md">
            <Sparkles size={24} />
          </div>
          <div>
            <strong>NEXUS</strong>
            <small>INTELLIGENT IT SUPPORT</small>
          </div>
        </div>

        <div className="login-art">
          <div className="orbital o1" />
          <div className="orbital o2" />
          <div className="orbital o3" />
          <div className="nexus-orb">
            <Sparkles size={52} />
          </div>
          <span className="float-label f1">
            <Network size={18} />
            Conectar problemas
          </span>
          <span className="float-label f2">
            <Lightbulb size={18} />
            Encontrar soluções
          </span>
        </div>

        <h1>
          Suporte de TI
          <br />
          mais inteligente.
        </h1>
        <p>Resolva problemas mais rápido com inteligência artificial.</p>
        <small>Inteligência que apoia. Pessoas que resolvem.</small>
      </section>

      {/* Lado direito: Formulário de Autenticação Funcional */}
      <section className="login-form">
        <span className="demo-badge">PORTAL DE ACESSO</span>
        <h1>Bem-vindo ao NEXUS</h1>
        <p>Entre para continuar e gerenciar os chamados de suporte.</p>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label>
            E-mail
            <div className="input-with-icon">
              <Mail size={17} className="text-gray-400" />
              <input
                aria-label="E-mail de login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </label>

          <label>
            Senha
            <div className="input-with-icon">
              <LockKeyhole size={17} className="text-gray-400" />
              <input
                aria-label="Senha"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="login-options">
            <span>Ambiente seguro autenticado via JWT</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Autenticando...
              </>
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <small style={{ marginTop: '25px', display: 'block', textAlign: 'center' }}>
          NEXUS © 2026 · Intelligent IT Support
        </small>
      </section>
    </div>
  );
}