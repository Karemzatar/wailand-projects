import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EnhancedLogin from './components/EnhancedLogin';
import AdminDashboard from './components/AdminDashboard';
import ProjectDashboard from './components/ProjectDashboard';
import LoadingScreen from './components/LoadingScreen';

// Page transition wrapper
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', height: '100%' }}
    >
        {children}
    </motion.div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, role, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--bg-color)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>
                        Access Denied
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You don't have permission to access this area.
                    </p>
                </div>
            </div>
        );
    }

    return <PageTransition>{children}</PageTransition>;
};

function EnhancedApp() {
    const { isAuthenticated, loading } = useAuth();

    // Show loading screen while checking auth
    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <AnimatePresence mode="wait">
                <Routes>
                    {/* Login Route */}
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated ? (
                                <Navigate to="/" replace />
                            ) : (
                                <PageTransition>
                                    <EnhancedLogin />
                                </PageTransition>
                            )
                        } 
                    />

                    {/* Admin Dashboard */}
                    <Route 
                        path="/admin/*" 
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Project Dashboard */}
                    <Route 
                        path="/*" 
                        element={
                            <ProtectedRoute>
                                <ProjectDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Default redirect */}
                    <Route 
                        path="*" 
                        element={
                            <Navigate 
                                to={isAuthenticated ? "/" : "/login"} 
                                replace 
                            />
                        } 
                    />
                </Routes>
            </AnimatePresence>
        </Router>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <div style={{ 
                background: 'var(--bg-color)', 
                minHeight: '100vh',
                fontFamily: 'var(--font-sans)'
            }}>
                <EnhancedApp />
            </div>
        </AuthProvider>
    );
}
