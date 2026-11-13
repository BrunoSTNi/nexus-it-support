import { useState, useEffect } from "react";
import { Plus, Sparkles, Search, Loader2 } from "lucide-react";
import { Button, PageHeading } from "../components/nexus-ui";
import { TicketTable, Filter } from "../components/ticket-components";
import { httpGet } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string | { name: string };
  priority: string;
  status: string;
  createdAt: string;
  requester?: { name: string } | string;
}

export function TicketList() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [tech, setTech] = useState("");
  const [period, setPeriod] = useState("");
  const [related, setRelated] = useState(
    () => new URLSearchParams(window.location.search).get("padrao") === "rede"
  );

  // Carrega os chamados reais do backend via API
  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const response = await httpGet("/api/tickets");
        setTickets(response.data || []);
      } catch (err) {
        console.error("Erro ao buscar chamados:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, [path]);

  // Se o caminho for "/meus-chamados", podemos filtrar pelo usuário logado atual
  const storedUser = localStorage.getItem("@nexus_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const baseTickets = path === "/meus-chamados" && currentUser
    ? tickets.filter((t) => {
        if (typeof t.requester === 'object' && t.requester !== null) {
          return t.requester.name === currentUser.name;
        }
        return true; // Se vier simplificado ou admin
      })
    : tickets;

  // Filtragem dinâmica dos chamados exibidos na tabela
  const shown = baseTickets.filter((t) => {
    const categoryName = typeof t.category === 'object' && t.category !== null ? t.category.name : String(t.category || "");
    const searchableText = `${t.id} ${t.title}`.toLowerCase();

    return (
      (!q || searchableText.includes(q.toLowerCase())) &&
      (!status || t.status === status) &&
      (!priority || t.priority === priority) &&
      (!category || categoryName === category) &&
      (!tech || true) && // Adaptável se houver campo de técnico no backend
      (!period || t.createdAt.startsWith(period)) &&
      (!related || categoryName.toLowerCase().includes("rede"))
    );
  });

  // Extrai categorias dinâmicas dos chamados reais para o filtro
  const categoriesList = Array.from(
    new Set(
      tickets.map((t) =>
        typeof t.category === 'object' && t.category !== null ? t.category.name : String(t.category || "Geral")
      )
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <PageHeading
        title={
          path === "/meus-chamados"
            ? "Meus chamados"
            : path === "/fila"
              ? "Fila de atendimento"
              : "Todos os chamados"
        }
        subtitle={
          path === "/meus-chamados"
            ? "Todas as suas solicitações, em um só lugar."
            : "Organize prioridades. Conecte problemas a soluções."
        }
        action={
          <Button onClick={() => navigate("/novo-chamado")}>
            <Plus size={17} />
            Novo chamado
          </Button>
        }
      />

      {/* Estatísticas dinâmicas calculadas direto dos dados reais */}
      <div className="queue-stats">
        {[
          ["Total", baseTickets.length],
          ["Abertos", baseTickets.filter((t) => t.status === "OPEN" || t.status === "Aberto").length],
          ["Em andamento", baseTickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "Em andamento").length],
          ["Resolvidos", baseTickets.filter((t) => t.status === "RESOLVED" || t.status === "Resolvido").length],
          ["Críticos", baseTickets.filter((t) => t.priority === "CRITICAL" || t.priority === "Crítica").length],
        ].map(([s, n]) => (
          <div key={s}>
            <span>{s}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>

      {related && (
        <div className="info-banner">
          <Sparkles size={18} />
          Exibindo chamados de rede relacionados ao padrão detectado.
          <button className="text-link" onClick={() => setRelated(false)} type="button">
            Limpar
          </button>
        </div>
      )}

      <section className="panel">
        <div className="filters">
          <div className="input-with-icon">
            <Search size={16} />
            <input
              aria-label="Buscar chamados"
              placeholder="Buscar chamado por ID ou título..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Filter
            label="Status"
            value={status}
            onChange={setStatus}
            items={["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]}
          />
          <Filter
            label="Prioridade"
            value={priority}
            onChange={setPriority}
            items={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
          />
          <Filter label="Categoria" value={category} onChange={setCategory} items={categoriesList} />
          
          <select aria-label="Período" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">Todo período</option>
            <option value={new Date().toISOString().split('T')[0]}>Hoje</option>
          </select>
        </div>

        <TicketTable tickets={shown} navigate={navigate} />

        <div className="table-bottom">
          <span>
            {shown.length} de {baseTickets.length} chamados exibidos
          </span>
          <span>
            Sincronizado com PostgreSQL <span className="online-dot" />
          </span>
        </div>
      </section>
    </>
  );
}

// Exporta o wrapper específico para "Meus Chamados" utilizando a mesma lógica base
export function MeusChamados() {
  return <TicketList />;
}