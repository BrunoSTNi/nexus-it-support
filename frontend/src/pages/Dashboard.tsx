import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSpeaker, LogOut, PlusCircle, AlertCircle, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { httpGet, createTicket } from '../services/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string | { name: string };
  priority: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados do Modal de Novo Chamado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const userStr = localStorage.getItem('@nexus_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('@nexus_token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchTickets();
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      const response = await httpGet('/api/tickets');
      setTickets(response.data || []);
    } catch (err: any) {
      setError('Erro ao carregar chamados.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await createTicket(description);
      setDescription('');
      setIsModalOpen(false);
      fetchTickets(); // Recarrega a lista de chamados
    } catch (err: any) {
      alert(err.message || 'Erro ao criar chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@nexus_token');
    localStorage.removeItem('@nexus_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <MonitorSpeaker size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">NEXUS Support</h1>
              <p className="text-xs text-gray-500">Painel de Atendimento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Olá, {user?.name || 'Usuário'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chamados Recentes</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <PlusCircle size={20} />
            Novo Chamado
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando chamados...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">Nenhum chamado encontrado</h3>
            <p className="text-gray-500 text-sm mt-1">Clique em "Novo Chamado" para registrar uma ocorrência.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-800">{ticket.title}</span>
                        
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {typeof ticket.category === 'object' && ticket.category !== null 
                            ? ticket.category.name 
                            : String(ticket.category || 'Geral')}
                        </span>

                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {ticket.priority}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm">{ticket.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span>{ticket.status}</span>
                    </div>
                </div>
                ))}
          </div>
        )}
      </main>

      {/* Modal de Novo Chamado com IA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Sparkles size={24} />
              <h3 className="text-xl font-bold text-gray-800">Novo Chamado com IA</h3>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              Descreva o seu problema detalhadamente. A nossa inteligência artificial analisará o texto, categorizará o chamado e definirá a prioridade automaticamente.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Problema</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Minha internet caiu na sala 3 e o computador não conecta no Wi-Fi..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processando com IA...' : 'Criar Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}