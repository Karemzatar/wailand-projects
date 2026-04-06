const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : ''; // Use relative path if deployed alongside backend

// DOM Elements
const views = {
    landing: document.getElementById('landing-view'),
    admin: document.getElementById('admin-view'),
    project: document.getElementById('project-view'),
};

const headerNav = document.getElementById('header-nav');
const logoutBtn = document.getElementById('logout-btn');

// Login Elements
const loginForm = document.getElementById('login-form');
const projectCodeInput = document.getElementById('project-code-input');
const loginError = document.getElementById('login-error');

// Admin Elements
const projectsContainer = document.getElementById('projects-container');
const showCreateProjectBtn = document.getElementById('show-create-project-btn');

// Project View Elements
const backBtn = document.getElementById('back-btn');
const pv = {
    name: document.getElementById('pv-name'),
    status: document.getElementById('pv-status'),
    username: document.getElementById('pv-username'),
    usermail: document.getElementById('pv-usermail'),
    usernumber: document.getElementById('pv-usernumber'),
    deadline: document.getElementById('pv-deadline'),
    price: document.getElementById('pv-price'),
    files: document.getElementById('pv-files'),
    code: document.getElementById('pv-code'),
    updatesList: document.getElementById('pv-updates-list'),
};

// Modal Elements
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalTitle = document.getElementById('modal-title');

// Current State
let currentRole = null; // 'admin' or 'user'
let currentProjects = [];

// --- UTILS --- //

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const switchView = (viewName) => {
    Object.values(views).forEach(view => view.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    
    if (viewName !== 'landing') {
        headerNav.classList.remove('hidden');
    } else {
        headerNav.classList.add('hidden');
    }
};

const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const renderStatusBadgeClass = (status) => {
    return `status-${status.replace(/\s+/g, '')}`;
};

// --- API CALLS --- //

const fetchAdminProjects = async () => {
    try {
        const res = await fetch(`${API_URL}/projects`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        currentProjects = await res.json();
        renderAdminProjects();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

const fetchProjectDetails = async (code) => {
    try {
        const res = await fetch(`${API_URL}/project/${code}`);
        if (!res.ok) throw new Error('Invalid Project Code');
        const project = await res.json();
        renderProjectView(project);
        switchView('project');
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
    }
};

const saveProject = async (projectData, code = null) => {
    try {
        const url = code ? `${API_URL}/project/${code}` : `${API_URL}/project`;
        const method = code ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        
        if (!res.ok) throw new Error('Failed to save project');
        
        showToast(`Project ${code ? 'updated' : 'created'} successfully!`);
        closeModal();
        fetchAdminProjects();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

const deleteProject = async (code) => {
    if(!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
        const res = await fetch(`${API_URL}/project/${code}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Failed to delete project');
        
        showToast('Project deleted successfully!');
        fetchAdminProjects();
    } catch (err) {
        showToast(err.message, 'error');
    }
};

// --- RENDERERS --- //

const renderAdminProjects = () => {
    projectsContainer.innerHTML = '';
    if (currentProjects.length === 0) {
        projectsContainer.innerHTML = '<p class="text-muted w-100">No projects found. Create one!</p>';
        return;
    }
    
    currentProjects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card glass-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${p.name || 'Untitled'}</h3>
                <span class="status-badge ${renderStatusBadgeClass(p.status)}">${p.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Code:</strong> <span class="code-font" style="font-size: 0.75rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.code}</span></p>
                <p><strong>Client:</strong> ${p.userName || 'N/A'}</p>
                <p><strong>Deadline:</strong> ${formatDate(p.deadline)}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-outline edit-btn">Edit</button>
                <button class="btn btn-danger delete-btn">Delete</button>
            </div>
        `;
        
        card.querySelector('.edit-btn').addEventListener('click', () => openModal(p));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteProject(p.code));
        
        projectsContainer.appendChild(card);
    });
};

const renderProjectView = (p) => {
    pv.name.textContent = p.name;
    pv.status.textContent = p.status;
    pv.status.className = `status-badge ${renderStatusBadgeClass(p.status)}`;
    
    pv.username.textContent = p.userName || 'N/A';
    pv.usermail.textContent = p.userMail || 'N/A';
    pv.usernumber.textContent = p.userNumber || 'N/A';
    
    pv.deadline.textContent = formatDate(p.deadline);
    pv.price.textContent = p.price || '0';
    
    if (p.files) {
        // Simple link generation if it's a URL, or just text
        pv.files.innerHTML = p.files.split(',').map(f => {
            f = f.trim();
            if (f.startsWith('http')) return `<a href="${f}" target="_blank" style="color:var(--primary)">${f}</a>`;
            return f;
        }).join(', ');
    } else {
        pv.files.textContent = 'None provided';
    }
    
    pv.code.textContent = p.code;
    
    // Updates
    pv.updatesList.innerHTML = '';
    if (!p.updates || p.updates.length === 0) {
        pv.updatesList.innerHTML = '<p class="text-muted">No updates yet.</p>';
    } else {
        // Show newest first
        const sortedUpdates = [...p.updates].reverse();
        sortedUpdates.forEach(u => {
            const el = document.createElement('div');
            el.className = 'update-item';
            el.innerHTML = `
                <div class="update-date">${formatDateTime(u.date)}</div>
                <div class="update-text">${u.text}</div>
            `;
            pv.updatesList.appendChild(el);
        });
    }
};

// --- MODAL & FORMS LOGIC --- //

const openModal = (project = null) => {
    projectForm.reset();
    if (project) {
        modalTitle.textContent = 'Edit Project';
        document.getElementById('form-project-code').value = project.code;
        document.getElementById('form-name').value = project.name || '';
        document.getElementById('form-username').value = project.userName || '';
        document.getElementById('form-usermail').value = project.userMail || '';
        document.getElementById('form-usernumber').value = project.userNumber || '';
        document.getElementById('form-deadline').value = project.deadline || '';
        document.getElementById('form-price').value = project.price || '';
        document.getElementById('form-status').value = project.status || 'Pending';
        document.getElementById('form-files').value = project.files || '';
    } else {
        modalTitle.textContent = 'Create New Project';
        document.getElementById('form-project-code').value = '';
    }
    projectModal.classList.remove('hidden');
};

const closeModal = () => {
    projectModal.classList.add('hidden');
};

// --- EVENT LISTENERS --- //

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const input = projectCodeInput.value.trim();
    
    if (input === 'wailandadmin') {
        currentRole = 'admin';
        switchView('admin');
        fetchAdminProjects();
        showToast('Welcome, Admin');
    } else if (input.length === 32) {
        currentRole = 'user';
        fetchProjectDetails(input);
    } else {
        loginError.textContent = 'Invalid code. Must be 32 characters or admin pass.';
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    currentRole = null;
    projectCodeInput.value = '';
    switchView('landing');
});

backBtn.addEventListener('click', () => {
    if (currentRole === 'admin') {
        switchView('admin');
    } else {
        currentRole = null;
        projectCodeInput.value = '';
        switchView('landing');
    }
});

showCreateProjectBtn.addEventListener('click', () => openModal(null));
closeModalBtn.addEventListener('click', closeModal);

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('form-project-code').value;
    
    const data = {
        name: document.getElementById('form-name').value,
        userName: document.getElementById('form-username').value,
        userMail: document.getElementById('form-usermail').value,
        userNumber: document.getElementById('form-usernumber').value,
        deadline: document.getElementById('form-deadline').value,
        price: parseFloat(document.getElementById('form-price').value) || 0,
        status: document.getElementById('form-status').value,
        files: document.getElementById('form-files').value
    };
    
    const newUpdate = document.getElementById('form-new-update').value.trim();
    if (newUpdate) {
        if (code) {
            data.newUpdate = newUpdate;
        } else {
            data.initialUpdate = newUpdate;
        }
    }
    
    saveProject(data, code || null);
});
