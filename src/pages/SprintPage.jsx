import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import StarField from '../components/StarField';

const YEAR_MAP = {
  Reception: 'Reception',
  'Year 1': 'Year 1-2', 'Year 2': 'Year 1-2',
  'Year 3': 'Year 3-4', 'Year 4': 'Year 3-4',
  'Year 5': 'Year 5-6', 'Year 6': 'Year 5-6',
  'Year 7': 'Year 7-8', 'Year 8': 'Year 7-8',
};

const GRADIENT = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
const GLOW = 'rgba(250,112,154,0.4)';
const SPRINT_DURATION = 60;
const POINTS_PER_CORRECT = 5;

function generateQuestion(yearKey) {
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  let question, answer;

  if (yearKey === 'Reception') {
    const a = r(1, 5), b = r(1, 5);
    const ops = [
      { q: `${a} + ${b} = ?`, ans: a + b },
      { q: `${a + b} âˆ’ ${b} = ?`, ans: a },
    ];
    const op = ops[Math.floor(Math.random() * ops.length)];
    question = op.q; answer = op.ans;
  } else if (yearKey === 'Year 1-2') {
    const a = r(1, 20), b = r(1, 20);
    const ops = [
      { q: `${a} + ${b} = ?`, ans: a + b },
      { q: `${Math.max(a,b)} âˆ’ ${Math.min(a,b)} = ?`, ans: Math.max(a,b) - Math.min(a,b) },
      { q: `${r(2,5)} Ã— ${r(2,5)} = ?`, ans: null },
    ];
    if (ops[2].ans === null) { const x = r(2,5), y = r(2,5); ops[2].q = `${x} Ã— ${y} = ?`; ops[2].ans = x * y; }
    const op = ops[Math.floor(Math.random() * ops.length)];
    question = op.q; answer = op.ans;
  } else if (yearKey === 'Year 3-4') {
    const x = r(2, 12), y = r(2, 12);
    const ops = [
      { q: `${x} Ã— ${y} = ?`, ans: x * y },
      { q: `${x * y} Ã· ${x} = ?`, ans: y },
      { q: `${r(10,99)} + ${r(10,99)} = ?`, ans: null },
      { q: `${r(20,99)} âˆ’ ${r(10,19)} = ?`, ans: null },
    ];
    if (ops[2].ans === null) { const a = r(10,99), b = r(10,99); ops[2].q = `${a} + ${b} = ?`; ops[2].ans = a + b; }
    if (ops[3].ans === null) { const a = r(20,99), b = r(10,19); ops[3].q = `${a} âˆ’ ${b} = ?`; ops[3].ans = a - b; }
    const op = ops[Math.floor(Math.random() * ops.length)];
    question = op.q; answer = op.ans;
  } else if (yearKey === 'Year 5-6') {
    const ops = [
      () => { const a = r(3,15), b = r(3,15); return { q: `${a} Ã— ${b} = ?`, ans: a * b }; },
      () => { const a = r(2,12), b = r(2,12); return { q: `${a*b} Ã· ${a} = ?`, ans: b }; },
      () => { const a = r(100,999), b = r(10,99); return { q: `${a} + ${b} = ?`, ans: a + b }; },
      () => { const a = r(100,999), b = r(10,99); return { q: `${a} âˆ’ ${b} = ?`, ans: a - b }; },
      () => { const a = r(2,9); return { q: `${a}Â² = ?`, ans: a * a }; },
    ];
    const op = ops[Math.floor(Math.random() * ops.length)]();
    question = op.q; answer = op.ans;
  } else {
    const ops = [
      () => { const a = r(10,30), b = r(10,30); return { q: `${a} Ã— ${b} = ?`, ans: a * b }; },
      () => { const a = r(2,12), b = r(2,12); const c = a * b; return { q: `${c} Ã· ${a} = ?`, ans: b }; },
      () => { const a = r(2,12); return { q: `${a}Â² = ?`, ans: a * a }; },
      () => { const a = r(2,9); return { q: `âˆš${a*a} = ?`, ans: a }; },
      () => { const a = r(1,100), b = r(1,100); return { q: `${a} + ${b} = ?`, ans: a + b }; },
    ];
    const op = ops[Math.floor(Math.random() * ops.length)]();
    question = op.q; answer = op.ans;
  }

  const wrong = new Set();
  while (wrong.size < 3) {
    const delta = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const w = answer + sign * delta;
    if (w !== answer && w >= 0) wrong.add(w);
  }
  const options = [...wrong, answer].sort(() => Math.random() - 0.5);
  return { question, answer, options };
}

export default function SprintPage() {
  const { student, addPoints } = useGame();
  const yearKey = YEAR_MAP[student?.yearGroup] || 'Year 3-4';
  const scoreRef = useRef(0);
  const availableYears = ['Reception', 'Year 1-2', 'Year 3-4', 'Year 5-6', 'Year 7-8'];
  const resolvedKey = availableYears.includes(yearKey) ? yearKey : 'Year 3-4';

  const [selectedYear, setSelectedYear] = useState(resolvedKey);
  const [phase, setPhase] = useState('ready'); // ready | sprint | finished
  const [q, setQ] = useState(() => generateQuestion(resolvedKey));
  const [timeLeft, setTimeLeft] = useState(SPRINT_DURATION);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong'
  const totalPointsRef = useRef(0);

  useEffect(() => {
    if (phase !== 'sprint') return;
    if (timeLeft <= 0) {
      setPhase('finished');
      // Batch-submit all earned points at end of sprint (one Firestore write)
      if (totalPointsRef.current > 0) {
        addPoints('sprint', totalPointsRef.current, scoreRef.current);
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 }, colors: ['#fa709a', '#fee140', '#fbbf24'] });
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, addPoints]);

  const handleAnswer = (opt) => {
    if (phase !== 'sprint') return;
    const correct = opt === q.answer;
    setTotal(t => t + 1);
    if (correct) {
      setScore(s => s + 1);
      scoreRef.current += 1;
      totalPointsRef.current += POINTS_PER_CORRECT;
      setFlash('correct');
    } else {
      setFlash('wrong');
    }
    setTimeout(() => {
      setFlash(null);
      setQ(generateQuestion(selectedYear));
    }, 300);
  };

  const startSprint = () => {
    setQ(generateQuestion(selectedYear));
    setTimeLeft(SPRINT_DURATION);
    setScore(0);
    setTotal(0);
    totalPointsRef.current = 0;
    scoreRef.current = 0;
    setFlash(null);
    setPhase('sprint');
  };

  const changeYear = (yr) => {
    setSelectedYear(yr);
    setPhase('ready');
  };

  const timerPct = (timeLeft / SPRINT_DURATION) * 100;
  const timerColor = timeLeft > 20 ? '#34D399' : timeLeft > 10 ? '#FBBF24' : '#F87171';
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #200122 0%, #6f0000 50%, #1a0010 100%)' }}>
      <StarField />
      <div className="max-w-2xl mx-auto px-4 relative z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="font-poppins font-black text-4xl text-white mb-1">âš¡ Mental Maths Sprint</h1>
          <p className="text-pink-300 font-semibold">Answer as many as you can in 60 seconds!</p>
        </motion.div>

        {/* Year selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {availableYears.map(yr => (
            <button key={yr} onClick={() => changeYear(yr)}
              disabled={phase === 'sprint'}
              className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-40"
              style={{
                background: selectedYear === yr ? GRADIENT : 'rgba(255,255,255,0.08)',
                color: selectedYear === yr ? 'white' : 'rgba(255,255,255,0.6)',
                border: selectedYear === yr ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
              {yr}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* READY */}
          {phase === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-3xl p-8 text-center">
              <div className="text-7xl mb-4">âš¡</div>
              <h2 className="font-poppins font-black text-2xl text-white mb-3">Ready to Sprint?</h2>
              <div className="glass rounded-2xl p-4 mb-6 text-left space-y-2">
                <p className="text-pink-300 text-sm">â° You have <strong className="text-white">60 seconds</strong></p>
                <p className="text-pink-300 text-sm">ðŸ”¢ Answer as many maths questions as possible</p>
                <p className="text-pink-300 text-sm">â­ Earn <strong className="text-white">{POINTS_PER_CORRECT} points</strong> per correct answer</p>
                <p className="text-pink-300 text-sm">âš¡ Questions auto-advance â€” keep going!</p>
              </div>
              <motion.button onClick={startSprint} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-2xl font-poppins font-bold text-white text-xl cursor-pointer"
                style={{ background: GRADIENT, boxShadow: `0 8px 32px ${GLOW}` }}>
                ðŸš€ Start Sprint!
              </motion.button>
            </motion.div>
          )}

          {/* SPRINT */}
          {phase === 'sprint' && (
            <motion.div key="sprint" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {/* Big timer */}
              <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-4">
                <div className="text-center w-20">
                  <p className="font-black text-4xl" style={{ color: timerColor }}>{timeLeft}</p>
                  <p className="text-white/40 text-xs">seconds</p>
                </div>
                <div className="flex-1">
                  <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${timerPct}%`, background: timerColor }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-black text-2xl">{score}</p>
                  <p className="text-white/40 text-xs">correct</p>
                </div>
              </div>

              {/* Question */}
              <motion.div
                animate={flash === 'correct' ? { backgroundColor: 'rgba(34,197,94,0.3)' } : flash === 'wrong' ? { backgroundColor: 'rgba(239,68,68,0.3)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                transition={{ duration: 0.15 }}
                className="rounded-3xl p-8 mb-5 text-center"
                style={{ border: '1px solid rgba(250,112,154,0.3)' }}>
                <div className="text-4xl mb-1">{flash === 'correct' ? 'âœ…' : flash === 'wrong' ? 'âŒ' : 'ðŸ”¢'}</div>
                <h2 className="font-poppins font-black text-white mb-1" style={{ fontSize: '2.5rem' }}>
                  {q.question}
                </h2>
                <p className="text-pink-400 text-sm">+{POINTS_PER_CORRECT} pts</p>
              </motion.div>

              {/* Answer buttons */}
              <div className="grid grid-cols-2 gap-4">
                {q.options.map((opt) => (
                  <motion.button key={opt} onClick={() => handleAnswer(opt)}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-5 rounded-2xl font-poppins font-black text-3xl text-white cursor-pointer transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {opt}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center mt-4">
                <p className="text-pink-400/60 text-xs">{total} answered Â· {accuracy}% accuracy</p>
              </div>
            </motion.div>
          )}

          {/* FINISHED */}
          {phase === 'finished' && (
            <motion.div key="finished" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-3xl p-8 text-center">
              <div className="text-6xl mb-3">{score >= 15 ? 'ðŸš€' : score >= 8 ? 'âš¡' : 'ðŸ’ª'}</div>
              <h2 className="font-poppins font-black text-3xl text-white mb-1">
                {score >= 15 ? 'Lightning Fast!' : score >= 8 ? 'Great Sprint!' : 'Good Effort!'}
              </h2>
              <p className="text-pink-300 mb-6">{selectedYear} Â· Mental Maths Sprint</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass rounded-xl p-3">
                  <p className="text-green-400 font-black text-2xl">{score}</p>
                  <p className="text-pink-300 text-xs">Correct</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <p className="text-yellow-400 font-black text-2xl">{score * POINTS_PER_CORRECT}</p>
                  <p className="text-pink-300 text-xs">Points Earned</p>
                </div>
                <div className="glass rounded-xl p-3">
                  <p className="text-blue-400 font-black text-2xl">{accuracy}%</p>
                  <p className="text-pink-300 text-xs">Accuracy</p>
                </div>
              </div>
              <div className="glass rounded-2xl p-4 mb-6">
                <p className="text-white/60 text-sm">Attempted: <span className="text-white font-bold">{total}</span> questions</p>
                <p className="text-white/60 text-sm mt-1">Best strategy: <span className="text-white font-bold">be fast but accurate!</span></p>
              </div>
              <div className="flex gap-3">
                <motion.button onClick={startSprint} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-xl font-poppins font-bold text-white text-lg cursor-pointer"
                  style={{ background: GRADIENT }}>
                  âš¡ Sprint Again!
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

