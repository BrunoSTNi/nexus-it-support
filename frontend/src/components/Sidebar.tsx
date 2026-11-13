import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  BookOpen,
  ListFilter,
  Headphones,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  Building2,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => path === route;

  return (
    <aside className="sidebar">
      {/* Logo e Marca */}
      <Link to="/dashboard" className="logo-link">
        <div className="brand">
          <div className="bg-blue-600 p-2 rounded-xl text-white inline-flex shadow-md">
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>N</span>
          </div>
          <div>
            <strong>NEXUS</strong>
            <small>INTELLIGENT IT SUPPORT</small>
          </div>
        </div>
      </Link>

      {/* Seletor de Workspace */}
      <div className="workspace">
        <div className="workspace-icon">
          <Building2 size={16} />
        </div>
        <div>
          <span>Workspace da empresa</span>
          <small>Ambiente de demonstração</small>
        </div>
        <ChevronDown size={14} />
      </div>

      {/* Seção Principal */}
      <div className="nav-label">PRINCIPAL</div>
      <nav>
        <Link to="/dashboard" className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/meus-chamados" className={`nav-item ${isActive("/meus-chamados") ? "active" : ""}`}>
          <Ticket size={18} />
          <span>Meus chamados</span>
          <b>2</b>
        </Link>
        <Link to="/novo-chamado" className={`nav-item ${isActive("/novo-chamado") ? "active" : ""}`}>
          <PlusCircle size={18} />
          <span>Novo chamado</span>
        </Link>
        <Link to="/conhecimento" className={`nav-item ${isActive("/conhecimento") ? "active" : ""}`}>
          <BookOpen size={18} />
          <span>Base de conhecimento</span>
        </Link>
      </nav>

      {/* Seção Suporte Técnico */}
      <div className="nav-label">SUPORTE TÉCNICO</div>
      <nav>
        <Link to="/fila" className={`nav-item ${isActive("/fila") ? "active" : ""}`}>
          <ListFilter size={18} />
          <span>Fila de atendimento</span>
          <b>3</b>
        </Link>
        <Link to="/chamados" className={`nav-item ${isActive("/chamados") ? "active" : ""}`}>
          <Headphones size={18} />
          <span>Chamados</span>
        </Link>
        <Link to="/diagnostico-ia" className={`nav-item ${isActive("/diagnostico-ia") ? "active" : ""}`}>
          <Sparkles size={18} />
          <span>Diagnóstico IA</span>
          <span className="mini-ai">IA</span>
        </Link>
      </nav>

      {/* Seção Administração */}
      <div className="nav-label">ADMINISTRAÇÃO</div>
      <nav>
        <Link to="/visao-geral" className={`nav-item ${isActive("/visao-geral") ? "active" : ""}`}>
          <BarChart3 size={18} />
          <span>Visão geral</span>
        </Link>
        <Link to="/usuarios" className={`nav-item ${isActive("/usuarios") ? "active" : ""}`}>
          <Users size={18} />
          <span>Usuários</span>
        </Link>
        <Link to="/configuracoes" className={`nav-item ${isActive("/configuracoes") ? "active" : ""}`}>
          <Settings size={18} />
          <span>Configurações</span>
        </Link>
      </nav>

      {/* Rodapé do Sidebar (Perfil do Usuário Logado) */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">JS</div>
          <div>
            <strong>João da Silva</strong>
            <select aria-label="Perfil ativo">
              <option>Requerente</option>
              <option>Técnico N1</option>
              <option>Administrador</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}