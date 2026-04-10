import { Navigate } from 'react-router-dom';
import Auth from '../utils/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!Auth.loggedIn()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}
