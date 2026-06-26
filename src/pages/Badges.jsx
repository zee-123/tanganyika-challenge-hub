import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import StarField from '../components/StarField';

const SUBJECT_META = {
  english:  { label: 'English',    icon: '📖' },
  math:     { label: 'Maths',      icon: '⚔️' },
  science:  { label: 'Science',    icon: '🔬' },
  reading:  { label: 'Reading',    icon: '📚' },
  spelling: { label: 'Spelling',   icon: '🐝' },
  sprint:   { label: 'Sprint',     icon: '⚡' },
  knowledge:{ label: 'Knowledge',  icon: '🌍' },
  stem:     { label: 'STEM',       icon: '🔭' },
  olympiad: { label: 'Olympiad',   icon: '🏆' },
};

export default function Badges() {
  const { stats, BADGES } = useGame();

  const allBadges = Object.entries(SUBJECT_META).flatMap(([key, meta]) =>
    (BADGES[key] || []).map(b => ({ ...b, subject: meta.label, subjectIcon: meta.icon }))
  );

  const earned = stats.badges || [];
  const totalEarned = earned.length;

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-4xl mx-auto px-4 relative z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">🎖️</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">Badges & Awards</h1>
          <p className="text-purple-300">Collect them all by earning points in every subject!</p>
          <div className="mt-3 inline-block px-4 py-2 rounded-xl text-purple-200 text-sm font-bold"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
            🎖️ {totalEarned} / {allBadges.length} Badges Earned
          </div>
        </motion.div>

        {/* Principal's Digital Excellence Award */}
        {(() => {
          const award = (stats.badges || []).find(b => b.id === 'principal_excellence');
          const isEarned = !!award;
          return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 mb-8 relative overflow-hidden"
              style={{
                background: isEarned
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.12) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: isEarned ? '2px solid rgba(255,215,0,0.5)' : '2px dashed rgba(255,255,255,0.12)',
                filter: isEarned ? 'none' : 'grayscale(60%)',
                opacity: isEarned ? 1 : 0.6,
              }}>
              {isEarned && (
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
              )}
              <div className="flex items-center gap-5">
                <div className="text-6xl" style={{ filter: isEarned ? 'drop-shadow(0 0 12px #FFD700)' : 'none' }}>🎓</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-poppins font-black text-white text-lg leading-tight">
                      Principal's Digital Excellence Award
                    </p>
                    {isEarned && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                        style={{ background: '#FFD700', color: '#000' }}>✓ Earned</span>
                    )}
                  </div>
                  <p className="text-yellow-300/70 text-sm">Awarded by The Tanganyika Schools for outstanding academic achievement</p>
                  <p className="text-yellow-400 text-xs font-bold mt-1">
                    {isEarned ? `Earned ${new Date(award.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Reach 1,000 total points to unlock'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl" style={{ color: isEarned ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>
                    {isEarned ? '⭐' : '🔒'}
                  </p>
                  <p className="text-xs font-bold mt-1" style={{ color: isEarned ? '#FFD700' : 'rgba(255,255,255,0.3)' }}>
                    1,000 pts
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Group badges by subject */}
        {Object.entries(SUBJECT_META).map(([key, meta]) => {
          const subjectBadges = (BADGES[key] || []).map(b => ({ ...b, subject: meta.label, subjectIcon: meta.icon }));
          if (!subjectBadges.length) return null;
          const earnedCount = subjectBadges.filter(b => earned.find(e => e.id === b.id)).length;
          return (
            <div key={key} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{meta.icon}</span>
                <h2 className="font-poppins font-black text-white text-lg">{meta.label}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-1"
                  style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                  {earnedCount}/{subjectBadges.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {subjectBadges.map((badge, i) => {
                  const isEarned = earned.find(b => b.id === badge.id);
                  return (
                    <motion.div key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      className="glass rounded-2xl p-5 text-center relative overflow-hidden"
                      style={{
                        border: isEarned ? `2px solid ${badge.color}60` : '1px solid rgba(255,255,255,0.1)',
                        filter: isEarned ? 'none' : 'grayscale(80%)',
                        opacity: isEarned ? 1 : 0.45,
                      }}>
                      {isEarned && (
                        <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                          style={{ background: badge.color }}>
                          ✓
                        </div>
                      )}
                      <div className="text-5xl mb-2"
                        style={{ filter: isEarned ? `drop-shadow(0 0 8px ${badge.color})` : 'none' }}>
                        {badge.icon}
                      </div>
                      <p className="font-poppins font-bold text-white text-sm mb-1">{badge.name}</p>
                      <div className="text-xs font-bold mt-1" style={{ color: badge.color }}>
                        {badge.points} pts required
                      </div>
                      {isEarned && (
                        <p className="text-xs text-purple-400 mt-1">
                          {new Date(isEarned.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {totalEarned === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 text-center mt-4">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-white font-bold font-poppins mb-2">No badges yet!</p>
            <p className="text-purple-300 text-sm">Answer questions in any subject to earn your first badge.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
