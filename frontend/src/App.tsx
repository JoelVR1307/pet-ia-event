import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { PredictionView } from './views/PredictionView';
import { PetDetailView } from './views/PetDetailView';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <PredictionView />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pet/:petId"
            element={
              <ProtectedRoute>
                <PetDetailView />
              </ProtectedRoute>
            }
          />
          
          {/* Redireccionamientos */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
