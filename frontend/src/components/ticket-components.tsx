import React from "react";
import { ChevronRight, Clock, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

// Componente para os Cards de Estatística (Topo da Dashboard)
export function Stat({
  icon,
  label,
  value,
  foot,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  foot: string;
  tone?: "blue" | "amber" | "green" | "red" | "gray";
}) {
  return (
    <div className="stat-card">
      <div>
        <span className={`stat-icon ${tone || ""}`}>{icon}</span>
        {label}
      </div>
      <strong>{value}</strong>
      <small>{foot}</small>
    </div>
  );
}

// Componente para Filtragem Rápida na Listagem
export function Filter({
  id,
  label,
  value,
  onChange,
  items,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  items: string[];
}) {
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{label}: Todos</option>
      {items.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

// Componente de Tabela de Chamados
export function TicketTable({
  tickets,
  navigate,
  compact = false,
}: {
  tickets: Array<{
    id: string;
    title: string;
    description: string;
    category: string | { name: string };
    priority: string;
    status: string;
    createdAt?: string;
  }>;
  navigate: (path: string) => void;
  compact?: boolean;
}) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty" style={{ padding: "30px" }}>
        <h3>Nenhum chamado encontrado.</h3>
        <p>Não há solicitações cadastradas com os filtros atuais.</p>
      </div>
    );
  }

  // Formata o status para exibição amigável em português
  const formatStatus = (status: string) => {
    switch (status) {
      case "OPEN":
      case "Aberto":
        return { text: "Aberto", className: "badge gray" };
      case "IN_PROGRESS":
      case "Em andamento":
        return { text: "Em andamento", className: "badge blue" };
      case "RESOLVED":
      case "Resolvido":
        return { text: "Resolvido", className: "badge green" };
      case "CLOSED":
      case "Fechado":
        return { text: "Fechado", className: "badge gray" };
      default:
        return { text: status, className: "badge gray" };
    }
  };

  // Formata a prioridade com cores correspondentes
  const formatPriority = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
      case "Crítica":
        return "badge red";
      case "HIGH":
      case "Alta":
        return "badge amber";
      case "MEDIUM":
      case "Média":
        return "badge blue";
      default:
        return "badge gray";
    }
  };

  return (
    <div className="table-scroll">
      <table>
        {!compact && (
          <thead>
            <tr>
              <th>ID / Título</th>
              <th>Categoria</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Data</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
        )}
        <tbody>
          {tickets.map((t) => {
            const catName = typeof t.category === "object" && t.category !== null 
              ? t.category.name 
              : (t.category || "Geral");
            const statusInfo = formatStatus(t.status);

            return (
              <tr key={t.id} onClick={() => navigate(`/chamado/${t.id}`)}>
                <td>
                  <div className="ticket-title-cell">
                    <div>
                      <strong>#{t.id.substring(0, 6)} · {t.title}</strong>
                      <span>{t.description.substring(0, 60)}...</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge">{catName}</span>
                </td>
                <td>
                  <span className={formatPriority(t.priority)}>
                    <i></i> {t.priority}
                  </span>
                </td>
                <td>
                  <span className={statusInfo.className}>
                    <i></i> {statusInfo.text}
                  </span>
                </td>
                <td>
                  <span className="muted">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString("pt-BR") : "Hoje"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="icon-button" aria-label="Ver detalhes">
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}