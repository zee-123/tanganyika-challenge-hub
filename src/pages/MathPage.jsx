import { motion } from 'framer-motion';
import StarField from '../components/StarField';
import QuizEngine from '../components/QuizEngine';
import { mathPool } from '../data/questions';

const gradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

export default function MathPage() {
  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #2d1060 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">âš”ï¸</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">Math Quest</h1>
          <p className="text-pink-300">Battle monsters with the power of Maths!</p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {['ðŸ”¢ Maths Cadet', 'âš”ï¸ Maths Warrior', 'ðŸ† Maths Legend'].map(b => (
              <span key={b} className="px-3 py-1 rounded-full text-xs font-bold text-pink-200"
                style={{ background: 'rgba(240,147,251,0.2)', border: '1px solid rgba(240,147,251,0.3)' }}>
                {b}
              </span>
            ))}
          </div>
          <div className="mt-3 px-4 py-2 rounded-xl inline-block text-sm text-pink-200"
            style={{ background: 'rgba(240,147,251,0.1)', border: '1px solid rgba(240,147,251,0.2)' }}>
            âš”ï¸ Correct answer = attack monster! Wrong answer = monster attacks back!
          </div>
        </motion.div>
        <QuizEngine subject="math" pool={mathPool} gradient={gradient} icon="âš”ï¸" monsterMode={true} />
      </div>
    </div>
  );
}

