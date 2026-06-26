import { motion } from 'framer-motion';
import StarField from '../components/StarField';
import QuizEngine from '../components/QuizEngine';
import { sciencePool } from '../data/questions';

const gradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

export default function SciencePage() {
  return (
    <div className="min-h-screen pt-20 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #0a2a4a 50%, #24243e 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3 floating">🔬</div>
          <h1 className="font-poppins font-black text-4xl text-white mb-2">Science Explorer</h1>
          <p className="text-cyan-300">Discover the wonders of the natural world!</p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {['🔬 Junior Scientist', '⚗️ Senior Scientist', '🧬 Master Scientist'].map(b => (
              <span key={b} className="px-3 py-1 rounded-full text-xs font-bold text-cyan-200"
                style={{ background: 'rgba(79,172,254,0.2)', border: '1px solid rgba(79,172,254,0.3)' }}>
                {b}
              </span>
            ))}
          </div>
        </motion.div>
        <QuizEngine subject="science" pool={sciencePool} gradient={gradient} icon="🔬" />
      </div>
    </div>
  );
}
