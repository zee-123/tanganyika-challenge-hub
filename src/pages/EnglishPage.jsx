import { motion } from 'framer-motion';
import StarField from '../components/StarField';
import QuizEngine from '../components/QuizEngine';
import { englishPool } from '../data/questions';

const gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // english

export default function EnglishPage() {
  return (
    <div className="min-h-screen pt-20 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1060 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">📖</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">English Adventure</h1>
          <p className="text-purple-300">Grammar · Vocabulary · Language Skills</p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {['🥉 Grammar Explorer', '🥈 Grammar Champion', '🥇 English Master'].map(b => (
              <span key={b} className="px-3 py-1 rounded-full text-xs font-bold text-purple-200"
                style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                {b}
              </span>
            ))}
          </div>
        </motion.div>
        <QuizEngine subject="english" pool={englishPool} gradient={gradient} icon="📖" />
      </div>
    </div>
  );
}
