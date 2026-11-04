# NEXUS — Intelligent IT Support

Plataforma inovadora de HelpDesk e suporte de TI impulsionada por inteligência artificial. O **NEXUS** automatiza a triagem, categorização e sumarização de chamados técnicos, acelerando o tempo de atendimento e auxiliando técnicos e administradores na tomada de decisão.

---

## 🚀 Visão do Produto

O NEXUS foi desenhado para otimizar o fluxo de atendimento em departamentos de TI corporativos e acadêmicos. Ele atende a três perfis principais de usuários:
*   **Usuários (Requerentes):** Abertura simplificada de chamados através de linguagem natural. A IA analisa o problema instantaneamente, preenche título, categoria e prioridade, e sugere artigos da base de conhecimento antes mesmo do chamado ser enviado.
*   **Técnicos (Nível 1 e 2):** Triagem inteligente, visualização de interações em tempo real, histórico de diagnósticos e ferramentas de suporte à decisão técnica.
*   **Administradores:** Monitoramento de métricas do sistema, painéis gerenciais e controle total sobre o ecossistema de atendimento.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando uma arquitetura moderna e desacoplada, garantindo alta performance, tipagem estática e manutenibilidade:

*   **Frontend:** 
    *   React (com Vite para bundling ultrarrápido)
    *   TypeScript (Tipagem estrita)
    *   Tailwind CSS (Estilização responsiva e moderna)
    *   Lucide React (Ícones vetoriais)
*   **Backend:**
    *   Node.js (Versão exigida: **22.x a 24.x**)
    *   Express.js (Framework web)
    *   TypeScript
    *   Google Generative AI SDK (`@google/generative-ai`) para integração com o Gemini.
*   **Banco de Dados & ORM:**
    *   PostgreSQL (Versão exigida: **15.x a 16.x**, rodando via Docker)
    *   Prisma ORM (Gerenciamento de migrações e persistência de dados)

---

## 📦 Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
*   Node.js (v22.x ou superior)
*   Docker e Docker Compose (para o container PostgreSQL)
*   Gerenciador de pacotes `npm` ou `yarn`

---

## ⚙️ Como Executar Localmente

Siga o passo a passo abaixo para colocar o ambiente completo em funcionamento:

### 1. Clonar o repositório e configurar o ambiente
Abra o seu terminal na pasta raiz do projeto.

Configure as variáveis de ambiente do backend criando um arquivo `.env` dentro da pasta `backend/`:
```env
PORT=3333
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_db?schema=public"
JWT_SECRET="nexus_secret_jwt_key_2026"
GEMINI_API_KEY="sua_chave_da_api_do_gemini_aqui"
