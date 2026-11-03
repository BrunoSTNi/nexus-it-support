import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class AIService {
  static async classifyTicket(description: string) {
    // Lista de modelos em ordem de preferência para tentativa
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-3.8-flash'];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          Você é um assistente de suporte de TI nível 2. Analise o problema relatado pelo usuário e estruture os dados.
          Problema: "${description}"
          
          Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, sem formatação markdown ou textos adicionais, contendo:
          {
            "category": "Nome curto da categoria sugerida (ex: Hardware, Rede, Software, Acesso)",
            "priority": "Escolha exatamente uma destas: LOW, MEDIUM, HIGH, CRITICAL",
            "summary": "Um título curto e claro para o chamado de no máximo 8 palavras",
            "keywords": ["palavra1", "palavra2", "palavra3"]
          }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        // Se deu certo, retorna imediatamente o resultado formatado
        return {
          category: parsed.category || "Suporte Geral",
          priority: parsed.priority || "MEDIUM",
          title: parsed.summary || description.substring(0, 40),
          keywords: parsed.keywords || []
        };
      } catch (error: any) {
        console.warn(`Tentativa com o modelo ${modelName} falhou:`, error.message);
        lastError = error;
        // Continua para o próximo modelo do loop
      }
    }

    // Se todos os modelos falharem, usa o fallback final estruturado
    console.error('Todos os modelos de IA falharam. Usando fallback padrão.', lastError);
    return {
      category: "Suporte Geral",
      priority: "MEDIUM",
      title: description.substring(0, 40) + "...",
      keywords: []
    };
  }
}