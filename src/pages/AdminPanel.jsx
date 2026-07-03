import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getMessaging, getToken } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext';
import app from '../firebase';

const NOTIFY_SECRET = import.meta.env.VITE_NOTIFY_SECRET || '';
const VAPID_KEY = 'BKIifE_iQjllohjjKl-wvDWt-4IoH0sWbJr0L-D3-VJD5Pdil6hJ1eY-NrxvbqnV5rEM48EJxi4PNtt8UpU_FuY';

const SUBJECTS = [
  { key: 'englishPoints',   label: 'English',    icon: '📖', color: '#667eea', qSubject: 'english' },
  { key: 'mathPoints',      label: 'Maths',      icon: '⚔️', color: '#f093fb', qSubject: 'math' },
  { key: 'sciencePoints',   label: 'Science',    icon: '🔬', color: '#4facfe', qSubject: 'science' },
  { key: 'readingPoints',   label: 'Reading',    icon: '📚', color: '#f6d365', qSubject: null },
  { key: 'spellingPoints',  label: 'Spelling',   icon: '🐝', color: '#84fab0', qSubject: null },
  { key: 'sprintPoints',    label: 'Sprint',     icon: '⚡', color: '#fd7043', qSubject: 'sprint' },
  { key: 'knowledgePoints', label: 'Knowledge',  icon: '🌍', color: '#38BDF8', qSubject: 'knowledge' },
  { key: 'stemPoints',      label: 'STEM',       icon: '🧪', color: '#34D399', qSubject: 'stem' },
  { key: 'olympiadPoints',  label: 'Olympiad',   icon: '🎖️', color: '#a78bfa', qSubject: 'olympiad' },
];

const YEAR_BANDS = ['Reception', 'Year 1-2', 'Year 3-4', 'Year 5-6', 'Year 7-8'];

const Q_SUBJECTS = SUBJECTS.filter(s => s.qSubject !== null).map(s => ({
  value: s.qSubject,
  label: s.label,
  icon: s.icon,
  color: s.color,
}));

function getRankInfo(total) {
  if (total >= 1000) return { title: 'Legend',   icon: '👑' };
  if (total >= 500)  return { title: 'Champion', icon: '🏆' };
  if (total >= 200)  return { title: 'Explorer', icon: '🌟' };
  if (total >= 50)   return { title: 'Learner',  icon: '📚' };
  return                    { title: 'Beginner', icon: '🌱' };
}

function accuracy(s) {
  if (!s.questionsAnswered) return 0;
  return Math.round((s.correctAnswers / s.questionsAnswered) * 100);
}

// ─── Horizontal Bar Chart ──────────────────────────────────────────────────
function HBar({ label, icon, value, max, color, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-xs font-semibold truncate max-w-[60%]">{icon} {label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value.toLocaleString()}{suffix}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div className="h-2 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }} />
      </div>
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────
function AnalyticsTab({ leaderboard }) {
  const subjectTotals = useMemo(() =>
    SUBJECTS.map(s => ({
      ...s,
      total: leaderboard.reduce((sum, x) => sum + (x[s.key] || 0), 0),
      participants: leaderboard.filter(x => (x[s.key] || 0) > 0).length,
    })), [leaderboard]);

  const maxSubjectTotal = Math.max(...subjectTotals.map(s => s.total), 1);

  const top10 = useMemo(() =>
    [...leaderboard].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 10),
    [leaderboard]);
  const maxPts = top10[0]?.totalPoints || 1;

  const yearGroups = useMemo(() => {
    const counts = {};
    leaderboard.forEach(s => { counts[s.yearGroup || 'Unknown'] = (counts[s.yearGroup || 'Unknown'] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [leaderboard]);
  const maxYG = Math.max(...yearGroups.map(([, c]) => c), 1);

  const avgAcc = leaderboard.length
    ? Math.round(leaderboard.reduce((s, x) => s + accuracy(x), 0) / leaderboard.length) : 0;
  const activeStudents = leaderboard.filter(s => (s.totalPoints || 0) > 0).length;
  const totalQs = leaderboard.reduce((s, x) => s + (x.questionsAnswered || 0), 0);
  const totalPoints = leaderboard.reduce((s, x) => s + (x.totalPoints || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', value: `${activeStudents}/${leaderboard.length}`, icon: '🟢', color: '#34D399' },
          { label: 'Total Points Earned', value: totalPoints.toLocaleString(), icon: '⭐', color: '#FBBF24' },
          { label: 'Questions Answered', value: totalQs.toLocaleString(), icon: '❓', color: '#60A5FA' },
          { label: 'Avg. Accuracy', value: `${avgAcc}%`, icon: '🎯', color: '#F472B6' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${k.color}30` }}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="font-poppins font-black text-white text-xl">{k.value}</div>
            <div className="text-purple-400 text-xs mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Popularity */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <h3 className="text-white font-bold text-sm mb-4">📊 Subject Popularity (total points)</h3>
          {[...subjectTotals].sort((a, b) => b.total - a.total).map(s => (
            <HBar key={s.key} label={s.label} icon={s.icon} value={s.total} max={maxSubjectTotal} color={s.color} />
          ))}
        </div>

        {/* Top 10 Students */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <h3 className="text-white font-bold text-sm mb-4">🏆 Top 10 Students</h3>
          {top10.map((s, i) => (
            <HBar key={s.uid} label={s.name || s.username} icon={['🥇','🥈','🥉'][i] || `${i+1}.`}
              value={s.totalPoints || 0} max={maxPts} color={i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#a78bfa'} />
          ))}
          {top10.length === 0 && <p className="text-purple-400 text-sm">No data yet</p>}
        </div>

        {/* Year Group Distribution */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <h3 className="text-white font-bold text-sm mb-4">👥 Students by Year Group</h3>
          {yearGroups.map(([yr, count]) => (
            <HBar key={yr} label={yr} icon="🎓" value={count} max={maxYG} color="#818cf8" suffix=" students" />
          ))}
          {yearGroups.length === 0 && <p className="text-purple-400 text-sm">No data yet</p>}
        </div>

        {/* Subject Engagement */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <h3 className="text-white font-bold text-sm mb-4">✅ Subject Engagement (students who played)</h3>
          {[...subjectTotals].sort((a, b) => b.participants - a.participants).map(s => (
            <HBar key={s.key} label={s.label} icon={s.icon}
              value={s.participants} max={leaderboard.length || 1} color={s.color}
              suffix={` / ${leaderboard.length}`} />
          ))}
        </div>
      </div>

      {/* Per-subject top performer */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <h3 className="text-white font-bold text-sm mb-4">🌟 Subject Champions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {SUBJECTS.map(sub => {
            const top = [...leaderboard].filter(s => (s[sub.key] || 0) > 0)
              .sort((a, b) => (b[sub.key] || 0) - (a[sub.key] || 0))[0];
            return (
              <div key={sub.key} className="rounded-xl p-3 text-center"
                style={{ background: `${sub.color}10`, border: `1px solid ${sub.color}30` }}>
                <div className="text-2xl mb-1">{sub.icon}</div>
                <p className="text-xs font-bold mb-1" style={{ color: sub.color }}>{sub.label}</p>
                {top ? (
                  <>
                    <p className="text-white text-xs font-semibold truncate">{top.name || top.username}</p>
                    <p className="text-xs mt-0.5" style={{ color: sub.color }}>{top[sub.key]} pts</p>
                  </>
                ) : <p className="text-purple-500 text-xs">—</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Question Editor Tab ────────────────────────────────────────────────────
const EMPTY_FORM = { question: '', options: ['', '', '', ''], answer: '', points: 10 };

function QuestionEditorTab() {
  const [subject, setSubject] = useState(Q_SUBJECTS[0].value);
  const [band, setBand] = useState(YEAR_BANDS[0]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editIdx, setEditIdx] = useState(null); // null = adding, number = editing
  const [formOpen, setFormOpen] = useState(false);
  const [msg, setMsg] = useState('');

  const docId = `${subject}_${band.replace(/\s/g, '')}`;

  useEffect(() => {
    setLoading(true);
    setQuestions([]);
    getDoc(doc(db, 'customQuestions', docId))
      .then(snap => setQuestions(snap.exists() ? (snap.data().questions || []) : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [docId]);

  const saveToFirestore = async (qs) => {
    setSaving(true);
    await setDoc(doc(db, 'customQuestions', docId), { questions: qs }, { merge: false });
    setSaving(false);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditIdx(null);
    setFormOpen(true);
    setMsg('');
  };

  const openEdit = (idx) => {
    const q = questions[idx];
    setForm({ question: q.question, options: [...q.options], answer: q.answer, points: q.points || 10 });
    setEditIdx(idx);
    setFormOpen(true);
    setMsg('');
  };

  const deleteQ = async (idx) => {
    if (!window.confirm('Delete this question?')) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    await saveToFirestore(updated);
    setMsg('Question deleted.');
    setTimeout(() => setMsg(''), 2000);
  };

  const submitForm = async () => {
    if (!form.question.trim()) return setMsg('⚠️ Question text is required.');
    if (form.options.some(o => !o.trim())) return setMsg('⚠️ All 4 options must be filled in.');
    if (!form.answer.trim()) return setMsg('⚠️ Select the correct answer.');
    if (!form.options.includes(form.answer)) return setMsg('⚠️ The correct answer must match one of the options exactly.');

    const newQ = {
      id: `cq_${subject}_${Date.now()}`,
      question: form.question.trim(),
      options: form.options.map(o => o.trim()),
      answer: form.answer.trim(),
      points: Number(form.points) || 10,
    };

    let updated;
    if (editIdx !== null) {
      updated = questions.map((q, i) => i === editIdx ? { ...q, ...newQ, id: q.id } : q);
    } else {
      updated = [...questions, newQ];
    }

    setQuestions(updated);
    await saveToFirestore(updated);
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setEditIdx(null);
    setMsg(editIdx !== null ? '✅ Question updated!' : '✅ Question added!');
    setTimeout(() => setMsg(''), 3000);
  };

  const subjectMeta = Q_SUBJECTS.find(s => s.value === subject) || Q_SUBJECTS[0];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm text-white cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}>
            {Q_SUBJECTS.map(s => <option key={s.value} value={s.value} style={{ background: '#302b63' }}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-1">Year Band</label>
          <select value={band} onChange={e => setBand(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm text-white cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}>
            {YEAR_BANDS.map(b => <option key={b} value={b} style={{ background: '#302b63' }}>{b}</option>)}
          </select>
        </div>
        <button onClick={openAdd}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          + Add Question
        </button>
        {msg && <span className="text-sm" style={{ color: msg.startsWith('⚠️') ? '#f87171' : '#34d399' }}>{msg}</span>}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{subjectMeta.icon}</span>
        <span className="text-white font-bold">{subjectMeta.label} — {band}</span>
        <span className="text-purple-400 text-sm ml-2">
          {loading ? 'Loading…' : `${questions.length} custom question${questions.length !== 1 ? 's' : ''}`}
        </span>
        {saving && <span className="text-purple-400 text-xs">Saving…</span>}
      </div>

      <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
        {loading ? (
          <div className="py-8 text-center text-purple-400 text-sm">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-purple-400 text-sm">No custom questions yet for this subject + band.</p>
            <p className="text-purple-500 text-xs mt-1">Static questions from code are always included. Custom questions are extras.</p>
          </div>
        ) : (
          questions.map((q, i) => (
            <div key={q.id || i} className="px-5 py-4 flex gap-4 items-start"
              style={{ borderTop: i > 0 ? '1px solid rgba(168,85,247,0.1)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              <span className="text-purple-400 font-bold text-sm w-6 flex-shrink-0 pt-0.5">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium mb-2">{q.question}</p>
                <div className="flex flex-wrap gap-2 mb-1">
                  {q.options.map((opt, oi) => (
                    <span key={oi} className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                      style={{
                        background: opt === q.answer ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                        border: opt === q.answer ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        color: opt === q.answer ? '#34d399' : 'rgba(255,255,255,0.7)',
                      }}>
                      {opt === q.answer ? '✓ ' : ''}{opt}
                    </span>
                  ))}
                </div>
                <span className="text-yellow-400 text-xs">⭐ {q.points} pts</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(i)}
                  className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                  Edit
                </button>
                <button onClick={() => deleteQ(i)}
                  className="px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <h3 className="text-white font-bold text-sm mb-4">{editIdx !== null ? '✏️ Edit Question' : '➕ New Question'}</h3>

            <div className="space-y-3">
              <div>
                <label className="text-purple-400 text-xs font-bold block mb-1">Question Text</label>
                <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={2} placeholder="Enter the question…"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i}>
                    <label className="text-purple-400 text-xs font-bold block mb-1">Option {String.fromCharCode(65 + i)}</label>
                    <input value={opt}
                      onChange={e => setForm(f => { const opts = [...f.options]; opts[i] = e.target.value; return { ...f, options: opts }; })}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-purple-400 text-xs font-bold block mb-1">Correct Answer (must match an option exactly)</label>
                  <select value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-white text-sm cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <option value="" style={{ background: '#302b63' }}>— Select correct answer —</option>
                    {form.options.filter(o => o.trim()).map((o, i) => (
                      <option key={i} value={o} style={{ background: '#302b63' }}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-purple-400 text-xs font-bold block mb-1">Points</label>
                  <input type="number" min={5} max={100} step={5} value={form.points}
                    onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
                </div>
              </div>

              {msg && <p className="text-sm" style={{ color: msg.startsWith('⚠️') ? '#f87171' : '#34d399' }}>{msg}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={submitForm} disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-bold text-white text-sm cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                  {saving ? 'Saving…' : editIdx !== null ? 'Update Question' : 'Add Question'}
                </button>
                <button onClick={() => { setFormOpen(false); setMsg(''); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main AdminPanel ────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { leaderboard, isAdmin, BADGES } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('totalPoints');
  const [selected, setSelected] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifStatus, setNotifStatus] = useState('idle');
  const [enableStatus, setEnableStatus] = useState('idle');
  const [enableError, setEnableError] = useState('');

  const enableNotifications = async () => {
    setEnableStatus('saving');
    setEnableError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setEnableStatus('error'); setEnableError('Permission denied'); return; }
      const existing = await navigator.serviceWorker.getRegistrations();
      for (const sw of existing) await sw.unregister();
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('SW activation timeout')), 10000);
        if (swReg.active) { clearTimeout(timeout); resolve(); return; }
        const worker = swReg.installing || swReg.waiting;
        if (worker) {
          worker.addEventListener('statechange', e => {
            if (e.target.state === 'activated') { clearTimeout(timeout); resolve(); }
            if (e.target.state === 'redundant') { clearTimeout(timeout); reject(new Error('SW became redundant')); }
          });
        } else { clearTimeout(timeout); resolve(); }
      });
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
      if (!token) { setEnableStatus('error'); setEnableError('No token returned — check VAPID key'); return; }
      await setDoc(doc(db, 'fcmTokens', currentUser.uid), { token, uid: currentUser.uid, updatedAt: new Date().toISOString() }, { merge: true });
      setEnableStatus('done');
    } catch (err) {
      setEnableStatus('error');
      setEnableError(err.message || String(err));
    }
  };

  const sendAnnouncement = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setNotifStatus('sending');
    try {
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
  const avgAccuracy = totalStudents ? Math.round(leaderboard.reduce((s, x) => s + accuracy(x), 0) / totalStudents) : 0;
  const totalPoints = leaderboard.reduce((s, x) => s + (x.totalPoints || 0), 0);

  const TABS = [
    { id: 'students',      label: 'Students',      icon: '👨‍🎓' },
    { id: 'analytics',     label: 'Analytics',     icon: '📊' },
    { id: 'questions',     label: 'Questions',      icon: '✏️' },
    { id: 'announcements', label: 'Announcements', icon: '📣' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6">
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
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students',    value: totalStudents,                     icon: '👨‍🎓', color: '#667eea' },
          { label: 'Total Points',      value: totalPoints.toLocaleString(),      icon: '⭐',   color: '#f6d365' },
          { label: 'Questions Answered',value: totalQuestionsAnswered.toLocaleString(), icon: '❓', color: '#84fab0' },
          { label: 'Avg. Accuracy',     value: `${avgAccuracy}%`,                icon: '🎯',  color: '#f093fb' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${card.color}40` }}>
            <div className="text-3xl mb-1">{card.icon}</div>
            <div className="font-poppins font-black text-white text-2xl">{card.value}</div>
            <div className="text-purple-300 text-xs mt-1">{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.2)', width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'rgba(168,85,247,0.7)',
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto">

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <input type="text" placeholder="Search by name or username…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }} />
              <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }}>
                {yearGroups.map(y => <option key={y} value={y} style={{ background: '#302b63' }}>{y === 'All' ? 'All Years' : y}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)', color: 'white' }}>
                <option value="totalPoints"  style={{ background: '#302b63' }}>Sort: Total Points</option>
                <option value="weeklyPoints" style={{ background: '#302b63' }}>Sort: Weekly Points</option>
                <option value="accuracy"     style={{ background: '#302b63' }}>Sort: Accuracy</option>
                <option value="badges"       style={{ background: '#302b63' }}>Sort: Badges</option>
                <option value="name"         style={{ background: '#302b63' }}>Sort: Name A-Z</option>
              </select>
              <span className="text-purple-400 text-sm">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Student Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
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
                      <div className="grid gap-2 px-4 py-3 items-center hover:bg-white/5 transition-colors"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: selected?.uid === s.uid ? 'rgba(168,85,247,0.12)' : 'transparent' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.avatar || '🎓'}</span>
                          <div>
                            <p className="text-white font-semibold text-sm leading-tight">{s.name || '—'}</p>
                            <p className="text-purple-400 text-xs">@{s.username} · {s.yearGroup || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-center"><span className="text-yellow-400 font-bold text-sm">⭐ {(s.totalPoints || 0).toLocaleString()}</span></div>
                        <div className="text-center"><span className="text-cyan-400 font-semibold text-sm">{(s.weeklyPoints || 0).toLocaleString()}</span></div>
                        <div className="text-center">
                          <span className={`font-bold text-sm ${acc >= 80 ? 'text-green-400' : acc >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{acc}%</span>
                        </div>
                        <div className="text-center"><span className="text-purple-300 font-semibold text-sm">🏅 {s.badges?.length || 0}</span></div>
                        <div className="text-center"><span className="text-sm">{rank.icon} <span className="text-purple-200 text-xs">{rank.title}</span></span></div>
                      </div>
                      <AnimatePresence>
                        {selected?.uid === s.uid && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                            style={{ background: 'rgba(168,85,247,0.08)', borderTop: '1px solid rgba(168,85,247,0.15)' }}>
                            <div className="px-6 py-5">
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
                              <div className="flex flex-wrap gap-4 mb-4">
                                <div className="text-xs text-purple-300">Questions: <span className="text-white font-bold">{s.questionsAnswered || 0}</span></div>
                                <div className="text-xs text-purple-300">Correct: <span className="text-white font-bold">{s.correctAnswers || 0}</span></div>
                                <div className="text-xs text-purple-300">Accuracy: <span className="text-white font-bold">{acc}%</span></div>
                                <div className="text-xs text-purple-300">Weekly Start: <span className="text-white font-bold">{s.weeklyStart || '—'}</span></div>
                              </div>
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
            </div>

            {/* Top Performers by Subject */}
            <div className="mt-8">
              <h2 className="text-white font-bold text-lg mb-4">📊 Top Performers by Subject</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUBJECTS.map(sub => {
                  const top = [...leaderboard].filter(s => (s[sub.key] || 0) > 0)
                    .sort((a, b) => (b[sub.key] || 0) - (a[sub.key] || 0)).slice(0, 3);
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
                          <span className="text-xs w-4">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                          <span className="text-white text-xs flex-1 truncate">{s.name || s.username}</span>
                          <span className="text-xs font-bold" style={{ color: sub.color }}>{s[sub.key]}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && <AnalyticsTab leaderboard={leaderboard} />}

        {/* ── Questions Tab ── */}
        {activeTab === 'questions' && (
          <div>
            <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)' }}>
              <p className="text-yellow-300 text-sm font-semibold">ℹ️ About Custom Questions</p>
              <p className="text-yellow-200/70 text-xs mt-1">
                Questions added here are <strong>extras</strong> — they are merged with the built-in question pools at quiz time.
                Supported subjects: English, Maths, Science, Sprint, Knowledge, STEM, Olympiad.
                Reading and Spelling use a different format and must be edited in code.
              </p>
            </div>
            <QuestionEditorTab />
          </div>
        )}

        {/* ── Announcements Tab ── */}
        {activeTab === 'announcements' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <h2 className="text-white font-bold text-lg mb-4">📣 Send Announcement to All Students</h2>
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
            {enableError && <p className="text-red-400 text-xs mb-3 px-1">Error: {enableError}</p>}
            <p className="text-purple-300 text-sm mb-4">Push a notification to every student who has the app installed and granted permission.</p>
            <div className="flex flex-col gap-3 max-w-xl">
              <input type="text" placeholder="Notification title (e.g. New Challenge Available!)"
                value={notifTitle} onChange={e => setNotifTitle(e.target.value)} maxLength={80}
                className="px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
              <textarea placeholder="Message body (e.g. The Olympiad challenge is now live — log in and compete!)"
                value={notifBody} onChange={e => setNotifBody(e.target.value)} maxLength={200} rows={3}
                className="px-4 py-2.5 rounded-xl text-white text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)' }} />
              <button onClick={sendAnnouncement} disabled={notifStatus === 'sending' || !notifTitle.trim() || !notifBody.trim()}
                className="px-6 py-2.5 rounded-xl font-bold text-white cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                {notifStatus === 'sending' ? '⏳ Sending…' : notifStatus === 'sent' ? '✅ Sent!' : notifStatus === 'error' ? '❌ Error — check setup' : '📣 Send to All Students'}
              </button>
              {notifStatus === 'error' && <p className="text-red-400 text-xs">Failed to send. No students may have accepted notifications yet, or check Vercel logs for API errors.</p>}
              <p className="text-purple-500 text-xs">Only students who installed the app and accepted notifications will receive this.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
