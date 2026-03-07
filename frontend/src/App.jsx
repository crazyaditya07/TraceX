import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { NotificationProvider } from './contexts/NotificationContext';
// Use the new Navbar
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Use new/existing pages
// Note: We'll likely need to update these component imports if we rename or move files
// For now, assume we will update the files in place or redirect imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';
import ScanProduct from './pages/ScanProduct';
import ManageUsers from './pages/ManageUsers';
import CreateProduct from './pages/CreateProduct';

import { AnimatePresence, motion } from 'framer-motion';

// Protected Route Component (unchanged)
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-screen bg-tracex-darker">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && user) {
        const userRoles = user.roles || [user.role];
        if (!allowedRoles.some(role => userRoles.includes(role))) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
        },
    },
}

const AnimatedPage = ({ children }) => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen pt-20" // Add padding top for fixed navbar
    >
        {children}
    </motion.div>
)

function AppContent() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-tracex-darker relative overflow-x-hidden font-sans text-gray-100">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] top-0 left-1/4 animate-pulse-glow" />
                <div className="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] bottom-1/4 right-0" />
                <div className="absolute w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] top-1/2 left-0" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow">
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
                            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <AnimatedPage><Dashboard /></AnimatedPage>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/product/:productId"
                                element={<AnimatedPage><ProductDetails /></AnimatedPage>}
                            />
                            <Route
                                path="/scan"
                                element={<AnimatedPage><ScanProduct /></AnimatedPage>}
                            />
                            <Route
                                path="/create-product"
                                element={
                                    <ProtectedRoute allowedRoles={['MANUFACTURER', 'ADMIN']}>
                                        <AnimatedPage><CreateProduct /></AnimatedPage>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/manage-users"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                        <AnimatedPage><ManageUsers /></AnimatedPage>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AnimatePresence>
                </main>

                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Web3Provider>
                <AuthProvider>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </AuthProvider>
            </Web3Provider>
        </Router>
    );
}

export default App;
