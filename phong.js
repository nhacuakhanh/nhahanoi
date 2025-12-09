const baseId = localStorage.getItem("currentBaseId");
const floorId = localStorage.getItem("currentFloorId");
const roomList = document.getElementById("roomList");

function addRoom() {
  const name = document.getElementById("roomName").value.trim();
  if (!name) return alert("Nhập tên phòng!");

  StorageAPI.addRoom(baseId, floorId, name);
  document.getElementById("roomName").value = "";
  loadRooms();
}

function loadRooms() {
  const rooms = StorageAPI.getRooms(baseId, floorId);
  roomList.innerHTML = "";

  rooms.forEach(r => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <div class="list-title">${r.name}</div>
      <div class="list-arrow">›</div>
    `;
    li.onclick = () => {
      localStorage.setItem("currentRoomId", r.id);
      location.href = "khach.html";
    };
    roomList.appendChild(li);
  });
}

function backPage() {
  location.href = "tang.html";
}

loadRooms();
