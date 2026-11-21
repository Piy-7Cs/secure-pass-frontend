import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import { getEntries } from "./api/password";
import { useAuth } from "./context/AuthContext";
import { type PasswordEntry } from "./components/PasswordList";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setEntries([]);
      return;
    }
    setLoadingEntries(true);
    try {
      const data = await getEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
    }
  }, [user, fetchEntries]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard entries={entries} loading={loadingEntries} refresh={fetchEntries} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard entries={entries} loading={loadingEntries} refresh={fetchEntries} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;