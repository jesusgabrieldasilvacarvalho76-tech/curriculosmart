import React from 'react';
import { useAdSense } from '@/hooks/useAdSense';

/**
 * Provedor do Google AdSense
 * 
 * Este componente deve ser usado uma vez na aplicação (preferencialmente no App.tsx)
 * para garantir que o AdSense funcione corretamente em todas as páginas.
 * 
 * Funcionalidades:
 * - Inicializa o AdSense para toda a aplicação
 * - Monitora mudanças de rota para SPAs
 * - Garante carregamento correto de anúncios automáticos
 */
interface AdSenseProviderProps {
  children: React.ReactNode;
}

const AdSenseProvider: React.FC<AdSenseProviderProps> = ({ children }) => {
  // Usar o hook personalizado para gerenciar o AdSense
  useAdSense();

  // Este componente não renderiza nada visível, apenas gerencia o AdSense
  return <>{children}</>;
};

export default AdSenseProvider;