import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Combobox } from '@/components/ui/combobox';
import { PhotoUpload } from './PhotoUpload';
import { FormData } from '@/types/resume';
import { Sparkles, HelpCircle, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PROFESSION_OPTIONS } from '@/data/professions';
import { formatPhoneNumber, validateEmail, validatePhone, calculateFormProgress } from '@/utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EducationItem } from '@/types/resume';

interface ResumeFormProps {
  onFormChange: (data: FormData) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const ResumeForm = ({ onFormChange, onGenerate, isGenerating }: ResumeFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    phone: '',
    email: '',
    desiredPosition: '',
    experience: '',
    education: [],
  });
  const [isImprovingExperience, setIsImprovingExperience] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formProgress, setFormProgress] = useState(0);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Formatação automática para telefone
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    const updatedData = { ...formData, [field]: processedValue };
    setFormData(updatedData);
    onFormChange(updatedData);
    
    // Validação em tempo real
    validateField(field, processedValue);
  };

  const validateField = (field: keyof FormData, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = 'E-mail inválido';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          errors.phone = 'Telefone deve ter 10 ou 11 dígitos';
        } else {
          delete errors.phone;
        }
        break;
      case 'fullName':
        if (value && value.length < 2) {
          errors.fullName = 'Nome deve ter pelo menos 2 caracteres';
        } else {
          delete errors.fullName;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  // Atualizar progresso quando formData mudar
  useEffect(() => {
    setFormProgress(calculateFormProgress(formData));
  }, [formData]);

  const handlePhotoChange = (file: File | null) => {
    const updatedData = { ...formData, photo: file || undefined };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const addEducationItem = () => {
    const newItem: EducationItem = {
      level: '',
      status: '',
      institution: '',
      course: '',
      period: '',
    };
    const updatedData = { ...formData, education: [...formData.education, newItem] };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const removeEducationItem = (index: number) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    const updatedData = { ...formData, education: updatedEducation };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const updateEducationItem = (index: number, field: keyof EducationItem, value: string) => {
    const updatedEducation = formData.education.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    const updatedData = { ...formData, education: updatedEducation };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const handleImproveExperience = async () => {
    if (!formData.experience.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, escreva algo sobre sua experiência profissional primeiro.",
        variant: "destructive",
      });
      return;
    }

    // Preservar o texto original antes de iniciar o processamento
    const originalText = formData.experience;
    
    setIsImprovingExperience(true);
    
    // Mostrar toast informando que está processando
    toast({
      title: "Gerando melhoria...",
      description: "A IA está aprimorando seu texto. Aguarde um momento.",
    });

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('improve-experience', {
        body: { experienceText: originalText }
      });

      if (error) {
        throw error;
      }

      if (data?.improvedText) {
        // Atualizar apenas se houver resposta válida
        handleInputChange('experience', data.improvedText);
        toast({
          title: "Texto melhorado!",
          description: "Sua experiência profissional foi aprimorada pela IA.",
        });
      } else {
        // Se não houver resposta, manter o texto original
        toast({
          title: "Aviso",
          description: "Não foi possível gerar uma melhoria. Seu texto original foi mantido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao melhorar texto:', error);
      // Em caso de erro, garantir que o texto original permanece
      // O texto já está no formData, então não precisamos fazer nada
      toast({
        title: "Não foi possível melhorar o texto agora.",
        description: "Seu texto original foi preservado. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsImprovingExperience(false);
    }
  };

  const isFormValid = formData.fullName && formData.phone && formData.email && 
                     formData.desiredPosition && formData.experience;

  return (
    <TooltipProvider>
      <Card className="h-fit">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-heading-md flex items-center gap-2">
            Criar Meu Currículo
            <div className="ml-auto flex items-center gap-2 text-sm font-normal">
              <span>Progresso:</span>
              <div className="w-20">
                <Progress value={formProgress} className="h-2" />
              </div>
              <span>{formProgress}%</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground">Foto Profissional</h3>
          <PhotoUpload onPhotoChange={handlePhotoChange} />
        </div>

        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground">Dados Pessoais</h3>
          <div className="grid gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Digite seu nome completo como aparece nos documentos</p>
                    <p className="text-xs mt-1">Exemplo: João Silva Santos</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                  className={`mt-1 pr-8 ${validationErrors.fullName ? 'border-destructive' : formData.fullName ? 'border-green-500' : ''}`}
                  aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
                />
                {formData.fullName && !validationErrors.fullName && (
                  <CheckCircle2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {validationErrors.fullName && (
                  <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {validationErrors.fullName && (
                <p id="fullName-error" className="text-sm text-destructive mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Campo opcional. Algumas empresas não recomendam incluir idade no currículo</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="mt-1"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Digite apenas números, a formatação será automática</p>
                      <p className="text-xs mt-1">Aceita celular (11 dígitos) ou fixo (10 dígitos)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`mt-1 pr-8 ${validationErrors.phone ? 'border-destructive' : formData.phone && validatePhone(formData.phone) ? 'border-green-500' : ''}`}
                    aria-describedby={validationErrors.phone ? 'phone-error' : undefined}
                    maxLength={15}
                  />
                  {formData.phone && validatePhone(formData.phone) && (
                    <CheckCircle2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {validationErrors.phone && (
                    <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                  )}
                </div>
                {validationErrors.phone && (
                  <p id="phone-error" className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use um e-mail profissional</p>
                    <p className="text-xs mt-1">Exemplo: joao.silva@email.com</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={`mt-1 pr-8 ${validationErrors.email ? 'border-destructive' : formData.email && validateEmail(formData.email) ? 'border-green-500' : ''}`}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                />
                {formData.email && validateEmail(formData.email) && (
                  <CheckCircle2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {validationErrors.email && (
                  <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {validationErrors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground">Informações Profissionais</h3>
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="desiredPosition">Profissão Desejada *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Escolha da lista ou digite sua própria profissão</p>
                  <p className="text-xs mt-1">Seja específico: "Desenvolvedor React" é melhor que só "Desenvolvedor"</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <Combobox
                options={PROFESSION_OPTIONS}
                value={PROFESSION_OPTIONS.find(option => option.label === formData.desiredPosition)?.value}
                onValueChange={(value) => {
                  const selectedOption = PROFESSION_OPTIONS.find(option => option.value === value);
                  if (selectedOption) {
                    handleInputChange('desiredPosition', selectedOption.label);
                  }
                }}
                placeholder="Escolha uma profissão..."
                searchPlaceholder="Pesquisar profissão..."
                emptyMessage="Nenhuma profissão encontrada."
                className="mt-1"
              />
              <div className="text-sm text-muted-foreground text-center">ou</div>
              <Input
                id="desiredPosition"
                value={formData.desiredPosition}
                onChange={(e) => handleInputChange('desiredPosition', e.target.value)}
                placeholder="Digite sua profissão personalizada..."
                className=""
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="experience">Experiência Profissional *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Inclua:</p>
                  <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                    <li>Trabalhos anteriores</li>
                    <li>Projetos relevantes</li>
                    <li>Atividades que demonstram suas habilidades</li>
                    <li>Resultados alcançados (números, percentuais)</li>
                  </ul>
                  <p className="text-xs mt-2">Use a IA para melhorar seu texto!</p>
                </TooltipContent>
              </Tooltip>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-2 py-1 h-6 text-xs ml-auto"
                onClick={handleImproveExperience}
                disabled={isImprovingExperience || !formData.experience.trim()}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isImprovingExperience ? 'Melhorando...' : 'Melhorar com IA'}
              </Button>
            </div>

            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Descreva sua experiência profissional, projetos, responsabilidades e conquistas..."
              className="mt-1 min-h-40 text-base"
              rows={6}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading-sm text-foreground">Formação Acadêmica</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicione suas formações acadêmicas</p>
                <p className="text-xs mt-1">Comece pela mais recente</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {formData.education.map((item, index) => (
            <Card key={index} className="p-4 space-y-3 relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeEducationItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nível *</Label>
                  <Select 
                    value={item.level} 
                    onValueChange={(value) => updateEducationItem(index, 'level', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ensino-medio">Ensino Médio</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="graduacao">Graduação</SelectItem>
                      <SelectItem value="pos-graduacao">Pós-graduação</SelectItem>
                      <SelectItem value="mestrado">Mestrado</SelectItem>
                      <SelectItem value="doutorado">Doutorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status *</Label>
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => updateEducationItem(index, 'status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Completo</SelectItem>
                      <SelectItem value="cursando">Cursando</SelectItem>
                      <SelectItem value="incompleto">Incompleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Instituição *</Label>
                <Input
                  value={item.institution}
                  onChange={(e) => updateEducationItem(index, 'institution', e.target.value)}
                  placeholder="Nome da escola, universidade ou curso"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Curso</Label>
                <Input
                  value={item.course || ''}
                  onChange={(e) => updateEducationItem(index, 'course', e.target.value)}
                  placeholder="Ex: Administração, Técnico em Informática (opcional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Período *</Label>
                <Input
                  value={item.period}
                  onChange={(e) => updateEducationItem(index, 'period', e.target.value)}
                  placeholder="Ex: 2020-2024 ou 2023-Atual"
                  className="mt-1"
                />
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addEducationItem}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Formação
          </Button>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onGenerate}
            disabled={!isFormValid || isGenerating}
            variant="gradient-accent"
            size="lg"
            className="w-full text-lg py-6 font-bold shadow-elegant hover:shadow-xl transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Gerando Currículo...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Currículo Profissional
              </>
            )}
          </Button>

          {!isFormValid && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Campos obrigatórios pendentes:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {!formData.fullName && <li>• Nome Completo</li>}
                {!formData.phone && <li>• Telefone</li>}
                {!formData.email && <li>• E-mail</li>}
                {!formData.desiredPosition && <li>• Profissão Desejada</li>}
                {!formData.experience && <li>• Experiência Profissional</li>}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};