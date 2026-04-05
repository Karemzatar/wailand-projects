import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/projects/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || 'Login failed. Please try again.');
        return;
      }

      if (data.role === 'admin') {
        onLogin('admin', null);
      } else {
        onLogin('user', data.project);
      }
    } catch (err) {
      setError('Unable to reach server. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="h1 mb-2" style={{ marginBottom: '0.5rem' }}>Access Portal</h1>
        <p className="text-secondary mb-6" style={{ marginBottom: '2rem' }}>Enter your secure Project Code to continue.</p>
        
        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Project Code</label>
            <input 
              type="text" 
              placeholder="e.g. XyZ123!@#" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                style={{ color: 'var(--danger-color)', fontSize: '0.875rem', textAlign: 'left', padding: '0.5rem', background: '#fee2e2', borderRadius: 'var(--radius-md)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
