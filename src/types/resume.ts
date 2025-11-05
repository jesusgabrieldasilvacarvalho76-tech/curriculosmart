export interface PersonalInfo {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  photo?: string;
}

export interface ProfessionalInfo {
  desiredPosition: string;
  experience: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  skills: string[];
  education: string[];
  summary: string;
}

export interface EducationItem {
  level: string; // "ensino-medio" | "graduacao" | "pos-graduacao" | "tecnico" | "outro"
  status: string; // "completo" | "incompleto" | "cursando"
  institution: string;
  course?: string;
  period: string; // "2020-2024" ou "2020-Atual"
}

export interface FormData {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  desiredPosition: string;
  experience: string;
  education: EducationItem[];
  photo?: File;
}