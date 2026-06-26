import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import StarField from '../components/StarField';

export default function Badges() {
  const { stats, BADGES } = useGame();

  const allBadges = [
    ...BADGES.english.map(b => ({ ...b, subject: 'English', subjectIcon: '📖' })),
    ...BADGES.math.map(b => ({ ...b, subject: 'Maths', subjectIcon: '⚔️' })),
    ...BADGES.science.map(b => ({ ...b, subject: 'Science', subjectIcon: '🔬' })),
  ];

  const earned = stats.badges;

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">🎖️</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">Badges & Awards</h1>
          <p className="text-purple-300">Collect them all by earning points!</p>
          <div className="mt-3 inline-block px-4 py-2 rounded-xl text-purple-200 text-sm font-bold"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
            🎖️ {earned.length} / {allBadges.length} Badges Earned
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {allBadges.map((badge, i) => {
            const isEarned = earned.find(b => b.id === badge.id);
            return (
              <motion.div key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-2xl p-6 text-center relative overflow-hidden"
                style={{
                  border: isEarned ? `2px solid ${badge.color}60` : '1px solid rgba(255,255,255,0.1)',
                  filter: isEarned ? 'none' : 'grayscale(80%)',
                  opacity: isEarned ? 1 : 0.5,
                }}>
                {isEarned && (
                  <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ background: badge.color }}>
                    ✓ Earned
                  </div>
                )}
                <div className="text-5xl mb-3" style={{ filter: isEarned ? 'drop-shadow(0 0 8px currentColor)' : 'none' }}>
                  {badge.icon}
                </div>
                <p className="font-poppins font-bold text-white text-sm mb-1">{badge.name}</p>
                <p className="text-purple-400 text-xs mb-2">{badge.subjectIcon} {badge.subject}</p>
                <div className="text-xs font-bold" style={{ color: badge.color }}>
                  {badge.points} pts required
                </div>
                {isEarned && (
                  <p className="text-xs text-purple-400 mt-2">
                    Earned {new Date(isEarned.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {earned.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 text-center mt-4">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-white font-bold font-poppins mb-2">No badges yet!</p>
            <p className="text-purple-300 text-sm">Answer questions to earn your first badge.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
