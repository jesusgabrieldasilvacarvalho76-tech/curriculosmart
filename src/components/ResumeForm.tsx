import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUpload } from './PhotoUpload';
import { FormData } from '@/types/resume';

interface ResumeFormProps {
  onFormChange: (data: FormData) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const ResumeForm = ({ onFormChange, onGenerate, isGenerating }: ResumeFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    phone: '',
    email: '',
    desiredPosition: '',
    experience: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const handlePhotoChange = (file: File | null) => {
    const updatedData = { ...formData, photo: file || undefined };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const isFormValid = formData.fullName && formData.phone && formData.email && 
                     formData.desiredPosition && formData.experience;

  return (
    <Card className="h-fit">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-heading-md">Criar Meu Currículo</CardTitle>
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
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Seu nome completo"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-heading-sm text-foreground">Informações Profissionais</h3>
          <div>
            <Label htmlFor="desiredPosition">Profissão Desejada *</Label>
            <Input
              id="desiredPosition"
              value={formData.desiredPosition}
              onChange={(e) => handleInputChange('desiredPosition', e.target.value)}
              placeholder="Ex: Desenvolvedor Frontend, Analista de Marketing..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="experience">Experiência Profissional *</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Descreva sua experiência profissional, projetos, responsabilidades e conquistas..."
              className="mt-1 min-h-32"
            />
          </div>
        </div>

        <Button 
          onClick={onGenerate}
          disabled={!isFormValid || isGenerating}
          variant="gradient-accent"
          size="lg"
          className="w-full text-lg py-6"
        >
          {isGenerating ? 'Gerando Currículo...' : 'Gerar Currículo Profissional'}
        </Button>

        {!isFormValid && (
          <p className="text-sm text-muted-foreground text-center">
            * Preencha todos os campos obrigatórios para gerar seu currículo
          </p>
        )}
      </CardContent>
    </Card>
  );
};