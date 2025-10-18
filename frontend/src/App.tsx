
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Views
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { PredictionView } from './views/PredictionView';
import { PetDetailView } from './views/PetDetailView';
import NotificationsView from './views/NotificationsView';
import GamificationDashboardView from './views/GamificationDashboardView';
import SearchView from './views/SearchView';
import { SocialFeedView } from './views/SocialFeedView';
import MedicalView from './views/MedicalView';
import AdminDashboardView from './views/AdminDashboardView';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            } />
            
            <Route path="/predict" element={
              <ProtectedRoute>
                <PredictionView />
              </ProtectedRoute>
            } />
            
            <Route path="/pet/:petId" element={
              <ProtectedRoute>
                <PetDetailView />
              </ProtectedRoute>
            } />
            
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchView />
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsView />
              </ProtectedRoute>
            } />
            
            <Route path="/gamification" element={
              <ProtectedRoute>
                <GamificationDashboardView />
              </ProtectedRoute>
            } />

            <Route path="/social" element={
              <ProtectedRoute>
                <SocialFeedView />
              </ProtectedRoute>
            } />

            <Route path="/medical" element={
              <ProtectedRoute>
                <MedicalView />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboardView />
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
