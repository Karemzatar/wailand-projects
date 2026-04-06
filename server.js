// server/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'projects.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // إذا عندك ملفات ثابتة في public

// Helper: Read data
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Helper: Write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Helper: Generate 32-char code
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let code = '';
  code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  code += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  code += '0123456789'[Math.floor(Math.random() * 10)];
  code += '!@#$%^&*()-_=+'[Math.floor(Math.random() * 14)];
  for (let i = code.length; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.split('').sort(() => 0.5 - Math.random()).join('');
};

// ===== Routes =====

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = readData();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single project by code
app.get('/api/project/:code', (req, res) => {
  try {
    const projects = readData();
    const project = projects.find(p => p.code === req.params.code);
    if (project) res.json(project);
    else res.status(404).json({ message: 'Project not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new project
app.post('/api/project', (req, res) => {
  try {
    const projects = readData();
    const newProject = {
      code: generateCode(),
      name: req.body.name || 'Untitled Project',
      userMail: req.body.userMail || '',
      userName: req.body.userName || '',
      userNumber: req.body.userNumber || '',
      deadline: req.body.deadline || '',
      price: req.body.price || 0,
      status: req.body.status || 'Pending',
      files: req.body.files || '',
      updates: [],
      createdAt: new Date().toISOString()
    };
    if (req.body.initialUpdate) {
      newProject.updates.push({ date: new Date().toISOString(), text: req.body.initialUpdate });
    }
    projects.push(newProject);
    writeData(projects);
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a project
app.put('/api/project/:code', (req, res) => {
  try {
    const projects = readData();
    const index = projects.findIndex(p => p.code === req.params.code);
    if (index !== -1) {
      const project = projects[index];
      project.name = req.body.name ?? project.name;
      project.userMail = req.body.userMail ?? project.userMail;
      project.userName = req.body.userName ?? project.userName;
      project.userNumber = req.body.userNumber ?? project.userNumber;
      project.deadline = req.body.deadline ?? project.deadline;
      project.price = req.body.price ?? project.price;
      project.status = req.body.status ?? project.status;
      project.files = req.body.files ?? project.files;
      if (req.body.newUpdate) {
        project.updates.push({ date: new Date().toISOString(), text: req.body.newUpdate });
      }
      projects[index] = project;
      writeData(projects);
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a project
app.delete('/api/project/:code', (req, res) => {
  try {
    let projects = readData();
    const initialLength = projects.length;
    projects = projects.filter(p => p.code !== req.params.code);
    if (projects.length < initialLength) {
      writeData(projects);
      res.json({ message: 'Project deleted successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});