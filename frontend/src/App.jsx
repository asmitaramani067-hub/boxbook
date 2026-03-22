import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TurfList from './pages/TurfList';
import TurfDetail from './pages/TurfDetail';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/owner/Dashboard';
import TurfForm from './pages/owner/TurfForm';
import ExploreTurfs from './pages/ExploreTurfs';
import ExploreTurfDetail from './pages/ExploreTurfDetail';

function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-ink-50 text-ink-900 relative">
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/turfs" element={<PageWrapper><TurfList /></PageWrapper>} />
              <Route path="/turfs/:id" element={<PageWrapper><TurfDetail /></PageWrapper>} />
              <Route path="/explore" element={<PageWrapper><ExploreTurfs /></PageWrapper>} />
              <Route path="/explore/:id" element={<PageWrapper><ExploreTurfDetail /></PageWrapper>} />
              <Route path="/bookings" element={
                <ProtectedRoute role="player">
                  <PageWrapper><MyBookings /></PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/owner/dashboard" element={
                <ProtectedRoute role="owner">
                  <PageWrapper><OwnerDashboard /></PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/owner/add-turf" element={
                <ProtectedRoute role="owner">
                  <PageWrapper><TurfForm /></PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/owner/edit-turf/:id" element={
                <ProtectedRoute role="owner">
                  <PageWrapper><TurfForm /></PageWrapper>
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <PageWrapper>
                  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                    <p className="text-6xl">🏏</p>
                    <h1 className="text-3xl font-black">404 — Page Not Found</h1>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </PageWrapper>
              } />
            </Routes>
          </AnimatePresence>
          <Footer />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#fff', color: '#111827', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
            success: { iconTheme: { primary: '#2E7D32', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
