# Panduan Aplikasi Ujian Online (Firebase + Microsoft Forms)

Aplikasi ini menampilkan soal dari Microsoft Forms di dalam halaman yang dilindungi token, jadwal, dan pengawasan anti curang. Login peserta, jadwal, sesi, log pelanggaran, dan nilai disimpan di Firebase Firestore.

## 1. Menyiapkan Microsoft Forms

1. Buat formulir di forms.office.com (pilih **Kuis** agar penilaian otomatis).
2. Tambahkan pertanyaan pertama **NIS** (teks pendek, wajib diisi). Ini dipakai untuk mencocokkan nilai dengan peserta.
3. Di **Pengaturan** formulir:
   - Pilih **Siapa saja dapat merespons** (sesuai keputusan Anda, link terbuka).
   - Aktifkan **Acak urutan pertanyaan** dan acak pilihan jawaban di setiap soal.
   - Matikan **Tampilkan hasil setelah pengiriman** dan jangan perlihatkan jawaban benar.
4. Klik **Bagikan** lalu tab **Sematkan** dan salin kodenya (atau link-nya). Tempel ke kolom "Link / kode embed" saat membuat ujian di aplikasi. Aplikasi mengambil link dari kode itu dan menambahkan `embed=true` otomatis.
5. Setelah ujian selesai, matikan **Terima respons** di Forms agar tidak ada kiriman susulan.

## 2. Membuat Project Firebase

1. Buka console.firebase.google.com, klik **Add project**, ikuti langkahnya.
2. **Firestore Database**: menu *Build > Firestore Database > Create database*, pilih lokasi terdekat (misalnya `asia-southeast2` Jakarta), mulai dalam mode produksi.
3. **Authentication**: menu *Build > Authentication > Get started*, aktifkan provider **Email/Password**.
4. Daftarkan akun admin pertama: tab *Users > Add user*, isi email dan password.
5. **Matikan pendaftaran mandiri**: *Authentication > Settings > User actions*, nonaktifkan **Enable create (sign-up)**. Ini penting agar orang lain tidak bisa membuat akun admin lewat API.
6. **Security Rules**: *Firestore Database > Rules*, hapus isi lama, tempel seluruh isi file `firestore.rules`, lalu **Publish**.
7. Ambil konfigurasi web: *Project settings (ikon roda gigi) > Your apps > ikon </> (Web)*, daftarkan aplikasi, lalu salin objek `firebaseConfig`.
8. Tambahkan domain tempat aplikasi dipasang: *Authentication > Settings > Authorized domains* (misalnya domain Blogger atau hosting Anda).

## 3. Mengisi konfigurasi dan beralih ke mode produksi

Di bagian atas kode (`<script type="module">`):

```javascript
const IS_PREVIEW = false; // false = produksi, tanpa data dummy, langsung ke Firestore

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Saat `IS_PREVIEW = false`, semua data dummy, banner preview, dan akun demo hilang, dan tidak ada data aplikasi yang disimpan di localStorage/sessionStorage.

## 4. Memasang aplikasi

**Blogger**: *Tema > Edit HTML* tidak diperlukan. Buat **Halaman** baru, pindah ke mode HTML, tempel seluruh isi `index.html`, lalu terbitkan. Aplikasi otomatis menutupi seluruh layar.
Atau tambahkan widget **HTML/JavaScript** dan tempel kodenya.

**Hosting lain** (Vercel, Netlify, GitHub Pages, Firebase Hosting): unggah `index.html` apa adanya. Wajib memakai **HTTPS** karena aplikasi memakai fitur keamanan browser (hash password PBKDF2 dan layar penuh).

## 5. Alur penggunaan

**Admin (login dengan email Firebase)**
1. **Pengaturan**: isi nama sekolah, batas pelanggaran (default 3), layar penuh, tata tertib.
2. **Data Peserta**: tambah satu per satu atau **Impor CSV** (kolom `nis,nama,kelas,password`). Password yang dikosongkan dibuat acak, dan file *kartu-login-peserta.csv* otomatis terunduh untuk dibagikan.
3. **Data Ujian**: isi judul, mapel, **tingkat peserta (Kelas X / XI / XII / Semua tingkat)**, link Forms, jadwal, durasi. Token dibuat otomatis dan tampil di kartu ujian (bisa disalin atau dibuat ulang). Buat satu ujian per kelas dan per sesi, masing-masing dengan token sendiri.
4. Saat ujian: bagikan **token** kepada peserta hanya ketika ujian dimulai. Pantau di **Pantauan Ujian** (tekan *Segarkan*), buka kunci peserta yang terkunci, dan lihat **Log Pelanggaran**.
5. Setelah ujian: di Forms pilih **Buka di Excel**, unduh file .xlsx, lalu di **Rekap Nilai** klik **Impor Excel/CSV**. Pilih kolom NIS dan kolom skor (*Total points*), pilih aturan duplikat, lalu impor. Nilai bisa diekspor sebagai CSV.

**Pengawas**: lihat bagian 10 (Modul BAP).

**Peserta**
1. Login dengan NIS dan password.
2. Menu **Kerjakan Ujian**, pilih ujian, masukkan token, baca tata tertib, lalu **Mulai mengerjakan** (layar penuh aktif).
3. Setelah mengirim jawaban di formulir, tekan **Saya sudah mengirim jawaban**.
4. Nilai terlihat di **Riwayat & Nilai** setelah admin mengimpornya (bisa disembunyikan lewat Pengaturan).

## 6. Fitur anti curang

- Token ujian, hanya valid dalam jadwal. Link Forms tidak tersimpan di data ujian yang terbaca peserta dan baru bisa diambil setelah token benar.
- Satu sesi login per peserta. Login di perangkat lain mengeluarkan sesi sebelumnya.
- Timer dari waktu server, tidak bisa diulang dengan reload.
- Wajib layar penuh, deteksi pindah tab/jendela, blokir klik kanan, salin/tempel, dan pintasan alat pengembang.
- Setiap pelanggaran dicatat. Pada pelanggaran ke-3 (atau sesuai pengaturan) ujian terkunci sampai admin membukanya.

## 7. Batasan yang perlu diketahui

- Aplikasi tidak bisa melihat isi dalam Forms. Siswa yang mendapat link Forms dari luar aplikasi tidak bisa dicegah. Karena itu rahasiakan token dan tutup form setelah ujian.
- Karena link terbuka, pengiriman ganda dari NIS yang sama mungkin terjadi. Pakai opsi duplikat saat impor nilai.
- Pembatasan browser tidak bisa menghentikan HP kedua, diskusi langsung, atau pengguna yang sangat paham teknis. Gunakan sebagai penghalang dan bukti, bukan jaminan mutlak.
- Pada HP (terutama iPhone) layar penuh tidak selalu tersedia, jadi pengawasan layar penuh dilewati otomatis di perangkat itu.
- Login peserta memakai data di Firestore (sesuai desain tanpa server). Gunakan password yang acak dan tidak mudah ditebak. Jangan memakai password seragam seperti tanggal lahir.
- Fitur pasang sebagai aplikasi (PWA) berbasis satu file memiliki batasan browser; aplikasi tetap berjalan normal sebagai halaman web.

## 8. Filter per tingkat (hemat kuota)

- Tingkat siswa dibaca dari **awal nama kelas** di Data Peserta: `X A`, `XI-2`, `XII IPS 1` menjadi X, XI, XII. Kelas yang tidak diawali X/XI/XII ditandai merah "tingkat?" dan hanya melihat ujian bertingkat "Semua tingkat". Perbaiki penulisan kelasnya.
- Siswa hanya membaca ujian yang **aktif** dan sesuai tingkatnya, tidak peduli berapa banyak ujian lama di database. Daftar ujian juga disimpan sementara 2 menit di perangkat siswa, jadi pindah menu tidak menambah bacaan.
- Pantauan Ujian dan Rekap Nilai hanya menghitung peserta dari tingkat ujian yang dipilih.
- Setelah nilai selesai dipublikasikan, **hilangkan centang "Ujian aktif"** pada ujian lama. Ujian nonaktif tidak lagi dibaca siswa dan tidak tampil di Riwayat mereka.
- Tidak perlu membuat index tambahan di Firestore, dan `firestore.rules` tidak berubah.
- Ujian yang dibuat sebelum pembaruan ini harus dibuka (**Ubah**) dan disimpan sekali agar tingkatnya tercatat.

## 9. Kuota dan ujian serentak (±1000 siswa)

Firestore paket gratis (Spark) memberi kuota harian sekitar 50.000 baca dan 20.000 tulis per project Firebase (memisahkan kode aplikasi tidak menambah kuota). Aplikasi dirancang hemat: sekitar 10-20 baca dan 3-6 tulis per siswa per ujian, tanpa listener realtime yang boros. Pada hari dengan tiga sesi ujian, hitung ketiganya bersama dan pantau penggunaan di konsol Firebase (tab Usage). Kuota harian direset sekitar tengah malam waktu Pasifik (kira-kira pukul 15.00 WIB); pastikan di dokumentasi Firebase. Jika Anda menjalankan beberapa ujian besar per hari atau sering menekan *Segarkan* di Pantauan (membaca hingga ±1000 dokumen sekali tekan), pertimbangkan paket Blaze (bayar sesuai pemakaian, ada kuota gratis yang sama).

Sebelum hari ujian, lakukan uji coba dengan 100-200 siswa serentak, terutama untuk memastikan Microsoft Forms di tenant Anda tidak membatasi respons yang masuk bersamaan.

## 10. Modul BAP (Berita Acara Pelaksanaan) di dalam aplikasi ini

Aplikasi BAP lama sudah digabung ke satu file `index.html` dan satu `firestore.rules`. Semua memakai satu project Firebase, jadi kuota Firestore dihitung bersama.

**Perubahan penting dari versi sebelumnya**
- **Akun ruang dihapus**, diganti **akun pengawas** (satu akun per guru). Pengawas yang menggantikan teman tetap bisa mengisi BAP karena yang dipilih adalah ruang yang sedang ia awasi, bukan akun ruang.
- Login punya tiga tab: **Peserta**, **Pengawas**, **Admin**. Admin membuka BAP lewat menu **BAP Ujian**, dan kembali lewat tombol **Ujian Online** di menu BAP.
- Hash password diganti ke PBKDF2 dengan salt (lebih kuat dari sebelumnya). **Peserta yang dibuat dengan versi lama tidak bisa login**; impor ulang CSV peserta dengan kolom password, atau ubah passwordnya satu per satu. Aplikasi ujian dan BAP sebaiknya dipasang bersamaan dengan data peserta baru.
- Koleksi baru di Firestore: `akunPengawas`. Koleksi `akunRuang` tidak lagi dipakai dan boleh dihapus. Tempel ulang seluruh `firestore.rules` lalu **Publish**.

**Alur admin (menu BAP Ujian)**
1. **Data Master**: mapel, ruang (nama ruang dan kelas bawaan), kelas, siswa, dan pengawas. Setiap pengawas punya username dan password; impor pengawas: `Nama;NIP;Username;Password`.
2. **Impor siswa** (`NIS;Nama;Kelas`) sekaligus **membuat akun peserta ujian online**. Password acak dibuat otomatis dan file *kartu-login-peserta.csv* terunduh untuk dibagikan. Peserta yang sudah ada tidak diubah passwordnya.
3. **Jadwal Ujian**: tentukan tanggal, jam ke-, mapel, ruang, dan (opsional) **Ujian Online** yang terkait. Pengawas tidak ditentukan di jadwal; pengawas memilih sendiri saat bertugas.
4. **Rekap BAP**: lihat, buka kunci, hapus, dan cetak PDF dengan tanda tangan.

**Alur pengawas**
1. Login tab **Pengawas**, menu **Isi BAP**.
2. Pilih tanggal dan jam ke-, lalu ketuk **Saya mengawas ini** pada ruang yang diawasi. Ruang yang sudah diambil pengawas lain tidak bisa diambil, dan bisa dilepas bila salah pilih.
3. Kehadiran terisi otomatis dari ujian online: siswa yang belum pernah memulai ujian ditandai **Alpa**, siswa yang terkunci atau melanggar tercatat di catatan. Pengawas memeriksa dan mengubah S/I/A bila perlu.
4. Tanda tangan di layar, lalu **Finalkan BAP** atau **Cetak PDF**. Setelah final, BAP terkunci dan hanya admin yang bisa membukanya.

**Catatan keamanan**
- Karena login pengawas dan peserta memakai data di Firestore (tanpa server), aturan tidak bisa memastikan siapa yang menulis. Aturan hanya memastikan ruang tidak bisa diambil dua orang, BAP hanya ditulis atas nama pengawas yang mengambil ruang itu, dan BAP final tidak bisa diubah pengawas.
- Data siswa, pengawas, jadwal, dan BAP terbaca publik oleh siapa pun yang tahu alamat project (NIS dan nama dapat terlihat). Jangan menyimpan data sensitif di sana. Jika ini jadi masalah, pertimbangkan Cloud Functions.
- PDF memakai pustaka jsPDF dari CDN, jadi perangkat yang mencetak harus terhubung internet.
- Setelah selesai uji coba, pastikan `IS_PREVIEW = false` agar data demo hilang.
