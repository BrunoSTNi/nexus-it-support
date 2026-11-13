import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronRight,
  Loader2,
  Printer,
  Wifi,
  Mail,
  KeyRound,
  Laptop,
} from "lucide-react";
import { Button, PageHeading } from "../components/nexus-ui";
import { httpGet } from "../services/api";

interface TicketQueueItem {
  id: string;
  title: string;
  category: { name: string } | string;
  priority: string;
  status: string;
  requester?: { name: string } | string;
  assignee?: { name: string } | string;
  createdAt: string;
}

export function QueueList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Carrega os chamados da fila do backend
  useEffect(() => {
    async function fetchQueue() {
      try {
        setLoading(true);
        const res = await httpGet("/api/tickets");
        const list = res.data || res || [];
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erro ao carregar fila de atendimento:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  // Cálculo das métricas para os cards do topo
  const total = tickets.length;
  const abertos = tickets.filter((t) => t.status === "OPEN" || t.status === "Aberto").length;
  const emAndamento = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "Em andamento").length;
  const aguardando = tickets.filter((t) => t.status === "WAITING" || t.status === "Aguardando usuário").length;
  const criticos = tickets.filter((t) => t.priority === "CRITICAL" || t.priority === "Crítica").length;

  // Filtragem local dos chamados
  const filteredTickets = tickets.filter((t) => {
    const catName = typeof t.category === "object" ? t.category?.name : (t.category || "");
    const reqName = typeof t.requester === "object" ? t.requester?.name : (t.requester || "Usuário");
    const searchMatch = `${t.title} ${catName} ${reqName}`.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;

    return searchMatch && matchesStatus && matchesPriority;
  });

  // Ícone dinâmico baseado na categoria
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("impressora")) return <Printer size={18} className="text-blue-600" />;
    if (cat.includes("rede") || cat.includes("wifi")) return <Wifi size={18} className="text-emerald-600" />;
    if (cat.includes("mail") || cat.includes("e-mail")) return <Mail size={18} className="text-indigo-600" />;
    if (cat.includes("acessos") || cat.includes("senha")) return <KeyRound size={18} className="text-amber-600" />;
    return <Laptop size={18} className="text-gray-600" />;
  };

  // Formatadores visuais de Status e Prioridade
  const formatStatus = (status: string) => {
    switch (status) {
      case "OPEN":
      case "Aberto":
        return { text: "Aberto", className: "badge gray" };
      case "IN_PROGRESS":
      case "Em andamento":
        return { text: "Em andamento", className: "badge blue" };
      case "WAITING":
      case "Aguardando usuário":
        return { text: "Aguardando usuário", className: "badge amber" };
      case "RESOLVED":
      case "Resolvido":
        return { text: "Resolvido", className: "badge green" };
      default:
        return { text: status, className: "badge gray" };
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
      case "Crítica":
        return "badge red";
      case "HIGH":
      case "Alta":
        return "badge amber";
      case "MEDIUM":
      case "Média":
        return "badge blue";
      default:
        return "badge gray";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      {/* Cabeçalho da Página */}
      <PageHeading
        title="Fila de atendimento"
        subtitle="Organize prioridades. Conecte problemas a soluções."
        action={
          <Button onClick={() => navigate("/novo-chamado")}>
            <Plus size={17} /> Novo chamado
          </Button>
        }
      />

      {/* Cards de Métricas (Topo) */}
      <div className="stats-grid grid grid-cols-5 gap-4 mb-6">
        <div className="stat-card">
          <small>Total</small>
          <strong>{total}</strong>
        </div>
        <div className="stat-card">
          <small>Abertos</small>
          <strong>{abertos}</strong>
        </div>
        <div className="stat-card">
          <small>Em andamento</small>
          <strong>{emAndamento}</strong>
        </div>
        <div className="stat-card">
          <small>Aguardando usuário</small>
          <strong>{aguardando}</strong>
        </div>
        <div className="stat-card text-red-600">
          <small>Críticos</small>
          <strong>{criticos}</strong>
        </div>
      </div>

      {/* Barra de Filtros Avançados */}
      <div className="filters-bar flex gap-3 mb-6 items-center flex-wrap">
        <div className="input-with-icon" style={{ flex: 1, minWidth: "250px" }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar chamado ou solicitante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar chamado ou solicitante"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar por Status"
          className="p-2 border rounded-lg bg-white text-sm"
        >
          <option value="">Status: Todos</option>
          <option value="OPEN">Aberto</option>
          <option value="IN_PROGRESS">Em andamento</option>
          <option value="WAITING">Aguardando usuário</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filtrar por Prioridade"
          className="p-2 border rounded-lg bg-white text-sm"
        >
          <option value="">Prioridade: Todas</option>
          <option value="CRITICAL">Crítica</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Média</option>
        </select>
      </div>

      {/* Tabela de Fila de Atendimento */}
      <div className="panel table-scroll p-0">
        <table>
          <thead>
            <tr>
              <th>Chamado</th>
              <th>Solicitante</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Técnico</th>
              <th>Atualização</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => {
                const catName = typeof t.category === "object" && t.category !== null 
                  ? t.category.name 
                  : (t.category || "Geral");
                const reqName = typeof t.requester === "object" && t.requester !== null 
                  ? t.requester.name 
                  : (t.requester || "Usuário");
                const assigneeName = typeof t.assignee === "object" && t.assignee !== null 
                  ? t.assignee.name 
                  : (t.assignee || "Não atribuído");
                
                const statusInfo = formatStatus(t.status);

                return (
                  <tr key={t.id} onClick={() => navigate(`/chamado/${t.id}`)} style={{ cursor: "pointer" }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getCategoryIcon(catName)}
                        </div>
                        <div>
                          <strong>{t.title}</strong>
                          <span className="block text-xs text-gray-400">#{t.id.substring(0, 6)}</span>
                        </div>
                      </div>
                    </td>
                    <td>{reqName}</td>
                    <td>
                      <span className="badge">{catName}</span>
                    </td>
                    <td>
                      <span className={statusInfo.className}>{statusInfo.text}</span>
                    </td>
                    <td>
                      <span className={formatPriority(t.priority)}>{t.priority}</span>
                    </td>
                    <td className="text-gray-600 text-sm">{assigneeName}</td>
                    <td className="text-gray-400 text-sm">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString("pt-BR") : "Hoje"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="icon-button" aria-label="Ver detalhes">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  Nenhum chamado encontrado na fila de atendimento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}