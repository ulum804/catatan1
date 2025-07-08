const namaPengguna = "alifiyan";
const form = document.getElementById('formTugas');
const daftarTugas = document.getElementById('daftarTugas');
const toastContainer = document.getElementById('toastContainer');
const judulInput = document.getElementById('judul');
const deskripsiInput = document.getElementById('deskripsi');
const deadlineInput = document.getElementById('deadline');

let tugasList = JSON.parse(localStorage.getItem(`tugas_${namaPengguna}`)) || [];

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}
function simpanTugas() {
  localStorage.setItem(`tugas_${namaPengguna}`, JSON.stringify(tugasList));
}
function renderTugas() {
  daftarTugas.innerHTML = '';
  const sekarang = new Date();

  tugasList.forEach((tugas, index) => {
    const deadlineTugas = new Date(tugas.deadline);
    const terlambat = deadlineTugas < sekarang;
    const rowClass = terlambat ? 'baris-terlambat' : '';
    const judulTeks = terlambat ? `<span class="ikon-terlambat">${tugas.judul}</span>` : tugas.judul;

    const row = document.createElement('tr');
    row.className = rowClass;
    row.innerHTML = `
      <td>${judulTeks}</td>
      <td>${tugas.deskripsi}</td>
      <td>${deadlineTugas.toLocaleString('id-ID', {
        dateStyle: 'full', timeStyle: 'short'
      })}</td>
      <td>
        <button class="btn btn-warning btn-sm me-1" onclick="editTugas(${index})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="hapusTugas(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </td>`;
    daftarTugas.appendChild(row);
  });
}
function editTugas(index) {
  const tugas = tugasList[index];
  const judulBaru = prompt('Edit Judul:', tugas.judul);
  const deskripsiBaru = prompt('Edit Deskripsi:', tugas.deskripsi);
  const deadlineBaru = prompt('Edit Deadline (YYYY-MM-DDTHH:MM):', tugas.deadline);

  if (judulBaru && deskripsiBaru && deadlineBaru) {
    tugasList[index] = { judul: judulBaru, deskripsi: deskripsiBaru, deadline: deadlineBaru };
    simpanTugas();
    renderTugas();
  }
}
function hapusTugas(index) {
  if (confirm("Yakin ingin menghapus catatan ini?")) {
    tugasList.splice(index, 1);
    simpanTugas();
    renderTugas();
  }
}
function hapusSemuaTugas() {
  if (confirm("Yakin ingin menghapus semua catatan?")) {
    tugasList = [];
    simpanTugas();
    renderTugas();
  }
}
function tampilkanNotifikasi(teks) {
  const audio = document.getElementById("notifikasiSuara");
  audio.play();

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🔔 Pengingat Tugas", {
      body: teks,
      icon: "https://cdn-icons-png.flaticon.com/512/1250/1250615.png"
    });
  } else {
    const notifikasi = document.createElement('div');
    notifikasi.className = 'toast align-items-center text-bg-danger toast-animasi show';
    notifikasi.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${teks}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
      toastContainer.appendChild(notifikasi);

    setTimeout(() => {
      notifikasi.classList.remove('toast-animasi');
      notifikasi.classList.add('toast-keluar');
      setTimeout(() => notifikasi.remove(), 400); // tunggu animasi keluar selesai
    }, 9000);
  }
}


// Cek tugas yang mendekati deadline
// function cekPengingat() {
//   const sekarang = new Date();
//   const dalamSejam = tugasList.filter(t => {
//     const dl = new Date(t.deadline);
//     return dl - sekarang <= 3600000 && dl - sekarang > 0;
//   });

//   if (dalamSejam.length > 0) {
//     tampilkanNotifikasi(
//       `🛎️ Tugas mendekati deadline:\n` +
//       dalamSejam.map(t => `${t.judul} (${new Date(t.deadline).toLocaleTimeString('id-ID')})`).join(', ')
//     );
//   }
// }
function cekTepatDeadline() {
  const sekarang = new Date();
  tugasList.forEach(t => {
    const waktuDeadline = new Date(t.deadline);
    const selisih = waktuDeadline - sekarang;
    if (Math.abs(selisih) <= 30000) {
      tampilkanNotifikasi(`⏰ Deadline sekarang: ${t.judul}`);
    }
  });
}
function filterTugas() {
  const kataKunci = document.getElementById('inputPencarian').value.toLowerCase();
  const baris = daftarTugas.getElementsByTagName('tr');
  for (let i = 0; i < baris.length; i++) {
    const kolom = baris[i].getElementsByTagName('td');
    const cocok = [...kolom].some(td =>
      td.innerText.toLowerCase().includes(kataKunci)
    );
    baris[i].style.display = cocok ? '' : 'none';
  }
}

function updateWaktu() {
  const sekarang = new Date();
  document.getElementById('hariIni').textContent = sekarang.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('waktuSekarang').textContent = sekarang.toLocaleTimeString('id-ID');
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const judul = judulInput.value.trim();
  const deskripsi = deskripsiInput.value.trim();
  const deadline = deadlineInput.value.trim();
  if (judul && deskripsi && deadline) {
    tugasList.unshift({ judul, deskripsi, deadline });
    simpanTugas();
    renderTugas();
    judulInput.value = '';
    deskripsiInput.value = '';
    deadlineInput.value = '';
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    cekPengingat();
    cekTepatDeadline();
  }
});

renderTugas();
updateWaktu();
// cekPengingat();
cekTepatDeadline();

setInterval(updateWaktu, 1000);
// setInterval(cekPengingat, 180000);
setInterval(cekTepatDeadline, 15000);
setInterval(renderTugas, 10000); 