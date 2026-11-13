import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Ticket as TicketIcon,
  Clock3,
  CircleDot,
  CheckCircle2,
  BookOpen,
  MoreHorizontal,
  Headphones,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { PageHeading, Button, SectionHeading, ArticleCard } from "../components/nexus-ui";
import { Stat, TicketTable } from "../components/ticket-components";
import { httpGet, httpPost } from "../services/api";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string | { name: string };
  priority: string;
  status: string;
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [quick, setQuick] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Recupera o nome do usuário logado do localStorage se houver
  const storedUser = localStorage.getItem("@nexus_user");
  const user = storedUser ? JSON.parse(storedUser) : { name: "Usuário NEXUS" };

  // Carrega os dados reais do backend ao abrir a página
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Busca chamados reais e artigos da base de conhecimento do backend
        const ticketsRes = await httpGet("/api/tickets");
        setTickets(ticketsRes.data || []);

        // Caso tenha uma rota de artigos, busca; senão, mantém array vazio ou mock leve de apoio
        try {
          const articlesRes = await httpGet("/api/articles");
          setArticles(articlesRes.data || []);
        } catch {
          setArticles([]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Função para enviar o problema rápido para a IA / Criar Chamado
  const handleAnalyzeAndCreate = async (descriptionText: string) => {
    if (!descriptionText.trim()) return;
    try {
      setSubmitting(true);
      // Cria o chamado chamando a API real (o backend já passa pelo AIService automaticamente)
      await httpPost("/api/tickets", { description: descriptionText });
      
      // Redireciona para a página de listagem de chamados ou limpa
      setQuick("");
      navigate("/meus-chamados");
    } catch (err: any) {
      alert(err.message || "Erro ao criar chamado");
    } finally {
      setSubmitting(false);
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
      <PageHeading
        title={`Olá, ${user.name.split(" ")[0]}`}
        subtitle="Como podemos ajudar hoje?"
        action={
          <div className="date-label">
            <CalendarDays size={16} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        }
      />
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          {/* Card de Abertura Rápida com IA */}
          <section className="quick-card">
            <div className="quick-title">
              <span className="spark-icon">
                <Sparkles size={22} />
              </span>
              <div>
                <h2>Um problema? Vamos resolver juntos.</h2>
                <p>Descreva o que está acontecendo. O NEXUS ajuda com o próximo passo.</p>
              </div>
              <span className="powered">ASSISTIDO POR IA</span>
            </div>
            <div className="quick-input">
              <textarea
                aria-label="Descreva seu problema"
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
                placeholder="Descreva seu problema... Ex: minha impressora não está imprimindo."
              />
              <div className="quick-input-bottom">
                <span>
                  <ShieldCheck size={14} />
                  Você tem o controle. A IA apenas sugere.
                </span>
                <Button onClick={() => handleAnalyzeAndCreate(quick)} disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                  Analisar problema
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
            <div className="quick-examples">
              <span>Experimente:</span>
              {["Impressora não imprime", "Computador lento", "Problema de acesso"].map((s) => (
                <button key={s} onClick={() => setQuick(s)} type="button">
                  {s}
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
          </section>

          {/* Estatísticas Dinâmicas baseadas nos dados do banco */}
          <div className="stats-grid">
            <Stat
              icon={<TicketIcon size={19} />}
              label="Meus chamados"
              value={tickets.length.toString()}
              foot="Total de chamados"
            />
            <Stat
              icon={<Clock3 size={19} />}
              label="Em andamento"
              value={tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "Em andamento").length.toString()}
              foot="Estamos cuidando disso"
              tone="blue"
            />
            <Stat
              icon={<CircleDot size={19} />}
              label="Abertos"
              value={tickets.filter((t) => t.status === "OPEN" || t.status === "Aberto").length.toString()}
              foot="Aguardando atendimento"
              tone="amber"
            />
            <Stat
              icon={<CheckCircle2 size={19} />}
              label="Resolvidos"
              value={tickets.filter((t) => t.status === "RESOLVED" || t.status === "Resolvido").length.toString()}
              foot="Problemas solucionados"
              tone="green"
            />
          </div>

          {/* Tabela de Chamados Recentes */}
          <section className="panel recent-panel">
            <SectionHeading
              title="Meus chamados recentes"
              subtitle="Acompanhe o que está acontecendo com suas solicitações."
              action={
                <Link to="/meus-chamados" className="text-link">
                  Ver todos
                  <ArrowRight size={14} />
                </Link>
              }
            />
            <TicketTable
              tickets={tickets.slice(0, 5)}
              navigate={navigate}
              compact
            />
          </section>

          {/* Base de Conhecimento (Preview) */}
          {articles.length > 0 && (
            <section className="knowledge-preview">
              <SectionHeading
                title="Artigos que podem ajudar"
                subtitle="Às vezes, a solução já está aqui."
                action={
                  <Link to="/conhecimento" className="text-link">
                    Explorar base
                    <ArrowRight size={14} />
                  </Link>
                }
              />
              <div className="article-grid">
                {articles.slice(0, 3).map((a) => (
                  <ArticleCard key={a.id} article={a} onClick={() => navigate(`/conhecimento/${a.id}`)} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Lateral */}
        <aside className="dashboard-side">
          <section className="assistant-card">
            <div className="assistant-heading">
              <span className="spark-icon">
                <Sparkles size={20} />
              </span>
              <h3>Seu suporte, mais inteligente</h3>
            </div>
            <p>O NEXUS conecta problemas a soluções para você seguir em frente.</p>
            <div className="assistant-feature">
              <span>
                <Sparkles size={17} />
              </span>
              <div>
                <strong>Menos tempo explicando</strong>
                <p>A IA organiza seu problema e sugere uma classificação.</p>
              </div>
            </div>
            <div className="assistant-feature">
              <span>
                <BookOpen size={17} />
              </span>
              <div>
                <strong>Respostas que já existem</strong>
                <p>Encontre soluções validadas na base de conhecimento.</p>
              </div>
            </div>
            <div className="assistant-feature">
              <span>
                <ShieldCheck size={17} />
              </span>
              <div>
                <strong>A decisão é sempre sua</strong>
                <p>Aceite, altere ou rejeite as sugestões. Você está no controle.</p>
              </div>
            </div>
            <div className="assistant-foot">
              <i />
              Inteligência que apoia. Não substitui.
            </div>
          </section>

          <div className="support-card">
            <span>
              <Headphones size={22} />
            </span>
            <h3>Precisa de uma mão?</h3>
            <p>Nossa equipe de TI está por aqui.</p>
            <button onClick={() => navigate("/novo-chamado")} className="text-link" type="button">
              Abrir um chamado
              <ArrowRight size={14} />
            </button>
            <small>
              <i />
              Atendimento · 08h às 18h
            </small>
          </div>
        </aside>
      </div>
    </>
  );
}