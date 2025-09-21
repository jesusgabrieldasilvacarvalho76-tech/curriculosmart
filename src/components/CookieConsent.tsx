import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Componente de Consentimento de Cookies para GDPR
 * 
 * Funcionalidades:
 * - Aparece na primeira visita do usuário
 * - Salva a preferência no localStorage
 * - Design responsivo e acessível
 * - Compatível com regulamentação GDPR
 */
const CookieConsent: React.FC = () => {
  // Estado para controlar a visibilidade da barra
  const [isVisible, setIsVisible] = useState(false);

  // Chave do localStorage para salvar o consentimento
  const CONSENT_KEY = 'cookie-consent-accepted';

  /**
   * useEffect para verificar se o usuário já deu consentimento
   * Executa apenas na montagem do componente
   */
  useEffect(() => {
    // Verificar se o consentimento já foi dado
    const consentGiven = localStorage.getItem(CONSENT_KEY);
    
    // Se não foi dado consentimento, mostrar a barra
    if (!consentGiven) {
      setIsVisible(true);
    }
  }, []);

  /**
   * Função para aceitar os cookies
   * Salva no localStorage e oculta a barra
   */
  const acceptCookies = () => {
    // Salvar consentimento no localStorage
    localStorage.setItem(CONSENT_KEY, 'true');
    
    // Ocultar a barra com animação suave
    setIsVisible(false);
  };

  /**
   * Se não deve ser visível, não renderizar nada
   */
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elegant animate-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Texto explicativo com link para política de privacidade */}
          <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
            <p>
              Usamos cookies para melhorar sua experiência, personalizar anúncios e analisar o tráfego do site. 
              Ao continuar navegando, você concorda com o uso de cookies de acordo com nossa{' '}
              <a 
                href="/politica-de-privacidade" 
                className="text-primary hover:text-primary-light underline underline-offset-2 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir Política de Privacidade em nova aba"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Botão principal de aceitar */}
            <Button
              onClick={acceptCookies}
              className="flex-1 sm:flex-initial bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-200 font-medium"
              size="sm"
              aria-label="Aceitar cookies e fechar aviso"
            >
              Aceitar Cookies
            </Button>

            {/* Botão secundário para fechar */}
            <Button
              onClick={acceptCookies}
              variant="ghost"
              size="sm"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 sm:hidden"
              aria-label="Fechar aviso de cookies"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;