import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import StarField from '../components/StarField';

const subjects = [
  {
    path: '/english', icon: '📖', label: 'English Adventure',
    desc: 'Grammar, vocabulary & language skills',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glow: 'rgba(102,126,234,0.4)',
    key: 'english',
    phase: 1,
  },
  {
    path: '/math', icon: '⚔️', label: 'Math Quest',
    desc: 'Battle monsters with maths power!',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glow: 'rgba(240,147,251,0.4)',
    key: 'math',
    phase: 1,
  },
  {
    path: '/science', icon: '🔬', label: 'Science Explorer',
    desc: 'Discover the world of science',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    glow: 'rgba(79,172,254,0.4)',
    key: 'science',
    phase: 1,
  },
  {
    path: '/reading', icon: '📚', label: 'Reading Race',
    desc: 'Read passages & answer comprehension questions',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    glow: 'rgba(246,211,101,0.4)',
    key: 'reading',
    phase: 2,
  },
  {
    path: '/spelling', icon: '🐝', label: 'Spelling Bee',
    desc: 'Choose the correct spelling from four options',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    glow: 'rgba(67,233,123,0.4)',
    key: 'spelling',
    phase: 2,
  },
  {
    path: '/sprint', icon: '⚡', label: 'Mental Maths Sprint',
    desc: '60-second rapid-fire maths challenge!',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    glow: 'rgba(250,112,154,0.4)',
    key: 'sprint',
    phase: 2,
  },
  {
    path: '/knowledge', icon: '🌍', label: 'Knowledge League',
    desc: 'Maths · Science · Geography · Tanzania · ICT',
    gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    glow: 'rgba(0,147,233,0.4)',
    key: 'knowledge',
    phase: 2,
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { student, stats, getRank, leaderboard, weeklyChampion } = useGame();
  const rank = getRank();
  const myRank = leaderboard.find(s => s.uid === student?.uid)?.rank || '—';
  const accuracy = stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />

      <div className="max-w-6xl mx-auto px-4 relative z-10">

        {/* Welcome banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
          <div className="text-6xl floating">{student?.avatar || '🎓'}</div>
          <div className="text-center sm:text-left">
            <p className="text-purple-300 text-sm font-semibold">Welcome back,</p>
            <h1 className="font-poppins font-black text-3xl text-white">{student?.name}</h1>
            <p className="text-purple-300 text-sm">{student?.yearGroup} · Sky Wings Academy</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <p className="text-yellow-400 font-black text-2xl">{stats.totalPoints}</p>
              <p className="text-yellow-300 text-xs font-semibold">Total Points</p>
            </div>
            <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <p className="text-purple-300 font-black text-2xl">#{myRank}</p>
              <p className="text-purple-400 text-xs font-semibold">School Rank</p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Rank', value: rank.icon + ' ' + rank.title, color: rank.color },
            { label: 'Badges', value: `🎖️ ${stats.badges.length}`, color: '#F59E0B' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#34D399' },
            { label: 'Questions', value: stats.questionsAnswered, color: '#60A5FA' },
          ].map(stat => (
            <motion.div key={stat.label} variants={item}
              className="glass rounded-2xl p-4 text-center">
              <p className="font-poppins font-black text-2xl text-white">{stat.value}</p>
              <p className="text-purple-300 text-xs mt-1 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Champion banner */}
        {weeklyChampion && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.12) 100%)',
              border: '1px solid rgba(251,191,36,0.45)',
              boxShadow: '0 0 32px rgba(251,191,36,0.12)',
            }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Last Week's Champion</p>
                <p className="text-white font-black text-lg leading-tight">{weeklyChampion.name}</p>
                <p className="text-yellow-300 text-xs">{weeklyChampion.yearGroup} · {weeklyChampion.weekOf}</p>
              </div>
            </div>
            <div className="text-5xl sm:ml-2">{weeklyChampion.avatar}</div>
            <div className="sm:ml-auto text-center px-5 py-2 rounded-2xl"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <p className="text-yellow-400 font-black text-xl">⭐ {weeklyChampion.points}</p>
              <p className="text-yellow-300 text-xs font-semibold">Weekly Points</p>
            </div>
            {weeklyChampion.uid === student?.uid && (
              <div className="px-4 py-2 rounded-2xl text-center"
                style={{ background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.5)' }}>
                <p className="text-yellow-300 font-black text-sm">🎉 That's You!</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Subject cards */}
          <div className="lg:col-span-2">
            <h2 className="font-poppins font-bold text-white text-xl mb-4">📚 Choose Your Challenge</h2>

            {/* Phase 1 */}
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">Phase 1 — Core Subjects</p>
            <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3 mb-5">
              {subjects.filter(s => s.phase === 1).map(sub => {
                const subPoints = stats[`${sub.key}Points`] || 0;
                return (
                  <motion.div key={sub.path} variants={item} whileHover={{ scale: 1.02, y: -2 }}>
                    <Link to={sub.path} className="no-underline">
                      <div className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
                        style={{ background: sub.gradient, boxShadow: `0 8px 32px ${sub.glow}` }}>
                        <div className="text-4xl">{sub.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-poppins font-bold text-white text-base">{sub.label}</h3>
                          <p className="text-white/80 text-xs">{sub.desc}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/20">
                              <div className="h-1.5 rounded-full bg-white/80 transition-all"
                                style={{ width: `${Math.min((subPoints / 300) * 100, 100)}%` }} />
                            </div>
                            <span className="text-white text-xs font-bold">{subPoints} pts</span>
                          </div>
                        </div>
                        <div className="text-white text-xl">→</div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Phase 2 */}
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">⭐ Phase 2 — New Challenges</p>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
              {subjects.filter(s => s.phase === 2).map(sub => {
                const subPoints = stats[`${sub.key}Points`] || 0;
                return (
                  <motion.div key={sub.path} variants={item} whileHover={{ scale: 1.03, y: -3 }}>
                    <Link to={sub.path} className="no-underline">
                      <div className="rounded-2xl p-4 cursor-pointer transition-all h-full"
                        style={{ background: sub.gradient, boxShadow: `0 6px 24px ${sub.glow}` }}>
                        <div className="text-3xl mb-2">{sub.icon}</div>
                        <h3 className="font-poppins font-bold text-white text-sm leading-tight">{sub.label}</h3>
                        <p className="text-white/75 text-xs mt-1 leading-snug">{sub.desc}</p>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="flex-1 h-1.5 rounded-full bg-white/20">
                            <div className="h-1.5 rounded-full bg-white/80 transition-all"
                              style={{ width: `${Math.min((subPoints / 300) * 100, 100)}%` }} />
                          </div>
                          <span className="text-white text-xs font-bold">{subPoints}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Mini leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-bold text-white text-xl">🏆 Top Students</h2>
              <Link to="/leaderboard" className="text-purple-400 text-sm font-semibold no-underline hover:text-purple-300">
                See all →
              </Link>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              {leaderboard.slice(0, 6).map((s, i) => {
                const isMe = s.uid === student?.uid;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0"
                    style={{ background: isMe ? 'rgba(168,85,247,0.2)' : 'transparent' }}>
                    <div className="font-black text-sm w-6 text-center"
                      style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${s.rank}`}
                    </div>
                    <div className="text-xl">{s.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{s.name} {isMe && '(You)'}</p>
                      <p className="text-purple-400 text-xs">{s.yearGroup}</p>
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">{s.totalPoints}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Badges preview */}
        {stats.badges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-bold text-white text-xl">🎖️ Your Badges</h2>
              <Link to="/badges" className="text-purple-400 text-sm font-semibold no-underline">See all →</Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map(badge => (
                <div key={badge.id} className="glass px-4 py-3 rounded-2xl flex items-center gap-2"
                  style={{ border: `1px solid ${badge.color}40` }}>
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-white text-sm font-bold">{badge.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
