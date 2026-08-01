import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import SegregatorDashboard from './pages/SegregatorDashboard';
import OfficeStaffDashboard from './pages/OfficeStaffDashboard';
import CustodianDashboard from './pages/CustodianDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/segregator"
            element={
              <ProtectedRoute allowedRoles={['segregator']}>
                <SegregatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/office-staff"
            element={
              <ProtectedRoute allowedRoles={['officeStaff', 'offc_staff']}>
                <OfficeStaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custodian"
            element={
              <ProtectedRoute allowedRoles={['custodian']}>
                <CustodianDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;