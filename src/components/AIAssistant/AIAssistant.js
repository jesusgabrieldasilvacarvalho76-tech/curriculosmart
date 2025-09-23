// src/components/AIAssistant/AIAssistant.js
import React, { useState } from 'react';
import DeepSeekService from '../../services/deepseekService';

const AIAssistant = ({ onSuggestionGenerated, currentText = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState(currentText);
  
  const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
  const deepSeekService = new DeepSeekService(apiKey);

  const handleGenerateSuggestion = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      const prompt = `
        Como especialista em recrutamento, otimize esta descrição para currículo:
        "${userInput}"
        
        Forneça uma versão melhorada com:
        - Linguagem profissional
        - Palavras-chave para ATS
        - Destaque de conquistas
        - Formatação clara
        - Máximo de 150 palavras
      `;

      const suggestion = await deepSeekService.generateContent(prompt);
      onSuggestionGenerated(suggestion);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com a IA. Verifique sua API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant" style={{ border: '1px solid #ddd', padding: '15px', margin: '15px 0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 Assistente IA para Currículo</h4>
      
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Cole sua descrição aqui para otimizar com IA..."
        rows={4}
        style={{ width: '100%', margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }}
        disabled={isLoading}
      />
      
      <button 
        onClick={handleGenerateSuggestion}
        disabled={isLoading || !userInput.trim()}
        style={{ 
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? '⏳ Processando...' : '✨ Otimizar com IA'}
      </button>
      
      {isLoading && (
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '12px' }}>
          Gerando sugestão profissional... Isso pode levar alguns segundos.
        </p>
      )}
    </div>
  );
};

export default AIAssistant;