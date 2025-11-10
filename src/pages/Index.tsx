import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumePreview } from '@/components/ResumePreview';
import { ColorCustomizer, ColorTheme } from '@/components/ColorCustomizer';
import { generateResumeData } from '@/utils/resumeGenerator';
import { FormData, ResumeData } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Download, MessageCircle, Share2, LogIn, LogOut, Crown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>({
    primary: "214 84% 56%",
    accent: "45 93% 47%",
    background: "0 0% 100%",
    foreground: "216 15% 15%",
    fontFamily: "sans"
  });
  const { toast } = useToast();
  const { user, subscribed, signOut, checkSubscription } = useAuth();
  const navigate = useNavigate();

  const handleFormChange = (data: FormData) => {
    setFormData(data);
    
    // Handle photo preview
    if (data.photo) {
      const url = URL.createObjectURL(data.photo);
      setPhotoUrl(url);
    }
  };

  const handleGenerateResume = async () => {
    if (!formData) return;

    // Check authentication
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa fazer login para gerar currículos.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check subscription
    if (!subscribed) {
      toast({
        title: "Assinatura Necessária",
        description: "Assine o plano profissional para gerar currículos.",
        variant: "destructive",
      });
      navigate('/plans');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedResume = generateResumeData(formData);
      setResumeData(generatedResume);
      
      toast({
        title: "Currículo Gerado com Sucesso! ✨",
        description: "Seu currículo profissional está pronto para download.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Gerar Currículo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateResume = (updatedData: ResumeData) => {
    setResumeData(updatedData);
    toast({
      title: "Currículo Atualizado! ✨",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  const handleExportPDF = async () => {
    if (!resumeData || !subscribed) {
      toast({
        title: "Assinatura Necessária",
        description: "Assine o plano profissional para exportar PDF.",
        variant: "destructive",
      });
      navigate('/plans');
      return;
    }
    
    try {
      const element = document.getElementById('resume-preview');
      if (!element) return;

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename: `curriculo-${resumeData.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const
        }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF Exportado com Sucesso! 📄",
        description: "Seu currículo foi baixado automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!resumeData) return;
    
    const message = `Olá! Acabei de criar meu currículo profissional. 
    
🎯 *${resumeData.personalInfo.fullName}*
📧 ${resumeData.personalInfo.email}
📱 ${resumeData.personalInfo.phone}
💼 ${resumeData.professionalInfo.desiredPosition}

${resumeData.summary}

Criei usando um gerador profissional de currículos!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!resumeData) return;
    
    const summary = encodeURIComponent(`Acabei de atualizar meu perfil profissional! 

🎯 ${resumeData.professionalInfo.desiredPosition}
${resumeData.summary}

#OpenToWork #${resumeData.professionalInfo.desiredPosition.replace(/\s+/g, '')}`);
    
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${summary}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-heading-lg text-foreground">
                  Criador de Currículos Profissionais
                </h1>
                <p className="text-muted-foreground">
                  Crie seu currículo perfeito em minutos com IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {subscribed ? (
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        checkSubscription();
                        toast({
                          title: "Status Atualizado",
                          description: "Verificação de assinatura concluída.",
                        });
                      }}
                    >
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Plano Pro
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="gap-2"
                      onClick={() => navigate('/plans')}
                    >
                      <Crown className="w-4 h-4" />
                      Assinar Pro
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button className="gap-2" onClick={() => navigate('/auth')}>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <ResumeForm
              onFormChange={handleFormChange}
              onGenerate={handleGenerateResume}
              isGenerating={isGenerating}
            />
            
            {/* Color Customizer */}
            <ColorCustomizer
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
            />
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {resumeData && (
              <div className="bg-gradient-accent p-4 rounded-lg shadow-elegant">
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Seu currículo está pronto! Compartilhe agora:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    onClick={handleExportPDF} 
                    variant="secondary"
                    className="gap-2 font-bold bg-white text-accent hover:bg-accent hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </Button>
                  <Button 
                    onClick={handleShareWhatsApp}
                    className="gap-2 font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={handleShareLinkedIn}
                    className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            )}
            
            <ResumePreview
              resumeData={resumeData}
              photoUrl={photoUrl}
              onExportPDF={handleExportPDF}
              onUpdateResume={handleUpdateResume}
              colorTheme={selectedTheme}
            />
          </div>
        </div>

        {/* Features Section */}
        {!resumeData && (
          <section className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-heading-lg text-foreground mb-4">
                Por que escolher nosso criador?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desenvolvemos um sistema inteligente que cria currículos profissionais
                personalizados para sua área de atuação.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-heading-sm mb-2">IA Personalizada</h3>
                <p className="text-muted-foreground">
                  Nossa IA gera conteúdo específico para sua área profissional
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-heading-sm mb-2">Layout Profissional</h3>
                <p className="text-muted-foreground">
                  Design moderno e elegante que impressiona recrutadores
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-elegant transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-heading-sm mb-2">Pronto para PDF</h3>
                <p className="text-muted-foreground">
                  Exportação direta para PDF otimizado para impressão
                </p>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Criador de Currículos Profissionais. Desenvolvido com ❤️ para seu sucesso.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;