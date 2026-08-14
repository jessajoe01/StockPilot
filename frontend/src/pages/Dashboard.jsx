import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 className="page-title">Welcome, {user?.name}</h1>
      <p className="page-subtitle">Role: {user?.role}</p>
    </AppLayout>
  );
}