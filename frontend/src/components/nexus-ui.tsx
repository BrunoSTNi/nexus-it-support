import React from "react";
import { Sparkles, BookOpen, Search, Plus} from "lucide-react";

// Título de Página
export function PageHeading({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Botão Padrão do Sistema
export function Button({
  children,
  secondary,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button className={`btn ${secondary ? "btn-secondary" : "btn-primary"}`} {...props}>
      {children}
    </button>
  );
}

// Cabeçalho de Seção
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card de Artigo da Base de Conhecimento
export function ArticleCard({
  article,
  onClick,
}: {
  article: { id: string; title: string; category: string; summary?: string };
  onClick: () => void;
}) {
  return (
    <div className="article-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="article-top">
        <span className="article-category">{article.category}</span>
      </div>
      <h3>{article.title}</h3>
      <div className="article-footer">
        <span>Ler artigo</span>
        <span>→</span>
      </div>
    </div>
  );
}

// Badge de Status / Tags
export function Badge({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind?: string;
}) {
  return <span className={`badge ${kind === "tag" ? "tag-badge" : ""}`}>{children}</span>;
}

// Alerta de IA
export function AIWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="ai-warning">
      <Sparkles size={16} />
      <p>{children}</p>
    </div>
  );
}

// Estado Vazio (Empty)
export function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <h3>{text}</h3>
      <p>Tente ajustar os filtros ou realizar uma nova busca.</p>
    </div>
  );
}