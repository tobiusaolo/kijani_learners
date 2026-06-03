import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Apply from './pages/public/Apply';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Learner Pages
import LearnerDashboard from './pages/learner/LearnerDashboard';
import Modules from './pages/learner/Modules';
import ModuleDetail from './pages/learner/ModuleDetail';
import Storytelling from './pages/learner/Storytelling';
import Forum from './pages/learner/Forum';
import LearnerProfile from './pages/learner/LearnerProfile';
import Certificate from './pages/learner/Certificate';
import Assessment from './pages/learner/Assessment';
import Webinars from './pages/learner/Webinars';
import OfflineHub from './pages/learner/OfflineHub';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/apply" element={<Apply />} />

          {/* Protected Learner Portal */}
          <Route element={<ProtectedRoute />}>
            <Route path="/learn/dashboard" element={<LearnerDashboard />} />
            <Route path="/learn/modules" element={<Modules />} />
            <Route path="/learn/modules/:id" element={<ModuleDetail />} />
            <Route path="/learn/storytelling" element={<Storytelling />} />
            <Route path="/learn/forum" element={<Forum />} />
            <Route path="/learn/profile" element={<LearnerProfile />} />
            <Route path="/learn/assessment" element={<Assessment />} />
            <Route path="/learn/assessment/:type" element={<Assessment />} />
            <Route path="/learn/webinars" element={<Webinars />} />
            <Route path="/learn/certificate" element={<Certificate />} />
            <Route path="/learn/offline" element={<OfflineHub />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
