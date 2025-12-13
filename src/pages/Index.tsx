import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumePreview } from '@/components/ResumePreview';
import { ResumeHistory } from '@/components/ResumeHistory';
import { ColorCustomizer, ColorTheme } from '@/components/ColorCustomizer';
import { generateResumeData } from '@/utils/resumeGenerator';
import { FormData, ResumeData } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Download, MessageCircle, Share2, LogIn, LogOut, Crown, Mail, Save } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
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

  const handleSaveResume = async () => {
    if (!resumeData || !user) return;

    setIsSaving(true);
    try {
      const resumePayload = {
        user_id: user.id,
        title: `Currículo - ${resumeData.personalInfo.fullName}`,
        personal_info: JSON.parse(JSON.stringify(resumeData.personalInfo)),
        professional_info: JSON.parse(JSON.stringify(resumeData.professionalInfo)),
        summary: resumeData.summary,
        skills: resumeData.skills,
        education: resumeData.education,
        languages: JSON.parse(JSON.stringify(resumeData.languages)),
        certifications: JSON.parse(JSON.stringify(resumeData.certifications)),
        photo_url: photoUrl || null,
        color_theme: JSON.parse(JSON.stringify(selectedTheme)),
      };

      if (currentResumeId) {
        // Update existing resume
        const { error } = await supabase
          .from('resumes')
          .update(resumePayload)
          .eq('id', currentResumeId);

        if (error) throw error;
        
        toast({
          title: "Currículo Atualizado! ✨",
          description: "Suas alterações foram salvas no histórico.",
        });
      } else {
        // Create new resume
        const { data, error } = await supabase
          .from('resumes')
          .insert(resumePayload)
          .select('id')
          .single();

        if (error) throw error;
        
        setCurrentResumeId(data.id);
        toast({
          title: "Currículo Salvo! ✨",
          description: "Seu currículo foi adicionado ao histórico.",
        });
      }
      
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao salvar currículo:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o currículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadResume = (resume: ResumeData, loadedPhotoUrl: string | null, theme: ColorTheme | null, resumeId: string) => {
    setResumeData(resume);
    setPhotoUrl(loadedPhotoUrl || undefined);
    if (theme) {
      setSelectedTheme(theme);
    }
    setCurrentResumeId(resumeId);
  };

  const handleNewResume = () => {
    setResumeData(null);
    setPhotoUrl(undefined);
    setCurrentResumeId(null);
    setFormData(null);
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

  const generatePdfBlob = async (): Promise<Blob | null> => {
    try {
      const element = document.getElementById('resume-preview');
      if (!element) return null;

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename: `curriculo-${resumeData?.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
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

      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return null;
    }
  };

  const handleShareWhatsApp = async () => {
    if (!resumeData) return;
    
    // Check if Web Share API is available and supports files
    if (navigator.share && navigator.canShare) {
      try {
        const pdfBlob = await generatePdfBlob();
        if (pdfBlob) {
          const file = new File([pdfBlob], `curriculo-${resumeData.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`, { type: 'application/pdf' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Currículo - ${resumeData.personalInfo.fullName}`,
              text: `Olá! Confira meu currículo profissional.\n\n🎯 ${resumeData.personalInfo.fullName}\n💼 ${resumeData.professionalInfo.desiredPosition}`,
              files: [file]
            });
            return;
          }
        }
      } catch (error) {
        console.log('Erro no compartilhamento com arquivo, usando fallback:', error);
      }
    }
    
    // Fallback: open WhatsApp with text only
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

  const handleShareLinkedIn = async () => {
    if (!resumeData) return;
    
    // Download PDF first for LinkedIn
    await handleExportPDF();
    
    // Open LinkedIn share
    const summary = encodeURIComponent(`Acabei de atualizar meu perfil profissional! 

🎯 ${resumeData.professionalInfo.desiredPosition}
${resumeData.summary}

#OpenToWork #${resumeData.professionalInfo.desiredPosition.replace(/\s+/g, '')}`);
    
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${summary}`, '_blank');
    
    toast({
      title: "PDF baixado!",
      description: "Anexe o PDF na sua publicação do LinkedIn.",
    });
  };

  const handleShareEmail = async () => {
    if (!resumeData) return;
    
    // Try to share with file attachment
    if (navigator.share && navigator.canShare) {
      try {
        const pdfBlob = await generatePdfBlob();
        if (pdfBlob) {
          const file = new File([pdfBlob], `curriculo-${resumeData.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`, { type: 'application/pdf' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Currículo - ${resumeData.personalInfo.fullName}`,
              text: `Segue meu currículo profissional em anexo.`,
              files: [file]
            });
            return;
          }
        }
      } catch (error) {
        console.log('Erro no compartilhamento com arquivo, usando fallback:', error);
      }
    }
    
    // Fallback: open mailto
    const subject = encodeURIComponent(`Currículo - ${resumeData.personalInfo.fullName}`);
    const body = encodeURIComponent(`Olá,

Segue meu currículo profissional.

🎯 ${resumeData.personalInfo.fullName}
📧 ${resumeData.personalInfo.email}
📱 ${resumeData.personalInfo.phone}
💼 ${resumeData.professionalInfo.desiredPosition}

${resumeData.summary}

Atenciosamente,
${resumeData.personalInfo.fullName}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    // Also download PDF
    await handleExportPDF();
    toast({
      title: "PDF baixado!",
      description: "Anexe o PDF no seu e-mail.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground truncate">
                  Criador de Currículos
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Crie seu currículo perfeito em minutos com IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {user ? (
                <>
                  {subscribed ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1.5 text-xs md:text-sm"
                      onClick={() => {
                        checkSubscription();
                        toast({
                          title: "Status Atualizado",
                          description: "Verificação de assinatura concluída.",
                        });
                      }}
                    >
                      <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                      <span className="hidden xs:inline">Plano</span> Pro
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="gap-1.5 text-xs md:text-sm"
                      onClick={() => navigate('/plans')}
                    >
                      <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden xs:inline">Assinar</span> Pro
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs md:text-sm" onClick={signOut}>
                    <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </>
              ) : (
                <Button size="sm" className="gap-1.5 text-xs md:text-sm" onClick={() => navigate('/auth')}>
                  <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
            {/* Resume History */}
            {user && (
              <ResumeHistory 
                onLoadResume={handleLoadResume}
                refreshTrigger={historyRefreshTrigger}
              />
            )}

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
              <div className="bg-gradient-accent p-3 md:p-4 rounded-lg shadow-elegant">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-white font-bold text-sm md:text-lg flex items-center gap-2">
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    Currículo pronto!
                  </h3>
                  <div className="flex gap-2">
                    {currentResumeId && (
                      <Button 
                        onClick={handleNewResume}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        Novo
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveResume}
                      disabled={isSaving}
                      size="sm"
                      className="gap-1.5 text-xs font-bold bg-white text-accent hover:bg-white/90"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? 'Salvando...' : currentResumeId ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                  <Button 
                    onClick={handleExportPDF} 
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs md:text-sm font-bold bg-white text-accent hover:bg-accent hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    PDF
                  </Button>
                  <Button 
                    onClick={handleShareWhatsApp}
                    size="sm"
                    className="gap-1.5 text-xs md:text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={handleShareLinkedIn}
                    size="sm"
                    className="gap-1.5 text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={handleShareEmail}
                    size="sm"
                    className="gap-1.5 text-xs md:text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    E-mail
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