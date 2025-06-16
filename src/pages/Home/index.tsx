import UserForm from "@/enteties/UserForm/ui/UserForm";
import { User } from "@/enteties/UserForm/types/User";

interface HomeProps {
  userData?: User;
}

export default function Home({ userData }: HomeProps) {
  const defaultUser: User = {
    id: '0',
    birthDate: '00.00.0000',
    gender: '',
    role: '',
    name: '',
    email: '',
  };

  return (
    <UserForm initialData={userData ?? defaultUser} />
  );
}