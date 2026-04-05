import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Mail, Settings, LogOut, Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const navItems = [
    { id: 'projects', label: 'Projects', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Access', icon: Users },
    { id: 'crm', label: 'CRM / Notes', icon: Search },
    { id: 'email', label: 'Email Threads', icon: Mail },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="h2" style={{ color: 'var(--primary-color)' }}>Wailand Admin</h2>
          <p className="text-xs">System Control Center</p>
        </div>
        
        <nav className="flex-col gap-2" style={{ flex: 1 }}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ background: activeTab === item.id ? 'var(--primary-color)' : 'transparent', color: activeTab === item.id ? 'white' : 'var(--text-secondary)' }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="nav-link" onClick={onLogout} style={{ marginTop: 'auto', color: 'var(--danger-color)' }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h1 className="h2">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          {activeTab === 'projects' && (
            <button 
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              New Project
            </button>
          )}
        </header>
        
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'projects' && <ProjectsView onEdit={setEditingProject} />}
          {activeTab === 'email' && <EmailManagementView />}
          {activeTab !== 'projects' && activeTab !== 'email' && (
            <div className="card">
              <p className="text-secondary">Module "{activeTab}" is currently under construction.</p>
            </div>
          )}
        </motion.div>

        {/* Create/Edit Project Modal */}
        {(showCreateModal || editingProject) && (
          <ProjectModal 
            project={editingProject} 
            onClose={() => {
              setShowCreateModal(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProjectsView({ onEdit }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setProjects(projects.filter(p => p._id !== projectId));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to delete project');
      }
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/projects');
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Failed to load projects');
        }

        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <p className="text-secondary">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '1.25rem' }}>
        <p style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4">
      <div className="card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }} className="text-sm">Project / Company</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }} className="text-sm">Access Code</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }} className="text-sm">Recipient</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }} className="text-sm">Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }} className="text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const expiryDate = p?.expiryDate ? new Date(p.expiryDate) : null;
              const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false;
              const statusLabel = isExpired ? 'Expired' : (p?.status || 'Active');

              return (
              <tr key={p?._id || p?.projectCode} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 500 }}>{p?.companyName || 'Project'}</div>
                  <div className="text-xs">{expiryDate ? `Expires ${expiryDate.toISOString().slice(0, 10)}` : ''}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', letterSpacing: '1px' }}>
                    {p?.projectCode}
                  </code>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>{p?.recipientName}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span className={`badge ${statusLabel === 'Active' ? 'badge-active' : 'badge-expired'}`}>
                    {statusLabel}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div className="flex gap-2">
                    <button 
                      className="text-sm" 
                      style={{ color: 'var(--primary-color)', background: 'none', padding: 0 }}
                      onClick={() => onEdit(p)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="text-sm" 
                      style={{ color: 'var(--danger-color)', background: 'none', padding: 0 }}
                      onClick={() => deleteProject(p._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  const [formData, setFormData] = useState({
    recipientName: project?.recipientName || '',
    recipientEmail: project?.recipientEmail || '',
    companyName: project?.companyName || '',
    phoneNumber: project?.phoneNumber || '',
    projectSupervisor: project?.projectSupervisor || '',
    expiryDate: project?.expiryDate ? new Date(project.expiryDate).toISOString().split('T')[0] : '',
    status: project?.status || 'Active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = project ? `/api/admin/projects/${project._id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        window.location.reload(); // Simple refresh to show updated data
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to save project');
      }
    } catch (err) {
      alert('Failed to save project');
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
        style={{ maxWidth: '500px', width: '90%' }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 className="h2">{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Recipient Name *</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                required
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Recipient Email *</label>
              <input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Project Supervisor *</label>
              <input
                type="text"
                value={formData.projectSupervisor}
                onChange={(e) => setFormData({...formData, projectSupervisor: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Expiry Date *</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                required
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2" style={{ marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="text-sm" style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} style={{ marginRight: '0.5rem' }} />Save Project</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EmailManagementView() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch('/api/emails/admin/all');
        const data = await res.json().catch(() => []);
        setEmails(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p className="text-secondary">Loading emails...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 className="h3">All Email Communications</h3>
        <p className="text-secondary">View all email threads across projects</p>
      </div>
      
      <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
        {emails.length ? (
          emails.map((email) => (
            <div
              key={email._id}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{email.subject}</span>
                  <span className={`badge ${email.status === 'sent' ? 'badge-active' : 'badge-expired'}`}>
                    {email.status}
                  </span>
                </div>
                <div className="text-sm text-secondary" style={{ marginBottom: '0.25rem' }}>
                  {email.direction === 'sent' ? `To: ${email.to}` : `From: ${email.from}`}
                </div>
                <div className="text-xs text-secondary">
                  Project: {email.projectId?.projectCode || 'Unknown'} • 
                  {formatDate(email.createdAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-xs text-secondary">
                  {email.projectId?.recipientName || 'Unknown Client'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Mail size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <p className="text-secondary">No email communications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toISOString().slice(0, 10);
}
