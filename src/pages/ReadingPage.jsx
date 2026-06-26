import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { readingPool, getReadingPoints, getRandomPassage } from '../data/readingPassages';
import confetti from 'canvas-confetti';
import StarField from '../components/StarField';

const YEAR_MAP = {
  Reception: 'Reception',
  'Year 1': 'Year 1-2', 'Year 2': 'Year 1-2',
  'Year 3': 'Year 3-4', 'Year 4': 'Year 3-4',
  'Year 5': 'Year 5-6', 'Year 6': 'Year 5-6',
  'Year 7': 'Year 7-8', 'Year 8': 'Year 7-8',
};

const GRADIENT = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
const GLOW = 'rgba(246,211,101,0.35)';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ReadingPage() {
  const { student, addPoints } = useGame();
  const yearKey = YEAR_MAP[student?.yearGroup] || 'Year 1-2';
  const availableYears = Object.keys(readingPool);
  const resolvedKey = readingPool[yearKey] ? yearKey : availableYears[0];

  const [selectedYear, setSelectedYear] = useState(resolvedKey);
  const [phase, setPhase] = useState('reading'); // reading | quiz | finished
  const [passage, setPassage] = useState(() => getRandomPassage(readingPool[resolvedKey]));
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const pts = getReadingPoints(selectedYear);

  const startQuiz = () => {
    const qs = passage.questions.map(q => ({ ...q, options: shuffle(q.options) }));
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setResults([]);
    setTimeLeft(30);
    setTimerActive(true);
    setPhase('quiz');
  };

  const handleTimeout = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    setSelected('__timeout__');
    setResults(r => [...r, { correct: false, question: questions[currentQ]?.q }]);
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(30);
        setTimerActive(true);
      } else {
        setPhase('finished');
      }
    }, 1500);
  }, [answered, currentQ, questions]);

  useEffect(() => {
    if (!timerActive || answered || phase !== 'quiz') return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, answered, phase, handleTimeout]);

  const handleAnswer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTimerActive(false);
    const q = questions[currentQ];
    const correct = opt === q.answer;
    setResults(r => [...r, { correct, question: q.q }]);
    if (correct) {
      setScore(s => s + pts);
      addPoints('reading', pts);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#f6d365', '#fda085', '#fbbf24'] });
    }
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(30);
        setTimerActive(true);
      } else {
        setPhase('finished');
      }
    }, 1800);
  };

  const restart = () => {
    const newPassage = getRandomPassage(readingPool[selectedYear]);
    setPassage(newPassage);
    setPhase('reading');
    setScore(0);
    setResults([]);
  };

  const changeYear = (yr) => {
    setSelectedYear(yr);
    const newPassage = getRandomPassage(readingPool[yr]);
    setPassage(newPassage);
    setPhase('reading');
    setScore(0);
    setResults([]);
  };

  const timerColor = timeLeft > 15 ? '#34D399' : timeLeft > 7 ? '#FBBF24' : '#F87171';
  const q = questions[currentQ];

  return (
    <div className="min-h-screen pt-28 pb-10 relative"
      style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #0f2027 100%)' }}>
      <StarField />
      <div className="max-w-3xl mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6">
          <h1 className="font-poppins font-black text-4xl text-white mb-1">📖 Reading Race</h1>
          <p className="text-orange-300 font-semibold">Read carefully, then answer the questions!</p>
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

        <AnimatePresence mode="wait">
          {/* READING PHASE */}
          {phase === 'reading' && (
            <motion.div key="reading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass rounded-3xl p-6 mb-5"
                style={{ border: '1px solid rgba(246,211,101,0.25)', background: 'rgba(246,211,101,0.05)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📖</span>
                  <div>
                    <h2 className="font-poppins font-bold text-white text-xl">{passage?.title}</h2>
                    <p className="text-orange-300 text-xs font-semibold">{selectedYear} · {pts} pts per question</p>
                  </div>
                </div>
                <div className="rounded-2xl p-5 leading-relaxed text-white/90 text-base"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Georgia, serif', lineHeight: '1.9' }}>
                  {passage?.passage}
                </div>
                <p className="text-orange-300/70 text-xs mt-3 text-center">
                  📝 Read carefully — {passage?.questions?.length} questions await!
                </p>
              </div>
              <motion.button onClick={startQuiz} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-poppins font-bold text-white text-lg cursor-pointer"
                style={{ background: GRADIENT, boxShadow: `0 8px 32px ${GLOW}` }}>
                ✅ I've Read It — Start Questions!
              </motion.button>
            </motion.div>
          )}

          {/* QUIZ PHASE */}
          {phase === 'quiz' && q && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Progress + Timer */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-orange-300 text-sm font-semibold">Question {currentQ + 1} of {questions.length}</span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full transition-all"
                        style={{ background: i < currentQ ? '#fda085' : i === currentQ ? 'white' : 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl" style={{ background: `${timerColor}20`, border: `1px solid ${timerColor}40` }}>
                  <span style={{ color: timerColor }} className="font-bold text-sm">⏱ {timeLeft}s</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 mb-5">
                <div className="h-2 rounded-full transition-all" style={{ width: `${(currentQ / questions.length) * 100}%`, background: GRADIENT }} />
              </div>

              <div className="glass rounded-2xl p-5 mb-5">
                <p className="text-orange-300 text-xs font-bold mb-2 uppercase tracking-wider">Comprehension Question</p>
                <h2 className="font-poppins font-bold text-white text-xl leading-relaxed">{q.q}</h2>
                <p className="text-orange-300 text-sm mt-2 font-semibold">+{pts} pts</p>
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
                  return (
                    <motion.button key={opt} onClick={() => handleAnswer(opt)}
                      whileHover={!answered ? { scale: 1.03, y: -2 } : {}}
                      whileTap={!answered ? { scale: 0.97 } : {}}
                      disabled={answered}
                      className="p-4 rounded-2xl text-left font-semibold text-base cursor-pointer transition-all"
                      style={{ background: bg, border, color: textColor }}>
                      <span className="inline-block w-6 h-6 rounded-full text-xs font-black text-center leading-6 mr-2"
                        style={{ background: 'rgba(255,255,255,0.15)' }}>
                        {['A','B','C','D'][idx]}
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
                  {selected === q.answer ? `🎉 Correct! +${pts} points!` : selected === '__timeout__' ? `⏰ Time's up! Answer: ${q.answer}` : `❌ Answer: ${q.answer}`}
                </motion.div>
              )}

              <div className="flex items-center justify-between mt-5 px-2">
                <span className="text-orange-300 text-sm">Score this round</span>
                <span className="text-yellow-400 font-black text-xl">⭐ {score}</span>
              </div>
            </motion.div>
          )}

          {/* FINISHED PHASE */}
          {phase === 'finished' && (
            <motion.div key="finished" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-3xl p-8 text-center">
              {(() => {
                const correct = results.filter(r => r.correct).length;
                const pct = Math.round((correct / results.length) * 100);
                return (
                  <>
                    <div className="text-6xl mb-4">{pct >= 80 ? '🌟' : pct >= 60 ? '📚' : '💪'}</div>
                    <h2 className="font-poppins font-black text-3xl text-white mb-1">
                      {pct >= 80 ? 'Excellent Reader!' : pct >= 60 ? 'Good Work!' : 'Keep Reading!'}
                    </h2>
                    <p className="text-orange-300 mb-6">{passage?.title} · {selectedYear}</p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="glass rounded-xl p-3">
                        <p className="text-yellow-400 font-black text-2xl">{score}</p>
                        <p className="text-orange-300 text-xs">Points Earned</p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-green-400 font-black text-2xl">{correct}/{results.length}</p>
                        <p className="text-orange-300 text-xs">Correct</p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <p className="text-blue-400 font-black text-2xl">{pct}%</p>
                        <p className="text-orange-300 text-xs">Accuracy</p>
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
                      style={{ background: GRADIENT }}>
                      📖 Read Another Passage
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
