import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { experienceText } = await req.json();

    if (!experienceText || !experienceText.trim()) {
      return new Response(
        JSON.stringify({ error: 'Texto de experiência não fornecido' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY não configurado');
      return new Response(
        JSON.stringify({ error: 'Configuração da API não encontrada' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Você é uma IA especializada em melhorar descrições de experiência profissional. Receba o texto do usuário abaixo e gere uma versão aprimorada, mais clara, profissional e convincente, mantendo o estilo, tom e personalidade do autor.

Texto do usuário:
'${experienceText}'

Instruções:
- Não invente experiências ou informações que não estejam no texto original.
- Destaque responsabilidades, conquistas e projetos de forma concisa e organizada.
- Mantenha o texto natural, fluido e fácil de ler.
- Retorne apenas a versão melhorada do texto, sem comentários ou explicações adicionais.`;

    console.log('Enviando requisição para DeepSeek API...');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API DeepSeek (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: `Erro na API: ${response.status}` }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const improvedText = data.choices?.[0]?.message?.content;

    if (!improvedText) {
      console.error('Resposta da API não contém texto melhorado');
      return new Response(
        JSON.stringify({ error: 'Resposta inválida da API' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Texto melhorado com sucesso');
    
    return new Response(
      JSON.stringify({ improvedText: improvedText.trim() }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função improve-experience:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
