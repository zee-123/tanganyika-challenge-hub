import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getMessaging, getToken } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext';

const NOTIFY_SECRET = import.meta.env.VITE_NOTIFY_SECRET || '';
// VAPID public key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'BKIifE_iQjllohjjKl-wvDWt-4IoH0sWbJr0L-D3-VJD5Pdil6hJ1eY-NrxvbqnV5rEM48EJxi4PNtt8UpU_FuY';

const SUBJECTS = [
  { key: 'englishPoints', label: 'English', icon: '📖', color: '#667eea' },
  { key: 'mathPoints', label: 'Maths', icon: '⚔️', color: '#f093fb' },
  { key: 'sciencePoints', label: 'Science', icon: '🔬', color: '#4facfe' },
  { key: 'readingPoints', label: 'Reading', icon: '📚', color: '#f6d365' },
  { key: 'spellingPoints', label: 'Spelling', icon: '🐝', color: '#84fab0' },
  { key: 'sprintPoints', label: 'Sprint', icon: '⚡', color: '#fd7043' },
  { key: 'knowledgePoints', label: 'Knowledge', icon: '🌍', color: '#38BDF8' },
  { key: 'stemPoints', label: 'STEM', icon: '🧪', color: '#34D399' },
  { key: 'olympiadPoints', label: 'Olympiad', icon: '🎖️', color: '#a78bfa' },
];

function getRankInfo(total) {
  if (total >= 1000) return { title: 'Legend', icon: '👑' };
  if (total >= 500) return { title: 'Champion', icon: '🏆' };
  if (total >= 200) return { title: 'Explorer', icon: '🌟' };
  if (total >= 50) return { title: 'Learner', icon: '📚' };
  return { title: 'Beginner', icon: '🌱' };
}

function accuracy(s) {
  if (!s.questionsAnswered) return 0;
  return Math.round((s.correctAnswers / s.questionsAnswered) * 100);
}

export default function AdminPanel() {
  const { leaderboard, isAdmin, BADGES } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('totalPoints');
  const [selected, setSelected] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');

  // Announcement state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifStatus, setNotifStatus] = useState('idle');
  const [enableStatus, setEnableStatus] = useState('idle'); // idle | saving | done | error
  const [enableError, setEnableError] = useState('');

  const enableNotifications = async () => {
    setEnableStatus('saving');
    setEnableError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setEnableStatus('error'); setEnableError('Permission denied'); return; }

      // Unregister existing SWs first to avoid scope conflicts
      const existing = await navigator.serviceWorker.getRegistrations();
      for (const sw of existing) await sw.unregister();

      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      // Wait for the SW to become active
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('SW activation timeout')), 10000);
        if (swReg.active) { clearTimeout(timeout); resolve(); return; }
        const worker = swReg.installing || swReg.waiting;
        if (worker) {
          worker.addEventListener('statechange', e => {
            if (e.target.state === 'activated') { clearTimeout(timeout); resolve(); }
            if (e.target.state === 'redundant') { clearTimeout(timeout); reject(new Error('SW became redundant')); }
          });
        } else {
          clearTimeout(timeout); resolve();
        }
      });

      const messaging = getMessaging();
      // Convert URL-safe base64 VAPID key to standard base64
      const vapidKey = VAPID_KEY.replace(/-/g, '+').replace(/_/g, '/');
      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
      if (!token) { setEnableStatus('error'); setEnableError('No token returned — check VAPID key'); return; }

      await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
        token, uid: currentUser.uid, updatedAt: new Date().toISOString(),
      }, { merge: true });
      setEnableStatus('done');
    } catch (err) {
      console.error('Enable notifications error:', err);
      setEnableStatus('error');
      setEnableError(err.message || String(err));
    }
  };

  const sendAnnouncement = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setNotifStatus('sending');
    try {
      // Fetch all FCM tokens from Firestore
      const snap = await getDocs(collection(db, 'fcmTokens'));
      const tokens = snap.docs.map(d => d.data().token).filter(Boolean);
      if (!tokens.length) { setNotifStatus('error'); return; }

      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: NOTIFY_SECRET, title: notifTitle, body: notifBody, tokens }),
      });
      if (res.ok) { setNotifStatus('sent'); setNotifTitle(''); setNotifBody(''); setTimeout(() => setNotifStatus('idle'), 3000); }
      else setNotifStatus('error');
    } catch { setNotifStatus('error'); }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-white font-bold text-xl">Access Denied</p>
          <p className="text-purple-300 text-sm mt-2">Admin access required.</p>
          <button onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const yearGroups = useMemo(() => {
    const set = new Set(leaderboard.map(s => s.yearGroup).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leaderboard]);

  const filtered = useMemo(() => {
    let list = [...leaderboard];
    if (yearFilter !== 'All') list = list.filter(s => s.yearGroup === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.username || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'accuracy') return accuracy(b) - accuracy(a);
      if (sortBy === 'badges') return (b.badges?.length || 0) - (a.badges?.length || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });
    return list;
  }, [leaderboard, search, sortBy, yearFilter]);

  const totalStudents = leaderboard.length;
  const totalQuestionsAnswered = leaderboard.reduce((s, x) => s + (x.questionsAnswered || 0), 0);
  const avgAccuracy = totalStudents
    ? Math.round(leaderboard.reduce((s, x) => s + accuracy(x), 0) / totalStudents)
    : 0;
  const totalPoints = leaderboard.reduce((s, x) => s + (x.totalPoints || 0), 0);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">🛡️</span>
          <div>
            <h1 className="font-poppins font-black text-white text-3xl leading-tight">Admin Panel</h1>
            <p className="text-purple-300 text-sm">Sky Wings Academy — The Tanganyika Schools</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: totalStudents, icon: '👨‍🎓', color: '#667eea' },
          { label: 'Total Points Earned', value: totalPoints.toLocaleString(), icon: '⭐', color: '#f6d365' },
          { label: 'Questions Answered', value: totalQuestionsAnswered.toLocaleString(), icon: '❓', color: '#84fab0' },
          { label: 'Avg. Accuracy', value: `${avgAccuracy}%`, icon: '🎯', color: '#f093fb' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${card.color}40` }}>
            <div className="text-3xl mb-1">{card.icon}</div>
            <div className="font-poppins font-black text-white text-2xl">{card.value}</div>
            <div className="text-purple-300 text-xs mt-1">{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or username…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 rounded-xl text-white text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }}
        />
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }}>
          {yearGroups.map(y => <option key={y} value={y} style={{ background: '#302b63' }}>{y === 'All' ? 'All Years' : y}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }}>
          <option value="totalPoints" style={{ background: '#302b63' }}>Sort: Total Points</option>
          <option value="weeklyPoints" style={{ background: '#302b63' }}>Sort: Weekly Points</option>
          <option value="accuracy" style={{ background: '#302b63' }}>Sort: Accuracy</option>
          <option value="badges" style={{ background: '#302b63' }}>Sort: Badges</option>
          <option value="name" style={{ background: '#302b63' }}>Sort: Name A-Z</option>
        </select>
        <span className="text-purple-400 text-sm">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
      </motion.div>

      {/* Student Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
        {/* Table Header */}
        <div className="grid gap-2 px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wider"
          style={{ background: 'rgba(168,85,247,0.15)', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr' }}>
          <span>Student</span>
          <span className="text-center">Points</span>
          <span className="text-center">This Week</span>
          <span className="text-center">Accuracy</span>
          <span className="text-center">Badges</span>
          <span className="text-center">Rank</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-purple-400">No students found.</div>
        ) : (
          filtered.map((s, i) => {
            const rank = getRankInfo(s.totalPoints || 0);
            const acc = accuracy(s);
            return (
              <motion.div key={s.uid}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(selected?.uid === s.uid ? null : s)}
                className="cursor-pointer transition-all"
                style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
                {/* Row */}
                <div className="grid gap-2 px-4 py-3 items-center hover:bg-white/5 transition-colors"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: selected?.uid === s.uid ? 'rgba(168,85,247,0.12)' : 'transparent' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.avatar || '🎓'}</span>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{s.name || '—'}</p>
                      <p className="text-purple-400 text-xs">@{s.username} · {s.yearGroup || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-yellow-400 font-bold text-sm">⭐ {(s.totalPoints || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-cyan-400 font-semibold text-sm">{(s.weeklyPoints || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-center">
                    <span className={`font-bold text-sm ${acc >= 80 ? 'text-green-400' : acc >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {acc}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-purple-300 font-semibold text-sm">🏅 {s.badges?.length || 0}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm">{rank.icon} <span className="text-purple-200 text-xs">{rank.title}</span></span>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {selected?.uid === s.uid && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                      style={{ background: 'rgba(168,85,247,0.08)', borderTop: '1px solid rgba(168,85,247,0.15)' }}>
                      <div className="px-6 py-5">
                        {/* Subject breakdown */}
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">Subject Breakdown</p>
                        <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-5">
                          {SUBJECTS.map(sub => {
                            const pts = s[sub.key] || 0;
                            const max = Math.max(...leaderboard.map(x => x[sub.key] || 0), 1);
                            const pct = Math.round((pts / max) * 100);
                            return (
                              <div key={sub.key} className="text-center">
                                <div className="text-xl mb-1">{sub.icon}</div>
                                <div className="h-1.5 rounded-full mb-1 mx-auto w-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: sub.color }} />
                                </div>
                                <p className="text-white font-bold text-xs">{pts}</p>
                                <p className="text-purple-400 text-xs">{sub.label}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="text-xs text-purple-300">Questions: <span className="text-white font-bold">{s.questionsAnswered || 0}</span></div>
                          <div className="text-xs text-purple-300">Correct: <span className="text-white font-bold">{s.correctAnswers || 0}</span></div>
                          <div className="text-xs text-purple-300">Accuracy: <span className="text-white font-bold">{acc}%</span></div>
                          <div className="text-xs text-purple-300">Weekly Start: <span className="text-white font-bold">{s.weeklyStart || '—'}</span></div>
                        </div>

                        {/* Badges */}
                        {s.badges?.length > 0 && (
                          <div>
                            <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Badges Earned</p>
                            <div className="flex flex-wrap gap-2">
                              {s.badges.map(b => (
                                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                  style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${b.color || '#a78bfa'}40`, color: b.color || '#c084fc' }}>
                                  {b.icon} {b.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Subject leaderboard summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto mt-8">
        <h2 className="text-white font-bold text-lg mb-4">📊 Top Performers by Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map(sub => {
            const top = [...leaderboard]
              .filter(s => (s[sub.key] || 0) > 0)
              .sort((a, b) => (b[sub.key] || 0) - (a[sub.key] || 0))
              .slice(0, 3);
            return (
              <div key={sub.key} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${sub.color}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{sub.icon}</span>
                  <span className="text-white font-bold text-sm">{sub.label}</span>
                </div>
                {top.length === 0 ? (
                  <p className="text-purple-400 text-xs">No data yet</p>
                ) : top.map((s, i) => (
                  <div key={s.uid} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs w-4" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-white text-xs flex-1 truncate">{s.name || s.username}</span>
                    <span className="text-xs font-bold" style={{ color: sub.color }}>{s[sub.key]}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Send Announcement */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mt-8">
        <h2 className="text-white font-bold text-lg mb-4">📣 Send Announcement to All Students</h2>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <div className="flex items-center gap-4 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div>
              <p className="text-white text-sm font-semibold">Your notification status</p>
              <p className="text-purple-400 text-xs">Register this device to receive & test notifications</p>
            </div>
            <button onClick={enableNotifications} disabled={enableStatus === 'saving' || enableStatus === 'done'}
              className="ml-auto px-4 py-2 rounded-xl text-sm font-bold cursor-pointer flex-shrink-0 disabled:opacity-60"
              style={{ background: enableStatus === 'done' ? 'rgba(52,211,153,0.2)' : 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)', color: enableStatus === 'done' ? '#34d399' : 'white' }}>
              {enableStatus === 'idle' ? '🔔 Enable Notifications' : enableStatus === 'saving' ? '⏳ Registering…' : enableStatus === 'done' ? '✅ Enabled!' : '❌ Failed — retry'}
            </button>
          </div>
          {enableError && (
            <p className="text-red-400 text-xs mb-3 px-1">Error: {enableError}</p>
          )}
          <p className="text-purple-300 text-sm mb-4">
            Push a notification to every student who has the app installed and granted permission.
          </p>
          <div className="flex flex-col gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Notification title (e.g. New Challenge Available!)"
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              maxLength={80}
              className="px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}
            />
            <textarea
              placeholder="Message body (e.g. The Olympiad challenge is now live — log in and compete!)"
              value={notifBody}
              onChange={e => setNotifBody(e.target.value)}
              maxLength={200}
              rows={3}
              className="px-4 py-2.5 rounded-xl text-white text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}
            />
            <button
              onClick={sendAnnouncement}
              disabled={notifStatus === 'sending' || !notifTitle.trim() || !notifBody.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-white cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {notifStatus === 'sending' ? '⏳ Sending…' : notifStatus === 'sent' ? '✅ Sent!' : notifStatus === 'error' ? '❌ Error — check setup' : '📣 Send to All Students'}
            </button>
            {notifStatus === 'error' && (
              <p className="text-red-400 text-xs">
                Failed to send. No students may have accepted notifications yet, or check Vercel logs for API errors.
              </p>
            )}
            <p className="text-purple-500 text-xs">
              Only students who installed the app and accepted notifications will receive this.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
