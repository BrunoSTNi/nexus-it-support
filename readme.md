# 🚀 NEXUS · Intelligent IT Support Platform

Plataforma inovadora de HelpDesk e suporte de TI de nova geração, impulsionada por inteligência artificial. O **NEXUS** automatiza a triagem, categorização e sumarização de chamados técnicos, acelerando o tempo de atendimento e auxiliando técnicos e administradores na tomada de decisão.

---

## 🚀 Visão do Produto e Público-Alvo (RBAC)

O NEXUS foi desenhado para otimizar o fluxo de atendimento em departamentos corporativos e acadêmicos, atendendo a três perfis principais:
* **USER (Colaboradores / Requerentes):** Abertura simplificada de chamados através de linguagem natural. A IA analisa o problema instantaneamente, preenche título, categoria e prioridade, e sugere artigos da base de conhecimento antes mesmo do envio.
* **TECHNICIAN (Equipe de TI):** Analistas de níveis 1, 2 e 3 que gerenciam a fila de atendimento, executam diagnósticos assistidos por IA, visualizam interações em tempo real e atualizam o status dos incidentes.
* **ADMIN (Gestores):** Coordenadores focados na Visão Geral do suporte, métricas em tempo real, auditoria e controle total sobre o ecossistema de atendimento.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando uma arquitetura moderna e desacoplada, garantindo alta performance, tipagem estática e manutenibilidade:

* **Frontend:** 
  * React (com Vite para bundling ultrarrápido)
  * TypeScript (Tipagem estrita)
  * Tailwind CSS (Estilização responsiva e moderna)
  * Lucide React (Ícones vetoriais)
  * React Router DOM
* **Backend:**
  * Node.js (Versão recomendada: **22.x a 24.x**)
  * Express.js (Framework web)
  * TypeScript
  * SDK do Google Generative AI para recursos preditivos.
* **Banco de Dados & ORM:**
  * PostgreSQL (Versão **15 a 16**, via Docker)
  * Prisma ORM (Gerenciamento de migrações e persistência segura)

---

## ✨ Funcionalidades Desenvolvidas

1. **Visão Geral do Suporte (Dashboard Principal):**
   * Indicadores em tempo real conectados ao banco de dados PostgreSQL (Chamados abertos, em atendimento, resolvidos no dia e tempo médio).
   * Seção de **Insights do NEXUS**, identificando gargalos operacionais e padrões recorrentes.
   * Gráfico dinâmico de distribuição de chamados por categoria gerado a partir de dados reais.

2. **Fila de Atendimento:**
   * Listagem completa de chamados com cartões de métricas consolidadas (Total, Abertos, Em andamento, Aguardando, Críticos).
   * Barra de filtros avançados por status, prioridade e busca por texto/solicitante.

3. **Detalhes e Interação do Chamado:**
   * Visualização detalhada do incidente com histórico de interações, chat e registro de ações.

4. **Diagnóstico com IA:**
   * Análise preditiva de hipóteses de causas prováveis com barras dinâmicas de nível de confiança.
   * Lista de procedimentos sugeridos interativos com marcação de verificação passo a passo.
   * Botão de ação rápida para aplicar o diagnóstico diretamente nas notas do chamado.

5. **Base de Conhecimento:**
   * Listagem e detalhamento de artigos técnicos persistidos no banco de dados.
   * Formulário para criação de novos artigos com suporte a sumário e conteúdo estruturado.

6. **Gerenciamento de Usuários:**
   * Tabela interativa com avatares estilizados por iniciais automáticas, perfis de acesso (*Usuário*, *Técnico*, *Administrador*) e status (*Ativo*, *Inativo*).
   * Modais integrados para **criação** e **edição** completa de dados dos usuários do workspace.

---

## 📂 Arquitetura do Sistema

O sistema adota uma arquitetura modular em camadas, inspirada nos princípios de Domain-Driven Design (DDD), garantindo clara separação de responsabilidades:

* **Frontend (React/Vite):** Interface minimalista e focada na experiência do operador de suporte.
* **Controllers:** Gerenciam rotas e validações de entrada HTTP.
* **Services:** Contêm as regras de negócio e a integração com provedores externos (como os módulos de IA).
* **Repositories / Prisma:** Gerenciam as consultas e mutações seguras via Prisma ORM.
* **Database (PostgreSQL):** Armazena as entidades centrais (`User`, `Ticket`, `Interaction`, `Category`, `Article`).

---

## 💡 Histórico de Prompts e Engenharia de Contexto

Registro das principais interações e instruções utilizadas durante o desenvolvimento iterativo do projeto:

| Módulo / Etapa | Prompts Utilizados | Refinamento & Decisão de Engenharia |
| :--- | :--- | :--- |
| **Setup Base Backend** | *"Atue como um Engenheiro de Software Sênior. Escreva um script/estrutura que inicialize o Node.js com Express, TypeScript, Prisma e organize as pastas src/controllers, src/routes, src/models."* | Aprovado pela padronização rápida da estrutura de pastas, garantindo as dependências exigidas no escopo técnico. |
| **Integração de Rotas & Base de Conhecimento** | *"Crie as rotas de Artigos conectadas ao Prisma no server.ts e garanta tratamento de erros com fallback seguro para evitar crash no frontend."* | Implementação bem-sucedida de rotas GET/POST com persistência real em PostgreSQL e tratamento robusto de exceções. |
| **Fila e Painel de Diagnóstico IA** | *"Construa as telas de Fila de Atendimento e Diagnóstico com IA 100% funcionais, com seletores dinâmicos de chamados e barras de confiança estruturadas."* | Desenvolvimento de componentes altamente responsivos integrados com chamadas assíncronas à API backend. |
| **Gestão de Usuários & Dashboard Geral** | *"Implemente a tela de Usuários com modal de edição funcional e a Visão Geral do Suporte conectada às contagens reais do banco de dados."* | Substituição total de mocks estáticos por métricas calculadas dinamicamente a partir dos registros do Prisma. |

---

## 🐛 Falhas Superadas no Processo

Durante o desenvolvimento do projeto, diagnosticamos e solucionamos os seguintes desafios técnicos:

1. **Erro `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` (Rotas 404):**
   * *Causa:* Requisições do frontend batiam em rotas não registradas no Express (`/api/articles`, `/api/users`, `/api/ai/diagnose`), fazendo o servidor responder com uma página HTML de erro 404 em vez de JSON.
   * *Solução:* Mapeamento e registro centralizado de todas as rotas no `server.ts` e inclusão de fallbacks estruturados de segurança.
2. **Erro `Property 'article' does not exist on type PrismaClient`:**
   * *Causa:* Desatualização do cache de tipos internos do Prisma Client após a inclusão do model `Article` na modelagem do `schema.prisma`.
   * *Solução:* Execução correta de `npx prisma migrate dev` seguida por `npx prisma generate` e reinicialização do servidor TypeScript do editor.
3. **Erros de Decodificação de Fontes (`OTS parsing error`)**:
   * *Causa:* Arquivos locais `.ttf` corrompidos na pasta estática que impediam a renderização correta do navegador.
   * *Solução:* Padronização da tipografia utilizando classes utilitárias e fontes padrão do sistema via Tailwind CSS.

---

## 📦 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js (v22.x a v24.x)
* Docker e Docker Compose (para o contêiner do PostgreSQL)

### 2. Passo a Passo Completo
1. Clone o repositório e acesse a pasta raiz.
    * **Clonar o repositório e acessar a pasta raiz:**
  ```bash
  git clone [https://github.com/BrunoSTNi/nexus-it-support.git](https://github.com/BrunoSTNi/nexus-it-support.git)
  cd nexus-it-support

2. Suba a infraestrutura do banco de dados (se aplicável via Docker):
   ```bash
   docker-compose up -d

3. Instale as dependências do backend e frontend:
   ```bash
   npm install

4. Configure as variáveis de ambiente no arquivo .env com as credenciais do PostgreSQL.
Execute as migrações e gere os artefatos do Prisma:

   ```bash
   npx prisma migrate dev
   npx prisma generate

5. Inicie os servidores de desenvolvimento:

   ```bash
   npm run dev
