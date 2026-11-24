// ===== DATA ACARA =====
const ACARA = {
  judul: "Sweet Seventeen Ahn Keonho",
  mulai: new Date("2026-02-14T19:00:00+07:00"), // 19.00 WIB
  selesai: new Date("2026-02-14T22:00:00+07:00"),
  tempat: "The Breeze BSD City, Jl. BSD Grand Boulevard, Tangerang",
};
const KUNCI_PENYIMPANAN = "undangan-sweet17-buku-tamu";

// ===== 1. NAMA TAMU DARI URL (?to=Nama+Tamu) =====
const parameter = new URLSearchParams(window.location.search);
const namaTamu = (parameter.get("to") || "").replace(/\s+/g, " ").trim().slice(0, 60);

if (namaTamu) {
  document.getElementById("nama-tamu").textContent = namaTamu;
  document.getElementById("sapaan").textContent =
    `Halo, ${namaTamu}! Dengan penuh sukacita, aku mengundangmu untuk merayakan ulang tahunku yang ke-17. Kehadiranmu akan membuat malam ini jauh lebih berkesan.`;
  document.getElementById("input-nama").value = namaTamu;
}

// ===== 2. BUKA UNDANGAN + MUSIK =====
const sampul = document.getElementById("sampul");
const musik = document.getElementById("musik");
const tombolMusik = document.getElementById("tombol-musik");

function aturTombolMusik(diputar) {
  tombolMusik.classList.toggle("putar", diputar);
  tombolMusik.textContent = diputar ? "💿" : "▶️";
  tombolMusik.setAttribute("aria-label", diputar ? "Jeda musik" : "Putar musik");
}

document.getElementById("tombol-buka").addEventListener("click", () => {
  sampul.classList.add("keluar");             // animasi sampul naik
  document.body.classList.remove("terkunci"); // halaman boleh digulir
  window.scrollTo(0, 0);
  tombolMusik.hidden = false;
  // Musik baru boleh diputar setelah ada klik (aturan browser)
  musik.play().then(() => aturTombolMusik(true)).catch(() => aturTombolMusik(false));
  setTimeout(() => (sampul.hidden = true), 1000);
});

// ===== 3. TOMBOL MUSIK MELAYANG =====
tombolMusik.addEventListener("click", () => {
  if (musik.paused) {
    musik.play().then(() => aturTombolMusik(true));
  } else {
    musik.pause();
    aturTombolMusik(false);
  }
});

// ===== 4. HITUNG MUNDUR =====
function duaDigit(angka) {
  return String(angka).padStart(2, "0");
}

function perbaruiHitungMundur() {
  const selisih = ACARA.mulai - new Date();
  if (selisih <= 0) {
    document.getElementById("hitung-mundur").hidden = true;
    document.getElementById("acara-selesai").hidden = false;
    clearInterval(timer);
    return;
  }
  const totalDetik = Math.floor(selisih / 1000);
  document.getElementById("hari").textContent = duaDigit(Math.floor(totalDetik / 86400));
  document.getElementById("jam").textContent = duaDigit(Math.floor((totalDetik % 86400) / 3600));
  document.getElementById("menit").textContent = duaDigit(Math.floor((totalDetik % 3600) / 60));
  document.getElementById("detik").textContent = duaDigit(totalDetik % 60);
}
const timer = setInterval(perbaruiHitungMundur, 1000);
perbaruiHitungMundur();

// ===== 5. SIMPAN KE KALENDER =====
// Format waktu kalender: 20260214T120000Z (UTC)
function formatKalender(tanggal) {
  return tanggal.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const linkGcal = new URLSearchParams({
  action: "TEMPLATE",
  text: ACARA.judul,
  dates: `${formatKalender(ACARA.mulai)}/${formatKalender(ACARA.selesai)}`,
  details: "Perayaan ulang tahun ke-17 Ahn Keonho. Dress code: Peach, Cream & Gold.",
  location: ACARA.tempat,
});
document.getElementById("link-gcal").href = `https://calendar.google.com/calendar/render?${linkGcal}`;

document.getElementById("tombol-ics").addEventListener("click", () => {
  const isi = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Sweet17//ID",
    "BEGIN:VEVENT",
    `UID:sweet17-${formatKalender(ACARA.mulai)}@undangan`,
    `DTSTAMP:${formatKalender(new Date())}`,
    `DTSTART:${formatKalender(ACARA.mulai)}`,
    `DTEND:${formatKalender(ACARA.selesai)}`,
    `SUMMARY:${ACARA.judul}`,
    `LOCATION:${ACARA.tempat.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([isi], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sweet17-ahn-keonho.ics";
  a.click();
  URL.revokeObjectURL(a.href);
});

// ===== 6. NOTIFIKASI (TOAST) & SALIN TEKS =====
const toast = document.getElementById("toast");
let timerToast;
function tampilkanToast(pesan) {
  toast.textContent = "✅ " + pesan;
  toast.classList.add("tampil");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove("tampil"), 2500);
}

async function salinTeks(teks, pesan) {
  try {
    await navigator.clipboard.writeText(teks);
  } catch {
    // Cadangan untuk browser lama
    const area = document.createElement("textarea");
    area.value = teks;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  tampilkanToast(pesan);
}

document.querySelectorAll("[data-salin], [data-salin-dari]").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    const teks = tombol.dataset.salin || document.getElementById(tombol.dataset.salinDari).textContent;
    salinTeks(teks.trim(), tombol.dataset.pesan);
  });
});

// ===== 7. ANIMASI MUNCUL SAAT DIGULIR =====
const pengamat = new IntersectionObserver(
  (entri) => {
    entri.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("terlihat");
        pengamat.unobserve(e.target); // cukup sekali
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".muncul").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  pengamat.observe(el);
});

// ===== 8. GALERI: KETUK UNTUK MEMPERBESAR =====
const lightbox = document.getElementById("lightbox");
const fotoBesar = document.getElementById("lightbox-foto");
document.querySelectorAll(".foto").forEach((foto) => {
  foto.addEventListener("click", () => {
    fotoBesar.src = foto.src;
    fotoBesar.alt = foto.alt;
    lightbox.hidden = false;
  });
});
lightbox.addEventListener("click", () => (lightbox.hidden = true));

// ===== 9. RSVP & BUKU TAMU (localStorage) =====
function muatUcapan() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_PENYIMPANAN));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function waktuLalu(ms) {
  const detik = Math.floor((Date.now() - ms) / 1000);
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit yang lalu`;
  if (detik < 86400) return `${Math.floor(detik / 3600)} jam yang lalu`;
  return `${Math.floor(detik / 86400)} hari yang lalu`;
}

function tampilkanUcapan() {
  const daftar = muatUcapan();
  const ul = document.getElementById("daftar-ucapan");
  ul.innerHTML = "";
  daftar.forEach((u) => {
    const li = document.createElement("li");
    li.className = "ucapan";
    // Pakai textContent supaya teks dari tamu tidak bisa menyisipkan kode HTML
    const atas = document.createElement("div");
    atas.className = "baris-antara";
    const nama = document.createElement("p");
    nama.className = "tebal";
    nama.textContent = u.nama;
    const status = document.createElement("span");
    status.className = "status " + (u.status === "hadir" ? "hadir" : "");
    status.textContent = u.status === "hadir" ? "Hadir" : "Tidak hadir";
    atas.append(nama, status);
    const pesan = document.createElement("p");
    pesan.className = "ucapan-pesan";
    pesan.textContent = u.pesan;
    const waktu = document.createElement("p");
    waktu.className = "ucapan-waktu";
    waktu.textContent = waktuLalu(u.waktu);
    li.append(atas, pesan, waktu);
    ul.appendChild(li);
  });
  document.getElementById("jumlah-ucapan").textContent = daftar.length;
  document.getElementById("jumlah-hadir").textContent = daftar.filter((u) => u.status === "hadir").length;
  document.getElementById("ucapan-kosong").hidden = daftar.length > 0;
}

document.getElementById("form-rsvp").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = document.getElementById("input-nama").value.trim();
  const pesan = document.getElementById("input-pesan").value.trim();
  const status = document.querySelector('input[name="status"]:checked').value;
  const galat = document.getElementById("pesan-galat");

  let error = "";
  if (nama.length < 2) error = "Nama minimal 2 huruf, ya.";
  else if (pesan.length < 3) error = "Tulis ucapan atau doa dulu, ya.";
  galat.textContent = error;
  galat.hidden = !error;
  if (error) return;

  const daftar = muatUcapan();
  daftar.unshift({ nama, status, pesan, waktu: Date.now() }); // terbaru di atas
  localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftar));
  document.getElementById("input-pesan").value = "";
  tampilkanUcapan();
  tampilkanToast("Terima kasih! Ucapanmu sudah tersimpan.");
});

tampilkanUcapan();