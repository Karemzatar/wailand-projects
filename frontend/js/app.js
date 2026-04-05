document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let currentUser = null;
    let currentProject = null;
    let allProjects = [];

    // --- DOM ELEMENTS ---
    const views = {
        login: document.getElementById('login-view'),
        admin: document.getElementById('admin-view'),
        project: document.getElementById('project-view')
    };

    // --- UTILS ---
    const showView = (viewName) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        if (views[viewName]) views[viewName].classList.remove('hidden');
    };

    const formatDate = (val) => {
        if (!val) return '-';
        const d = new Date(val);
        return isNaN(d) ? '-' : d.toISOString().slice(0, 10);
    };

    const formatRelativeDate = (val) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d)) return '';
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 60) return `${mins} minutes ago`;
        if (hrs < 24) return `${hrs} hours ago`;
        if (days === 1) return 'Yesterday';
        return d.toISOString().slice(0, 10);
    };

    // --- LOGIN ---
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('project-code').value.trim();
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        
        errorEl.classList.add('hidden');
        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/projects/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Login failed.');

            currentUser = data.role;
            if (currentUser === 'admin') {
                initAdmin();
                showView('admin');
            } else {
                currentProject = data.project;
                initProject();
                showView('project');
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Unable to reach server.';
            errorEl.classList.remove('hidden');
        } finally {
            btn.textContent = 'Enter Workspace';
            btn.disabled = false;
        }
    });

    const logout = () => {
        currentUser = null;
        currentProject = null;
        document.getElementById('project-code').value = '';
        showView('login');
    };

    document.getElementById('admin-logout').addEventListener('click', logout);
    document.getElementById('project-logout').addEventListener('click', logout);

    // --- ADMIN DASHBOARD ---
    const initAdmin = () => {
        loadAdminProjects();
        setupAdminTabs();
    };

    const setupAdminTabs = () => {
        const tabs = document.querySelectorAll('#admin-view .nav-link[data-tab]');
        tabs.forEach(t => t.addEventListener('click', (e) => {
            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
            const targetId = e.target.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');
            
            document.getElementById('admin-header-title').textContent = e.target.textContent;

            if (targetId === 'admin-emails') {
                loadAdminEmails();
            } else if (targetId === 'admin-projects') {
                loadAdminProjects();
            }
        }));
    };

    const loadAdminProjects = async () => {
        const tbody = document.getElementById('projects-table-body');
        try {
            const res = await fetch('/api/admin/projects');
            const data = await res.json();
            allProjects = Array.isArray(data) ? data : [];
            
            if (!allProjects.length) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-secondary">No projects found.</td></tr>`;
                return;
            }

            tbody.innerHTML = allProjects.map(p => {
                const exp = p.expiryDate ? new Date(p.expiryDate) : null;
                const isOver = exp && exp.getTime() < Date.now();
                const status = isOver ? 'Expired' : (p.status || 'Active');
                const badge = status === 'Active' ? 'badge-active' : 'badge-expired';

                return `
                    <tr>
                        <td>
                            <div class="font-medium">${p.companyName || 'Project'}</div>
                            <div class="text-xs text-secondary">${exp ? 'Expires ' + exp.toISOString().slice(0,10) : ''}</div>
                        </td>
                        <td><code class="mono-badge">${p.projectCode}</code></td>
                        <td>${p.recipientName}</td>
                        <td><span class="badge ${badge}">${status}</span></td>
                        <td>
                            <div class="flex gap-2">
                                <button class="btn-icon text-primary" onclick="editProject('${p._id}')">✎</button>
                                <button class="btn-icon text-danger" onclick="deleteProject('${p._id}')">🗑</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-danger">Failed to load projects.</td></tr>`;
        }
    };

    window.editProject = (id) => {
        const p = allProjects.find(x => x._id === id);
        if(!p) return;
        document.getElementById('modal-title').textContent = 'Edit Project';
        document.getElementById('proj-id').value = id;
        document.getElementById('proj-recipientName').value = p.recipientName || '';
        document.getElementById('proj-recipientEmail').value = p.recipientEmail || '';
        document.getElementById('proj-companyName').value = p.companyName || '';
        document.getElementById('proj-phoneNumber').value = p.phoneNumber || '';
        document.getElementById('proj-projectSupervisor').value = p.projectSupervisor || '';
        document.getElementById('proj-expiryDate').value = p.expiryDate ? p.expiryDate.split('T')[0] : '';
        document.getElementById('proj-status').value = p.status || 'Active';
        document.getElementById('project-modal').classList.remove('hidden');
    };

    window.deleteProject = async (id) => {
        if(!confirm('Are you sure you want to delete this project?')) return;
        try {
            await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
            loadAdminProjects();
        } catch(e) {
            alert('Failed to delete.');
        }
    };

    document.getElementById('btn-create-project').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Create New Project';
        document.getElementById('project-form').reset();
        document.getElementById('proj-id').value = '';
        document.getElementById('project-modal').classList.remove('hidden');
    });

    const closeModals = () => {
        document.getElementById('project-modal').classList.add('hidden');
        document.getElementById('compose-modal').classList.add('hidden');
    };

    document.getElementById('btn-close-modal').addEventListener('click', closeModals);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModals);
    document.getElementById('btn-close-compose').addEventListener('click', closeModals);
    document.getElementById('btn-cancel-compose').addEventListener('click', closeModals);

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const payload = {
            recipientName: document.getElementById('proj-recipientName').value,
            recipientEmail: document.getElementById('proj-recipientEmail').value,
            companyName: document.getElementById('proj-companyName').value,
            phoneNumber: document.getElementById('proj-phoneNumber').value,
            projectSupervisor: document.getElementById('proj-projectSupervisor').value,
            expiryDate: document.getElementById('proj-expiryDate').value,
            status: document.getElementById('proj-status').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/projects/${id}` : '/api/projects';

        try {
            const res = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                closeModals();
                loadAdminProjects();
            } else {
                alert('Save failed.');
            }
        } catch(e) {
            alert('Error saving.');
        }
    });

    const loadAdminEmails = async () => {
        const list = document.getElementById('admin-emails-list');
        try {
            const res = await fetch('/api/emails/admin/all');
            const data = await res.json();
            const emails = Array.isArray(data) ? data : [];
            
            if(!emails.length) {
                list.innerHTML = `<div class="p-6 text-center text-secondary">No emails yet.</div>`;
                return;
            }

            list.innerHTML = emails.map(e => `
                <div class="flex justify-between items-center p-4 border-bottom">
                    <div>
                        <div class="font-medium mb-1">${e.subject} <span class="badge ${e.status==='sent'?'badge-active':'badge-expired'}">${e.status}</span></div>
                        <div class="text-sm text-secondary">${e.direction==='sent'?'To: '+e.to:'From: '+e.from}</div>
                        <div class="text-xs text-secondary mt-1">Project: ${e.projectId?.projectCode || '-'} • ${formatDate(e.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        } catch(e) {
            list.innerHTML = `<div class="p-6 text-center text-danger">Failed to load emails.</div>`;
        }
    };

    // --- USER DASHBOARD ---
    const initProject = () => {
        const p = currentProject;
        document.getElementById('header-recipient').textContent = p.recipientName;
        document.getElementById('proj-top-company').textContent = p.companyName || 'Project';
        document.getElementById('proj-top-code').textContent = p.projectCode;
        
        const exp = p.expiryDate ? new Date(p.expiryDate) : null;
        let status = 'Active';
        if(exp && exp.getTime() < Date.now()) {
            status = 'Expired';
            document.getElementById('proj-top-status').className = 'text-danger font-medium';
        } else {
            status = p.status || 'Active';
            document.getElementById('proj-top-status').className = 'text-success font-medium';
        }
        document.getElementById('proj-top-status').textContent = status;

        // Overview
        document.getElementById('dtl-client').textContent = p.recipientName || '-';
        document.getElementById('dtl-company').textContent = p.companyName || '-';
        document.getElementById('dtl-supervisor').textContent = p.projectSupervisor || '-';
        document.getElementById('dtl-start').textContent = formatDate(p.createdAt);
        document.getElementById('dtl-expected').textContent = formatDate(p.expiryDate);

        const activityHtml = (p.activityLog || []).slice(-3).reverse().map(a => `
            <div class="flex items-start gap-3">
                <div class="text-primary mt-1">🕒</div>
                <div>
                    <div class="text-sm font-medium">${a.action}</div>
                    <div class="text-xs text-secondary">${formatRelativeDate(a.date)}</div>
                </div>
            </div>
        `).join('');
        document.getElementById('proj-activity-list').innerHTML = activityHtml || '<div class="text-secondary">No activity yet.</div>';

        // Notes
        const notesHtml = (p.notes || []).slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map(n => `
            <div class="p-4 bg-surface" style="background:#f8fafc; border-left:4px solid var(--primary-color);">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${n.author||'Unknown'}</span>
                    <span class="text-xs text-secondary">${formatDate(n.date)}</span>
                </div>
                <p class="text-sm text-secondary m-0" style="white-space:pre-wrap;">${n.content}</p>
            </div>
        `).join('');
        document.getElementById('proj-notes-list').innerHTML = notesHtml || '<div class="text-secondary">No notes yet.</div>';

        setupProjectTabs();
    };

    const setupProjectTabs = () => {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.addEventListener('click', (e) => {
            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.proj-tab-content').forEach(c => c.classList.add('hidden'));
            const targetId = e.target.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');

            if (targetId === 'proj-emails') {
                loadProjectEmails();
            }
        }));
    };

    let projectEmails = [];
    const loadProjectEmails = async () => {
        const list = document.getElementById('user-emails-list');
        list.innerHTML = `<div class="p-4 text-center">Loading...</div>`;
        try {
            const res = await fetch(`/api/emails/project/${currentProject._id}`);
            projectEmails = await res.json();
            
            if(!projectEmails.length) {
                list.innerHTML = `<div class="p-6 text-center text-secondary">No emails yet.</div>`;
                return;
            }

            list.innerHTML = projectEmails.map((e, i) => `
                <div class="p-4 border-bottom cursor-pointer hover-bg" onclick="viewEmail(${i})" style="cursor:pointer;">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-medium text-sm">${e.direction==='sent'?'To: '+e.to:'From: '+e.from}</span>
                        <span class="text-xs text-secondary">${formatRelativeDate(e.createdAt)}</span>
                    </div>
                    <div class="font-medium mb-1">${e.subject}</div>
                    <div class="text-xs text-secondary" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${e.body}</div>
                </div>
            `).join('');

        } catch(e) {
            list.innerHTML = `<div class="p-6 text-center text-danger">Failed to load emails.</div>`;
        }
    };

    window.viewEmail = (idx) => {
        const e = projectEmails[idx];
        if(!e) return;
        document.getElementById('user-email-empty').classList.add('hidden');
        document.getElementById('user-email-detail').classList.remove('hidden');
        document.getElementById('user-email-detail').classList.add('flex');
        
        document.getElementById('msg-subject').textContent = e.subject;
        document.getElementById('msg-sender').textContent = e.direction==='sent'?'To: '+e.to:'From: '+e.from;
        document.getElementById('msg-date').textContent = formatDate(e.createdAt);
        document.getElementById('msg-body').textContent = e.body;
    };

    document.getElementById('btn-compose').addEventListener('click', () => {
        document.getElementById('compose-form').reset();
        document.getElementById('compose-to').value = currentProject.recipientEmail || '';
        document.getElementById('compose-modal').classList.remove('hidden');
    });

    document.getElementById('compose-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-send-compose');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    projectId: currentProject._id,
                    to: document.getElementById('compose-to').value,
                    subject: document.getElementById('compose-subject').value,
                    body: document.getElementById('compose-body').value,
                })
            });
            if(res.ok) {
                closeModals();
                loadProjectEmails();
            } else {
                alert('Send failed.');
            }
        } catch(err) {
            alert('Error sending.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Email';
        }
    });

});
