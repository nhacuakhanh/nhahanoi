const baseName = document.getElementById("baseName");
const baseList = document.getElementById("baseList");

baseName.addEventListener("keydown", e => {
  if (e.key === "Enter") addBase();
});

function addBase() {
  const name = baseName.value.trim();
  if (!name) return alert("Nhập tên cơ sở!");

  StorageAPI.addBase(name);
  baseName.value = "";
  loadBases();
}

function loadBases() {
  const bases = StorageAPI.getBases();
  baseList.innerHTML = "";

  bases.forEach(b => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <div class="list-title">${b.name}</div>
      <div class="list-arrow">›</div>
    `;
    li.onclick = () => {
      localStorage.setItem("currentBaseId", b.id);
      location.href = "tang.html";
    };
    baseList.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem("session");
  location.href = "index.html";
}

loadBases();
