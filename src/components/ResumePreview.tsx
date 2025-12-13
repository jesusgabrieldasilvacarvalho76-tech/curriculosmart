import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Mail, Phone, Calendar, User, Edit2, Save, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { ColorTheme } from '@/components/ColorCustomizer';
import { useState } from 'react';
import html2pdf from 'html2pdf.js';

interface ResumePreviewProps {
  resumeData: ResumeData | null;
  photoUrl?: string;
  onExportPDF: () => void;
  onUpdateResume?: (updatedData: ResumeData) => void;
  colorTheme: ColorTheme;
}

const getFontFamily = (fontFamily: string): string => {
  const fontMap: Record<string, string> = {
    'classic': 'Times New Roman, serif',
    'sans': 'Inter, system-ui, sans-serif',
    'playfair': 'Playfair Display, serif',
    'merriweather': 'Merriweather, serif',
    'open-sans': 'Open Sans, sans-serif',
    'lora': 'Lora, serif',
    'source-sans': 'Source Sans Pro, sans-serif'
  };
  return fontMap[fontFamily] || fontMap['sans'];
};

export const ResumePreview = ({ resumeData, photoUrl, onExportPDF, onUpdateResume, colorTheme }: ResumePreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ResumeData | null>(null);

  if (!resumeData) {
    return (
      <Card className="h-fit p-8 text-center">
        <div className="text-muted-foreground">
          <User className="w-24 h-24 mx-auto mb-4 opacity-20" />
          <h3 className="text-heading-sm mb-2">Preview do Currículo</h3>
          <p>Preencha o formulário para ver o preview do seu currículo profissional.</p>
        </div>
      </Card>
    );
  }

  const currentData = editedData || resumeData;

  const handleEdit = () => {
    setEditedData({ ...resumeData });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedData && onUpdateResume) {
      onUpdateResume(editedData);
    }
    setIsEditing(false);
    setEditedData(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const updateField = (path: string[], value: string | string[]) => {
    if (!editedData) return;
    
    const newData = { ...editedData };
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setEditedData(newData);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Preview do Currículo</h2>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} variant="gradient" size="sm" className="flex items-center gap-1.5 text-xs md:text-sm">
                <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs md:text-sm">
                <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs md:text-sm">
                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Editar
              </Button>
              <Button onClick={onExportPDF} variant="gradient" size="sm" className="flex items-center gap-1.5 text-xs md:text-sm">
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Exportar PDF
              </Button>
            </>
          )}
        </div>
      </div>

      <Card 
        id="resume-preview" 
        className="p-4 md:p-8 shadow-card print:shadow-none print:border-none overflow-x-auto"
        style={{ 
          backgroundColor: `hsl(${colorTheme.background})`,
          color: `hsl(${colorTheme.foreground})`,
          fontFamily: getFontFamily(colorTheme.fontFamily)
        }}
      >
        {/* Header Section - Professional Layout */}
        <header className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'hsl(0 0% 85%)' }}>
          {/* Photo - Left side on desktop, top on mobile */}
          {photoUrl && (
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt="Foto profissional"
                className="w-[90px] h-[90px] object-cover rounded-lg"
                style={{ 
                  border: `2px solid hsl(${colorTheme.primary})`,
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
          
          {/* Name and Contact Info - Right side */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <Input
                value={currentData.personalInfo.fullName}
                onChange={(e) => updateField(['personalInfo', 'fullName'], e.target.value)}
                className="text-2xl md:text-3xl font-bold mb-2 border-0 p-0 h-auto bg-transparent"
                style={{ color: 'hsl(0 0% 15%)' }}
              />
            ) : (
              <h1 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: 'hsl(0 0% 15%)' }}
              >
                {currentData.personalInfo.fullName}
              </h1>
            )}
            
            {/* Contact info in a single line */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm" style={{ color: 'hsl(0 0% 45%)' }}>
              {currentData.personalInfo.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" style={{ color: `hsl(${colorTheme.primary})` }} />
                  {isEditing ? (
                    <Input
                      value={currentData.personalInfo.phone}
                      onChange={(e) => updateField(['personalInfo', 'phone'], e.target.value)}
                      className="text-sm h-6 border-0 p-0 bg-transparent w-32"
                    />
                  ) : (
                    <span>{currentData.personalInfo.phone}</span>
                  )}
                </div>
              )}
              {currentData.personalInfo.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" style={{ color: `hsl(${colorTheme.primary})` }} />
                  {isEditing ? (
                    <Input
                      value={currentData.personalInfo.email}
                      onChange={(e) => updateField(['personalInfo', 'email'], e.target.value)}
                      className="text-sm h-6 border-0 p-0 bg-transparent w-48"
                    />
                  ) : (
                    <span>{currentData.personalInfo.email}</span>
                  )}
                </div>
              )}
              {currentData.personalInfo.birthDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" style={{ color: `hsl(${colorTheme.primary})` }} />
                  {isEditing ? (
                    <Input
                      type="date"
                      value={currentData.personalInfo.birthDate}
                      onChange={(e) => updateField(['personalInfo', 'birthDate'], e.target.value)}
                      className="text-sm h-6 border-0 p-0 bg-transparent"
                    />
                  ) : (
                    <span>{new Date(currentData.personalInfo.birthDate).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Professional Summary */}
        {currentData.summary && (
          <section className="mb-8">
            <h2 
              className="text-heading-sm pb-2 mb-4 border-b-2"
              style={{ 
                color: `hsl(${colorTheme.primary})`,
                borderColor: `hsl(${colorTheme.primary} / 0.2)`
              }}
            >
              Resumo Profissional
            </h2>
            {isEditing ? (
              <Textarea
                value={currentData.summary}
                onChange={(e) => updateField(['summary'], e.target.value)}
                className="text-foreground leading-relaxed border-0 p-0 bg-transparent resize-none"
                rows={3}
              />
            ) : (
              <p className="text-foreground leading-relaxed">
                {currentData.summary}
              </p>
            )}
          </section>
        )}

        {/* Professional Experience */}
        <section className="mb-8">
          <h2 
            className="text-heading-sm pb-2 mb-4 border-b-2"
            style={{ 
              color: `hsl(${colorTheme.primary})`,
              borderColor: `hsl(${colorTheme.primary} / 0.2)`
            }}
          >
            Experiência Profissional
          </h2>
          {isEditing ? (
            <Textarea
              value={currentData.professionalInfo.experience}
              onChange={(e) => updateField(['professionalInfo', 'experience'], e.target.value)}
              className="text-foreground leading-relaxed border-0 p-0 bg-transparent resize-none"
              rows={6}
            />
          ) : (
            <div className="space-y-3">
              {currentData.professionalInfo.experience.split('\n').filter(exp => exp.trim()).map((experience, index) => (
                <div key={index} className="flex gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colorTheme.accent})` }}
                  ></div>
                  <p 
                    className="leading-relaxed"
                    style={{ color: `hsl(${colorTheme.foreground})` }}
                  >
                    {experience.trim()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skills */}
        {currentData.skills.length > 0 && (
          <section className="mb-8">
            <h2 
              className="text-heading-sm pb-2 mb-4 border-b-2"
              style={{ 
                color: `hsl(${colorTheme.primary})`,
                borderColor: `hsl(${colorTheme.primary} / 0.2)`
              }}
            >
              Habilidades e Competências
            </h2>
            {isEditing ? (
              <Textarea
                value={currentData.skills.join(', ')}
                onChange={(e) => updateField(['skills'], e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className="text-foreground leading-relaxed border-0 p-0 bg-transparent resize-none"
                rows={3}
                placeholder="Separe as habilidades por vírgula"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `hsl(${colorTheme.accent})` }}
                    ></div>
                    <span style={{ color: `hsl(${colorTheme.foreground})` }}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Education */}
        {currentData.education.length > 0 && (
          <section className="mb-8">
            <h2 
              className="text-heading-sm pb-2 mb-4 border-b-2"
              style={{ 
                color: `hsl(${colorTheme.primary})`,
                borderColor: `hsl(${colorTheme.primary} / 0.2)`
              }}
            >
              Formação e Qualificações
            </h2>
            {isEditing ? (
              <Textarea
                value={currentData.education.join('\n')}
                onChange={(e) => updateField(['education'], e.target.value.split('\n').filter(s => s.trim()))}
                className="text-foreground leading-relaxed border-0 p-0 bg-transparent resize-none"
                rows={3}
                placeholder="Uma qualificação por linha"
              />
            ) : (
              <div className="space-y-2">
                {currentData.education.map((edu, index) => (
                  <div key={index} className="flex gap-3">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: `hsl(${colorTheme.accent})` }}
                    ></div>
                    <p style={{ color: `hsl(${colorTheme.foreground})` }}>{edu}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Languages */}
        {currentData.languages && currentData.languages.length > 0 && (
          <section className="mb-8">
            <h2 
              className="text-heading-sm pb-2 mb-4 border-b-2"
              style={{ 
                color: `hsl(${colorTheme.primary})`,
                borderColor: `hsl(${colorTheme.primary} / 0.2)`
              }}
            >
              Idiomas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentData.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `hsl(${colorTheme.accent})` }}
                  ></div>
                  <span style={{ color: `hsl(${colorTheme.foreground})` }}>
                    {lang.name} - {lang.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {currentData.certifications && currentData.certifications.length > 0 && (
          <section>
            <h2 
              className="text-heading-sm pb-2 mb-4 border-b-2"
              style={{ 
                color: `hsl(${colorTheme.primary})`,
                borderColor: `hsl(${colorTheme.primary} / 0.2)`
              }}
            >
              Certificações
            </h2>
            <div className="space-y-2">
              {currentData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colorTheme.accent})` }}
                  ></div>
                  <p style={{ color: `hsl(${colorTheme.foreground})` }}>
                    {cert.name} - {cert.institution}
                    {cert.year && ` (${cert.year})`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </Card>
    </div>
  );
};