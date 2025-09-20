import { useState } from 'react';
import { ResumeForm } from '@/components/ResumeForm';
import { ResumePreview } from '@/components/ResumePreview';
import { ColorCustomizer, ColorTheme } from '@/components/ColorCustomizer';
import { generateResumeData } from '@/utils/resumeGenerator';
import { FormData, ResumeData } from '@/types/resume';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>({
    primary: "0 0% 0%",
    accent: "0 0% 40%",
    background: "0 0% 100%",
    foreground: "0 0% 0%",
    fontFamily: "classic"
  });
  const { toast } = useToast();

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
    if (!resumeData) return;
    
    try {
      const element = document.getElementById('resume-preview');
      if (!element) return;

      // Convert HSL color to hex for PDF background
      const hslToHex = (hsl: string) => {
        const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
        const sDecimal = s / 100;
        const lDecimal = l / 100;
        
        const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = lDecimal - c / 2;
        
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      const backgroundColor = hslToHex(selectedTheme.background);

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename: `curriculo-${resumeData.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="container mx-auto px-4 py-6">
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
          <div>
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
