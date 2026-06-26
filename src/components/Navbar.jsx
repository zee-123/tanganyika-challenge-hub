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
  { path: '/stem', icon: '🧪', label: 'STEM' },
  { path: '/olympiad', icon: '🎖️', label: 'Olympiad' },
  { path: '/badges', icon: '🏅', label: 'Badges' },
];

export default function Navbar() {
  const { student, stats, getRank, logout, isAdmin } = useGame();
  const location = useLocation();
  const rank = getRank();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{ background: 'rgba(15, 12, 41, 0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
      <div className="max-w-full px-3 py-2 flex items-center gap-2">

        {/* Logo — shrinks but never disappears */}
        <Link to="/dashboard" className="flex items-center gap-2 no-underline flex-shrink-0">
          <img src="/logo.png" alt="Sky Wings Academy" className="h-9 w-auto" />
          <div className="whitespace-nowrap hidden sm:block">
            <p className="font-poppins font-black text-white leading-tight" style={{ fontSize: '12px' }}>Sky Wings Academy</p>
            <p className="font-poppins text-yellow-400 leading-tight font-bold" style={{ fontSize: '9px' }}>The Tanganyika Schools</p>
            <p className="font-poppins text-purple-400 leading-tight" style={{ fontSize: '8px' }}>Challenge Hub</p>
          </div>
        </Link>

        {/* Desktop Nav — grows to fill space */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto scrollbar-none">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                title={item.label}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl font-semibold transition-all no-underline flex-shrink-0"
                style={{
                  background: active ? 'rgba(168,85,247,0.25)' : 'transparent',
                  color: active ? '#c084fc' : 'rgba(255,255,255,0.7)',
                  border: active ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
                  fontSize: '11px',
                }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side — always visible */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
          {/* Points chip */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <span className="text-yellow-400 font-bold" style={{ fontSize: '12px' }}>⭐ {stats.totalPoints}</span>
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: '18px' }}>{student?.avatar || '🎓'}</span>
              <div className="text-left hidden sm:block">
                <p className="text-white font-bold leading-tight" style={{ fontSize: '11px' }}>{student?.name?.split(' ')[0]}</p>
                <p className="text-purple-400 leading-tight" style={{ fontSize: '10px' }}>{rank.icon} {rank.title}</p>
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 rounded-2xl p-3 min-w-52 max-h-screen-90 overflow-y-auto"
                  style={{ background: 'rgba(20,15,50,0.97)', border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
                  <div className="px-3 py-2 border-b border-purple-800/30 mb-2">
                    <p className="text-white font-bold text-sm">{student?.name}</p>
                    <p className="text-purple-400 text-xs">{student?.yearGroup}</p>
                    <p className="text-yellow-400 text-xs font-semibold mt-0.5">⭐ {stats.totalPoints} pts · {rank.icon} {rank.title}</p>
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
                  <Link to="/parent" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-purple-200 hover:text-white no-underline font-semibold">
                    👨‍👩‍👧 Parent Portal
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-yellow-300 hover:text-white no-underline font-semibold">
                      🛡️ Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-purple-800/30 my-1" />
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
