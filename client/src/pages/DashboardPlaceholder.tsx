import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
export default function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Logged in successfully</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout} style={{ marginTop: 20, padding: '8px 16px' }}>Log out</button>
    </div>
  );
}