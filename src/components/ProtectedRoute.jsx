import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BackgroundPrefetch from './BackgroundPrefetch';

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If we only want learners to access the learner portal, we can check role
  if (user.role !== 'learner') {
    // Admins have their own portal, so if an admin logs in here, maybe redirect or allow?
    // For now, allow or redirect. Let's just allow anyone authenticated to view the learner side for testing,
    // or strictly enforce 'learner'.
    // return <Navigate to="/" replace />;
  }

  return (
    <>
      <BackgroundPrefetch />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
