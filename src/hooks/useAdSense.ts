import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para gerenciar Google AdSense em SPAs
 * 
 * Funcionalidades:
 * - Inicializa o AdSense quando o componente monta
 * - Notifica o AdSense sobre mudanças de rota
 * - Garante carregamento correto de anúncios automáticos
 */
export const useAdSense = () => {
  const location = useLocation();

  useEffect(() => {
    // Verificar se o AdSense está disponível
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        // Notificar o AdSense sobre a mudança de página
        // Isso é importante para SPAs para garantir que os anúncios sejam atualizados
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('AdSense: Página atualizada para anúncios automáticos');
      } catch (error) {
        console.warn('AdSense: Erro ao atualizar anúncios', error);
      }
    }
  }, [location.pathname]); // Executar sempre que a rota mudar

  useEffect(() => {
    // Inicialização do AdSense quando o hook é usado pela primeira vez
    if (typeof window !== 'undefined') {
      try {
        // Garantir que o array adsbygoogle existe
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Se há anúncios automáticos configurados no Google AdSense,
        // eles serão carregados automaticamente pelo script no head
        console.log('AdSense: Inicializado com sucesso');
      } catch (error) {
        console.warn('AdSense: Erro na inicialização', error);
      }
    }
  }, []); // Executar apenas uma vez na montagem
};

// Declaração de tipos para TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}