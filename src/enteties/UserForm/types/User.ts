export type User = {
  id: string | null;
  name: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  birthDate: string;
  gender: string;  
  role: string;
  school?: string;
  schoolEndDate?: string;
  avatarUrl?: string;
};
