import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useGame } from '../context/GameContext';
import StarField from '../components/StarField';

const SUBJECT_BREAKDOWN = [
  { key: 'englishPoints',   label: 'English',    icon: '📖', color: '#818CF8' },
  { key: 'mathPoints',      label: 'Maths',      icon: '⚔️', color: '#60A5FA' },
  { key: 'sciencePoints',   label: 'Science',    icon: '🔬', color: '#34D399' },
  { key: 'readingPoints',   label: 'Reading',    icon: '📚', color: '#FBBF24' },
  { key: 'spellingPoints',  label: 'Spelling',   icon: '🐝', color: '#86EFAC' },
  { key: 'sprintPoints',    label: 'Sprint',     icon: '⚡', color: '#FB923C' },
  { key: 'knowledgePoints', label: 'Knowledge',  icon: '🌍', color: '#38BDF8' },
  { key: 'stemPoints',      label: 'STEM',       icon: '🔭', color: '#00B09B' },
  { key: 'olympiadPoints',  label: 'Olympiad',   icon: '🏆', color: '#A78BFA' },
];

export default function ParentPortal() {
  const { leaderboard, currentWeekStart } = useGame();
  const [username, setUsername] = useState('');
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u) return;
    setLoading(true);
    setError('');
    setChildData(null);
    setSearched(true);

    try {
      // 1. Look up username → uid
      const unameSnap = await getDoc(doc(db, 'usernames', u));
      if (!unameSnap.exists()) {
        setError('No student found with that username. Please check the spelling.');
        setLoading(false);
        return;
      }
      const uid = unameSnap.data().uid;

      // 2. Fetch profile + stats in parallel
      const [profileSnap, statsSnap] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        getDoc(doc(db, 'stats', uid)),
      ]);

      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const stats = statsSnap.exists() ? statsSnap.data() : {};

      // 3. Determine rank from leaderboard
      const entry = leaderboard.find(s => s.uid === uid);
      const rank = entry ? entry.rank : null;

      // 4. Weekly points
      const weeklyPts = stats.weeklyStart === currentWeekStart ? (stats.weeklyPoints || 0) : 0;

      setChildData({ uid, profile, stats, rank, weeklyPts });
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const getRankLabel = (rank) => {
    if (!rank) return '—';
    if (rank === 1) return '🥇 #1';
    if (rank === 2) return '🥈 #2';
    if (rank === 3) return '🥉 #3';
    return `#${rank}`;
  };

  const getTierLabel = (pts) => {
    if (pts >= 1000) return { title: 'Legend', icon: '👑', color: '#FFD700' };
    if (pts >= 500)  return { title: 'Champion', icon: '🏆', color: '#C0C0C0' };
    if (pts >= 200)  return { title: 'Explorer', icon: '🌟', color: '#CD7F32' };
    if (pts >= 50)   return { title: 'Learner', icon: '📚', color: '#60A5FA' };
    return { title: 'Beginner', icon: '🌱', color: '#34D399' };
  };

  const maxSubjectPts = childData
    ? Math.max(1, ...SUBJECT_BREAKDOWN.map(s => childData.stats[s.key] || 0))
    : 1;

  const earnedBadges = childData?.stats?.badges || [];
  const hasPrincipalAward = earnedBadges.find(b => b.id === 'principal_excellence');

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-2xl mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3">👨‍👩‍👧</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">Parent Portal</h1>
          <p className="text-purple-300">View your child's progress, badges and rankings</p>
        </motion.div>

        {/* Search box */}
        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6">
          <label className="block text-white font-bold mb-2 text-sm">
            🔍 Enter your child's username
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. sara_year5"
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.4)', color: 'white' }}
            />
            <motion.button type="submit" disabled={loading || !username.trim()}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl font-poppins font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', opacity: (!username.trim() || loading) ? 0.5 : 1 }}>
              {loading ? '...' : 'Search'}
            </motion.button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-3 font-semibold">⚠️ {error}</p>
          )}
        </motion.form>

        {/* Results */}
        <AnimatePresence>
          {childData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Principal's Award banner */}
              {hasPrincipalAward && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl p-5 mb-5 text-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.15) 100%)', border: '2px solid rgba(255,215,0,0.5)' }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
                  <div className="text-4xl mb-1">🎓</div>
                  <p className="font-poppins font-black text-yellow-300 text-lg">Principal's Digital Excellence Award</p>
                  <p className="text-yellow-400/70 text-xs mt-1">Awarded for outstanding academic achievement</p>
                </motion.div>
              )}

              {/* Profile card */}
              <div className="glass rounded-2xl p-6 mb-5">
                <div className="flex items-center gap-5">
                  <div className="text-6xl">{childData.profile.avatar || '🎓'}</div>
                  <div className="flex-1">
                    <h2 className="font-poppins font-black text-white text-2xl leading-tight">
                      {childData.profile.name || '—'}
                    </h2>
                    <p className="text-purple-300 text-sm mt-0.5">{childData.profile.yearGroup}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => { const t = getTierLabel(childData.stats.totalPoints || 0); return (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>
                          {t.icon} {t.title}
                        </span>
                      ); })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-black text-3xl">{childData.stats.totalPoints || 0}</p>
                    <p className="text-yellow-300 text-xs">Total Points</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-white font-black text-2xl">{getRankLabel(childData.rank)}</p>
                  <p className="text-purple-300 text-xs mt-1">School Rank</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-green-400 font-black text-2xl">{childData.weeklyPts}</p>
                  <p className="text-purple-300 text-xs mt-1">This Week</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center">
                  <p className="text-blue-400 font-black text-2xl">{earnedBadges.length}</p>
                  <p className="text-purple-300 text-xs mt-1">Badges Earned</p>
                </div>
              </div>

              {/* Subject breakdown */}
              <div className="glass rounded-2xl p-6 mb-5">
                <h3 className="font-poppins font-bold text-white mb-4 text-sm uppercase tracking-wider">
                  📊 Subject Breakdown
                </h3>
                <div className="space-y-3">
                  {SUBJECT_BREAKDOWN.map(({ key, label, icon, color }) => {
                    const pts = childData.stats[key] || 0;
                    const pct = Math.round((pts / maxSubjectPts) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/70 font-semibold">{icon} {label}</span>
                          <span className="text-xs font-black" style={{ color }}>{pts} pts</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-2 rounded-full"
                            style={{ background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges earned */}
              {earnedBadges.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-poppins font-bold text-white mb-4 text-sm uppercase tracking-wider">
                    🎖️ Badges Earned ({earnedBadges.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {earnedBadges.filter(b => b.id !== 'principal_excellence').map(badge => (
                      <div key={badge.id} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                        style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}40` }}>
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-xs font-bold text-white/80 text-center leading-tight max-w-16">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {earnedBadges.length === 0 && (
                <div className="glass rounded-2xl p-6 text-center">
                  <p className="text-4xl mb-2">🌱</p>
                  <p className="text-white font-bold mb-1">No badges yet</p>
                  <p className="text-purple-300 text-sm">Encourage your child to complete more challenges!</p>
                </div>
              )}
            </motion.div>
          )}

          {searched && !childData && !loading && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-white font-bold">No results found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
