# Arquitetura e Decisões de Engenharia — NEXUS

Este documento detalha as escolhas arquiteturais, o design de camadas, o isolamento de serviços de IA e a modelagem relacional adotada no backend do NEXUS.

---

## 📐 Visão Geral da Arquitetura em Camadas

O backend do NEXUS adota uma arquitetura em camadas estrita para garantir a separação de responsabilidades (SoC), testabilidade e facilidade de manutenção:

1.  **Rotas (Routes):** Mapeiam os endpoints HTTP para os controllers correspondentes e aplicam middlewares globais (como autenticação JWT).
2.  **Controllers (`src/modules/.../*.controller.ts`):** Responsáveis por receber o objeto `Request` do Express, extrair parâmetros e corpo da requisição, chamar os serviços de negócio e retornar as respostas HTTP formatadas em JSON com códigos de status apropriados.
3.  **Services (`src/modules/.../*.service.ts`):** Contêm o núcleo da regra de negócio da aplicação. É onde ocorrem as validações lógicas, chamadas ao Prisma ORM e orquestração com serviços externos.
4.  **Repositórios / Prisma Client (`src/config/prisma.ts`):** Camada de persistência que interage diretamente com o banco de dados PostgreSQL.

---

## 🤖 Módulo de IA (`AIService`)

Para evitar o acoplamento excessivo e garantir que falhas na API de Inteligência Artificial não derrubem a aplicação principal, toda a lógica relacionada ao Google Gemini foi isolada na classe estática `AIService` (`backend/src/modules/ai/ai.service.ts`).

*   **Isolamento e Resiliência:** O serviço encapsula a construção de prompts estruturados, chamadas assíncronas ao SDK `@google/generative-ai` e tratamento de exceções.
*   **Estratégia de Fallback em Cascata:** Para mitigar falhas temporárias de indisponibilidade ou sobrecarga de modelos (erros `503 Service Unavailable`), o `AIService` implementa um loop de tentativa sequencial entre múltiplos modelos (`gemini-1.5-flash`, `gemini-1.5-pro`). Caso todos falhem, um objeto estruturado padrão (fallback) é retornado, garantindo que o chamado seja persistido no banco sem travar a experiência do usuário.

---

## 🗄️ Banco de Dados e Modelagem Relacional

A persistência utiliza o **Prisma ORM** acoplado ao **PostgreSQL**. As principais entidades do domínio são:

*   **User:** Armazena os usuários do sistema, diferenciando papéis (Ex: `ADMIN`, `TECHNICIAN`, `USER`) e credenciais de acesso com hash de senha.
*   **Category:** Agrupa os chamados por áreas técnicas (Ex: Hardware, Redes, Software, Acesso). Criada de forma dinâmica ou pré-populada.
*   **Ticket:** A entidade central do sistema. Armazena `title`, `description`, `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), além de chaves estrangeiras para o criador (`requesterId`) e técnico atribuído (`assigneeId`).
*   **Interaction:** Histórico de mensagens, comentários e atualizações de status vinculados a um ticket específico, permitindo o acompanhamento colaborativo.
*   **KnowledgeArticle:** Base de conhecimento integrada que armazena soluções documentadas para consulta prévia e suporte à decisão.

---

## ⚖️ Decisões de Risco e Mitigação

### 1. Mitigação de Retornos Inválidos da IA
*   **Risco:** Modelos de linguagem podem retornar texto livre acompanhado de conversas ("Aqui está o JSON que você pediu..."), quebrando o parser JSON no backend.
*   **Mitigação:** Os prompts enviados ao Gemini exigem estritamente um objeto JSON puro. No código, aplicamos uma rotina de sanitização por Regex (`response.text().replace(/```json/g, '').replace(/```/g, '').trim()`) seguida de `JSON.parse` blindado por blocos `try/catch` com valores de fallback garantidos.

### 2. Escolha por Busca Textual Tradicional (MVP) vs. Bancos Vetoriais
*   **Risco:** A implementação de buscas semânticas avançadas com Embeddings e bancos vetoriais (como Pinecone ou pgvector) adicionaria complexidade de infraestrutura desnecessária para o escopo inicial do produto.
*   **Mitigação:** Optamos por utilizar os recursos relacionais eficientes do PostgreSQL combinados com análise de palavras-chave extraídas pela IA (`keywords`), o que atende perfeitamente à performance de indexação e recuperação de artigos de suporte no MVP, mantendo o deploy simples e autocontido via Docker.
