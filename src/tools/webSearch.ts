import axios from 'axios';

// Chaves de API para Google Custom Search
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Realiza uma pesquisa na web usando Google Custom Search API e retorna os resultados formatados
 * @param query Termos de pesquisa
 * @returns Resultados da pesquisa formatados como texto
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    // Verificar se as chaves de API estão configuradas
    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
      console.warn("API do Google não configurada. Configure GOOGLE_API_KEY e GOOGLE_CSE_ID no .env");
      return ""; // Retornar vazio indicando que não conseguiu fazer a pesquisa
    }

    console.log("Iniciando pesquisa para:", query);
    console.log("Usando API Key:", GOOGLE_API_KEY ? "Configurada (primeiros 5 caracteres: " + GOOGLE_API_KEY.substring(0, 5) + "...)" : "Não configurada");
    console.log("Usando CSE ID:", GOOGLE_CSE_ID ? "Configurado" : "Não configurado");
    
    // Formatar a consulta para URL
    const searchQuery = `Cristiano Ronaldo ${query}`;
    
    // Fazer a requisição para a API do Google
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: searchQuery,
          num: 3 // Número de resultados a retornar (máximo 10 na versão gratuita)
        }
      }
    );

    // Verificar se a API retornou resultados
    if (!response.data.items || response.data.items.length === 0) {
      return "Não foi possível encontrar informações relevantes sobre essa pergunta.";
    }

    // Extrair e formatar os resultados da pesquisa
    const results = response.data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    // Formatar os resultados como texto
    let formattedResults = '';
    results.forEach((result: GoogleSearchResult) => {
      formattedResults += `${result.title}\n${result.snippet}\n\n`;
    });

    return formattedResults;
  } catch (error: any) {
    console.error('Erro ao pesquisar na web:', error.message);
    
    // Adicionar mais informações de diagnóstico
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensagem de erro:', error.response.data?.error?.message || 'Sem mensagem de erro específica');
      
      if (error.response.data?.error?.errors) {
        console.error('Detalhes do erro:', JSON.stringify(error.response.data.error.errors, null, 2));
      }
    }
    
    if (error.response?.status === 403) {
      console.error('Erro 403 - Acesso proibido. Verifique se sua chave API tem permissões adequadas.');
      return "";
    }
    
    if (error.response?.status === 429) {
      return "Limite de consultas diárias atingido para a API de pesquisa.";
    }
    
    return ""; // Retornar vazio para que o bot não indique ao usuário que tentou pesquisar
  }
}