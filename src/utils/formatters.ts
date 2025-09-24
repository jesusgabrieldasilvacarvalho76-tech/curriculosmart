// Formatação automática para telefone brasileiro
export const formatPhoneNumber = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a formatação baseada no número de dígitos
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Valida email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valida telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

// Calcula progresso do formulário
export const calculateFormProgress = (formData: any): number => {
  const fields = [
    'fullName',
    'phone', 
    'email',
    'desiredPosition',
    'experience'
  ];
  
  const filledFields = fields.filter(field => {
    const value = formData[field];
    return value && value.toString().trim().length > 0;
  });
  
  return Math.round((filledFields.length / fields.length) * 100);
};