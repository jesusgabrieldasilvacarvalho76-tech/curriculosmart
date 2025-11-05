import { FormData, ResumeData, EducationItem } from '@/types/resume';

export const generateResumeData = (formData: FormData): ResumeData => {
  const skills = generateSkillsFromExperience(formData.experience, formData.desiredPosition);
  const education = formData.education.length > 0 
    ? formatEducationData(formData.education)
    : generateEducationSuggestions(formData.desiredPosition);
  const summary = generateProfessionalSummary(formData.desiredPosition, formData.experience);

  return {
    personalInfo: {
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      phone: formData.phone,
      email: formData.email,
    },
    professionalInfo: {
      desiredPosition: formData.desiredPosition,
      experience: formData.experience,
    },
    skills,
    education,
    summary,
  };
};

const generateSkillsFromExperience = (experience: string, position: string): string[] => {
  const skillsMap: Record<string, string[]> = {
    'desenvolvedor': ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Git', 'SQL', 'TypeScript', 'APIs REST'],
    'designer': ['Adobe Creative Suite', 'Figma', 'UI/UX Design', 'Prototipagem', 'Design Thinking', 'Photoshop', 'Illustrator'],
    'marketing': ['Marketing Digital', 'Google Analytics', 'SEO/SEM', 'Redes Sociais', 'Email Marketing', 'Google Ads', 'Análise de Dados'],
    'vendas': ['Negociação', 'CRM', 'Prospecção', 'Relacionamento com Cliente', 'Análise de Mercado', 'Apresentações', 'Meta de Vendas'],
    'recursos humanos': ['Recrutamento', 'Seleção', 'Gestão de Pessoas', 'Treinamento', 'Avaliação de Desempenho', 'eSocial', 'CLT'],
    'administrativo': ['Pacote Office', 'Organização', 'Gestão de Documentos', 'Atendimento ao Cliente', 'Processos Administrativos'],
    'financeiro': ['Excel Avançado', 'Análise Financeira', 'Controladoria', 'Contabilidade', 'Relatórios Gerenciais', 'Fluxo de Caixa'],
  };

  // Extract skills based on position
  const positionLower = position.toLowerCase();
  let baseSkills: string[] = [];

  for (const [key, skills] of Object.entries(skillsMap)) {
    if (positionLower.includes(key)) {
      baseSkills = skills;
      break;
    }
  }

  // Add generic professional skills
  const genericSkills = [
    'Comunicação Eficaz',
    'Trabalho em Equipe',
    'Resolução de Problemas',
    'Gestão de Tempo',
    'Adaptabilidade',
    'Liderança',
  ];

  // Extract specific skills mentioned in experience
  const experienceSkills = extractSkillsFromText(experience);

  // Combine and deduplicate
  const allSkills = [...new Set([...baseSkills.slice(0, 6), ...experienceSkills, ...genericSkills.slice(0, 4)])];
  
  return allSkills.slice(0, 10); // Limit to 10 skills
};

const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    'excel', 'word', 'powerpoint', 'javascript', 'python', 'java', 'react', 'angular', 'vue',
    'figma', 'photoshop', 'illustrator', 'google analytics', 'seo', 'marketing', 'vendas',
    'inglês', 'espanhol', 'leitura', 'gestão', 'liderança', 'equipe', 'cliente'
  ];

  const foundSkills: string[] = [];
  const textLower = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (textLower.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return foundSkills.slice(0, 5);
};

const formatEducationData = (educationItems: EducationItem[]): string[] => {
  const levelMap: Record<string, string> = {
    'ensino-medio': 'Ensino Médio',
    'tecnico': 'Curso Técnico',
    'graduacao': 'Graduação',
    'pos-graduacao': 'Pós-graduação',
    'mestrado': 'Mestrado',
    'doutorado': 'Doutorado',
  };

  const statusMap: Record<string, string> = {
    'completo': 'Completo',
    'cursando': 'Cursando',
    'incompleto': 'Incompleto',
  };

  return educationItems.map(item => {
    const level = levelMap[item.level] || item.level;
    const status = statusMap[item.status] || item.status;
    const course = item.course ? ` em ${item.course}` : '';
    
    return `${level}${course} - ${item.institution} (${status}) - ${item.period}`;
  });
};

const generateEducationSuggestions = (position: string): string[] => {
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes('desenvolvedor') || positionLower.includes('programador')) {
    return [
      'Graduação em Ciência da Computação, Engenharia de Software ou área correlata',
      'Cursos especializados em tecnologias web',
      'Certificações em plataformas de desenvolvimento'
    ];
  }
  
  if (positionLower.includes('designer')) {
    return [
      'Graduação em Design Gráfico, Design Digital ou área correlata',
      'Cursos de especialização em UI/UX Design',
      'Certificações em ferramentas de design'
    ];
  }

  if (positionLower.includes('marketing')) {
    return [
      'Graduação em Marketing, Comunicação ou Administração',
      'Especializações em Marketing Digital',
      'Certificações Google Analytics e Google Ads'
    ];
  }

  return [
    'Ensino Superior Completo ou Cursando',
    'Cursos de especialização na área',
    'Certificações profissionais relevantes'
  ];
};

const generateProfessionalSummary = (position: string, experience: string): string => {
  const templates = {
    default: `Profissional dedicado e proativo, com experiência em ${position.toLowerCase()}. Comprometido com resultados de qualidade e desenvolvimento contínuo. Busco contribuir com minhas habilidades em uma empresa que valorize inovação e crescimento mútuo.`
  };

  // Customize based on experience length
  const experienceWords = experience.split(' ').length;
  
  if (experienceWords > 50) {
    return `Profissional experiente na área de ${position.toLowerCase()}, com sólida trajetória e comprovados resultados. Possuo expertise em gestão de projetos, trabalho em equipe e foco em soluções inovadoras. Busco novos desafios para aplicar meu conhecimento e contribuir para o crescimento organizacional.`;
  } else if (experienceWords > 20) {
    return `Profissional qualificado em ${position.toLowerCase()}, com experiência prática e conhecimento técnico. Tenho facilidade para aprender, adaptar-me a novos ambientes e trabalhar colaborativamente. Procuro oportunidade para crescer profissionalmente e agregar valor à equipe.`;
  }

  return templates.default;
};