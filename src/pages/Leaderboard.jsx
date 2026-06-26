import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import StarField from '../components/StarField';

const RANK_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
const RANK_BG = { 1: 'rgba(255,215,0,0.12)', 2: 'rgba(192,192,192,0.1)', 3: 'rgba(205,127,50,0.1)' };

export default function Leaderboard() {
  const { student, stats, leaderboard } = useGame();
  const myEntry = leaderboard.find(s => s.uid === student?.uid);

  return (
    <div className="min-h-screen pt-20 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">🏆</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">School Leaderboard</h1>
          <p className="text-purple-300">
            {leaderboard.length > 0 ? `${leaderboard.length} students competing` : 'Be the first on the board!'}
            {' '}· Live updates 🔴
          </p>
        </motion.div>

        {/* My rank card */}
        {myEntry && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ border: '2px solid rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.1)' }}>
            <div className="text-4xl font-black text-purple-400">#{myEntry.rank}</div>
            <div className="text-4xl">{student?.avatar}</div>
            <div className="flex-1">
              <p className="text-white font-bold font-poppins">
                {student?.name} <span className="text-purple-400">(You)</span>
              </p>
              <p className="text-purple-300 text-sm">{student?.yearGroup}</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-black text-2xl">{stats.totalPoints}</p>
              <p className="text-yellow-300 text-xs">Points</p>
            </div>
          </motion.div>
        )}

        {leaderboard.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-white font-bold text-lg mb-2">No one's here yet!</p>
            <p className="text-purple-300 text-sm">Complete a challenge to appear on the leaderboard.</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((s, idx) => {
                  if (!s) return <div key={idx} />;
                  const realRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const heights = { 1: 'pb-8 pt-4', 2: 'pb-4 pt-2', 3: 'pb-2 pt-1' };
                  const isMe = s.uid === student?.uid;
                  return (
                    <motion.div key={s.uid}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: realRank * 0.1 }}
                      className={`glass rounded-2xl p-4 text-center flex flex-col items-center justify-end ${heights[realRank]}`}
                      style={{
                        background: isMe ? 'rgba(168,85,247,0.2)' : RANK_BG[realRank] || 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isMe ? '#a855f7' : RANK_COLORS[realRank] || 'rgba(255,255,255,0.1)'}40`,
                      }}>
                      <div className="text-3xl mb-1">{realRank === 1 ? '👑' : realRank === 2 ? '🥈' : '🥉'}</div>
                      <div className="text-3xl">{s.avatar}</div>
                      <p className="text-white font-bold text-sm mt-1 leading-tight">
                        {s.name?.split(' ')[0]}{isMe ? ' (You)' : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: RANK_COLORS[realRank] }}>
                        {s.totalPoints} pts
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full ranked list */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex gap-3 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-8">#</span>
                <span className="flex-1">Student</span>
                <span className="w-24 text-right">Points</span>
              </div>
              {leaderboard.map((s, i) => {
                const isMe = s.uid === student?.uid;
                return (
                  <motion.div key={s.uid}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5) }}
                    className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0 transition-all"
                    style={{ background: isMe ? 'rgba(168,85,247,0.15)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <div className="w-8 text-center font-black text-base"
                      style={{ color: RANK_COLORS[s.rank] || 'rgba(255,255,255,0.3)' }}>
                      {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : s.rank}
                    </div>
                    <div className="text-2xl">{s.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {s.name} {isMe && <span className="text-purple-400 text-xs">(You)</span>}
                      </p>
                      <p className="text-purple-400 text-xs">{s.yearGroup}{s.class ? ` · Class ${s.class}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-black">{s.totalPoints}</p>
                      <p className="text-purple-500 text-xs">pts</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-center text-purple-500 text-xs mt-4">
          🔴 Live · Updates instantly as students earn points
        </p>
      </div>
    </div>
  );
}
