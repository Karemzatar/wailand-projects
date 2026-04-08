const express = require("express");
const path = require("path");

const app = express();

// ✅ أهم تعديل (متوافق مع Render)
const PORT = process.env.PORT || 3000;

app.use(express.json());

// يخدم ملفات HTML/CSS/JS
app.use(express.static(path.join(__dirname)));

// بيانات مؤقتة (تنمسح عند إعادة التشغيل)
let projects = [];

// 🔐 توليد كود عشوائي
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let code = "";
  for (let i = 0; i < 32; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 📦 جميع المشاريع
app.get("/projects", (req, res) => {
  res.json(projects);
});

// 📄 مشروع واحد
app.get("/project/:code", (req, res) => {
  const project = projects.find(p => p.code === req.params.code);
  if (!project) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(project);
});

// ➕ إنشاء مشروع
app.post("/project", (req, res) => {
  const newProject = {
    code: generateCode(),
    ...req.body,
    updates: [],
    createdAt: new Date()
  };

  projects.push(newProject);
  res.json(newProject);
});

// ✏️ تعديل مشروع
app.put("/project/:code", (req, res) => {
  const project = projects.find(p => p.code === req.params.code);

  if (!project) {
    return res.status(404).json({ error: "Not found" });
  }

  Object.assign(project, req.body);

  // تسجيل تحديث
  project.updates.push({
    date: new Date(),
    changes: req.body
  });

  res.json(project);
});

// ❌ حذف مشروع
app.delete("/project/:code", (req, res) => {
  const index = projects.findIndex(p => p.code === req.params.code);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  projects.splice(index, 1);
  res.json({ success: true });
});

// 🟢 تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});