// src/pages/NovoArtigo.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { PageHeading, Button } from "../components/nexus-ui";
import { httpPost } from "../services/api";

export function NovoArtigo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Impressoras");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return alert("Preencha todos os campos.");

    try {
      setLoading(true);
      await httpPost("/api/articles", { title, category, summary });
      navigate("/conhecimento");
    } catch (err: any) {
      alert(err.message || "Erro ao criar artigo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => navigate("/conhecimento")} className="back-link flex items-center gap-2 mb-4">
        <ArrowLeft size={16} /> Voltar para Base de Conhecimento
      </button>

      <PageHeading title="Novo Artigo" subtitle="Adicione uma solução validada à base de conhecimento." />

      <form onSubmit={handleSubmit} className="panel form-panel" style={{ maxWidth: "700px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label className="block text-sm font-semibold mb-1">Título do Artigo</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como resolver erro de spooler de impressão"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label className="block text-sm font-semibold mb-1">Categoria</label>
          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Impressoras">Impressoras</option>
            <option value="Rede">Rede</option>
            <option value="Hardware">Hardware</option>
            <option value="Acessos">Acessos</option>
            <option value="Sistemas">Sistemas</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label className="block text-sm font-semibold mb-1">Resumo / Solução</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={5}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Descreva o passo a passo da solução..."
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          Salvar Artigo
        </Button>
      </form>
    </>
  );
}