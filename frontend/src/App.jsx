import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authStore from './stores/authStore';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import RobotSettings from './pages/RobotSettings';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { token } = authStore();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const { token } = authStore();

  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <Trades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <RobotSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
