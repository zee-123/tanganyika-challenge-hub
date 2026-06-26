import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  doc, onSnapshot, updateDoc, setDoc, increment, arrayUnion,
  collection, query, orderBy, limit,
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
  questionsAnswered: 0,
  correctAnswers: 0,
  badges: [],
};

export function GameProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Real-time listener on the current user's stats
  useEffect(() => {
    if (!currentUser) {
      setStats(EMPTY_STATS);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    const unsub = onSnapshot(doc(db, 'stats', currentUser.uid), (snap) => {
      if (snap.exists()) {
        setStats(snap.data());
      } else {
        setStats(EMPTY_STATS);
      }
      setStatsLoading(false);
    });
    return unsub;
  }, [currentUser]);

  // Real-time leaderboard — top 50 by totalPoints
  useEffect(() => {
    const q = query(collection(db, 'stats'), orderBy('totalPoints', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setLeaderboard(
        snap.docs.map((d, i) => ({ uid: d.id, ...d.data(), rank: i + 1 }))
      );
    });
    return unsub;
  }, []);

  const addPoints = useCallback(async (subject, pts, correctCount = 1) => {
    if (!currentUser) return;

    const subjectKey = `${subject}Points`;
    const currentSubjectPts = (stats[subjectKey] || 0) + pts;

    // Determine newly earned badges
    const subjectBadges = BADGES[subject] || [];
    const currentBadges = stats.badges || [];
    const newBadges = subjectBadges.filter(
      badge => currentSubjectPts >= badge.points && !currentBadges.find(b => b.id === badge.id)
    ).map(b => ({ ...b, earnedAt: new Date().toISOString() }));

    const ref = doc(db, 'stats', currentUser.uid);
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

  const logout = async () => {
    await signOut(auth);
  };

  const student = currentUser && userProfile
    ? { uid: currentUser.uid, ...userProfile }
    : null;

  return (
    <GameContext.Provider value={{
      student,
      stats,
      statsLoading,
      addPoints,
      getRank,
      leaderboard,
      logout,
      BADGES,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
