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

export interface FormData {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  desiredPosition: string;
  experience: string;
  photo?: File;
}