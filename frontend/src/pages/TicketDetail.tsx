import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Headphones,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "../components/nexus-ui";
import { httpGet, httpPost } from "../services/api";

interface Interaction {
  id?: string;
  author?: { name: string; role?: string } | string;
  message?: string;
  text?: string;
  createdAt?: string;
  time?: string;
  isAI?: boolean;
}

interface TicketDetailData {
  id: string;
  title: string;
  description: string;
  category: { name: string } | string;
  priority: string;
  status: string;
  createdAt: string;
  requester?: { name: string } | string;
  assignee?: { name: string } | string;
  interactions?: Interaction[];
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Carrega os dados reais do chamado específico pelo ID
  useEffect(() => {
    async function fetchTicketDetail() {
      try {
        setLoading(true);
        const res = await httpGet(`/api/tickets/${id}`);
        setTicket(res.data);
      } catch (err) {
        console.error("Erro ao carregar detalhes do chamado:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTicketDetail();
  }, [id]);

  // Função para enviar nova mensagem/interação no chat do chamado
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      const res = await httpPost(`/api/tickets/${id}/interactions`, { message });
      
      // Adiciona a nova interação retornada pelo backend ou cria um objeto local de apoio
      const newInteraction = res.data || {
        message,
        author: { name: "Você" },
        createdAt: new Date().toISOString(),
      };

      setTicket((prev) => 
        prev ? { ...prev, interactions: [...(prev.interactions || []), newInteraction] } : prev
      );
      setMessage("");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  // Função para assumir ou resolver o chamado rapidamente
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await httpPost(`/api/tickets/${id}/status`, { status: newStatus });
      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="empty" style={{ padding: "50px" }}>
        <h3>Chamado não encontrado</h3>
        <p>O chamado solicitado não existe ou foi removido.</p>
        <Button onClick={() => navigate("/meus-chamados")} style={{ marginTop: "15px" }}>
          <ArrowLeft size={16} /> Voltar para Meus Chamados
        </Button>
      </div>
    );
  }

  const categoryName = typeof ticket.category === "object" && ticket.category !== null 
    ? ticket.category.name 
    : (ticket.category || "Geral");

  const requesterName = typeof ticket.requester === "object" && ticket.requester !== null
    ? ticket.requester.name
    : (ticket.requester || "Usuário");

  return (
    <>
      {/* Botão Voltar e Ações do Topo */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/meus-chamados")}
          className="back-link flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          type="button"
        >
          <ArrowLeft size={16} />
          Voltar para listagem
        </button>

        <div className="heading-actions flex gap-2">
          <Button secondary onClick={() => handleUpdateStatus("IN_PROGRESS")}>
            <Headphones size={16} /> Assumir
          </Button>
          <Button onClick={() => handleUpdateStatus("RESOLVED")}>
            <CheckCircle2 size={16} /> Resolver chamado
          </Button>
        </div>
      </div>

      {/* Cabeçalho do Chamado */}
      <div className="mb-6">
        <span className="eyebrow">CHAMADO #{ticket.id.substring(0, 6)}</span>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{ticket.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aberto em {new Date(ticket.createdAt).toLocaleDateString("pt-BR")} · {categoryName}
        </p>
      </div>

      <div className="ticket-detail-grid">
        {/* Coluna Principal: Descrição e Histórico de Interações */}
        <div>
          <section className="panel detail-description mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-700">Descrição do problema</h2>
              <span className="badge amber">{ticket.priority}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
          </section>

          <section className="panel timeline-panel">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Interações</h2>
            <p className="text-xs text-gray-400 mb-6">Uma conversa conectando o problema à solução.</p>

            <div className="timeline">
              {ticket.interactions && ticket.interactions.length > 0 ? (
                ticket.interactions.map((item, idx) => {
                  // Extrai o nome do autor com segurança se for objeto ou string
                  const authorStr = typeof item.author === "object" && item.author !== null
                    ? item.author.name
                    : (typeof item.author === "string" ? item.author : "Suporte NEXUS");

                  const messageText = item.message || item.text || "";
                  const timeFormatted = item.createdAt 
                    ? new Date(item.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
                    : (item.time || "Agora");

                  return (
                    <div className="timeline-event" key={item.id || idx}>
                      <div className={`timeline-avatar ${item.isAI ? "ai" : ""}`}>
                        {item.isAI ? <Sparkles size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div className="event-heading">
                          <strong>{authorStr}</strong>
                          {item.isAI && <span className="badge tag-badge">ASSISTENTE IA</span>}
                          <small>{timeFormatted}</small>
                        </div>
                        <p>{messageText}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400">Nenhuma interação registrada ainda.</p>
              )}
            </div>

            {/* Caixa de Envio de Mensagem Funcional */}
            <form onSubmit={handleSendMessage} className="message-form mt-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva uma mensagem..."
                aria-label="Escreva uma mensagem"
                disabled={sending}
              />
              <div>
                <small>Converse com a equipe de suporte.</small>
                <Button type="submit" disabled={sending}>
                  {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                  Enviar
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Sidebar Lateral Direita: Resumo e Diagnóstico da IA */}
        <aside>
          <section className="panel ticket-summary mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Resumo do chamado</h2>
            
            <div className="summary-row">
              <span>Status</span>
              <strong>{ticket.status}</strong>
            </div>
            <div className="summary-row">
              <span>Prioridade</span>
              <strong>{ticket.priority}</strong>
            </div>
            <div className="summary-row">
              <span>Categoria</span>
              <strong>{categoryName}</strong>
            </div>
            <div className="summary-row">
              <span>Solicitante</span>
              <strong>{requesterName}</strong>
            </div>
            <div className="summary-row">
              <span>Data de abertura</span>
              <strong>{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</strong>
            </div>
          </section>

          <section className="diagnosis-short">
            <Sparkles size={22} />
            <h3 className="text-sm font-semibold text-gray-700">Um olhar inteligente sobre o problema</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Explore causas prováveis e procedimentos sugeridos para este chamado.
            </p>
            <Button secondary style={{ width: "100%" }} onClick={() => alert("Diagnóstico da IA acionado com sucesso!")}>
              Assistente de diagnóstico →
            </Button>
            <small className="text-[10px] text-gray-400 mt-3 block text-center">
              Sugestões com validação humana.
            </small>
          </section>
        </aside>
      </div>
    </>
  );
}