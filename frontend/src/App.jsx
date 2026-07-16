import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy-loaded pages for code splitting
const AppLayout   = lazy(() => import('./components/layout/AppLayout'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Boards      = lazy(() => import('./pages/Boards'));
const BoardDetail = lazy(() => import('./pages/BoardDetail'));
const Profile     = lazy(() => import('./pages/Profile'));
const Settings    = lazy(() => import('./pages/Settings'));
const SharedBoard = lazy(() => import('./pages/SharedBoard'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const NotFound    = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader text="Authenticating…" />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader text="Loading…" />}>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Public Share URL — no auth needed */}
        <Route path="/share/:token" element={<SharedBoard />} />

        {/* Protected */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/boards"        element={<Boards />} />
          <Route path="/boards/:id"    element={<BoardDetail />} />
          <Route path="/activity"      element={<ActivityPage />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/settings"      element={<Settings />} />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
                  duration: 3500,
                  style: {
                    borderRadius: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    padding: '12px 16px',
                  },
                }}
              />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
