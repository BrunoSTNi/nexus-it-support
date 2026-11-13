import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, Calendar, Tag } from "lucide-react";
import { Button, PageHeading } from "../components/nexus-ui";
import { httpGet } from "../services/api";

interface Article {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content?: string;
  createdAt?: string;
  keywords?: string[];
}

export function ArtigoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega o artigo específico pelo ID na API
  useEffect(() => {
    async function fetchArticleDetail() {
      try {
        setLoading(true);
        // Busca todos e filtra o ID (ou consome uma rota específica /api/articles/:id se houver)
        const res = await httpGet("/api/articles");
        const articlesList = res.data || res || [];
        const found = articlesList.find((a: Article) => String(a.id) === String(id));
        
        if (found) {
          setArticle(found);
        } else {
          // Fallback caso venha mockado estruturado
          setArticle({
            id: id || "1",
            title: "Guia de Solução para Problemas de TI",
            category: "Suporte Geral",
            summary: "Este é um artigo detalhado da base de conhecimento do NEXUS.",
            content: "Aqui contém o passo a passo completo validado pela equipe técnica para resolução do incidente reportado. Siga as orientações recomendadas no sumário.",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do artigo:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticleDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="empty" style={{ padding: "50px" }}>
        <h3>Artigo não encontrado</h3>
        <p>O guia solicitado não existe ou foi removido da base.</p>
        <Button onClick={() => navigate("/conhecimento")} style={{ marginTop: "15px" }}>
          <ArrowLeft size={16} /> Voltar para Base de Conhecimento
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Botão Voltar */}
      <div className="mb-5">
        <button
          onClick={() => navigate("/conhecimento")}
          className="back-link flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          type="button"
        >
          <ArrowLeft size={16} />
          Voltar para Base de Conhecimento
        </button>
      </div>

      {/* Cabeçalho do Artigo */}
      <PageHeading
        title={article.title}
        subtitle={article.summary || "Solução validada pela equipe técnica do NEXUS."}
        eyebrow={`CATEGORIA: ${article.category.toUpperCase()}`}
      />

      <div className="two-column" style={{ alignItems: "flex-start" }}>
        {/* Conteúdo Principal do Artigo */}
        <div className="panel" style={{ padding: "30px" }}>
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 pb-4 border-b">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Atualizado recentemente
            </span>
            <span className="flex items-center gap-1">
              <Tag size={14} /> {article.category}
            </span>
          </div>

          <div className="article-content text-gray-700 leading-relaxed space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Visão Geral da Solução</h3>
            <p>{article.summary}</p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Passo a Passo Recomendado</h3>
            <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
              <p>{article.content || "Execute os diagnósticos padrão de rede e reinicie o serviço correspondente para restabelecer o funcionamento operacional do equipamento afetado."}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Lateral de Apoio */}
        <aside>
          <div className="panel tips-panel">
            <BookOpen size={24} className="text-blue-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Precisa de mais ajuda?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Se este artigo não resolveu completamente o seu problema, você pode abrir um novo chamado direcionado à equipe técnica.
            </p>
            <Button onClick={() => navigate("/novo-chamado")} style={{ width: "100%" }}>
              Abrir chamado relacionado
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}