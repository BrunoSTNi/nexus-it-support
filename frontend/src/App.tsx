import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Login from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { TicketList } from "./pages/TicketList";
import { TicketDetail } from "./pages/TicketDetail";
import { NovoChamado } from "./pages/NewTicket";
import { BaseConhecimento } from "./pages/BaseConhecimento";
import { NovoArtigo } from "./pages/NovoArtigo";
import { ArtigoDetalhe } from "./pages/ArtigoDetalhe";
import { QueueList } from "./pages/QueueList";
import { AiDiagnostics } from "./pages/AiDiagnostics";
import { UsersManagement } from "./pages/UsersManagement";
import { DashboardOverview } from "./pages/DashboardOverview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas internas protegidas com a estrutura do App Shell (Painel Principal) */}
        <Route
          path="/*"
          element={
            <div className="app-shell">
              <Sidebar />
              <div className="main-shell">
                <main className="page-content">
                  <Routes>
                    {/* A raiz interna "/*" agora carrega a Visão Geral do Suporte */}
                    <Route path="" element={<DashboardOverview />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="visao-geral" element={<DashboardOverview />} />
                    <Route path="meus-chamados" element={<TicketList />} />
                    <Route path="novo-chamado" element={<NovoChamado />} />
                    <Route path="chamado/:id" element={<TicketDetail />} />
                    <Route path="conhecimento" element={<BaseConhecimento />} />
                    <Route path="novo-artigo" element={<NovoArtigo />} />
                    <Route path="conhecimento/:id" element={<ArtigoDetalhe />} />
                    <Route path="fila" element={<QueueList />} />
                    <Route path="diagnostico-ia" element={<AiDiagnostics />} />
                    <Route path="usuarios" element={<UsersManagement />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}