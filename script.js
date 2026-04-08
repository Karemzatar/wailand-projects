const app = document.getElementById("app");

// الصفحة الرئيسية
function showHome() {
  app.innerHTML = `
    <div class="container">
      <h2>Enter Project Code</h2>
      <input id="code" placeholder="Project Code"/>
      <button onclick="checkCode()">Enter</button>
      <p id="error"></p>
    </div>
  `;
}

async function checkCode() {
  const code = document.getElementById("code").value;

  if (code === "wailandadmin") {
    showAdmin();
    return;
  }

  const res = await fetch(`/project/${encodeURIComponent(code)}`);
  if (!res.ok) {
    document.getElementById("error").innerText = "Invalid Code";
    return;
  }

  const data = await res.json();
  showProject(data);
}

// عرض مشروع
function showProject(p) {
  app.innerHTML = `
    <div class="container">
      <h2>${p.name}</h2>

      <div class="card">
        <p><b>Email:</b> ${p.email}</p>
        <p><b>User:</b> ${p.username}</p>
        <p><b>Phone:</b> ${p.number}</p>
        <p><b>Deadline:</b> ${p.deadline}</p>
        <p><b>Price:</b> ${p.price}</p>
        <p><b>Status:</b> ${p.status}</p>

        <h3>Files</h3>
        ${(p.files || []).map(f => `<p>${f}</p>`).join("")}

        <h3>Updates</h3>
        ${(p.updates || []).map(u => `<p>- ${u}</p>`).join("")}
      </div>

      <button onclick="showHome()">Back</button>
    </div>
  `;
}

// الأدمن
async function showAdmin() {
  const res = await fetch("/projects");
  const projects = await res.json();

  app.innerHTML = `
    <div class="container">
      <h2>Admin Dashboard</h2>

      <button onclick="createProjectForm()">Create Project</button>

      ${projects.map(p => `
        <div class="card">
          <b>${p.name}</b>
          <p>Code: ${p.code}</p>
          <button onclick="deleteProject('${p.code}')" class="small-btn">Delete</button>
        </div>
      `).join("")}

      <button onclick="showHome()">Back</button>
    </div>
  `;
}

// نموذج إنشاء مشروع
function createProjectForm() {
  app.innerHTML = `
    <div class="container">
      <h2>Create New Project</h2>

      <div class="card">
        <div class="grid">
          <input id="name" placeholder="Project Name">
          <input id="email" placeholder="User Email">
          <input id="username" placeholder="User Name">
          <input id="number" placeholder="Phone Number">
          <input id="deadline" placeholder="Deadline">
          <input id="price" placeholder="Price">
        </div>

        <input id="status" placeholder="Status">
        <textarea id="files" placeholder="Files / Links (comma separated)"></textarea>

        <button onclick="submitProject()">Create Project</button>
      </div>

      <button onclick="showAdmin()">Back</button>
    </div>
  `;
}

// إنشاء مشروع
async function submitProject() {
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    username: document.getElementById("username").value,
    number: document.getElementById("number").value,
    deadline: document.getElementById("deadline").value,
    price: document.getElementById("price").value,
    status: document.getElementById("status").value,
    files: document.getElementById("files").value.split(","),
  };

  await fetch("/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  showAdmin();
}

// حذف
async function deleteProject(code) {
  await fetch(`/project/${encodeURIComponent(code)}`, { method: "DELETE" });
  showAdmin();
}

// تشغيل
showHome();