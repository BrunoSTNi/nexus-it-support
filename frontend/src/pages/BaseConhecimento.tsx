import { useState, useEffect } from "react";
import { Plus, BookOpen, Search, Loader2 } from "lucide-react";
import { Button, SectionHeading, PageHeading, ArticleCard, Empty } from "../components/nexus-ui";
import { httpGet } from "../services/api";
import { useNavigate } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content?: string;
  keywords?: string[];
  problem?: string;
}

export function BaseConhecimento() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");

  // Carrega os artigos reais da base de conhecimento do backend
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await httpGet("/api/articles");
        // Trata se a resposta vem como response.data ou direto em response
        const list = response.data || response || [];
        setArticles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Erro ao carregar base de conhecimento:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  // Extrai categorias dinâmicas dos artigos vindos do banco
  const categoriesList = ["Todas", ...Array.from(new Set(articles.map((a) => a.category || "Geral")))];

  // Filtra os artigos baseado na busca textual e categoria selecionada
  const result = articles.filter((a) => {
    const matchesCategory = cat === "Todas" || a.category === cat;
    const searchableText = `${a.title} ${a.summary || ""} ${a.category}`.toLowerCase();
    const matchesSearch = searchableText.includes(q.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        title="Base de conhecimento"
        subtitle="Soluções validadas. Conhecimento que cresce com cada chamado."
        action={
          <Button onClick={() => navigate("/novo-artigo")}>
            <Plus size={17} />
            Novo artigo
          </Button>
        }
      />
      <div className="knowledge-hero">
        <span className="spark-icon">
          <BookOpen size={26} />
        </span>
        <h2>A resposta pode estar aqui.</h2>
        <p>Encontre guias e soluções criados pela sua equipe de TI.</p>
        <div className="input-with-icon">
          <Search size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque por um problema ou palavra-chave..."
            aria-label="Buscar artigo"
          />
        </div>
      </div>

      {/* Abas de Categorias dinâmicas */}
      <div className="category-tabs">
        {categoriesList.map((c) => (
          <button
            className={cat === c ? "selected" : ""}
            key={c}
            onClick={() => setCat(c)}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      <SectionHeading
        title={cat === "Todas" ? "Explore os artigos" : `Artigos de ${cat}`}
        subtitle={`${result.length} artigos disponíveis`}
      />

      <div className="article-grid knowledge-grid">
        {result.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            onClick={() => navigate(`/conhecimento/${a.id}`)}
          />
        ))}
      </div>

      {!result.length && <Empty text="Nenhum artigo encontrado na base de conhecimento." />}
    </>
  );
}