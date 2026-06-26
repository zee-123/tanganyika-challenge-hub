import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnglishPage from './pages/EnglishPage';
import MathPage from './pages/MathPage';
import SciencePage from './pages/SciencePage';
import ReadingPage from './pages/ReadingPage';
import SpellingPage from './pages/SpellingPage';
import SprintPage from './pages/SprintPage';
import KnowledgePage from './pages/KnowledgePage';
import StemPage from './pages/StemPage';
import OlympiadPage from './pages/OlympiadPage';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import ParentPortal from './pages/ParentPortal';
import AdminPanel from './pages/AdminPanel';
import AdminSetup from './pages/AdminSetup';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppRoutes() {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <div className="text-6xl floating mb-4">🚀</div>
          <p className="font-poppins font-bold text-purple-300 text-lg">Loading Challenge Hub…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/english" element={<EnglishPage />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/science" element={<SciencePage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/spelling" element={<SpellingPage />} />
        <Route path="/sprint" element={<SprintPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/stem" element={<StemPage />} />
        <Route path="/olympiad" element={<OlympiadPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/parent" element={<ParentPortal />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </AuthProvider>
  );
}
