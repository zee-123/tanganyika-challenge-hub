import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { spellingPool, getRandomSpellingQuestions, getSpellingPoints } from '../data/spellingWords';
import confetti from 'canvas-confetti';
import StarField from '../components/StarField';

const YEAR_MAP = {
  Reception: 'Reception',
  'Year 1': 'Year 1-2', 'Year 2': 'Year 1-2',
  'Year 3': 'Year 3-4', 'Year 4': 'Year 3-4',
  'Year 5': 'Year 5-6', 'Year 6': 'Year 5-6',
  'Year 7': 'Year 7-8', 'Year 8': 'Year 7-8',
};

const GRADIENT = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
const GLOW = 'rgba(67,233,123,0.35)';
const QUESTIONS_PER_ROUND = 10;

export default function SpellingPage() {
  const { student, addPoints } = useGame();
  const yearKey = YEAR_MAP[student?.yearGroup] || 'Year 1-2';
  const availableYears = Object.keys(spellingPool);
  const resolvedKey = spellingPool[yearKey] ? yearKey : availableYears[0];

  const [selectedYear, setSelectedYear] = useState(resolvedKey);
  const [qs, setQs] = useState(() => getRandomSpellingQuestions(spellingPool[resolvedKey], QUESTIONS_PER_ROUND));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(true);

  const pts = getSpellingPoints(selectedYear);
  const q = qs[currentQ];

  const handleTimeout = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setSelected('__timeout__');
    setResults(r => [...r, { correct: false, word: qs[currentQ]?.word }]);
    setTimeout(() => {
      if (currentQ + 1 < qs.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(20);
        setTimerActive(true);
      } else {
        setFinished(true);
      }
    }, 1500);
  }, [answered, currentQ, qs]);

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
    setResults(r => [...r, { correct, word: q.word }]);
    if (correct) {
      setScore(s => s + pts);
      addPoints('spelling', pts);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#43e97b', '#38f9d7', '#fbbf24'] });
    }
    setTimeout(() => {
      if (currentQ + 1 < qs.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(20);
        setTimerActive(true);
      } else {
        setFinished(true);
      }
    }, 1800);
  };

  const restart = (yr = selectedYear) => {
    setQs(getRandomSpellingQuestions(spellingPool[yr], QUESTIONS_PER_ROUND));
    setCurrentQ(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setResults([]);
    setTimeLeft(20); setTimerActive(true);
  };

  const changeYear = (yr) => {
    setSelectedYear(yr);
    restart(yr);
  };

  const timerColor = timeLeft > 10 ? '#34D399' : timeLeft > 5 ? '#FBBF24' : '#F87171';
  const timerPct = (timeLeft / 20) * 100;

  if (finished) {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div className="min-h-screen pt-20 pb-10 relative"
        style={{ background: 'linear-gradient(135deg, #0a2a1a 0%, #0d3b2a 50%, #071f15 100%)' }}>
        <StarField />
        <div className="max-w-lg mx-auto px-4 relative z-10 pt-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">{pct >= 80 ? '🐝' : pct >= 60 ? '✏️' : '💪'}</div>
            <h2 className="font-poppins font-black text-3xl text-white mb-1">
              {pct >= 80 ? 'Spelling Star!' : pct >= 60 ? 'Well Spelled!' : 'Keep Practising!'}
            </h2>
            <p className="text-green-300 mb-6">{selectedYear} Spelling Bee</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass rounded-xl p-3">
                <p className="text-yellow-400 font-black text-2xl">{score}</p>
                <p className="text-green-300 text-xs">Points Earned</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-green-400 font-black text-2xl">{correct}/{results.length}</p>
                <p className="text-green-300 text-xs">Correct</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-blue-400 font-black text-2xl">{pct}%</p>
                <p className="text-green-300 text-xs">Accuracy</p>
              </div>
            </div>
            <div className="space-y-2 mb-6 text-left max-h-40 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`rounded-xl px-3 py-2 text-sm flex items-center gap-2 ${r.correct ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                  <span>{r.correct ? '✅' : '❌'}</span>
                  <span className="font-mono font-bold">{r.word}</span>
                </div>
              ))}
            </div>
            <motion.button onClick={() => restart()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-full py-4 rounded-xl font-poppins font-bold text-white text-lg cursor-pointer"
              style={{ background: GRADIENT }}>
              🐝 Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="min-h-screen pt-20 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #0a2a1a 0%, #0d3b2a 50%, #071f15 100%)' }}>
      <StarField />
      <div className="max-w-2xl mx-auto px-4 relative z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="font-poppins font-black text-4xl text-white mb-1">🐝 Spelling Bee</h1>
          <p className="text-green-300 font-semibold">Choose the correct spelling!</p>
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

        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-green-300 text-sm font-semibold">Word {currentQ + 1} of {qs.length}</span>
            <div className="flex gap-1">
              {qs.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i < currentQ ? '#43e97b' : i === currentQ ? 'white' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl" style={{ background: `${timerColor}20`, border: `1px solid ${timerColor}40` }}>
            <span style={{ color: timerColor }} className="font-bold text-sm">⏱ {timeLeft}s</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 rounded-full bg-white/10 mb-6">
          <div className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }}>
            {/* Word card */}
            <div className="glass rounded-3xl p-8 mb-6 text-center"
              style={{ border: '1px solid rgba(67,233,123,0.25)', background: 'rgba(67,233,123,0.05)' }}>
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">Which spelling is correct?</p>
              <div className="text-green-300 text-base leading-relaxed font-medium italic mb-2">
                "{q.definition}"
              </div>
              <p className="text-white/40 text-sm mt-3">+{pts} pts</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
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
                    whileHover={!answered ? { scale: 1.03, y: -2 } : {}}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    disabled={answered}
                    className="p-4 rounded-2xl text-center font-mono font-bold text-xl cursor-pointer transition-all"
                    style={{ background: bg, border, color: textColor }}>
                    {opt}
                    {answered && isCorrect && <span className="ml-2 text-base">✅</span>}
                    {answered && isSelected && !isCorrect && <span className="ml-2 text-base">❌</span>}
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-2xl p-4 text-center font-poppins font-bold text-xl ${selected === q.answer ? 'text-green-400' : 'text-red-400'}`}
                style={{ background: selected === q.answer ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {selected === q.answer
                  ? `🎉 "${q.answer}" — correct! +${pts} pts`
                  : selected === '__timeout__'
                    ? `⏰ Time's up! It's "${q.answer}"`
                    : `❌ Correct spelling: "${q.answer}"`}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-5 px-2">
          <span className="text-green-300 text-sm">Score this round</span>
          <span className="text-yellow-400 font-black text-xl">⭐ {score}</span>
        </div>
      </div>
    </div>
  );
}
