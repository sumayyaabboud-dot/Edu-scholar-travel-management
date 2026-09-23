import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import NewApplicationPage from './pages/NewApplicationPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import DonorDashboard from './pages/DonorDashboard';
import TravelAgencyDashboard from './pages/TravelAgencyDashboard';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/dashboard/school-admin" element={<SchoolAdminDashboard />} />
      <Route path="/dashboard/school-admin/new-application" element={<NewApplicationPage />} />
      <Route path="/dashboard/school-admin/application/:id" element={<ApplicationDetailPage />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/dashboard/donor" element={<DonorDashboard />} />
     <Route path="/dashboard/travel-agency" element={<TravelAgencyDashboard />} />
    </Routes>
  );
}

export default App;