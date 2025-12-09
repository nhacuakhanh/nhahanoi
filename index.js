const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener("click", login);

function login() {
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();

    if (!u || !p) return alert("Vui lòng nhập đầy đủ!");

    // Admin login
    if (u === "khanhchunha" && p === "khanh0311") {
        localStorage.setItem("session", JSON.stringify({ role: "admin" }));
        window.location.href = "admin.html";
        return;
    }

    // Guest login
    const found = StorageAPI.findGuestByPhone(u);
    if (!found) return alert("Không tìm thấy tài khoản khách!");

    if (p !== u) return alert("Mật khẩu khách phải bằng SĐT!");

    localStorage.setItem(
        "session",
        JSON.stringify({
            role: "guest",
            phone: u,
            baseId: found.baseId,
            floorId: found.floorId,
            roomId: found.roomId
        })
    );

    window.location.href = "khach.html";
}
