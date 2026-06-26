import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import StarField from '../components/StarField';

const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐬', '🦋', '🌟', '🐉', '🦄', '🐧', '🦈'];
const YEAR_GROUPS = [
  { value: 'Reception',  label: 'Reception' },
  { value: 'Year 1',     label: 'Year 1 / Grade 1' },
  { value: 'Year 2',     label: 'Year 2 / Grade 2' },
  { value: 'Year 3',     label: 'Year 3 / Grade 3' },
  { value: 'Year 4',     label: 'Year 4 / Grade 4' },
  { value: 'Year 5',     label: 'Year 5 / Grade 5' },
  { value: 'Year 6',     label: 'Year 6 / Grade 6' },
  { value: 'Year 7',     label: 'Year 7 / Grade 7' },
  { value: 'Year 8',     label: 'Year 8 / Grade 8' },
];

const toEmail = (username) => `${username.toLowerCase().trim()}@tch.hub`;

const validateUsername = (u) => /^[a-z0-9_]{3,20}$/.test(u);

const EMPTY_STATS = {
  totalPoints: 0, englishPoints: 0, mathPoints: 0, sciencePoints: 0,
  readingPoints: 0, spellingPoints: 0, sprintPoints: 0, knowledgePoints: 0,
  questionsAnswered: 0, correctAnswers: 0, badges: [],
};

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1); // register steps 1 | 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regYear, setRegYear] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regAvatar, setRegAvatar] = useState('🦁');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'taken' | 'available'

  // Username availability check (debounced)
  useEffect(() => {
    if (!regUsername || !validateUsername(regUsername)) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, 'usernames', regUsername.toLowerCase()));
        setUsernameStatus(snap.exists() ? 'taken' : 'available');
      } catch {
        setUsernameStatus(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [regUsername]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, toEmail(loginUsername), loginPassword);
    } catch (err) {
      setError(err.code === 'auth/invalid-credential'
        ? 'Incorrect username or password.'
        : 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim()) return setError('Please enter your name.');
    if (!validateUsername(regUsername.toLowerCase()))
      return setError('Username must be 3–20 characters, letters, numbers or underscore only.');
    if (usernameStatus === 'taken') return setError('That username is already taken.');
    if (usernameStatus === 'checking') return setError('Checking username availability…');
    if (!regYear) return setError('Please select your year group.');
    if (regPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (regPassword !== regConfirm) return setError('Passwords do not match.');
    setStep(2);
  };

  const handleRegisterFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const uname = regUsername.toLowerCase().trim();
      // Double-check username isn't taken
      const usernameSnap = await getDoc(doc(db, 'usernames', uname));
      if (usernameSnap.exists()) {
        setError('That username was just taken — please choose another.');
        setStep(1);
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, toEmail(uname), regPassword);

      // Write Firestore docs atomically
      await Promise.all([
        setDoc(doc(db, 'usernames', uname), { uid: user.uid }),
        setDoc(doc(db, 'users', user.uid), {
          name: regName.trim(),
          username: uname,
          yearGroup: regYear,
          avatar: regAvatar,
          createdAt: serverTimestamp(),
        }),
        setDoc(doc(db, 'stats', user.uid), {
          ...EMPTY_STATS,
          name: regName.trim(),
          username: uname,
          yearGroup: regYear,
          avatar: regAvatar,
          updatedAt: serverTimestamp(),
        }),
      ]);
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-8"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <StarField />

      <div className="fixed top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
      <div className="fixed bottom-20 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6">
          <div className="floating inline-block mb-3">
            <img src="/logo.png" alt="Sky Wings Academy" className="h-20 w-auto mx-auto" />
          </div>
          <h1 className="font-poppins font-black text-xl text-white mb-0.5">Sky Wings Academy</h1>
          <h2 className="font-poppins font-bold text-sm text-yellow-400 mb-1">The Tanganyika Schools</h2>
          <p className="gradient-text font-poppins font-bold text-lg">Challenge Hub</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl overflow-hidden">
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setStep(1); setError(''); }}
                className="flex-1 py-3 font-poppins font-bold text-sm transition-all cursor-pointer"
                style={{
                  background: tab === t ? 'rgba(168,85,247,0.2)' : 'transparent',
                  color: tab === t ? '#c084fc' : 'rgba(255,255,255,0.4)',
                  borderBottom: tab === t ? '2px solid #a855f7' : '2px solid transparent',
                }}>
                {t === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          <div className="p-7">
            <AnimatePresence mode="wait">

              {/* ── LOGIN ── */}
              {tab === 'login' && (
                <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Username</label>
                    <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                      placeholder="e.g. amina_y5"
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', fontSize: '1rem' }}
                      autoCapitalize="none" autoComplete="username" />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', fontSize: '1rem' }}
                      autoComplete="current-password" />
                  </div>
                  {error && (
                    <div className="rounded-xl px-4 py-3 text-red-300 text-sm font-semibold"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 rounded-xl font-poppins font-bold text-white text-base cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                    {loading ? '⏳ Signing in…' : '🚀 Sign In'}
                  </motion.button>
                  <p className="text-center text-purple-400 text-xs">
                    New student?{' '}
                    <button type="button" onClick={() => { setTab('register'); setError(''); }}
                      className="text-purple-300 font-bold underline cursor-pointer">
                      Register here
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── REGISTER STEP 1 ── */}
              {tab === 'register' && step === 1 && (
                <motion.form key="reg1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegisterStep1} className="space-y-4">
                  <p className="text-purple-300 text-xs font-semibold text-center">Step 1 of 2 — Your details</p>

                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Full Name</label>
                    <input value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="e.g. Amina Hassan"
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', fontSize: '1rem' }} />
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Username</label>
                    <div className="relative">
                      <input value={regUsername} onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. amina_y5  (letters, numbers, _)"
                        className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none pr-10"
                        style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${usernameStatus === 'available' ? 'rgba(34,197,94,0.5)' : usernameStatus === 'taken' ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.3)'}`, fontSize: '1rem' }}
                        autoCapitalize="none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {usernameStatus === 'checking' ? '⏳' : usernameStatus === 'available' ? '✅' : usernameStatus === 'taken' ? '❌' : ''}
                      </span>
                    </div>
                    {usernameStatus === 'taken' && <p className="text-red-400 text-xs mt-1">Username taken — try another</p>}
                    {usernameStatus === 'available' && <p className="text-green-400 text-xs mt-1">Username available!</p>}
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Year Group / Grade</label>
                    <select value={regYear} onChange={e => setRegYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none cursor-pointer"
                      style={{ background: 'rgba(30,20,60,0.95)', border: '1px solid rgba(168,85,247,0.3)', fontSize: '0.95rem' }}>
                      <option value="">Select year / grade…</option>
                      {YEAR_GROUPS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', fontSize: '1rem' }}
                      autoComplete="new-password" />
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm font-semibold mb-1.5 block">Confirm Password</label>
                    <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                      placeholder="Type password again"
                      className="w-full px-4 py-3 rounded-xl text-white font-medium outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${regConfirm && regPassword !== regConfirm ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.3)'}`, fontSize: '1rem' }}
                      autoComplete="new-password" />
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 text-red-300 text-sm font-semibold"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-poppins font-bold text-white text-base cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                    Next → Pick Your Avatar
                  </motion.button>
                </motion.form>
              )}

              {/* ── REGISTER STEP 2 — AVATAR ── */}
              {tab === 'register' && step === 2 && (
                <motion.div key="reg2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <p className="text-purple-300 text-xs font-semibold text-center mb-4">Step 2 of 2 — Choose your avatar</p>
                  <p className="text-white font-bold text-center mb-5">
                    Welcome, <span className="gradient-text">{regName.split(' ')[0]}</span>! 👋
                  </p>

                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {AVATARS.map(av => (
                      <motion.button key={av} type="button" onClick={() => setRegAvatar(av)}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="aspect-square rounded-2xl text-4xl flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: regAvatar === av ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.06)',
                          border: regAvatar === av ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.1)',
                          boxShadow: regAvatar === av ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
                        }}>
                        {av}
                      </motion.button>
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 text-red-300 text-sm font-semibold mb-4"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep(1); setError(''); }}
                      className="px-5 py-3 rounded-xl text-purple-300 font-bold text-sm cursor-pointer transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      ← Back
                    </button>
                    <motion.button type="button" onClick={handleRegisterFinish} disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                      className="flex-1 py-3 rounded-xl font-poppins font-bold text-white text-base cursor-pointer disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                      {loading ? '⏳ Creating account…' : '🚀 Start Playing!'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-purple-500 text-xs mt-4">
          Sky Wings Academy · The Tanganyika Schools · Centres of Excellence
        </p>
      </div>
    </div>
  );
}
