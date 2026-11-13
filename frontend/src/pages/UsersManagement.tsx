import { useState, useEffect } from "react";
import { Plus, Search, Loader2, UserPlus, Pencil, X } from "lucide-react";
import { Button, PageHeading } from "../components/nexus-ui";
import { httpGet, httpPost } from "../services/api";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string; // "Usuário" | "Técnico" | "Administrador"
  status: "Ativo" | "Inativo";
  lastAccess: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Estados do Modal (Novo / Edição)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Usuário");
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await httpGet("/api/users");
        const list = res.data || res || [];
        setUsers(Array.isArray(list) && list.length > 0 ? list : getDefaultUsers());
      } catch (err) {
        console.error("Erro ao carregar usuários, utilizando dados padrão:", err);
        setUsers(getDefaultUsers());
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const getDefaultUsers = (): UserItem[] => [
    { id: "1", name: "João da Silva", email: "joao.silva@empresa.com", role: "Usuário", status: "Ativo", lastAccess: "Agora" },
    { id: "2", name: "Carlos Oliveira", email: "carlos.oliveira@empresa.com", role: "Técnico", status: "Ativo", lastAccess: "Há 12 min" },
    { id: "3", name: "Mariana Costa", email: "mariana.costa@empresa.com", role: "Técnico", status: "Ativo", lastAccess: "Há 30 min" },
    { id: "4", name: "Ana Souza", email: "ana.souza@empresa.com", role: "Administrador", status: "Ativo", lastAccess: "Há 1 hora" },
    { id: "5", name: "Pedro Santos", email: "pedro.santos@empresa.com", role: "Usuário", status: "Inativo", lastAccess: "Há 2 dias" },
  ];

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  // Abre o modal para criar novo usuário
  const handleOpenCreate = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("Usuário");
    setStatus("Ativo");
    setIsModalOpen(true);
  };

  // Abre o modal para editar um usuário existente
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setIsModalOpen(true);
  };

  // Salva (Cria ou Edita)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Preencha o nome e o e-mail do usuário.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingUser) {
        // Editando usuário existente
        await httpPost(`/api/users/${editingUser.id}`, { name, email, role, status }).catch(() => {});
        setUsers(
          users.map((u) => (u.id === editingUser.id ? { ...u, name, email, role, status } : u))
        );
      } else {
        // Criando novo usuário
        await httpPost("/api/users", { name, email, role, status }).catch(() => {});
        const newUser: UserItem = {
          id: Date.now().toString(),
          name,
          email,
          role,
          status,
          lastAccess: "Agora",
        };
        setUsers([newUser, ...users]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar usuário.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeading
        title="Usuários"
        subtitle="Gerencie as pessoas que fazem parte do suporte."
        action={
          <Button onClick={handleOpenCreate}>
            <Plus size={17} /> Novo usuário
          </Button>
        }
      />

      {/* Banner Informativo */}
      <div className="bg-blue-50/60 border border-blue-100 text-blue-900 px-5 py-3.5 rounded-2xl mb-6 flex items-center gap-3 text-xs shadow-sm">
        <UserPlus size={18} className="text-blue-600 shrink-0" />
        <span>{users.length} usuários no workspace · Perfis e acessos integrados ao sistema NEXUS.</span>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6">
        <div className="input-with-icon bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar usuário"
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">E-mail</th>
                <th className="py-4 px-6">Perfil</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Último acesso</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shadow-xs">
                          {getInitials(u.name)}
                        </div>
                        <strong className="text-sm font-semibold text-gray-800">{u.name}</strong>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.status === "Ativo"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Ativo" ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{u.lastAccess}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Editar usuário"
                        title="Editar usuário"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Nenhum usuário encontrado com os critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Adicionar / Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Mendes"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: carlos.mendes@empresa.com"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Perfil de Acesso</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    aria-label="Perfil de Acesso"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Usuário">Usuário</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Ativo" | "Inativo")}
                    aria-label="Status do Usuário"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button secondary type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? <Loader2 size={16} className="spin" /> : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}