import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Plans() {
  const [loading, setLoading] = useState(false);
  const { user, subscribed, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-muted-foreground">
            Desbloqueie recursos profissionais para criar currículos incríveis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Gratuito</CardTitle>
              <CardDescription>Recursos básicos para começar</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Visualização do currículo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Personalização básica</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Continuar Gratuito
              </Button>
            </CardContent>
          </Card>

          <Card className={subscribed ? "border-primary" : ""}>
            <CardHeader>
              {subscribed && (
                <Badge className="w-fit mb-2">Plano Atual</Badge>
              )}
              <CardTitle>Plano Profissional</CardTitle>
              <CardDescription>Recursos completos para destacar-se</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ 29,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Geração de currículo profissional</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Personalização completa de cores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Exportação em PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Compartilhamento social</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              {subscribed ? (
                <Button variant="outline" className="w-full" disabled>
                  Plano Ativo
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Assinar Agora'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
}