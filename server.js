const express = require("express");
const app = express();
const PORT = 4343;

app.use(express.json());
app.use(express.static(__dirname));

let projects = [];

// توليد كود عشوائي
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let code = "";
  for (let i = 0; i < 32; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// routes
app.get("/projects", (req, res) => {
  res.json(projects);
});

app.get("/project/:code", (req, res) => {
  const project = projects.find(p => p.code === req.params.code);
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json(project);
});

app.post("/project", (req, res) => {
  const newProject = {
    code: generateCode(),
    ...req.body,
    updates: []
  };
  projects.push(newProject);
  res.json(newProject);
});

app.put("/project/:code", (req, res) => {
  const project = projects.find(p => p.code === req.params.code);
  if (!project) return res.status(404).json({ error: "Not found" });

  Object.assign(project, req.body);
  res.json(project);
});

app.delete("/project/:code", (req, res) => {
  projects = projects.filter(p => p.code !== req.params.code);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:4343");
});