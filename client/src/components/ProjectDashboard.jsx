import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle, Clock, FileText, Send, Paperclip, Plus, Reply, Mail, X } from 'lucide-react';

export default function ProjectDashboard({ project, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'updates', label: 'Notes & Updates' },
    { id: 'emails', label: 'Email Threads' },
  ];

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      {/* Header top bar */}
      <header style={{ background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="h3">Wailand Access</h1>
            <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }}></div>
            <span className="text-secondary" style={{ fontWeight: 500 }}>{project.recipientName}</span>
          </div>
          <button className="nav-link" onClick={onLogout} style={{ color: 'var(--danger-color)', padding: '0.5rem' }}>
            <LogOut size={18} />
            Exit Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '2rem' }}>
        {/* Project Header Card */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(to right, #0f172a, #1e293b)', color: 'white', border: 'none' }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs" style={{ color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Project</div>
              <h2 className="h1" style={{ color: 'white', marginBottom: '0.5rem' }}>Next-Gen Web Platform</h2>
              <p style={{ color: '#cbd5e1' }}>Project Code: <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{project.projectCode}</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-sm" style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>Status</div>
              <div className="flex items-center gap-2" style={{ color: '#34d399', fontWeight: 500 }}>
                <CheckCircle size={18} />
                On Track
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
                borderRadius: '0',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab project={project} />}
          {activeTab === 'updates' && <UpdatesTab project={project} />}
          {activeTab === 'emails' && <EmailsTab project={project} />}
        </motion.div>
      </main>
    </div>
  );
}

function OverviewTab({ project }) {
  const details = {
    clientName: project?.recipientName || '-',
    company: project?.companyName || '-',
    supervisor: project?.projectSupervisor || '-',
    startDate: formatDate(project?.createdAt),
    expectedDelivery: formatDate(project?.expiryDate),
  };

  const activity = Array.isArray(project?.activityLog) ? project.activityLog : [];
  const recent = activity
    .slice(-3)
    .reverse()
    .map((item) => ({
      action: item?.action || '',
      time: formatRelativeDate(item?.date),
    }));

  return (
    <div className="flex gap-6">
      {/* Left Column */}
      <div className="flex-col gap-6" style={{ flex: 2 }}>
        <div className="card">
          <h3 className="h3" style={{ marginBottom: '1rem' }}>Project Details</h3>
          <div className="flex-col gap-4">
            <DetailRow label="Client Name" value={details.clientName} />
            <DetailRow label="Company" value={details.company} />
            <DetailRow label="Supervisor" value={details.supervisor} />
            <DetailRow label="Start Date" value={details.startDate} />
            <DetailRow label="Expected Delivery" value={details.expectedDelivery} />
          </div>
        </div>
      </div>
      
      {/* Right Column */}
      <div className="flex-col gap-6" style={{ flex: 1 }}>
        <div className="card">
          <h3 className="h3" style={{ marginBottom: '1rem' }}>Recent Activity</h3>
          <div className="flex-col gap-4">
            {recent.length ? (
              recent.map((item, idx) => (
                <ActivityItem key={`${item.action}-${idx}`} time={item.time} action={item.action} />
              ))
            ) : (
              <p className="text-secondary" style={{ padding: '0.5rem 0' }}>
                No activity yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
      <span className="text-secondary">{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ActivityItem({ time, action }) {
  return (
    <div className="flex items-start gap-3">
      <div style={{ marginTop: '0.25rem', color: 'var(--primary-color)' }}>
        <Clock size={16} />
      </div>
      <div>
        <div className="text-sm" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{action}</div>
        <div className="text-xs">{time}</div>
      </div>
    </div>
  );
}

function UpdatesTab({ project }) {
  const notes = Array.isArray(project?.notes) ? project.notes : [];
  const sortedNotes = notes
    .slice()
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0))
    .slice(0, 6);

  return (
    <div className="card">
      <h3 className="h3" style={{ marginBottom: '1.5rem' }}>CRM Notes & Updates</h3>
      <div className="flex-col gap-4" style={{ marginBottom: '2rem' }}>
        {sortedNotes.length ? (
          sortedNotes.map((note, idx) => (
            <div
              key={`${note?.content || 'note'}-${idx}`}
              style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--primary-color)',
              }}
            >
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{note?.author || 'Unknown'}</span>
                <span className="text-xs">{formatDate(note?.date)}</span>
              </div>
              <p className="text-secondary text-sm" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {note?.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-secondary" style={{ padding: '0.5rem 0' }}>
            No notes yet.
          </p>
        )}
      </div>
    </div>
  );
}

function EmailsTab({ project }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const projectId = project._id || 'mock-project-id';
        const res = await fetch(`/api/emails/project/${projectId}`);
        const data = await res.json().catch(() => []);
        setEmails(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [project]);

  if (loading) {
    return (
      <div className="card">
        <p className="text-secondary">Loading emails...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '600px' }}>
      {/* Email List */}
      <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="h3" style={{ margin: 0 }}>Inbox</h3>
          <button 
            className="btn-primary" 
            onClick={() => setShowCompose(true)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Compose
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {emails.length ? (
            emails.map((email) => (
              <div
                key={email._id}
                onClick={() => setSelectedEmail(email)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  background: selectedEmail?._id === email._id ? '#f1f5f9' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {email.direction === 'sent' ? `To: ${email.to}` : `From: ${email.from}`}
                  </span>
                  <span className="text-xs">
                    {formatRelativeDate(email.sentAt || email.receivedAt || email.createdAt)}
                  </span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{email.subject}</div>
                <div className="text-xs text-secondary" style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  maxWidth: '300px'
                }}>
                  {email.body}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`badge ${email.status === 'sent' ? 'badge-active' : 'badge-expired'}`}>
                    {email.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <Mail size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <p className="text-secondary">No emails yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {selectedEmail ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="h3" style={{ margin: 0, marginBottom: '0.5rem' }}>{selectedEmail.subject}</h3>
              <div className="text-sm text-secondary">
                {selectedEmail.direction === 'sent' ? `To: ${selectedEmail.to}` : `From: ${selectedEmail.from}`}
                <span style={{ margin: '0 0.5rem' }}>•</span>
                {formatDate(selectedEmail.sentAt || selectedEmail.receivedAt || selectedEmail.createdAt)}
              </div>
            </div>
            
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>
                {selectedEmail.body}
              </p>
            </div>
            
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <Reply size={16} style={{ marginRight: '0.5rem' }} />
                Reply
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <FileText size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <p className="text-secondary">Select an email to view</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeEmail 
          project={project}
          onClose={() => setShowCompose(false)}
          onSend={() => {
            setShowCompose(false);
            // Refresh emails
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toISOString().slice(0, 10);
}

function formatRelativeDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  return d.toISOString().slice(0, 10);
}

function ComposeEmail({ project, onClose, onSend }) {
  const [formData, setFormData] = useState({
    to: project?.recipientEmail || '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectId = project._id || 'mock-project-id';
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...formData
        })
      });

      if (res.ok) {
        onSend();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to send email');
      }
    } catch (err) {
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ maxWidth: '600px', width: '90%' }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 className="h2">Compose Email</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>To *</label>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Message *</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              required
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          <div className="flex gap-2" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="text-sm" style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : <><Send size={16} style={{ marginRight: '0.5rem' }} />Send Email</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
