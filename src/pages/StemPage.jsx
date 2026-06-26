import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { getRandomStemQuestions } from '../data/stemQuestions';
import confetti from 'canvas-confetti';
import StarField from '../components/StarField';

const YEAR_MAP = {
  Reception: 'Reception',
  'Year 1': 'Year 1-2', 'Year 2': 'Year 1-2',
  'Year 3': 'Year 3-4', 'Year 4': 'Year 3-4',
  'Year 5': 'Year 5-6', 'Year 6': 'Year 5-6',
  'Year 7': 'Year 7-8', 'Year 8': 'Year 7-8',
};

const GRADIENT = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
const QUESTIONS_PER_ROUND = 15;

const CAT_COLORS = {
  '🔬 Science': '#06b6d4',
  '⚙️ Engineering': '#f97316',
  '💻 Technology': '#8b5cf6',
  '🧮 Maths': '#ec4899',
  '🌿 Environment': '#22c55e',
};

export default function StemPage() {
  const { student, addPoints } = useGame();
  const yearKey = YEAR_MAP[student?.yearGroup] || 'Year 3-4';
  const availableYears = ['Reception', 'Year 1-2', 'Year 3-4', 'Year 5-6', 'Year 7-8'];
  const resolvedKey = availableYears.includes(yearKey) ? yearKey : 'Year 3-4';

  const [selectedYear, setSelectedYear] = useState(resolvedKey);
  const [qs, setQs] = useState(() => getRandomStemQuestions(resolvedKey, QUESTIONS_PER_ROUND));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(35);
  const [timerActive, setTimerActive] = useState(true);

  const q = qs[currentQ];

  const advance = useCallback((wasCorrect) => {
    setTimeout(() => {
      if (currentQ + 1 < qs.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(35);
        setTimerActive(true);
      } else {
        setFinished(true);
      }
    }, wasCorrect ? 1800 : 1500);
  }, [currentQ, qs.length]);

  const handleTimeout = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setSelected('__timeout__');
    setResults(r => [...r, { correct: false, question: qs[currentQ]?.q, cat: qs[currentQ]?.cat }]);
    advance(false);
  }, [answered, currentQ, qs, advance]);

  useEffect(() => {
    if (!timerActive || answered || finished) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, answered, finished, handleTimeout]);

  const handleAnswer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTimerActive(false);
    const correct = opt === q.answer;
    setResults(r => [...r, { correct, question: q.q, cat: q.cat }]);
    if (correct) {
      setScore(s => s + q.points);
      addPoints('stem', q.points);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#00b09b', '#96c93d', '#fbbf24'] });
    }
    advance(correct);
  };

  const restart = (yr = selectedYear) => {
    setQs(getRandomStemQuestions(yr, QUESTIONS_PER_ROUND));
    setCurrentQ(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setResults([]);
    setTimeLeft(35); setTimerActive(true);
  };

  const changeYear = (yr) => { setSelectedYear(yr); restart(yr); };
  const timerColor = timeLeft > 20 ? '#34D399' : timeLeft > 10 ? '#FBBF24' : '#F87171';

  if (finished) {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    const catCounts = {};
    results.forEach(r => {
      if (!catCounts[r.cat]) catCounts[r.cat] = { correct: 0, total: 0 };
      catCounts[r.cat].total++;
      if (r.correct) catCounts[r.cat].correct++;
    });
    return (
      <div className="min-h-screen pt-28 pb-10 relative"
        style={{ background: 'linear-gradient(135deg, #003d2e 0%, #005c42 50%, #001a15 100%)' }}>
        <StarField />
        <div className="max-w-lg mx-auto px-4 relative z-10 pt-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl p-8 text-center">
            <div className="text-6xl mb-3">{pct >= 80 ? '🚀' : pct >= 60 ? '⚗️' : '🔭'}</div>
            <h2 className="font-poppins font-black text-3xl text-white mb-1">
              {pct >= 80 ? 'STEM Genius!' : pct >= 60 ? 'Great Scientist!' : 'Keep Exploring!'}
            </h2>
            <p className="text-emerald-300 mb-5">{selectedYear} STEM Challenge</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="glass rounded-xl p-3">
                <p className="text-yellow-400 font-black text-2xl">{score}</p>
                <p className="text-emerald-300 text-xs">Points</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-green-400 font-black text-2xl">{correct}/{results.length}</p>
                <p className="text-emerald-300 text-xs">Correct</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-blue-400 font-black text-2xl">{pct}%</p>
                <p className="text-emerald-300 text-xs">Accuracy</p>
              </div>
            </div>
            <div className="mb-5 text-left">
              <p className="text-white/60 text-xs uppercase font-bold tracking-wider mb-2">Category Scores</p>
              <div className="space-y-2">
                {Object.entries(catCounts).map(([cat, { correct: c, total: t }]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-36 text-white/70 truncate">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full transition-all"
                        style={{ width: `${Math.round((c / t) * 100)}%`, background: CAT_COLORS[cat] || '#60a5fa' }} />
                    </div>
                    <span className="text-xs text-white/60 w-10 text-right">{c}/{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button onClick={() => restart()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-full py-4 rounded-xl font-poppins font-bold text-white text-lg cursor-pointer"
              style={{ background: GRADIENT }}>
              🔬 Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #003d2e 0%, #005c42 50%, #001a15 100%)' }}>
      <StarField />
      <div className="max-w-2xl mx-auto px-4 relative z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="font-poppins font-black text-4xl text-white mb-1">🔬 STEM Challenge</h1>
          <p className="text-emerald-300 font-semibold">Science · Technology · Engineering · Maths</p>
        </motion.div>

        {/* Year selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {availableYears.map(yr => (
            <button key={yr} onClick={() => changeYear(yr)}
              className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all"
              style={{
                background: selectedYear === yr ? GRADIENT : 'rgba(255,255,255,0.08)',
                color: selectedYear === yr ? 'white' : 'rgba(255,255,255,0.6)',
                border: selectedYear === yr ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {yr}
            </button>
          ))}
        </div>

        {/* Progress + timer */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-300 text-sm font-semibold">Q {currentQ + 1} of {qs.length}</span>
            <div className="flex gap-0.5">
              {qs.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i < currentQ ? '#00b09b' : i === currentQ ? 'white' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl"
            style={{ background: `${timerColor}20`, border: `1px solid ${timerColor}40` }}>
            <span style={{ color: timerColor }} className="font-bold text-sm">⏱ {timeLeft}s</span>
          </div>
        </div>

        <div className="h-2 rounded-full bg-white/10 mb-5">
          <div className="h-2 rounded-full transition-all"
            style={{ width: `${(currentQ / qs.length) * 100}%`, background: GRADIENT }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="glass rounded-2xl p-6 mb-5"
              style={{ border: `1px solid ${(CAT_COLORS[q.cat] || '#60a5fa')}40` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${CAT_COLORS[q.cat] || '#60a5fa'}20`, color: CAT_COLORS[q.cat] || '#60a5fa', border: `1px solid ${CAT_COLORS[q.cat] || '#60a5fa'}40` }}>
                  {q.cat}
                </span>
                <span className="text-yellow-400 text-xs font-bold ml-auto">+{q.points} pts</span>
              </div>
              <h2 className="font-poppins font-bold text-white text-lg leading-relaxed">{q.q}</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, idx) => {
                const isCorrect = opt === q.answer;
                const isSelected = opt === selected;
                let bg = 'rgba(255,255,255,0.06)';
                let border = '1px solid rgba(255,255,255,0.12)';
                let textColor = 'rgba(255,255,255,0.9)';
                if (answered) {
                  if (isCorrect) { bg = 'rgba(34,197,94,0.2)'; border = '1px solid rgba(34,197,94,0.6)'; textColor = '#86efac'; }
                  else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.2)'; border = '1px solid rgba(239,68,68,0.6)'; textColor = '#fca5a5'; }
                }
                return (
                  <motion.button key={opt} onClick={() => handleAnswer(opt)}
                    whileHover={!answered ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    disabled={answered}
                    className="p-4 rounded-2xl text-left font-semibold text-sm cursor-pointer transition-all"
                    style={{ background: bg, border, color: textColor }}>
                    <span className="inline-block w-6 h-6 rounded-full text-xs font-black text-center leading-6 mr-2"
                      style={{ background: 'rgba(255,255,255,0.15)' }}>
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    {opt}
                    {answered && isCorrect && <span className="ml-2">✅</span>}
                    {answered && isSelected && !isCorrect && <span className="ml-2">❌</span>}
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-2xl p-4 text-center font-poppins font-bold ${selected === q.answer ? 'text-green-400' : 'text-red-400'}`}
                style={{ background: selected === q.answer ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {selected === q.answer
                  ? `🎉 Correct! +${q.points} points!`
                  : selected === '__timeout__'
                    ? `⏰ Time's up! Answer: ${q.answer}`
                    : `❌ Answer: ${q.answer}`}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-5 px-2">
          <span className="text-emerald-300 text-sm">Score this round</span>
          <span className="text-yellow-400 font-black text-xl">⭐ {score}</span>
        </div>
      </div>
    </div>
  );
}
