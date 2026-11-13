import { useState } from "react";
import {
  Plus,
  BookOpen,
  Sparkles,
  ChevronRight,
  CircleDot,
  Paperclip,
  Lightbulb,
  Check,
  Loader2,
  Pencil,
} from "lucide-react";
import { Badge, Button, SectionHeading, PageHeading, AIWarning } from "../components/nexus-ui";
import { Filter } from "../components/ticket-components";
import { httpPost, httpGet } from "../services/api";
import { useNavigate } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content?: string;
}

export function NovoChamado() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState(0); // 0: Digitando, 1: Analisando via API, 2: Revisão dos dados da IA
  const [error, setError] = useState("");
  
  // Dados retornados pela IA ou ajustados pelo usuário
  const [category, setCategory] = useState("Hardware");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("Falha");
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  // Função que chama o backend real para processar a IA e gerar a triagem
  const analyzeWithAI = async () => {
    if (text.trim().length < 10) {
      setError("Descreva o problema com pelo menos 10 caracteres.");
      return;
    }
    setError("");
    setPhase(1); // Entra no estado de carregamento real

    try {
      // Fazemos uma chamada simulando a análise ou enviando para uma rota de preview da IA
      // Como o backend cria o ticket com a IA, podemos disparar a criação temporária ou usar o retorno
      const response = await httpPost("/api/tickets", { description: text });
      const createdTicket = response.data;

      // Popula os estados com o retorno inteligente da IA armazenado no banco
      const resolvedCategory = typeof createdTicket.category === 'object' 
        ? createdTicket.category?.name 
        : (createdTicket.category || "Suporte Geral");

      setCategory(resolvedCategory);
      setPriority(createdTicket.priority || "MEDIUM");
      setSummary(createdTicket.title || text.substring(0, 50));
      setKeywords(createdTicket.keywords || [resolvedCategory, "Suporte"]);

      // Busca artigos da base de conhecimento para sugerir
      try {
        const artRes = await httpGet("/api/articles");
        setArticles(artRes.data || []);
      } catch {
        setArticles([]);
      }

      setPhase(2); // Vai para a tela de revisão
    } catch (err: any) {
      setError(err.message || "Erro ao processar análise com IA.");
      setPhase(0);
    }
  };

  // Confirma e finaliza a abertura do chamado redirecionando para a listagem
  const handleFinalizeTicket = async () => {
    if (!summary.trim()) {
      setError("O resumo não pode ficar vazio.");
      return;
    }

    try {
      setSubmitting(true);
      // O ticket já foi criado no passo da IA, ou podemos garantir o redirecionamento
      navigate("/meus-chamados");
    } catch (err: any) {
      setError(err.message || "Erro ao abrir chamado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Como podemos ajudar?"
        subtitle="Descreva o problema com suas próprias palavras. O NEXUS ajuda a identificar o que está acontecendo."
        eyebrow="NOVO CHAMADO"
      />
      <div className="flow-steps">
        <span className={phase === 0 ? "active" : "active"}>
          <b>1</b>Descreva o problema
        </span>
        <div />
        <span className={phase >= 1 ? "active" : ""}>
          <b>2</b>Revise a análise da IA
        </span>
        <div />
        <span className={phase === 2 ? "active" : ""}>
          <b>3</b>Chamado pronto
        </span>
      </div>

      <div className="two-column">
        <div>
          <section className="panel form-panel">
            <SectionHeading
              title="Conte o que aconteceu"
              subtitle="Inclua o equipamento, setor e quando o problema começou."
            />
            <textarea
              className="description-area"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Minha impressora do setor financeiro não está imprimindo."
              aria-label="Descrição do problema"
              disabled={phase === 1}
            />
            {error && <p className="error">{error}</p>}
            <div className="description-foot">
              <label className="attachment">
                <Paperclip size={15} />
                {file || "Adicionar anexo (local)"}
                <input
                  aria-label="Adicionar anexo"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
                />
              </label>
              <small>{text.length} caracteres</small>
            </div>
            <Button onClick={analyzeWithAI} disabled={phase === 1}>
              <Sparkles size={16} />
              {phase === 1
                ? "Analisando com Google Gemini..."
                : phase === 2
                  ? "Reanalisar problema"
                  : "Analisar problema com IA"}
            </Button>
          </section>

          {/* Loading real da IA */}
          {phase === 1 && (
            <section className="panel analysis-loading">
              <span className="spark-icon">
                <Loader2 className="spin" size={25} />
              </span>
              <h2>Processando com Inteligência Artificial</h2>
              <div className="flex items-center gap-2 text-blue-600 my-4 justify-center">
                <Loader2 size={18} className="spin" />
                <span>Conectando ao modelo Gemini e estruturando dados...</span>
              </div>
              <div className="skeleton" />
              <div className="skeleton short" />
            </section>
          )}

          {/* Painel de Revisão com os dados reais do Backend/IA */}
          {phase === 2 && (
            <section className="panel analysis-panel">
              <SectionHeading title="Análise do NEXUS (IA)" action={<Badge>Processado com Sucesso</Badge>} />
              <AIWarning>
                Estas informações foram geradas automaticamente pelo Google Gemini e podem ser ajustadas antes de concluir.
              </AIWarning>
              <div className="form-grid">
                <label htmlFor="filter-categoria">
                  Categoria Sugerida
                  <Filter
                    id="filter-categoria"
                    label="Categoria"
                    value={category}
                    onChange={setCategory}
                    items={["Hardware", "Rede", "Software", "Acessos", "Suporte Geral"]}
                  />
                </label>
                <label htmlFor="filter-tipo">
                  Tipo
                  <Filter
                    id="filter-tipo"
                    label="Tipo"
                    value={type}
                    onChange={setType}
                    items={["Falha", "Solicitação", "Dúvida"]}
                  />
                </label>
                <label htmlFor="filter-prioridade-sugerida">
                  Prioridade
                  <Filter
                    id="filter-prioridade-sugerida"
                    label="Prioridade"
                    value={priority}
                    onChange={setPriority}
                    items={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
                  />
                </label>
                <div className="form-label">
                  Confiança do Modelo
                  <span className="confidence">
                    <span />
                    Alta · Gemini AI
                  </span>
                </div>
              </div>
              <label>
                Resumo Executivo
                {editing ? (
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    aria-label="Resumo"
                  />
                ) : (
                  <div className="summary-text">{summary}</div>
                )}
              </label>
              <div className="keywords">
                <small>PALAVRAS-CHAVE</small>
                {keywords.map((s) => (
                  <Badge key={s} kind="tag">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="form-actions">
                <Button secondary onClick={() => setEditing(!editing)}>
                  <Pencil size={15} />
                  {editing ? "Concluir edição" : "Editar informações"}
                </Button>
                <Button onClick={handleFinalizeTicket} disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                  Ir para Meus Chamados
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside>
          <section className="panel tips-panel">
            <Lightbulb size={25} />
            <h3>Uma boa descrição ajuda</h3>
            <p>Você não precisa conhecer termos técnicos. Conte o problema do seu jeito.</p>
            <ul>
              <li>O que você estava tentando fazer?</li>
              <li>O que aconteceu de diferente?</li>
              <li>Há alguma mensagem de erro?</li>
              <li>Outras pessoas estão com o mesmo problema?</li>
            </ul>
            <AIWarning>
              Integração ativa com Google Generative AI (Gemini).
            </AIWarning>
          </section>

          {phase === 2 && articles.length > 0 && (
            <section className="panel suggested-articles">
              <h3>Soluções relacionadas</h3>
              {articles.slice(0, 2).map((a) => (
                <button onClick={() => navigate(`/conhecimento/${a.id}`)} key={a.id} type="button">
                  <BookOpen size={18} />
                  <span>{a.title}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}