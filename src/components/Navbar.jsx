import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { path: '/english', icon: '📖', label: 'English' },
  { path: '/math', icon: '⚔️', label: 'Maths' },
  { path: '/science', icon: '🔬', label: 'Science' },
  { path: '/reading', icon: '📚', label: 'Reading' },
  { path: '/spelling', icon: '🐝', label: 'Spelling' },
  { path: '/sprint', icon: '⚡', label: 'Sprint' },
  { path: '/knowledge', icon: '🌍', label: 'Knowledge' },
  { path: '/stem', icon: '🔬', label: 'STEM' },
  { path: '/olympiad', icon: '🏆', label: 'Olympiad' },
  { path: '/badges', icon: '🎖️', label: 'Badges' },
];

export default function Navbar() {
  const { student, stats, getRank, logout } = useGame();
  const location = useLocation();
  const rank = getRank();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{ background: 'rgba(15, 12, 41, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="Sky Wings Academy" className="h-10 w-auto" />
          <div className="whitespace-nowrap">
            <p className="font-poppins font-black text-white leading-tight" style={{fontSize:'13px'}}>Sky Wings Academy</p>
            <p className="font-poppins text-yellow-400 leading-tight font-bold" style={{fontSize:'10px'}}>The Tanganyika Schools</p>
            <p className="font-poppins text-purple-400 leading-tight" style={{fontSize:'9px'}}>Challenge Hub</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all no-underline"
                style={{
                  background: active ? 'rgba(168,85,247,0.25)' : 'transparent',
                  color: active ? '#c084fc' : 'rgba(255,255,255,0.7)',
                  border: active ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Student info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <span className="text-yellow-400 font-bold text-sm">⭐ {stats.totalPoints}</span>
          </div>

          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="text-xl">{student?.avatar || '🎓'}</span>
              <div className="hidden sm:block text-left">
                <p className="text-white text-xs font-bold leading-tight">{student?.name?.split(' ')[0]}</p>
                <p className="text-purple-400 text-xs leading-tight">{rank.icon} {rank.title}</p>
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 rounded-2xl p-3 min-w-48"
                  style={{ background: 'rgba(20,15,50,0.97)', border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(20px)' }}>
                  <div className="px-3 py-2 border-b border-purple-800/30 mb-2">
                    <p className="text-white font-bold text-sm">{student?.name}</p>
                    <p className="text-purple-400 text-xs">{student?.yearGroup}</p>
                  </div>
                  {/* Mobile nav items */}
                  <div className="md:hidden mb-2">
                    {navItems.map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-purple-200 hover:text-white no-underline">
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-purple-800/30 my-2" />
                  </div>
                  <button onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors cursor-pointer">
                    🚪 Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
