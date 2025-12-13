import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ResumeData } from '@/types/resume';
import { ColorTheme } from '@/components/ColorCustomizer';
import { History, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedResume {
  id: string;
  title: string;
  personal_info: ResumeData['personalInfo'];
  professional_info: ResumeData['professionalInfo'];
  summary: string;
  skills: string[];
  education: string[];
  languages: ResumeData['languages'];
  certifications: ResumeData['certifications'];
  photo_url: string | null;
  color_theme: ColorTheme | null;
  created_at: string;
  updated_at: string;
}

interface ResumeHistoryProps {
  onLoadResume: (resume: ResumeData, photoUrl: string | null, theme: ColorTheme | null, resumeId: string) => void;
  refreshTrigger?: number;
}

export const ResumeHistory = ({ onLoadResume, refreshTrigger }: ResumeHistoryProps) => {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchResumes = async () => {
    if (!user) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for the data since TypeScript doesn't know the table structure yet
      setResumes((data as unknown as SavedResume[]) || []);
    } catch (error) {
      console.error('Erro ao buscar currículos:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar seus currículos salvos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResumes(resumes.filter(r => r.id !== id));
      toast({
        title: "Currículo excluído",
        description: "O currículo foi removido do histórico.",
      });
    } catch (error) {
      console.error('Erro ao excluir currículo:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o currículo.",
        variant: "destructive",
      });
    }
  };

  const handleLoad = (resume: SavedResume) => {
    const resumeData: ResumeData = {
      personalInfo: resume.personal_info,
      professionalInfo: resume.professional_info,
      summary: resume.summary || '',
      skills: resume.skills || [],
      education: resume.education || [],
      languages: resume.languages || [],
      certifications: resume.certifications || [],
    };

    onLoadResume(resumeData, resume.photo_url, resume.color_theme, resume.id);
    
    toast({
      title: "Currículo carregado",
      description: "Edite e salve as alterações quando terminar.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="h-fit">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg py-3 md:py-4">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <History className="w-4 h-4 md:w-5 md:h-5" />
          Meus Currículos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum currículo salvo ainda.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Gere seu primeiro currículo para começar!
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {resume.personal_info?.fullName || resume.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {resume.professional_info?.desiredPosition || 'Sem cargo'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(resume.updated_at)}
                  </div>
                </div>
                <div className="flex gap-1.5 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleLoad(resume)}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir currículo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O currículo será permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(resume.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
