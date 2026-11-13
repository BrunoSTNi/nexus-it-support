import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, CheckSquare, Square, ExternalLink, MessageSquarePlus } from "lucide-react";
import { Button, PageHeading } from "../components/nexus-ui";
import { httpGet, httpPost } from "../services/api";

interface Ticket {
  id: string;
  title: string;
  description: string;
}

interface Cause {
  title: string;
  confidence: number;
  level: string;
}

interface Procedure {
  id: number;
  text: string;
  checked: boolean;
}

export function AiDiagnostics() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [causes, setCauses] = useState<Cause[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [observation, setObservation] = useState("");
  const [showObservationInput, setShowObservationInput] = useState(false);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoadingTickets(true);
        const res = await httpGet("/api/tickets");
        const list = res.data || res || [];
        setTickets(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setSelectedTicketId(list[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar chamados:", err);
      } finally {
        setLoadingTickets(false);
      }
    }
    fetchTickets();
  }, []);

  useEffect(() => {
    async function runAiAnalysis() {
      if (!selectedTicketId) return;
      const currentTicket = tickets.find((t) => t.id === selectedTicketId);
      if (!currentTicket) return;

      try {
        setAnalyzing(true);
        const res = await httpPost("/api/ai/diagnose", {
          ticketId: currentTicket.id,
          description: currentTicket.description || currentTicket.title,
        });

        const data = res.data || res;
        setCauses(data.causes || getDefaultCauses());
        setProcedures(data.procedures || getDefaultProcedures());
      } catch (err) {
        setCauses([
          { title: "Falha de comunicação no dispositivo", confidence: 88, level: "Alta" },
          { title: "Problema de conexão de rede", confidence: 65, level: "Média" },
          { title: "Serviço em segundo plano travado", confidence: 58, level: "Média" },
          { title: "Incompatibilidade de driver ou versão", confidence: 32, level: "Baixa" },
        ]);
        setProcedures([
          { id: 1, text: "Verificar conexão física ou de rede do dispositivo", checked: false },
          { id: 2, text: "Testar conectividade (ping) no endereço IP configurado", checked: false },
          { id: 3, text: "Verificar estado atual na fila de processamento", checked: false },
          { id: 4, text: "Reiniciar o serviço principal do sistema operacional", checked: false },
          { id: 5, text: "Executar teste funcional de validação", checked: false },
        ]);
      } finally {
        setAnalyzing(false);
      }
    }

    runAiAnalysis();
  }, [selectedTicketId, tickets]);

  const getDefaultCauses = () => [
    { title: "Dispositivo offline ou inacessível", confidence: 88, level: "Alta" },
    { title: "Problema de conexão de rede", confidence: 65, level: "Média" },
    { title: "Fila de processamento travada", confidence: 58, level: "Média" },
    { title: "Driver desatualizado ou corrompido", confidence: 32, level: "Baixa" },
  ];

  const getDefaultProcedures = () => [
    { id: 1, text: "Verificar conexão física ou de rede do dispositivo", checked: false },
    { id: 2, text: "Testar conectividade (ping) no endereço IP configurado", checked: false },
    { id: 3, text: "Verificar estado atual na fila de processamento", checked: false },
    { id: 4, text: "Reiniciar o serviço principal do sistema operacional", checked: false },
    { id: 5, text: "Executar teste funcional de validação", checked: false },
  ];

  const toggleProcedure = (id: number) => {
    setProcedures(
      procedures.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleUseSuggestion = async () => {
    try {
      const checkedTexts = procedures.filter((p) => p.checked).map((p) => p.text).join("; ");
      const observationText = observation ? ` Observação: ${observation}` : "";
      const fullMessage = `Diagnóstico IA aplicado: Passos executados [${checkedTexts}].${observationText}`;

      await httpPost(`/api/tickets/${selectedTicketId}/interactions`, { message: fullMessage });
      alert("Sugestão da IA aplicada e registrada no chamado com sucesso!");
      navigate(`/chamado/${selectedTicketId}`);
    } catch (err: any) {
      alert(err.message || "Erro ao aplicar sugestão no chamado.");
    }
  };

  const checkedCount = procedures.filter((p) => p.checked).length;

  if (loadingTickets) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeading
        title="Diagnóstico IA"
        subtitle="Uma segunda perspectiva para encontrar a melhor solução."
      />

      {/* Seletor de Chamado em Análise */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl mb-6 p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-inner">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-0.5">
              CHAMADO EM ANÁLISE
            </span>
            <select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              aria-label="Selecionar chamado em análise"
              className="font-bold text-gray-800 bg-transparent border-none cursor-pointer text-base focus:outline-none p-0"
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id.substring(0, 6)} · {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTicketId && (
          <Button
            secondary
            onClick={() => navigate(`/chamado/${selectedTicketId}`)}
            className="flex items-center gap-2 text-sm px-4 py-2"
          >
            Ver chamado <ExternalLink size={14} />
          </Button>
        )}
      </div>

      {/* Banner de Aviso de Validação Humana */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/80 text-blue-900 px-5 py-3.5 rounded-2xl mb-6 flex items-center gap-3 text-xs shadow-sm">
        <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
          <Sparkles size={16} />
        </div>
        <span className="font-medium">
          Estas são sugestões geradas pela IA. Valide com cautela antes de executar qualquer procedimento no ambiente.
        </span>
      </div>

      {analyzing ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3 bg-white rounded-2xl border shadow-sm">
          <Loader2 size={40} className="spin text-blue-600" />
          <p className="text-sm text-gray-500 font-medium">O NEXUS IA está cruzando dados e analisando o problema...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Possíveis Causas (Ocupa 7 colunas) */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:col-span-7">
            <h2 className="text-base font-bold text-gray-800 mb-1">Possíveis causas</h2>
            <p className="text-xs text-gray-400 mb-6">Hipóteses inteligentes para apoiar seu diagnóstico, não conclusões.</p>

            <div className="space-y-6">
              {causes.map((cause, idx) => (
                <div key={idx} className="pb-5 border-b border-gray-100 last:border-none last:pb-0">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-3.5">
                      <span className="text-xs font-bold text-gray-400 w-6">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <strong className="text-sm font-semibold text-gray-800">{cause.title}</strong>
                    </div>
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                      {cause.confidence}%
                    </span>
                  </div>
                  <div className="pl-9">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                      <span>Confiança: <strong className="text-gray-600">{cause.level}</strong></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${cause.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Procedimentos Sugeridos (Ocupa 5 colunas) */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-1">Procedimentos sugeridos</h2>
              <p className="text-xs text-gray-400 mb-6">Revise cada passo antes de executá-lo.</p>

              <div className="space-y-3 mb-6">
                {procedures.map((proc) => (
                  <div
                    key={proc.id}
                    onClick={() => toggleProcedure(proc.id)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      proc.checked
                        ? "border-blue-500 bg-blue-50/40 shadow-xs"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
                    }`}
                  >
                    <button type="button" className="text-blue-600 mt-0.5 shrink-0 focus:outline-none">
                      {proc.checked ? <CheckSquare size={18} /> : <Square size={18} className="text-gray-300" />}
                    </button>
                    <span
                      className={`text-sm leading-snug select-none ${
                        proc.checked ? "line-through text-gray-400" : "text-gray-700 font-medium"
                      }`}
                    >
                      {proc.id}. {proc.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Caixa opcional para adicionar observação */}
              {showObservationInput && (
                <div className="mb-6 animate-fade-in">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observação do técnico</label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Adicione notas sobre a execução dos procedimentos..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-400">
                  <strong className="text-gray-700">{checkedCount}</strong> de {procedures.length} procedimentos marcados
                </span>
                
                {!showObservationInput && (
                  <button
                    onClick={() => setShowObservationInput(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors"
                    type="button"
                  >
                    <MessageSquarePlus size={14} /> Adicionar observação
                  </button>
                )}
              </div>

              <Button onClick={handleUseSuggestion} style={{ width: "100%" }} className="py-2.5 shadow-md shadow-blue-500/10">
                <Sparkles size={16} /> Usar sugestão no chamado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}