import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class AIService {
  async classifyTicket(description: string) {
    try {
      // Usando o modelo exato listado na sua chave
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

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
      
      // Limpa possíveis marcações markdown (```json e ```)
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Falha na IA, usando fallback:', error);
      return {
        category: "Suporte Geral",
        priority: "LOW",
        summary: "Problema relatado",
        keywords: []
      };
    }
  }
}