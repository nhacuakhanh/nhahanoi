// ===============================
// KHÁCH — V1.1 FULL (ADMIN/GUEST)
// ===============================

let session = JSON.parse(localStorage.getItem("session") || "{}");

const baseId  = session.baseId  || localStorage.getItem("currentBaseId");
const floorId = session.floorId || localStorage.getItem("currentFloorId");
const roomId  = session.roomId  || localStorage.getItem("currentRoomId");

const isGuest = session.role === "guest";

// Lấy dữ liệu khách
let guest = StorageAPI.getGuest(baseId, floorId, roomId) || {};

loadFields();
applyGuestMode();

// ---------------------
// Gán dữ liệu vào form
// ---------------------
function loadFields() {
    fullName.value = guest.fullName || "";
    phone.value = guest.phone || "";
    cccd.value = guest.cccd || "";
    rent.value = guest.rent || "";
    people.value = guest.people || "";
    vehicles.value = guest.vehicles || "";
    contractMonths.value = guest.contractMonths || "";
    startDate.value = guest.startDate || "";
    endDate.value = guest.endDate || "";

    svcWater.value = guest.svcWater || "";
    svcTrash.value = guest.svcTrash || "";
    svcWifi.value = guest.svcWifi || "";
    svcFilter.value = guest.svcFilter || "";
    svcWash.value = guest.svcWash || "";
    svcDry.value = guest.svcDry || "";
    svcClean.value = guest.svcClean || "";

    meterRoomOld.value = guest.meterRoomOld || "";
    meterRoomNew.value = guest.meterRoomNew || "";
    priceRoom.value = guest.priceRoom || "";

    meterCommonOld.value = guest.meterCommonOld || "";
    meterCommonNew.value = guest.meterCommonNew || "";
    priceCommon.value = guest.priceCommon || "";
}

// ---------------------
// GUEST MODE — khóa form
// ---------------------
function applyGuestMode() {
    if (!isGuest) return;
    
    const lockFields = [
        fullName, phone, cccd, rent, people, vehicles, contractMonths,
        startDate, svcWater, svcTrash, svcWifi, svcFilter, svcWash, svcDry, svcClean,
        priceRoom, priceCommon, meterCommonOld, meterCommonNew
    ];

    lockFields.forEach(el => el.setAttribute("readonly", true));

    btnSaveInfo.style.display = "none";
    btnDelete.style.display = "none";
    btnEdit.style.display = "none";
}

// ---------------------
// Lưu thông tin (Admin)
// ---------------------
btnSaveInfo.onclick = () => {
    guest = {
        fullName: fullName.value,
        phone: phone.value,
        cccd: cccd.value,
        rent: Number(rent.value),
        people: Number(people.value),
        vehicles: Number(vehicles.value),

        contractMonths: Number(contractMonths.value),
        startDate: startDate.value,
        endDate: endDate.value,

        svcWater: Number(svcWater.value),
        svcTrash: Number(svcTrash.value),
        svcWifi: Number(svcWifi.value),
        svcFilter: Number(svcFilter.value),
        svcWash: Number(svcWash.value),
        svcDry: Number(svcDry.value),
        svcClean: Number(svcClean.value),

        meterRoomOld: guest.meterRoomOld || 0,
        meterRoomNew: guest.meterRoomNew || 0,
        meterCommonOld: guest.meterCommonOld || 0,
        meterCommonNew: guest.meterCommonNew || 0,
        priceRoom: guest.priceRoom || 0,
        priceCommon: guest.priceCommon || 0
    };

    StorageAPI.saveGuest(baseId, floorId, roomId, guest);
    alert("Đã lưu thông tin!");
};

// ---------------------
// Chỉnh sửa (Admin)
// ---------------------
btnEdit.onclick = () => {
    document.querySelectorAll("input").forEach(el => {
        el.removeAttribute("readonly");
    });
};

// ---------------------
// Xóa khách
// ---------------------
btnDelete.onclick = () => {
    if (!confirm("Xóa khách này?")) return;
    StorageAPI.deleteGuest(baseId, floorId, roomId);
    alert("Đã xóa!");
    location.reload();
};

// ---------------------
// TÍNH TIỀN
// ---------------------
btnCalc.onclick = () => {
    const rOld = +meterRoomOld.value;
    const rNew = +meterRoomNew.value;
    const priceR = +priceRoom.value;

    const cOld = +meterCommonOld.value;
    const cNew = +meterCommonNew.value;
    const priceC = +priceCommon.value;

    const diffRoom = rNew - rOld;
    const diffCommon = cNew - cOld;

    // Tổng số người toàn cơ sở
    let totalPeople = 0;

    const floors = StorageAPI.getFloors(baseId);
    floors.forEach(f => {
        StorageAPI.getRooms(baseId, f.id).forEach(r => {
            const g = StorageAPI.getGuest(baseId, f.id, r.id);
            if (g) totalPeople += Number(g.people);
        });
    });

    const electricRoom = diffRoom * priceR;
    const commonPerPerson = (diffCommon * priceC) / (totalPeople || 1);
    const electricCommon = commonPerPerson * Number(people.value);

    const service = (
        guest.svcWater +
        guest.svcTrash +
        guest.svcFilter +
        guest.svcWash +
        guest.svcDry +
        guest.svcClean
    ) * Number(people.value) + guest.svcWifi;

    const total = guest.rent + electricRoom + electricCommon + service;

    // Lưu
    Object.assign(guest, {
        meterRoomOld: rOld,
        meterRoomNew: rNew,
        meterCommonOld: cOld,
        meterCommonNew: cNew,
        priceRoom: priceR,
        priceCommon: priceC,
        roomElectric: electricRoom,
        commonElectric: electricCommon,
        serviceTotal: service,
        total
    });

    StorageAPI.saveGuest(baseId, floorId, roomId, guest);

    resultBox.style.display = "block";
    resultText.innerHTML = `
        Điện phòng: <b>${vnd(electricRoom)}</b><br>
        Điện chung: <b>${vnd(electricCommon)}</b><br>
        Dịch vụ: <b>${vnd(service)}</b><br>
        <div style="margin-top:10px;font-size:18px;">
            Tổng tiền: <b>${vnd(total)}</b>
        </div>
    `;

    btnExportPDF.style.display = "block";
};

// -----------------------------
// PDF — MB BANK STYLE + QR
// -----------------------------
btnExportPDF.onclick = () => generatePDF(guest);

function generatePDF(guest) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(22);
    doc.text("HÓA ĐƠN TIỀN PHÒNG", 105, y, { align: "center" });
    y += 14;

    doc.setFontSize(14);
    doc.text(`Khách thuê: ${guest.fullName}`, 10, y); y += 8;
    doc.text(`SĐT: ${guest.phone}`, 10, y); y += 8;

    doc.text("-------- CHI TIẾT --------", 10, y); y += 8;

    doc.text(`Tiền phòng: ${vnd(guest.rent)}`, 10, y); y += 8;
    doc.text(`Điện phòng: ${vnd(guest.roomElectric)}`, 10, y); y += 8;
    doc.text(`Điện chung: ${vnd(guest.commonElectric)}`, 10, y); y += 8;
    doc.text(`Dịch vụ: ${vnd(guest.serviceTotal)}`, 10, y); y += 10;

    doc.setFontSize(16);
    doc.text(`TỔNG: ${vnd(guest.total)}`, 10, y); 
    y += 20;

    // QR GEN
    const qrUrl = `https://img.vietqr.io/image/mbbank-0200356789999-compact.png?amount=${guest.total}`;
    doc.addImage(qrUrl, "PNG", 60, y, 90, 90);
    y += 100;

    doc.setFontSize(12);
    doc.text("MB Bank - Nguyễn Gia Khánh", 105, y, { align: "center" });
    y += 6;
    doc.text("STK: 0200356789999", 105, y, { align: "center" });

    doc.save(`hoadon_${guest.phone}.pdf`);
}

function backPage() {
    if (isGuest) location.href = "index.html";
    else location.href = "phong.html";
      }
