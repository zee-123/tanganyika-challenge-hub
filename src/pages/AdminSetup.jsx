import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Change this PIN before deploying — only share with school admin
const ADMIN_PIN = 'TSA2026';

export default function AdminSetup() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error

  if (!currentUser) return null;
  if (userProfile?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-white font-bold text-lg">You are already an admin!</p>
          <button onClick={() => navigate('/admin')}
            className="mt-4 px-6 py-2 rounded-xl text-white font-semibold cursor-pointer"
            style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
            Go to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.trim() !== ADMIN_PIN) { setStatus('error'); return; }
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
      setStatus('success');
      setTimeout(() => navigate('/admin'), 1500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 w-full max-w-sm text-center"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(20px)' }}>
        <div className="text-5xl mb-4">🛡️</div>
        <h1 className="font-poppins font-black text-white text-xl mb-1">Admin Setup</h1>
        <p className="text-purple-300 text-sm mb-6">Enter the admin PIN to gain access</p>

        {status === 'success' ? (
          <div className="text-green-400 font-bold">✅ Admin access granted! Redirecting…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Admin PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setStatus('idle'); }}
              className="w-full px-4 py-3 rounded-xl text-white text-center text-lg font-bold outline-none mb-3"
              style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${status === 'error' ? '#f87171' : 'rgba(168,85,247,0.4)'}` }}
              autoFocus
            />
            {status === 'error' && <p className="text-red-400 text-sm mb-3">Incorrect PIN. Try again.</p>}
            <button type="submit"
              className="w-full py-3 rounded-xl font-bold text-white cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              Unlock Admin Panel
            </button>
          </form>
        )}

        <p className="text-purple-500 text-xs mt-4">Logged in as: {userProfile?.name || currentUser.email}</p>
      </motion.div>
    </div>
  );
}
