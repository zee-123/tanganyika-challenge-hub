import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { getRandomQuestions } from '../data/questions';
import confetti from 'canvas-confetti';

const YEAR_MAP = {
  'Reception': 'Reception',
  'Year 1': 'Year 1-2', 'Year 2': 'Year 1-2',
  'Year 3': 'Year 3-4', 'Year 4': 'Year 3-4',
  'Year 5': 'Year 5-6', 'Year 6': 'Year 5-6',
  'Year 7': 'Year 7-8', 'Year 8': 'Year 7-8',
};

const QUESTIONS_PER_ROUND = 10;

export default function QuizEngine({ subject, pool, gradient, icon, monsterMode = false }) {
  const { student, addPoints } = useGame();
  const yearKey = YEAR_MAP[student?.yearGroup] || 'Year 1-2';
  const available = Object.keys(pool);
  const resolvedKey = pool[yearKey] ? yearKey : available[0];

  const [selectedYear, setSelectedYear] = useState(resolvedKey);
  const [qs, setQs] = useState(() => getRandomQuestions(pool[resolvedKey] || [], QUESTIONS_PER_ROUND));
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [monsterHp, setMonsterHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [monsterShake, setMonsterShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  const q = qs[currentQ];

  const handleTimeout = useCallback(() => {
    if (!answered) {
      setAnswered(true);
      setSelected('__timeout__');
      if (monsterMode) {
        setPlayerShake(true);
        setPlayerHp(h => Math.max(0, h - 20));
        setTimeout(() => setPlayerShake(false), 600);
      }
      setResults(r => [...r, { correct: false, question: q?.question }]);
      setTimeout(() => {
        if (currentQ + 1 < qs.length) {
          setCurrentQ(c => c + 1);
          setSelected(null);
          setAnswered(false);
          setTimeLeft(30);
          setTimerActive(true);
        } else {
          setFinished(true);
        }
      }, 1500);
    }
  }, [answered, currentQ, monsterMode, q, qs.length]);

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

    setResults(r => [...r, { correct, question: q.question, selected: opt, answer: q.answer }]);

    if (correct) {
      setScore(s => s + q.points);
      addPoints(subject, q.points);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#a855f7', '#6366f1', '#fbbf24', '#34d399'] });
      if (monsterMode) {
        setMonsterShake(true);
        setMonsterHp(h => Math.max(0, h - 25));
        setTimeout(() => setMonsterShake(false), 600);
      }
    } else {
      if (monsterMode) {
        setPlayerShake(true);
        setPlayerHp(h => Math.max(0, h - 20));
        setTimeout(() => setPlayerShake(false), 600);
      }
    }

    setTimeout(() => {
      if (currentQ + 1 < qs.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(30);
        setTimerActive(true);
      } else {
        setFinished(true);
      }
    }, 1800);
  };

  const restart = () => {
    setQs(getRandomQuestions(pool[selectedYear] || [], QUESTIONS_PER_ROUND));
    setCurrentQ(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setMonsterHp(100);
    setPlayerHp(100); setResults([]); setTimeLeft(30); setTimerActive(true);
  };

  const timerColor = timeLeft > 15 ? '#34D399' : timeLeft > 7 ? '#FBBF24' : '#F87171';

  if (finished) {
    const total = qs.reduce((s, q) => s + q.points, 0);
    const pct = Math.round((score / total) * 100);
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-3xl p-8 text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4">{pct >= 70 ? '🎉' : pct >= 40 ? '👍' : '💪'}</div>
        <h2 className="font-poppins font-black text-3xl text-white mb-2">
          {pct >= 70 ? 'Amazing!' : pct >= 40 ? 'Good Job!' : 'Keep Trying!'}
        </h2>
        <p className="text-purple-300 mb-6">{selectedYear} · {subject}</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3">
            <p className="text-yellow-400 font-black text-2xl">{score}</p>
            <p className="text-purple-300 text-xs">Points Earned</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-green-400 font-black text-2xl">{results.filter(r => r.correct).length}</p>
            <p className="text-purple-300 text-xs">Correct</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-blue-400 font-black text-2xl">{pct}%</p>
            <p className="text-purple-300 text-xs">Accuracy</p>
          </div>
        </div>
        <div className="space-y-2 mb-6 text-left max-h-40 overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className={`rounded-xl px-3 py-2 text-sm flex items-start gap-2 ${r.correct ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
              <span>{r.correct ? '✅' : '❌'}</span>
              <span className="truncate">{r.question}</span>
            </div>
          ))}
        </div>
        <motion.button onClick={restart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-xl font-poppins font-bold text-white text-lg cursor-pointer"
          style={{ background: gradient }}>
          🔄 Play Again
        </motion.button>
      </motion.div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Year selector */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {available.map(yr => (
          <button key={yr} onClick={() => { setSelectedYear(yr); setQs(getRandomQuestions(pool[yr] || [], QUESTIONS_PER_ROUND)); setCurrentQ(0); setSelected(null); setAnswered(false); setScore(0); setMonsterHp(100); setPlayerHp(100); setResults([]); setTimeLeft(30); setTimerActive(true); }}
            className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all"
            style={{
              background: selectedYear === yr ? gradient : 'rgba(255,255,255,0.08)',
              color: selectedYear === yr ? 'white' : 'rgba(255,255,255,0.6)',
              border: selectedYear === yr ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}>
            {yr}
          </button>
        ))}
      </div>

      {/* Monster battle mode */}
      {monsterMode && (
        <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className={`text-center flex-1 ${playerShake ? 'monster-shake' : ''}`}>
            <div className="text-3xl mb-1">{student?.avatar || '🎓'}</div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-3 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${playerHp}%` }} />
            </div>
            <p className="text-green-400 text-xs mt-1 font-bold">{playerHp} HP</p>
          </div>
          <div className="text-2xl font-bold text-red-400">⚔️</div>
          <div className={`text-center flex-1 ${monsterShake ? 'monster-shake' : ''}`}>
            <div className="text-3xl mb-1">👾</div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-3 rounded-full bg-red-500 transition-all duration-500" style={{ width: `${monsterHp}%` }} />
            </div>
            <p className="text-red-400 text-xs mt-1 font-bold">{monsterHp} HP</p>
          </div>
        </div>
      )}

      {/* Progress + Timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-purple-300 text-sm font-semibold">Question {currentQ + 1} of {qs.length}</span>
          <div className="flex gap-1">
            {qs.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{ background: i < currentQ ? '#a855f7' : i === currentQ ? 'white' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl" style={{ background: `${timerColor}20`, border: `1px solid ${timerColor}40` }}>
          <span style={{ color: timerColor }} className="font-bold text-sm">⏱ {timeLeft}s</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 mb-6">
        <div className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ) / qs.length) * 100}%`, background: gradient }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <div className="glass rounded-2xl p-6 mb-5">
            <div className="text-4xl text-center mb-3">{icon}</div>
            <h2 className="font-poppins font-bold text-white text-xl text-center leading-relaxed">
              {q.question}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-yellow-400 text-sm font-bold">+{q.points} pts</span>
              <span className="text-purple-400 text-xs">· {selectedYear}</span>
            </div>
          </div>

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
              const labels = ['A', 'B', 'C', 'D'];
              return (
                <motion.button key={opt} onClick={() => handleAnswer(opt)}
                  whileHover={!answered ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!answered ? { scale: 0.97 } : {}}
                  disabled={answered}
                  className={`answer-btn p-4 rounded-2xl text-left font-semibold text-base cursor-pointer transition-all ${answered ? 'cursor-default' : ''}`}
                  style={{ background: bg, border, color: textColor }}>
                  <span className="inline-block w-6 h-6 rounded-full text-xs font-black text-center leading-6 mr-2 mb-1"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>
                    {labels[idx]}
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
              className={`mt-4 rounded-2xl p-4 text-center font-poppins font-bold text-lg ${selected === q.answer ? 'text-green-400' : 'text-red-400'}`}
              style={{ background: selected === q.answer ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
              {selected === q.answer ? '🎉 Correct! +' + q.points + ' points!' : selected === '__timeout__' ? '⏰ Time\'s up! The answer was: ' + q.answer : '❌ The answer was: ' + q.answer}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Score */}
      <div className="flex items-center justify-between mt-6 px-2">
        <span className="text-purple-300 text-sm">Score this round</span>
        <span className="text-yellow-400 font-black text-xl">⭐ {score}</span>
      </div>
    </div>
  );
}
