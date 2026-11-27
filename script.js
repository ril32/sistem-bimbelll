// ==================== PENGATURAN AKUN LOGIN ====================
// Ubah username dan password di bawah ini sesuai yang kamu tentukan:
const ADMIN_CREDENTIALS = {
  username: "Nazril2502",       // <-- Username login
  password: "250206",        // <-- Password login
  displayName: "Admin Khasanah"
};

// ==================== PENYIMPANAN DATA (LOCALSTORAGE) ====================
const STORAGE_KEY = "bimbel_khasanah_db_v1";

// Struktur Database Awal
let db = {
  murid: [],      // { id, nama, jenjang, kelas, wa, spp }
  pembayaran: {}, // { "2026-11": { "muridId": true } }
  guru: [],       // { id, nama, mapel, skema, tarif }
  absensi: [],    // { id, tanggal, guruId, status: 'Hadir'|'Izin', catatan }
  gajiStatus: {}, // { "2026-11": { "guruId": true } }
  gajiManual: {}  // { "2026-11": { "guruId": jumlahSesiManual } }
};

function loadDatabase() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      db = JSON.parse(saved);
      if (!db.murid) db.murid = [];
      if (!db.pembayaran) db.pembayaran = {};
      if (!db.guru) db.guru = [];
      if (!db.absensi) db.absensi = [];
      if (!db.gajiStatus) db.gajiStatus = {};
      if (!db.gajiManual) db.gajiManual = {};
    } catch (e) {
      console.error("Gagal memuat database:", e);
    }
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ==================== LOGIN & LOGOUT ====================
function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById("input-username").value.trim();
  const pass = document.getElementById("input-password").value;
  const errorBox = document.getElementById("login-error");

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    errorBox.classList.add("hidden");
    localStorage.setItem("khasanah_logged_in", "true");
    showApp();
  } else {
    errorBox.classList.remove("hidden");
  }
}

function togglePassword() {
  const passInput = document.getElementById("input-password");
  const eyeIcon = document.getElementById("eye-icon");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passInput.type = "password";
    eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

function logout() {
  localStorage.removeItem("khasanah_logged_in");
  document.getElementById("input-username").value = "";
  document.getElementById("input-password").value = "";
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

function showApp() {
  document.getElementById("user-display-name").textContent = ADMIN_CREDENTIALS.displayName;
  document.getElementById("user-avatar").textContent = ADMIN_CREDENTIALS.displayName.charAt(0).toUpperCase();
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");
  renderAll();
}

// ==================== INISIALISASI HALAMAN ====================
window.addEventListener("DOMContentLoaded", () => {
  loadDatabase();

  // Set periode filter ke bulan & tahun saat ini
  const now = new Date();
  const bulanStr = String(now.getMonth() + 1).padStart(2, "0");
  const tahunStr = String(now.getFullYear());

  const selectBulan = document.getElementById("filter-bulan");
  const selectTahun = document.getElementById("filter-tahun");
  if (selectBulan) selectBulan.value = bulanStr;
  if ([...selectTahun.options].some(opt => opt.value === tahunStr)) {
    selectTahun.value = tahunStr;
  }

  // Set tanggal absensi ke hari ini
  const todayISO = now.toISOString().split("T")[0];
  document.getElementById("absensi-tanggal").value = todayISO;

  // Cek sesi login
  if (localStorage.getItem("khasanah_logged_in") === "true") {
    showApp();
  }
});

// ==================== NAVIGASI & HELPER ====================
function getPeriodeKey() {
  const b = document.getElementById("filter-bulan").value;
  const t = document.getElementById("filter-tahun").value;
  return `${t}-${b}`;
}

function getNamaBulan(kode) {
  const map = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
  };
  return map[kode] || kode;
}

function formatRupiah(angka) {
  return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function formatWaLink(nomor, pesan) {
  let clean = String(nomor).replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(pesan)}`;
}

function switchTab(tabName) {
  const tabs = ["dashboard", "murid", "absensi", "guru"];
  const titles = {
    dashboard: "Dashboard Keuangan Bimbel Khasanah",
    murid: "Data Murid & Pembayaran SPP",
    absensi: "Absensi Kehadiran & Izin Guru",
    guru: "Data Guru Les & Penggajian"
  };

  tabs.forEach(t => {
    document.getElementById(`tab-${t}`).classList.add("hidden");
    const navBtn = document.getElementById(`nav-${t}`);
    const mnavBtn = document.getElementById(`mnav-${t}`);
    if (navBtn) {
      navBtn.classList.remove("bg-indigo-600", "text-white");
      navBtn.classList.add("text-slate-300");
    }
    if (mnavBtn) {
      mnavBtn.classList.remove("text-indigo-600", "font-bold");
      mnavBtn.classList.add("text-slate-400");
    }
  });

  document.getElementById(`tab-${tabName}`).classList.remove("hidden");
  document.getElementById("page-title").textContent = titles[tabName];

  const activeNav = document.getElementById(`nav-${tabName}`);
  const activeMnav = document.getElementById(`mnav-${tabName}`);
  if (activeNav) {
    activeNav.classList.add("bg-indigo-600", "text-white");
    activeNav.classList.remove("text-slate-300");
  }
  if (activeMnav) {
    activeMnav.classList.add("text-indigo-600", "font-bold");
    activeMnav.classList.remove("text-slate-400");
  }

  renderAll();
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// ==================== MANAJEMEN MURID & SPP ====================
function saveMurid(event) {
  event.preventDefault();
  const nama = document.getElementById("murid-nama").value.trim();
  const jenjang = document.getElementById("murid-jenjang").value;
  const kelas = document.getElementById("murid-kelas").value.trim();
  const wa = document.getElementById("murid-wa").value.trim();
  const spp = Number(document.getElementById("murid-spp").value);

  db.murid.push({
    id: "m_" + Date.now(),
    nama,
    jenjang,
    kelas,
    wa,
    spp
  });

  saveDatabase();
  event.target.reset();
  closeModal("modal-murid");
  renderAll();
}

function toggleBayarMurid(muridId) {
  const periode = getPeriodeKey();
  if (!db.pembayaran[periode]) db.pembayaran[periode] = {};
  db.pembayaran[periode][muridId] = !db.pembayaran[periode][muridId];
  saveDatabase();
  renderAll();
}

function hapusMurid(muridId) {
  if (!confirm("Yakin ingin menghapus data murid ini?")) return;
  db.murid = db.murid.filter(m => m.id !== muridId);
  saveDatabase();
  renderAll();
}

function bukaNota(muridId) {
  const m = db.murid.find(item => item.id === muridId);
  if (!m) return;
  const b = document.getElementById("filter-bulan").value;
  const t = document.getElementById("filter-tahun").value;

  document.getElementById("nota-nama").textContent = m.nama;
  document.getElementById("nota-kelas").textContent = `${m.jenjang} - ${m.kelas}`;
  document.getElementById("nota-periode").textContent = `${getNamaBulan(b)} ${t}`;
  document.getElementById("nota-nominal").textContent = formatRupiah(m.spp);
  openModal("modal-nota");
}

function renderMurid() {
  const tbody = document.getElementById("table-murid-body");
  const periode = getPeriodeKey();
  const bayarBulanIni = db.pembayaran[periode] || {};

  const filterJenjang = document.getElementById("filter-jenjang").value;
  const filterStatus = document.getElementById("filter-status-spp").value;
  const keyword = document.getElementById("search-murid").value.toLowerCase();

  const b = document.getElementById("filter-bulan").value;
  const t = document.getElementById("filter-tahun").value;
  const labelPeriode = `${getNamaBulan(b)} ${t}`;

  const filtered = db.murid.filter(m => {
    const isLunas = !!bayarBulanIni[m.id];
    if (filterJenjang !== "SEMUA" && m.jenjang !== filterJenjang) return false;
    if (filterStatus === "LUNAS" && !isLunas) return false;
    if (filterStatus === "BELUM" && isLunas) return false;
    if (keyword && !m.nama.toLowerCase().includes(keyword)) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 text-xs">Belum ada data murid sesuai filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    const isLunas = !!bayarBulanIni[m.id];
    const badgeJenjang = m.jenjang === "SD" ? "bg-rose-100 text-rose-700" :
                         m.jenjang === "SMP" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700";

    const pesanWA = isLunas
      ? `Assalamu'alaikum Bapak/Ibu Wali Murid dari *${m.nama}* (${m.jenjang} - ${m.kelas}). Terima kasih, pembayaran SPP *Bimbel Khasanah* bulan *${labelPeriode}* sebesar *${formatRupiah(m.spp)}* telah kami terima (LUNAS).`
      : `Assalamu'alaikum Bapak/Ibu Wali Murid dari *${m.nama}* (${m.jenjang} - ${m.kelas}). Mengingatkan untuk pembayaran SPP *Bimbel Khasanah* bulan *${labelPeriode}* sebesar *${formatRupiah(m.spp)}*. Terima kasih.`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-3 font-bold text-slate-800">${m.nama}</td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeJenjang} mr-1">${m.jenjang}</span>
          <span class="text-slate-600">${m.kelas}</span>
        </td>
        <td class="py-3 px-3">
          <a href="${formatWaLink(m.wa, pesanWA)}" target="_blank"
             class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition">
            <i class="fa-brands fa-whatsapp text-sm"></i> ${m.wa}
          </a>
        </td>
        <td class="py-3 px-3 font-semibold text-slate-700">${formatRupiah(m.spp)}</td>
        <td class="py-3 px-3">
          <button onclick="toggleBayarMurid('${m.id}')"
            class="px-3 py-1 rounded-full text-xs font-bold transition ${isLunas ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}">
            ${isLunas ? '<i class="fa-solid fa-check mr-1"></i> Sudah Bayar' : '<i class="fa-solid fa-clock mr-1"></i> Belum Bayar'}
          </button>
        </td>
        <td class="py-3 px-3 text-right space-x-1">
          ${isLunas ? `<button onclick="bukaNota('${m.id}')" title="Cetak Nota" class="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><i class="fa-solid fa-receipt"></i></button>` : ''}
          <button onclick="hapusMurid('${m.id}')" title="Hapus Murid" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ==================== ABSENSI GURU (MASUK / IZIN) ====================
function catatAbsensi(guruId, status) {
  const tanggal = document.getElementById("absensi-tanggal").value;
  if (!tanggal) {
    alert("Pilih tanggal absensi terlebih dahulu!");
    return;
  }

  let catatan = "";
  if (status === "Izin") {
    catatan = prompt("Masukkan alasan izin guru (opsional):", "Izin berhalangan hadir") || "Izin";
  } else {
    catatan = "Hadir Mengajar";
  }

  // Cek apakah guru sudah diabsen pada tanggal tersebut -> timpa jika ada
  const existingIdx = db.absensi.findIndex(a => a.tanggal === tanggal && a.guruId === guruId);
  if (existingIdx !== -1) {
    db.absensi[existingIdx].status = status;
    db.absensi[existingIdx].catatan = catatan;
  } else {
    db.absensi.push({
      id: "abs_" + Date.now(),
      tanggal,
      guruId,
      status,
      catatan
    });
  }

  saveDatabase();
  renderAll();
}

function hapusAbsensi(absId) {
  db.absensi = db.absensi.filter(a => a.id !== absId);
  saveDatabase();
  renderAll();
}

function renderAbsensi() {
  const cardsContainer = document.getElementById("absensi-cards");
  const logBody = document.getElementById("table-absensi-log");
  const tanggalPilih = document.getElementById("absensi-tanggal").value;
  const periode = getPeriodeKey();

  if (db.guru.length === 0) {
    cardsContainer.innerHTML = `<div class="col-span-full text-center py-6 text-slate-400 text-xs">Belum ada data guru. Tambahkan guru di menu <strong>Data & Gaji Guru</strong> terlebih dahulu.</div>`;
  } else {
    cardsContainer.innerHTML = db.guru.map(g => {
      const absenHariIni = db.absensi.find(a => a.tanggal === tanggalPilih && a.guruId === g.id);
      const statusHariIni = absenHariIni ? absenHariIni.status : null;

      return `
        <div class="p-4 rounded-2xl border ${statusHariIni === 'Hadir' ? 'border-emerald-300 bg-emerald-50/40' : statusHariIni === 'Izin' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'} flex flex-col justify-between gap-3">
          <div>
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 text-sm">${g.nama}</h4>
              ${statusHariIni ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusHariIni === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${statusHariIni}</span>` : ''}
            </div>
            <p class="text-xs text-slate-500">${g.mapel}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="catatAbsensi('${g.id}', 'Hadir')"
              class="py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${statusHariIni === 'Hadir' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}">
              <i class="fa-solid fa-check"></i> Masuk
            </button>
            <button onclick="catatAbsensi('${g.id}', 'Izin')"
              class="py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${statusHariIni === 'Izin' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'}">
              <i class="fa-solid fa-envelope-open-text"></i> Izin
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render log absensi periode terpilih
  const logsPeriode = db.absensi
    .filter(a => a.tanggal.startsWith(periode))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  if (logsPeriode.length === 0) {
    logBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 text-xs">Belum ada catatan absensi pada periode ini.</td></tr>`;
    return;
  }

  logBody.innerHTML = logsPeriode.map(log => {
    const guru = db.guru.find(g => g.id === log.guruId);
    const namaGuru = guru ? guru.nama : "(Guru Dihapus)";
    const isHadir = log.status === "Hadir";

    return `
      <tr>
        <td class="py-2.5 px-3 font-medium text-slate-700">${log.tanggal}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800">${namaGuru}</td>
        <td class="py-2.5 px-3 text-slate-500">${log.catatan}</td>
        <td class="py-2.5 px-3">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isHadir ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
            ${log.status}
          </span>
        </td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="hapusAbsensi('${log.id}')" class="text-rose-500 hover:text-rose-700 p-1">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ==================== MANAJEMEN GURU & PENGGAJIAN ====================
function saveGuru(event) {
  event.preventDefault();
  const nama = document.getElementById("guru-nama").value.trim();
  const mapel = document.getElementById("guru-mapel").value.trim();
  const skema = document.getElementById("guru-skema").value;
  const tarif = Number(document.getElementById("guru-tarif").value);

  db.guru.push({
    id: "g_" + Date.now(),
    nama,
    mapel,
    skema,
    tarif
  });

  saveDatabase();
  event.target.reset();
  closeModal("modal-guru");
  renderAll();
}

function getJumlahSesiGuru(guruId, periode) {
  // Hitung jumlah status 'Hadir' pada periode tersebut
  const hadirAbsensi = db.absensi.filter(
    a => a.guruId === guruId && a.tanggal.startsWith(periode) && a.status === "Hadir"
  ).length;
  return hadirAbsensi;
}

function hitungTotalGajiGuru(guru, periode) {
  if (guru.skema === "bulanan") {
    return guru.tarif;
  }
  const sesi = getJumlahSesiGuru(guru.id, periode);
  return sesi * guru.tarif;
}

function toggleStatusGaji(guruId) {
  const periode = getPeriodeKey();
  if (!db.gajiStatus[periode]) db.gajiStatus[periode] = {};
  db.gajiStatus[periode][guruId] = !db.gajiStatus[periode][guruId];
  saveDatabase();
  renderAll();
}

function hapusGuru(guruId) {
  if (!confirm("Yakin ingin menghapus data guru ini?")) return;
  db.guru = db.guru.filter(g => g.id !== guruId);
  saveDatabase();
  renderAll();
}

function renderGuru() {
  const tbody = document.getElementById("table-guru-body");
  const periode = getPeriodeKey();
  const statusGajiBulanIni = db.gajiStatus[periode] || {};

  if (db.guru.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">Belum ada data guru les. Klik tombol "+ Tambah Guru Les".</td></tr>`;
    return;
  }

  tbody.innerHTML = db.guru.map(g => {
    const sesiHadir = getJumlahSesiGuru(g.id, periode);
    const jumlahIzin = db.absensi.filter(a => a.guruId === g.id && a.tanggal.startsWith(periode) && a.status === "Izin").length;
    const totalGaji = hitungTotalGajiGuru(g, periode);
    const sudahDigaji = !!statusGajiBulanIni[g.id];

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3 px-3 font-bold text-slate-800">${g.nama}</td>
        <td class="py-3 px-3 text-slate-600">${g.mapel}</td>
        <td class="py-3 px-3 text-slate-600">
          ${formatRupiah(g.tarif)}
          <span class="block text-[10px] text-slate-400">${g.skema === 'bulanan' ? 'Tetap / Bulan' : 'Per Pertemuan'}</span>
        </td>
        <td class="py-3 px-3">
          <span class="font-bold text-indigo-600">${sesiHadir}x Masuk</span>
          ${jumlahIzin > 0 ? `<span class="block text-[10px] text-amber-600">${jumlahIzin}x Izin</span>` : ''}
        </td>
        <td class="py-3 px-3 font-extrabold text-slate-800">${formatRupiah(totalGaji)}</td>
        <td class="py-3 px-3">
          <button onclick="toggleStatusGaji('${g.id}')"
            class="px-3 py-1 rounded-full text-xs font-bold transition ${sudahDigaji ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}">
            ${sudahDigaji ? '<i class="fa-solid fa-check mr-1"></i> Sudah Digaji' : '<i class="fa-solid fa-hourglass-half mr-1"></i> Belum Digaji'}
          </button>
        </td>
        <td class="py-3 px-3 text-right">
          <button onclick="hapusGuru('${g.id}')" title="Hapus Guru" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ==================== DASHBOARD KEUANGAN ====================
function renderDashboard() {
  const periode = getPeriodeKey();
  const bayarBulanIni = db.pembayaran[periode] || {};
  const gajiStatusBulanIni = db.gajiStatus[periode] || {};

  let totalPemasukan = 0;
  let totalTunggakan = 0;
  let jmlLunas = 0;
  let jmlBelum = 0;
  const muridMenunggak = [];

  db.murid.forEach(m => {
    if (bayarBulanIni[m.id]) {
      totalPemasukan += m.spp;
      jmlLunas++;
    } else {
      totalTunggakan += m.spp;
      jmlBelum++;
      muridMenunggak.push(m);
    }
  });

  let totalPengeluaranGaji = 0;
  let jmlGuruDigaji = 0;

  db.guru.forEach(g => {
    const nominal = hitungTotalGajiGuru(g, periode);
    if (gajiStatusBulanIni[g.id]) {
      totalPengeluaranGaji += nominal;
      jmlGuruDigaji++;
    }
  });

  const saldoBersih = totalPemasukan - totalPengeluaranGaji;

  document.getElementById("stat-pemasukan").textContent = formatRupiah(totalPemasukan);
  document.getElementById("stat-murid-lunas").textContent = `${jmlLunas} dari ${db.murid.length} murid sudah bayar`;

  document.getElementById("stat-pengeluaran").textContent = formatRupiah(totalPengeluaranGaji);
  document.getElementById("stat-guru-dibayar").textContent = `${jmlGuruDigaji} dari ${db.guru.length} guru sudah digaji`;

  document.getElementById("stat-saldo").textContent = formatRupiah(saldoBersih);
  document.getElementById("stat-tunggakan").textContent = formatRupiah(totalTunggakan);
  document.getElementById("stat-murid-belum").textContent = `${jmlBelum} murid belum bayar les`;

  // Render list cepat murid menunggak
  const tunggakanContainer = document.getElementById("dashboard-tunggakan-list");
  const b = document.getElementById("filter-bulan").value;
  const t = document.getElementById("filter-tahun").value;

  if (muridMenunggak.length === 0) {
    tunggakanContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Semua murid sudah lunas atau belum ada data murid.</p>`;
  } else {
    tunggakanContainer.innerHTML = muridMenunggak.map(m => {
      const pesanWA = `Assalamu'alaikum Bapak/Ibu Wali Murid dari *${m.nama}* (${m.jenjang} - ${m.kelas}). Mengingatkan untuk pembayaran SPP *Bimbel Khasanah* bulan *${getNamaBulan(b)} ${t}* sebesar *${formatRupiah(m.spp)}*. Terima kasih.`;
      return `
        <div class="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100">
          <div>
            <p class="text-xs font-bold text-slate-800">${m.nama} <span class="text-[10px] font-semibold text-slate-500">(${m.jenjang} - ${m.kelas})</span></p>
            <p class="text-xs font-extrabold text-amber-700">${formatRupiah(m.spp)}</p>
          </div>
          <a href="${formatWaLink(m.wa, pesanWA)}" target="_blank"
             class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5">
            <i class="fa-brands fa-whatsapp"></i> Tagih WA
          </a>
        </div>
      `;
    }).join("");
  }

  // Render list cepat ringkasan gaji guru
  const gajiContainer = document.getElementById("dashboard-gaji-list");
  if (db.guru.length === 0) {
    gajiContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Belum ada data guru les.</p>`;
  } else {
    gajiContainer.innerHTML = db.guru.map(g => {
      const nominal = hitungTotalGajiGuru(g, periode);
      const isPaid = !!gajiStatusBulanIni[g.id];
      return `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-bold text-slate-800">${g.nama}</p>
            <p class="text-[11px] text-slate-500">${g.mapel} • <strong>${formatRupiah(nominal)}</strong></p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
            ${isPaid ? 'Sudah Digaji' : 'Belum Digaji'}
          </span>
        </div>
      `;
    }).join("");
  }
}

// ==================== BACKUP & RESTORE DATA ====================
function exportBackup() {
  const dataStr = JSON.stringify(db, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Backup_Bimbel_Khasanah_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.murid && imported.guru) {
        db = imported;
        saveDatabase();
        renderAll();
        alert("Data Bimbel Khasanah berhasil dipulihkan!");
      } else {
        alert("Format file backup tidak valid.");
      }
    } catch (err) {
      alert("Gagal membaca file backup.");
    }
  };
  reader.readAsText(file);
}

// ==================== RENDER SEMUA ====================
function renderAll() {
  renderDashboard();
  renderMurid();
  renderAbsensi();
  renderGuru();
}