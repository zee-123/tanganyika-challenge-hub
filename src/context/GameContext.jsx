import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  doc, onSnapshot, updateDoc, setDoc, getDoc, increment, arrayUnion,
  collection, query, orderBy, getDocs,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const BADGES = {
  english: [
    { id: 'grammar_explorer', name: 'Grammar Explorer', icon: '🥉', points: 50, color: '#CD7F32' },
    { id: 'grammar_champion', name: 'Grammar Champion', icon: '🥈', points: 150, color: '#C0C0C0' },
    { id: 'english_master', name: 'English Master', icon: '🥇', points: 300, color: '#FFD700' },
  ],
  math: [
    { id: 'math_cadet', name: 'Maths Cadet', icon: '🔢', points: 50, color: '#60A5FA' },
    { id: 'math_warrior', name: 'Maths Warrior', icon: '⚔️', points: 150, color: '#8B5CF6' },
    { id: 'math_legend', name: 'Maths Legend', icon: '🏆', points: 300, color: '#F59E0B' },
  ],
  science: [
    { id: 'junior_scientist', name: 'Junior Scientist', icon: '🔬', points: 50, color: '#34D399' },
    { id: 'senior_scientist', name: 'Senior Scientist', icon: '⚗️', points: 150, color: '#06B6D4' },
    { id: 'master_scientist', name: 'Master Scientist', icon: '🧬', points: 300, color: '#F472B6' },
  ],
  reading: [
    { id: 'bookworm', name: 'Bookworm', icon: '📖', points: 50, color: '#FBBF24' },
    { id: 'story_explorer', name: 'Story Explorer', icon: '📚', points: 150, color: '#F97316' },
    { id: 'reading_star', name: 'Reading Star', icon: '🌟', points: 300, color: '#EF4444' },
  ],
  spelling: [
    { id: 'speller', name: 'Speller', icon: '✏️', points: 50, color: '#86EFAC' },
    { id: 'word_wizard', name: 'Word Wizard', icon: '🔤', points: 150, color: '#34D399' },
    { id: 'spelling_champion', name: 'Spelling Champion', icon: '🐝', points: 300, color: '#059669' },
  ],
  sprint: [
    { id: 'quick_thinker', name: 'Quick Thinker', icon: '⚡', points: 50, color: '#FB923C' },
    { id: 'speed_demon', name: 'Speed Demon', icon: '🚀', points: 150, color: '#F43F5E' },
    { id: 'maths_sprinter', name: 'Maths Sprinter', icon: '💨', points: 300, color: '#A855F7' },
  ],
  knowledge: [
    { id: 'explorer_badge', name: 'Explorer', icon: '🌍', points: 50, color: '#38BDF8' },
    { id: 'scholar', name: 'Scholar', icon: '🧠', points: 150, color: '#818CF8' },
    { id: 'knowledge_king', name: 'Knowledge King', icon: '👑', points: 300, color: '#F59E0B' },
  ],
  stem: [
    { id: 'stem_explorer', name: 'STEM Explorer', icon: '🔭', points: 50, color: '#34D399' },
    { id: 'stem_scientist', name: 'STEM Scientist', icon: '⚗️', points: 150, color: '#10B981' },
    { id: 'stem_master', name: 'STEM Master', icon: '🚀', points: 300, color: '#00B09B' },
  ],
  olympiad: [
    { id: 'olympiad_contender', name: 'Olympiad Contender', icon: '🎗️', points: 50, color: '#A78BFA' },
    { id: 'olympiad_scholar', name: 'Olympiad Scholar', icon: '🥈', points: 150, color: '#7C3AED' },
    { id: 'olympiad_champion', name: 'Olympiad Champion', icon: '🏅', points: 300, color: '#764BA2' },
  ],
};

const EMPTY_STATS = {
  totalPoints: 0,
  englishPoints: 0,
  mathPoints: 0,
  sciencePoints: 0,
  readingPoints: 0,
  spellingPoints: 0,
  sprintPoints: 0,
  knowledgePoints: 0,
  stemPoints: 0,
  olympiadPoints: 0,
  weeklyPoints: 0,
  weeklyStart: '',
  questionsAnswered: 0,
  correctAnswers: 0,
  badges: [],
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function getPreviousWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
  const prevMonday = new Date(now);
  prevMonday.setDate(diff);
  return prevMonday.toISOString().split('T')[0];
}

function formatWeekRange(start) {
  const d = new Date(start + 'T00:00:00');
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${d.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`;
}

export function GameProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [weeklyChampion, setWeeklyChampion] = useState(null);

  // Real-time listener on current user's stats
  useEffect(() => {
    if (!currentUser) { setStats(EMPTY_STATS); setStatsLoading(false); return; }
    setStatsLoading(true);
    const unsub = onSnapshot(doc(db, 'stats', currentUser.uid), (snap) => {
      setStats(snap.exists() ? snap.data() : EMPTY_STATS);
      setStatsLoading(false);
    });
    return unsub;
  }, [currentUser]);

  // Real-time leaderboard — all students by totalPoints
  useEffect(() => {
    const q = query(collection(db, 'stats'), orderBy('totalPoints', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setLeaderboard(snap.docs.map((d, i) => ({ uid: d.id, ...d.data(), rank: i + 1 })));
    });
    return unsub;
  }, []);

  // Weekly champion: detect new week and crown last week's top scorer
  useEffect(() => {
    if (!leaderboard.length) return;
    const currentWeekStart = getWeekStart();

    getDoc(doc(db, 'config', 'weekly')).then((snap) => {
      const data = snap.exists() ? snap.data() : {};
      setWeeklyChampion(data.champion || null);

      if (data.weekStart === currentWeekStart) return;

      // New week detected — find last week's top scorer
      const prevWeekStart = getPreviousWeekStart();
      const prevEntries = leaderboard
        .filter(s => s.weeklyStart === prevWeekStart && (s.weeklyPoints || 0) > 0)
        .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));

      const champ = prevEntries[0];
      const newChampion = champ ? {
        uid: champ.uid,
        name: champ.name || 'Unknown',
        avatar: champ.avatar || '🎓',
        yearGroup: champ.yearGroup || '',
        points: champ.weeklyPoints || 0,
        weekOf: formatWeekRange(prevWeekStart),
      } : (data.champion || null);

      setDoc(doc(db, 'config', 'weekly'), {
        weekStart: currentWeekStart,
        champion: newChampion,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setWeeklyChampion(newChampion);
    }).catch(() => {});
  }, [leaderboard]);

  const addPoints = useCallback(async (subject, pts, correctCount = 1) => {
    if (!currentUser) return;

    const subjectKey = `${subject}Points`;
    const currentSubjectPts = (stats[subjectKey] || 0) + pts;
    const currentWeekStart = getWeekStart();

    // Badge detection
    const subjectBadges = BADGES[subject] || [];
    const currentBadges = stats.badges || [];
    const newBadges = subjectBadges
      .filter(b => currentSubjectPts >= b.points && !currentBadges.find(cb => cb.id === b.id))
      .map(b => ({ ...b, earnedAt: new Date().toISOString() }));

    // Principal's Digital Excellence Award — auto-awarded at 1000 total points
    const newTotalPoints = (stats.totalPoints || 0) + pts;
    if (newTotalPoints >= 1000 && !currentBadges.find(b => b.id === 'principal_excellence')) {
      newBadges.push({
        id: 'principal_excellence',
        name: "Principal's Digital Excellence Award",
        icon: '🎓',
        color: '#FFD700',
        earnedAt: new Date().toISOString(),
      });
    }

    const ref = doc(db, 'stats', currentUser.uid);
    const isNewWeek = stats.weeklyStart !== currentWeekStart;

    const update = {
      [subjectKey]: increment(pts),
      totalPoints: increment(pts),
      questionsAnswered: increment(correctCount),
      correctAnswers: increment(correctCount),
      updatedAt: new Date(),
      name: userProfile?.name || '',
      username: userProfile?.username || '',
      yearGroup: userProfile?.yearGroup || '',
      avatar: userProfile?.avatar || '🎓',
      weeklyStart: currentWeekStart,
      weeklyPoints: isNewWeek ? pts : increment(pts),
    };

    await updateDoc(ref, update);
    if (newBadges.length > 0) {
      await updateDoc(ref, { badges: arrayUnion(...newBadges) });
    }
  }, [currentUser, stats, userProfile]);

  const getRank = () => {
    const total = stats?.totalPoints || 0;
    if (total >= 1000) return { title: 'Legend', icon: '👑', color: '#FFD700' };
    if (total >= 500) return { title: 'Champion', icon: '🏆', color: '#C0C0C0' };
    if (total >= 200) return { title: 'Explorer', icon: '🌟', color: '#CD7F32' };
    if (total >= 50) return { title: 'Learner', icon: '📚', color: '#60A5FA' };
    return { title: 'Beginner', icon: '🌱', color: '#34D399' };
  };

  const logout = async () => { await signOut(auth); };

  const student = currentUser && userProfile
    ? { uid: currentUser.uid, ...userProfile }
    : null;

  const isAdmin = userProfile?.role === 'admin';

  // Weekly leaderboard: same data filtered to current week, sorted by weeklyPoints
  const currentWeekStart = getWeekStart();
  const weeklyLeaderboard = [...leaderboard]
    .filter(s => s.weeklyStart === currentWeekStart && (s.weeklyPoints || 0) > 0)
    .sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0))
    .map((s, i) => ({ ...s, weeklyRank: i + 1 }));

  return (
    <GameContext.Provider value={{
      student,
      stats,
      statsLoading,
      addPoints,
      getRank,
      leaderboard,
      weeklyLeaderboard,
      weeklyChampion,
      currentWeekStart,
      logout,
      BADGES,
      isAdmin,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
