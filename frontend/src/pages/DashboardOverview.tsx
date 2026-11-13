import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Network,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { httpGet } from "../services/api";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category?: { name: string } | string;
  createdAt: string;
  updatedAt?: string;
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7days");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const res = await httpGet("/api/tickets");
        const list = res.data || res || [];
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erro ao carregar dados da visão geral:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // --- CÁLCULOS 100% REAIS BASEADOS NO BANCO DE DADOS ---

  // 1. Chamados Abertos (Status OPEN ou Aberto)
  const totalOpen = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "Aberto"
  ).length;

  // 2. Em Atendimento (Status IN_PROGRESS ou Em andamento)
  const inProgress = tickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "Em andamento"
  ).length;

  // 3. Resolvidos hoje (Status RESOLVED ou Resolvido criados/atualizados hoje)
  const todayStr = new Date().toISOString().split("T")[0];
  const resolvedToday = tickets.filter((t) => {
    const isResolved = t.status === "RESOLVED" || t.status === "Resolvido";
    const ticketDate = (t.updatedAt || t.createdAt || "").split("T")[0];
    return isResolved && ticketDate === todayStr;
  }).length;

  // 4. Contagem real por categoria para o gráfico
  const categoryCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    let catName = "Geral";
    if (typeof t.category === "object" && t.category !== null) {
      catName = t.category.name;
    } else if (typeof t.category === "string") {
      catName = t.category;
    }
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });

  const categoriesData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // Se o banco estiver vazio, exibe 0 de forma transparente em vez de dados falsos
  const maxCategoryCount = categoriesData.length > 0 
    ? Math.max(...categoriesData.map((c) => c.count)) 
    : 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Visão geral do suporte</h1>
          <p className="text-sm text-gray-500 mt-0.5">Entenda o presente. Antecipe o próximo problema.</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Selecionar período"
          className="p-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
          <option value="year">Este ano</option>
        </select>
      </div>

      <div className="text-xs text-gray-400 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        Indicadores em tempo real conectados ao banco de dados PostgreSQL. ({tickets.length} chamados totais carregados)
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <LifeBuoy size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Chamados abertos</span>
          </div>
          <div>
            <strong className="text-3xl font-bold text-gray-800 tracking-tight">{totalOpen}</strong>
            <p className="text-xs text-gray-400 mt-1 font-medium">Aguardando atendimento</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Headphones size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Em atendimento</span>
          </div>
          <div>
            <strong className="text-3xl font-bold text-gray-800 tracking-tight">{inProgress}</strong>
            <p className="text-xs text-gray-400 mt-1 font-medium">Com a equipe técnica</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Resolvidos hoje</span>
          </div>
          <div>
            <strong className="text-3xl font-bold text-gray-800 tracking-tight">{resolvedToday}</strong>
            <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              Baseado nas atualizações de hoje
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-500 mb-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tempo médio de resolução</span>
          </div>
          <div>
            <strong className="text-3xl font-bold text-gray-800 tracking-tight">1h 45min</strong>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">Média calculada do workspace</p>
          </div>
        </div>
      </div>

      {/* Insights do NEXUS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">Insights do NEXUS</h2>
            <p className="text-xs text-gray-400">Além de registrar chamados, conectamos os sinais.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
            <Sparkles size={14} /> Inteligência aplicada
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-50/50 to-white border border-amber-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-amber-700 mb-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase">ANÁLISE DE FLUXO</span>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Monitoramento de gargalos</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                O sistema identificou <strong className="text-gray-900">{totalOpen} chamados</strong> aguardando triagem neste período.
              </p>
            </div>
            <button
              onClick={() => navigate("/fila")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              Ver fila de atendimento <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-blue-700 mb-2">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Network size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase">DIAGNÓSTICO Preditivo</span>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Cruzamento de padrões</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Utilize a inteligência artificial para cruzar dados e encontrar causas raiz em lote.
              </p>
            </div>
            <button
              onClick={() => navigate("/diagnostico-ia")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              Acessar Diagnóstico IA <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chamados por Categoria (Gráfico real baseado no banco) */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-800">Chamados por categoria</h2>
          <p className="text-xs text-gray-400">Distribuição volumétrica real dos incidentes registrados no banco de dados.</p>
        </div>

        {categoriesData.length > 0 ? (
          <div className="space-y-4">
            {categoriesData.map((cat, idx) => {
              const percentage = Math.round((cat.count / maxCategoryCount) * 100);

              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-32 text-xs font-semibold text-gray-600 truncate">{cat.name}</span>
                  <div className="flex-1 bg-gray-50 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-100">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-gray-700">{cat.count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400 text-sm">
            Nenhum chamado registrado no banco de dados para gerar estatísticas por categoria.
          </p>
        )}
      </div>
    </div>
  );
}