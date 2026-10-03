// Lokalisasi lengkap: antarmuka + seluruh konten materi.
// ID = Bahasa Indonesia, EN = English. `t()` di i18n.jsx mengambil dari sini.
import { CHALLENGES } from "./data.js";

const UI_ID = {
  "nav.home": "Home",
  "nav.learn": "Belajar",
  "nav.challenge": "Tantangan",
  "nav.expenses": "Catat Pengeluaran",
  "nav.budget": "Budget",
  "nav.saving": "Menabung",
  "nav.decide": "Decision Lab",
  "nav.family": "Misi Keluarga",
  "nav.score": "Skor",
  "nav.leaderboard": "Peringkat",
  "nav.profile": "Profil",
  "nav.admin": "Admin",
  "nav.mainMenu": "Menu utama",
  "nav.brandTag": "Kebiasaan finansial remaja",
  "nav.groupMain": "Utama",
  "nav.groupTools": "Alat",
  "nav.demoBanner": "Mode demo (data lokal)",
  "nav.openProfile": "Buka profil",
  "nav.user": "Pengguna",
  "nav.userStat": "{points} poin · streak {streak}",

  "common.close": "Tutup",
  "common.edit": "Edit",
  "common.delete": "Hapus",
  "common.loading": "Memuat...",
  "common.minutes": "menit",
  "common.points": "poin",

  "auth.tagline": "BELANJA CERDAS. IRI AKAN HILANG.",
  "auth.taglineEn": "SPEND SMART. SAVE BETTER. BEAT FOMO.",
  "auth.subtitle": "Kelola uangmu tanpa harus membosankan.",
  "auth.tabLogin": "Masuk",
  "auth.tabRegister": "Daftar",
  "auth.phName": "Nama",
  "auth.phEmail": "Email",
  "auth.phPassword": "Kata sandi (min. 6 karakter)",
  "auth.errName": "Nama wajib diisi",
  "auth.errEmail": "Email wajib diisi",
  "auth.errEmailFormat": "Format email tidak valid",
  "auth.errPassShort": "Kata sandi minimal 6 karakter",
  "auth.btnLogin": "Masuk",
  "auth.btnRegister": "Buat akun",
  "auth.btnGoogle": "Masuk dengan Google",
  "auth.orDivider": "atau",
  "auth.btnDemo": "Coba mode demo tanpa akun",
  "auth.noAccount": "Belum punya akun?",
  "auth.haveAccount": "Sudah punya akun?",
  "auth.language": "Bahasa",

  "auth.oVerTitle": "Kode verifikasi",
  "auth.oVerSub": "Kami telah mengirim kode 6 digit ke {email}. Masukkan kodenya untuk menyelesaikan pendaftaran.",
  "auth.oVerSent": "Kode verifikasi dikirim ke email kamu.",
  "auth.oVerResend": "Kirim ulang kode",
  "auth.oVerCooldown": "Kirim ulang dalam {s} detik",
  "auth.oVerVerify": "Verifikasi",
  "auth.oVerError": "Kode salah atau sudah kedaluwarsa. Coba lagi.",
  "auth.oVerBack": "Ubah email",
  "auth.oVerDigit": "Kotak kode ke-{n}",

  "auth.magicLinkTitle": "Cek emailmu",
  "auth.magicLinkSub": "Kami telah mengirim tautan verifikasi ke {email}. Klik tautan tersebut untuk menyelesaikan pendaftaran.",
  "auth.magicLinkHint": "Tautan ini hanya berlaku sekali. Jika tidak diterima, cek folder spam atau kirim ulang.",
  "auth.forgot": "Lupa kata sandi?",
  "auth.forgotTitle": "Atur ulang kata sandi",
  "auth.forgotSub": "Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.",
  "auth.forgotSent": "Tautan atur ulang dikirim ke {email}. Buka emailmu untuk membuat kata sandi baru.",
  "auth.forgotBack": "Kembali ke masuk",
  "auth.forgotSend": "Kirim tautan",
  "auth.newPassTitle": "Buat kata sandi baru",
  "auth.newPassSub": "Tentukan kata sandi baru untuk akunmu, lalu masuk kembali.",
  "auth.newPassSave": "Simpan kata sandi",

  "auth.mascotAlt": "Maskot FINHABIT",

  "toast.verified": "Akun berhasil diverifikasi!",
  "toast.error": "Terjadi kesalahan",
  "toast.passwordUpdated": "Kata sandi berhasil diperbarui. Silakan masuk.",
  "toast.demoMode": "Mode demo aktif",
  "toast.demoFallback": "Backend tidak terhubung. Mode demo aktif.",
  "toast.network": "Jaringan bermasalah. Coba lagi.",

  "err.emailTaken": "Email sudah terdaftar",
  "err.emailNotConfirmed": "Email belum dikonfirmasi. Periksa kotak masuk email kamu.",
  "err.emailFormat": "Format email tidak valid",
  "err.badCredentials": "Email atau password salah",
  "err.rateLimit": "Terlalu sering mencoba. Tunggu sebentar, lalu coba lagi.",
  "err.weakPassword": "Kata sandi terlalu pendek atau lemah",
  "err.notImage": "Berkas harus berupa gambar JPG, PNG, atau WebP",
  "err.signupClosed": "Pendaftaran sedang ditutup.",
  "err.loginFailed": "Gagal masuk. Coba lagi.",
  "err.registerFailed": "Gagal mendaftar. Coba lagi.",
  "err.otpInvalid": "Kode salah atau sudah kedaluwarsa. Coba lagi.",

  "toast.hello": "Halo, {name}!",
  "toast.demoActive": "Mode demo aktif",
  "toast.networkLogin": "Backend tidak terhubung. Mode demo aktif.",
  "toast.networkErr": "Jaringan bermasalah. Coba lagi.",
  "toast.reset": "Data dikembalikan",

  "home.greet.morning": "Selamat pagi",
  "home.greet.afternoon": "Selamat siang",
  "home.greet.evening": "Selamat malam",
  "home.greet.night": "Selamat malam",
  "home.headline": "Satu kebiasaan kecil hari ini.",
  "home.limitOver": "Melebihi budget",
  "home.limitNear": "Mendekati batas",
  "home.limitBody": "Pengeluaran bulan ini {spent} dari {budget} ({pct}%).",
  "home.limitHintOver": "Budget harianmu kelewat. Lihat pola pengeluaranmu di Limit Warning.",
  "home.limitHintWarn": "Jangan sampai kelewat: cek pola pengeluaranmu sekarang.",
  "home.scoreLabel": "Financial Habit Score",
  "home.scoreUp": "Naik {n} poin",
  "home.scoreDown": "Turun {n} poin",
  "home.scoreWeek": "dari minggu lalu.",
  "home.progressTitle": "Progress hari ini",
  "home.progressSub": "{done} dari {total} aktivitas harian selesai.",
  "home.dailyLabel": "Daily Challenge",
  "home.challengeDone": "Selesai hari ini ✓",
  "home.challengeStart": "Mulai Challenge",
  "home.quickTitle": "Quick Actions",
  "home.quickExpenses": "Track Spending",
  "home.quickBudget": "Limit Warning",
  "home.quickSaving": "Saving Goals",
  "home.quickDecide": "Decision Lab",
  "home.quickLearn": "Learn",
  "home.quickFamily": "Family Mission",
  "home.quickLeaderboard": "Peringkat",
  "home.quickAdmin": "Admin",
  "home.statStreak": "Hari beruntun",
  "home.statPoints": "Total poin",
  "home.statChallenge": "Challenge",

  "score.title": "Financial Habit Score",
  "score.sr": "Skor {value} dari 100",
  "score.week": "Minggu lalu {last} → minggu ini {now} ({diff})",
  "score.breakdown": "Breakdown",
  "score.progress": "Perkembanganmu",
  "score.weekHint": "Skor 7 hari terakhir.",
  "score.tStarter": "Financial Starter",
  "score.tSteady": "Getting Steady",
  "score.tSmart": "Financial Smart",
  "score.tMaster": "Financial Master",
  "level.beginner": "Financial Beginner",
  "level.explorer": "Financial Explorer",
  "level.achiever": "Financial Achiever",
  "level.master": "Financial Master",

  "learn.title": "Belajar",
  "learn.sub": "Materi singkat, lalu langsung dipraktikkan.",
  "learn.progressTitle": "Progress materi",
  "learn.progressSub": "{done} dari {total} materi selesai.",
  "learn.done": "Selesai ✓",
  "learn.markDone": "Tandai selesai (+10 poin)",
  "learn.readAgain": "Baca lagi",
  "learn.study": "Pelajari",
  "learn.count": "{done}/{n} materi",
  "learn.doneTitle": "Materi selesai!",

  "ch.title": "Daily Challenge",
  "ch.sub": "Satu tantangan nyata setiap hari. Tonton, baca, atau kerjakan sampai selesai, lalu tulis apa yang kamu dapat.",
  "ch.steps": "Ikuti langkah ini",
  "ch.checkAll": "Centang semua langkah dulu",
  "ch.reflection": "Refleksi kamu",
  "ch.reflectionHint": "Tulis satu hal yang kamu pelajari dari tantangan ini.",
  "ch.reflectionShort": "Refleksi masih terlalu pendek, tulis minimal 15 karakter.",
  "ch.openSource": "Buka sumber aslinya",
  "ch.source": "Sumber",
  "ch.inApp": "Tanpa tautan, kerjakan langsung di aplikasi.",
  "ch.stepCount": "Langkah {done} dari {total}",
  "ch.filterAll": "Semua",
  "ch.kind.video": "Video",
  "ch.kind.read": "Baca",
  "ch.kind.quiz": "Kuis",
  "ch.kind.practice": "Praktik",
  "ch.newPicked": "Tantangan baru dipilih",
  "ch.other": "Tantangan lain",
  "ch.sourceOpened": "Sumber sudah dibuka ✓",
  "ch.openFirst": "Buka link sumbernya dulu sebelum Menyelesaikan Challenge.",
  "ch.gateHint": "Buka link sumber di atas dulu supaya challenge-nya dihitung selesai.",
  "ch.todayList": "Pilihan hari ini",
  "ch.todayCount": "{done} dari {total} challenge hari ini selesai",
  "ch.shuffle": "Ganti tantangan",
  "ch.doneToday": "Sudah selesai hari ini ✓",
  "ch.doIt": "Selesaikan Challenge",
  "ch.doneTitle": "Challenge selesai!",
  "ch.doneMark": " · selesai ✓",

  "ex.title": "Track Spending",
  "ex.sub": "Catat ke mana saja uangmu pergi: kopi, batagor, transport, top-up.",
  "ex.thisMonth": "Bulan ini",
  "ex.aman": "Aman",
  "ex.perhatian": "Perhatian",
  "ex.berlebihan": "Berlebihan",
  "ex.fromBudget": "dari budget {budget}",
  "ex.pctHint": "{pct}% dari batas bulan ini.",
  "ex.formTitle": "Catat pengeluaran",
  "ex.phNote": "Catatan (opsional)",
  "ex.btnAdd": "Tambah pengeluaran (+5 poin)",
  "ex.history": "Riwayat",
  "ex.empty": "Belum ada pengeluaran bulan ini.",
  "ex.errAmount": "Masukkan nominal lebih dari 0",
  "ex.added": "Pengeluaran dicatat",
  "ex.delete": "Hapus",

  "bu.title": "Limit Warning",
  "bu.sub": "Ketahui saat pengeluaranmu mulai di luar kendali, sebelum dompetmu menangis.",
  "bu.loading": "Memuat data budget...",
  "bu.safeTag": "Aman",
  "bu.safeTitle": "Pengeluaranmu masih terkendali.",
  "bu.safeHint": "Kamu belum mendekati batas budget bulan ini. Pertahankan ritme ini.",
  "bu.warnTag": "Perhatian",
  "bu.warnTitle": "Pengeluaranmu mulai di luar kendali.",
  "bu.warnHint": "Kamu sudah memakai sebagian besar budget bulan ini. Sisa hari ini tidak banyak. Kendalikan sebelum dompetmu menangis.",
  "bu.overTag": "Berlebihan",
  "bu.overTitle": "Budget bulan ini sudah lewat.",
  "bu.overHint": "Pengeluaranmu melewati batas. Fokuskan sisa bulan ini untuk menahan pengeluaran non-kebutuhan.",
  "bu.noneTag": "Belum diatur",
  "bu.noneTitle": "Atur budget bulananmu.",
  "bu.noneHint": "Tentukan batas agar aplikasi bisa memberi peringatan.",
  "bu.formTitle": "Budget bulanan",
  "bu.fieldLabel": "Besaran budget (Rp)",
  "bu.fromSpent": "dari {budget} · {pct}%",
  "bu.btnSave": "Simpan budget",
  "bu.saved": "Budget disimpan",
  "bu.err": "Masukkan budget lebih dari 0",
  "bu.level": "Level: {a} (<80%), {b} (80-100%), {c} (>100%). Aplikasi otomatis menandai kondisimu di halaman Home.",


  // 52 string untuk halaman tabungan
  "g.title": "Tabungan",
  "g.sub": "Pisahkan tiap tujuan jadi tabungan sendiri, lengkap dengan riwayatnya.",
  "g.newTitle": "Tabungan baru",
  "g.create": "Buat tabungan",
  "g.createFirst": "Buat tabungan pertama",
  "g.editTitle": "Ubah tabungan",
  "g.save": "Simpan",
  "g.edit": "Ubah",
  "g.menu": "Opsi untuk {name}",
  "g.deleteGoal": "Hapus tabungan",
  "g.deleteGoalTitle": "Hapus tabungan ini?",
  "g.deleteGoalBody": "\"{name}\" akan dihapus permanen, termasuk {count} riwayat di dalamnya. Riwayat yang dihapus tidak bisa dikembalikan.",
  "g.goalDeleted": "Tabungan dihapus",
  "g.empty": "Belum ada tabungan. Buat satu untuk mulai menabung.",
  "g.notFound": "Tabungan tidak ditemukan.",
  "g.name": "Nama tujuan",
  "g.phName": "mis. Laptop baru",
  "g.target": "Target",
  "g.phTarget": "mis. 3000000",
  "g.cadence": "Nabung per",
  "g.cadenceUnit": "Satuan",
  "g.cadenceHint": "Boleh dikosongkan kalau belum punya rencana menabung.",
  "g.unitDay": "hari",
  "g.unitWeek": "minggu",
  "g.unitMonth": "bulan",
  "g.collected": "Terkumpul",
  "g.reached": "Target tercapai.",
  "g.noPlan": "Belum ada rencana",
  "g.daysLeft": "{days} hari lagi",
  "g.daysLabel": "Sisa hari",
  "g.ringMoney": "Jumlah uang terkumpul",
  "g.ringDays": "Percepatan dibanding rencana",
  "g.paceAhead": "Lebih cepat",
  "g.paceOnTrack": "Sesuai rencana",
  "g.paceLate": "Kurang cepat",
  "g.paceDone": "Tercapai",
  "g.paceUnknown": "Belum ada rencana",
  "g.planNote": "Sisa {remain} dari targetmu.",
  "g.history": "Riwayat",
  "g.txEmpty": "Belum ada pemasukan atau pengeluaran.",
  "g.txTitle": "Tambah catatan",
  "g.txSave": "Simpan",
  "g.txSaved": "Tersimpan",
  "g.income": "Pemasukan",
  "g.expense": "Pengeluaran",
  "g.amount": "Nominal",
  "g.phAmount": "mis. 50000",
  "g.note": "Catatan",
  "g.phNote": "Opsional, contoh: setoran mingguan",
  "g.delete": "Hapus riwayat",
  "g.deleteTitle": "Hapus riwayat ini?",
  "g.deleteBody": "Saldo akan berkurang {amount}. Riwayat yang dihapus tidak bisa dikembalikan.",
  "g.deleteConfirm": "Hapus",
  "g.cancel": "Batal",
  "g.deleted": "Riwayat dihapus",
  "g.changePhoto": "Ganti gambar",
  "g.uploading": "Mengunggah...",

  "de.title": "Decision Lab",
  "de.sub": "Kuis keputusan: jawaban benar menambah poin, salah menguranginya.",
  "de.caseOf": "Kasus {n} dari {total}",
  "de.ptsGain": "+{n} poin",
  "de.noPts": "Tidak ada poin untuk pilihan ini",
  "de.resultTitle": "Kamu memilih {choice}",
  "de.next": "Lanjut",
  "de.hardMode": "Mode Sulit",
  "de.wrongCount": "Salah: {n}/{max}",
  "de.freeTag": "Tanpa Poin",
  "de.finishBtn": "Selesai Quiz",
  "de.startTitle": "Mulai Quiz",
  "de.startSub": "Bantulah Bailey mengambil keputusan yang tepat. Benar menambah poin, salah menguranginya.",
  "de.startBtn": "Mulai Quiz",
  "de.warnTitle": "Maaf, quiz berpoinmu sudah habis.",
  "de.warnSub": "Mau lanjut tanpa poin?",
  "de.warnContinue": "Lanjut Tanpa Poin",
  "de.warnEnd": "Selesai",
  "de.freeGood": "Benar!",
  "de.freeBad": "Kurang tepat.",
  "de.correctToast": "Benar! +{n} poin",
  "de.wrongToast": "Kurang tepat. −{n} poin",
  "de.resultCorrect": "Benar! +{pts} poin",
  "de.resultWrong": "Kurang tepat. −{pts} poin",
  "de.doneEarned": "Poin hari ini: {earned}",
  "de.hiddenBonus": "Bonus tersembunyi: +{n} poin",
  "de.allDoneTitle": "Semua kuis hari ini selesai!",
  "de.allDoneSub": "Kembali lagi besok untuk kuis dan poin baru.",

  "fa.title": "Family Mission",
  "fa.sub": "Misi yang dikerjakan bersama keluarga di rumah.",
  "fa.budget": "Budget",
  "fa.duration": "Durasi",
  "fa.status": "Status",
  "fa.done": "Selesai",
  "fa.running": "Berjalan",
  "fa.doneLabel": "Misi selesai ✓",
  "fa.complete": "Complete Mission",
  "fa.success": "Misi keluarga selesai!",

  "pf.title": "Profil",
  "pf.editIdentity": "Nama & foto",
  "pf.nameLabel": "Nama tampilan",
  "pf.namePlaceholder": "Nama kamu",
  "pf.photoLabel": "Foto profil",
  "pf.changePhoto": "Ganti foto",
  "pf.removePhoto": "Hapus foto",
  "pf.photoHint": "PNG, JPG, atau WebP. Maksimal 2 MB.",
  "pf.photoTooBig": "Ukuran foto maksimal 2 MB.",
  "pf.photoBadType": "Format foto harus PNG, JPG, atau WebP.",
  "pf.save": "Simpan perubahan",
  "pf.saved": "Profil berhasil diperbarui",
  "pf.nameTooLong": "Nama maksimal 40 karakter.",
  "pf.needName": "Nama tidak boleh kosong.",
  "pf.photoUploading": "Mengunggah foto...",
  "pf.streak": "Streak",
  "pf.challenge": "Challenge",
  "pf.points": "Poin",
  "pf.badges": "Badges",
  "pf.data": "Data",
  "pf.demoNote": "Mode demo. Data disimpan di browser ini saja.",
  "pf.liveNote": "Data tersinkron ke akunmu.",
  "pf.resetBtn": "Reset Demo Data",
  "pf.logout": "Keluar",
  "pf.language": "Bahasa",
  "pf.languageSub": "Pilih bahasa aplikasi.",
  "pf.resetConfirm": "Kembalikan semua data ke kondisi awal?",

  "lb.title": "Peringkat",
  "lb.sub": "Peringkat dihitung dari total poin. Semakin banyak kebiasaan baik, makin tinggi posisimu.",
  "lb.posTitle": "Posisimu",
  "lb.myPos": "Kamu berada di peringkat ke-{rank} dari {total} pemain.",
  "lb.streak": "streak {n}",
  "lb.you": "Kamu",
  "lb.empty": "Belum ada pemain.",
  "lb.loading": "Memuat papan skor...",

  "ad.title": "Panel Admin",
  "ad.forbidden": "Halaman ini hanya bisa diakses akun admin.",
  "ad.totalUsers": "Total user",
  "ad.challengesDoneShort": "challenge selesai",
  "ad.transactions": "Transaksi",
  "ad.activeToday": "Aktif hari ini",
  "ad.avgTitle": "Rata-rata pengguna",
  "ad.avgScore": "Skor finansial",
  "ad.avgPoints": "Poin",
  "ad.avgStreak": "Hari beruntun",
  "ad.spent": "Nilai pengeluaran tercatat: {value}",
  "ad.users": "Pengguna",
  "ad.promote": "Jadikan admin",
  "ad.demote": "Turunkan",
  "ad.confirmPromote": "Jadikan {name} menjadi admin?",
  "ad.confirmDemote": "Turunkan {name} menjadi user?",
  "ad.roleChanged": "Peran kamu diubah. Masuk lagi untuk memperbarui.",
  "ad.activity": "Aktivitas terbaru",
  "ad.emptyActivity": "Belum ada transaksi.",
  "ad.userLine": "{points} poin · streak {streak} · {badges} badge · {done} challenge",
  "ad.subtitle": "Kelola pengguna, pantau aktivitas keuangan, dan jaga kesehatan finansial remaja.",
  "ad.overview": "Ringkasan",
  "ad.rank": "Peringkat",
  "ad.name": "Nama",
  "ad.role": "Peran",
  "ad.points": "Poin",
  "ad.streak": "Streak",
  "ad.badges": "Badge",
  "ad.challenges": "Tantangan",
  "ad.adminRole": "Admin",
  "ad.userRole": "User",
  "ad.forbiddenDesc": "Halaman ini hanya bisa diakses akun admin.",
  "ad.date": "Tanggal",
  "ad.category": "Kategori",
  "ad.note": "Catatan",
  "ad.user": "User",
  "ad.amount": "Jumlah",
  "ad.ban": "Blokir",
  "ad.unban": "Aktifkan",
  "ad.banned": "Diblokir",
  "ad.confirmBan": "Blokir {name}? User tidak bisa masuk lagi.",
  "ad.confirmUnban": "Aktifkan kembali {name}?",
  "ad.leaderboard": "Papan peringkat",
  "ad.detail": "Detail",
  "ad.profileDetail": "Detail profil",
  "ad.dims": "Dimensi finansial",
  "ad.weekly": "Poin mingguan",
  "ad.spendByCat": "Pengeluaran per kategori",
  "ad.emptyChart": "Belum ada data",
  "ad.backToApp": "Kembali ke aplikasi",
  "ad.finance": "Keuangan",
  "ad.totalSpent": "Total pengeluaran",
  "ad.withAvatar": "Punya foto",
  "ad.pointsSpread": "Sebaran poin",
  "ad.avgScore": "Rata-rata skor",
  "ad.avgStreak": "Rata-rata streak",
  "ad.spendTrend": "Tren pengeluaran 14 hari",
  "ad.scoreBands": "Sebaran skor habits",
  "ad.skillRadar": "Profil kemampuan (rata-rata)",
  "ad.literacyGood": "literasi baik",
  "ad.topUsers": "Papan teratas",
  "ad.savingTotal": "Total ditabung",
  "ad.band2.starter": "Pemula",
  "ad.band2.steady": "Konsisten",
  "ad.band2.smart": "Cerdas",
  "ad.band2.master": "Master",
  "ad.band.0_99": "0-99",
  "ad.band.100_299": "100-299",
  "ad.band.300_599": "300-599",
  "ad.band.600_1199": "600-1199",
  "ad.band.1200plus": "1200+",
  "ch.custom": "buat sendiri",
  "ch.builtin": "bawaan",
  "ch.crSub": "Challenge bawaan tidak bisa diubah. Yang dibuat di sini akan ikut muncul di pilihan harian bersama challenge bawaan.",
  "ch.form.kind": "Jenis",
  "ch.form.dim": "Dimensi",
  "ch.form.title": "Judul",
  "ch.form.desc": "Deskripsi singkat",
  "ch.form.source": "Sumber",
  "ch.form.url": "Link sumber (https)",
  "ch.form.steps": "Langkah",
  "ch.form.stepN": "Langkah {n}",
  "ch.form.addStep": "Tambah langkah",
  "ch.form.minutes": "Menit",
  "ch.form.points": "Poin",
  "ch.form.position": "Urutan",
  "ch.form.saveEdit": "Simpan perubahan",
  "ch.form.create": "Buat challenge",
  "ch.form.cancel": "Batal edit",
  "ch.customList": "Challenge buatan admin",
  "ch.noCustom": "Belum ada challenge buatan admin.",
  "ch.active": "Aktif",
  "ch.inactive": "Nonaktif",
  "ch.activate": "Aktifkan",
  "ch.deactivate": "Nonaktifkan",
  "chErr.title": "Judul minimal 3 huruf.",
  "chErr.steps": "Isi minimal satu langkah.",
  "chErr.url": "Link sumber harus diawali https://",
  "chErr.saved": "Challenge diperbarui",
  "chErr.created": "Challenge dibuat",
  "chErr.delete": "Hapus challenge ini",
  "chErr.deleted": "Challenge dihapus",
  "ad.joined": "Bergabung",
  "ad.lastActive": "Aktif terakhir",
  "ad.savingProgress": "Tabungan",
  "ad.budgetInfo": "Anggaran bulanan",
  "ad.banners": "Banner Home",
  "ad.bannerSub": "Gambar promosi yang tampil sebagai carousel di halaman Home.",
  "ad.bannerAdd": "Tambah banner",
  "ad.bannerImage": "Gambar",
  "ad.bannerResize": "Disarankan 750×280. Gambar diubah otomatis ke ukuran itu.",
  "ad.bannerCaption": "Teks (opsional)",
  "ad.bannerLink": "Tautan tujuan (opsional)",
  "ad.bannerPosition": "Urutan",
  "ad.bannerActive": "Aktif",
  "ad.bannerInactive": "Nonaktif",
  "ad.bannerDelete": "Hapus",
  "ad.bannerAdded": "Banner ditambahkan",
  "ad.bannerUpdated": "Banner diperbarui",
  "ad.bannerDeleted": "Banner dihapus",
  "ad.bannerNoImage": "Pilih gambar dulu",
  "err.banned": "Akun kamu dinonaktifkan oleh admin.",
};

const UI_EN = {
  "nav.home": "Home",
  "nav.learn": "Learn",
  "nav.challenge": "Challenge",
  "nav.expenses": "Track Spending",
  "nav.budget": "Budget",
  "nav.saving": "Saving",
  "nav.decide": "Decision Lab",
  "nav.family": "Family",
  "nav.score": "Score",
  "nav.leaderboard": "Leaderboard",
  "nav.profile": "Profile",
  "nav.admin": "Admin",
  "nav.mainMenu": "Main menu",
  "nav.brandTag": "Financial habits for teens",
  "nav.groupMain": "Main",
  "nav.groupTools": "Tools",
  "nav.demoBanner": "Demo mode (local data)",
  "nav.openProfile": "Open profile",
  "nav.user": "User",
  "nav.userStat": "{points} points · streak {streak}",

  "common.close": "Close",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.loading": "Loading...",
  "common.minutes": "minutes",
  "common.points": "points",

  "auth.tagline": "SPEND SMART. SAVE BETTER. BEAT FOMO.",
  "auth.taglineEn": "SPEND SMART. SAVE BETTER. BEAT FOMO.",
  "auth.subtitle": "Manage your money without being boring.",
  "auth.tabLogin": "Log in",
  "auth.tabRegister": "Sign up",
  "auth.phName": "Name",
  "auth.phEmail": "Email",
  "auth.phPassword": "Password (min. 6 characters)",
  "auth.errName": "Name is required",
  "auth.errEmail": "Email is required",
  "auth.errEmailFormat": "Email format is invalid",
  "auth.errPassShort": "Password must be at least 6 characters",
  "auth.btnLogin": "Log in",
  "auth.btnRegister": "Create account",
  "auth.btnGoogle": "Continue with Google",
  "auth.orDivider": "or",
  "auth.btnDemo": "Try demo mode without an account",
  "auth.noAccount": "No account yet?",
  "auth.haveAccount": "Already have an account?",
  "auth.language": "Language",

  "auth.oVerTitle": "Verification code",
  "auth.oVerSub": "We sent a 6-digit code to {email}. Enter it to finish signing up.",
  "auth.oVerSent": "Verification code sent to your email.",
  "auth.oVerResend": "Resend code",
  "auth.oVerCooldown": "Resend in {s}s",
  "auth.oVerVerify": "Verify",
  "auth.oVerError": "Code is wrong or expired. Try again.",
  "auth.oVerBack": "Change email",
  "auth.oVerDigit": "Code box {n}",

  "auth.magicLinkTitle": "Check your email",
  "auth.magicLinkSub": "We've sent a verification link to {email}. Click the link to finish signing up.",
  "auth.magicLinkHint": "This link works once. If you don't see it, check spam or resend.",
  "auth.forgot": "Forgot password?",
  "auth.forgotTitle": "Reset password",
  "auth.forgotSub": "Enter your account email. We'll send a link to create a new password.",
  "auth.forgotSent": "Reset link sent to {email}. Open your email to set a new password.",
  "auth.forgotBack": "Back to log in",
  "auth.forgotSend": "Send link",
  "auth.newPassTitle": "Create a new password",
  "auth.newPassSub": "Set a new password for your account, then log in again.",
  "auth.newPassSave": "Save password",

  "auth.mascotAlt": "FINHABIT mascot",

  "err.emailTaken": "Email is already registered",
  "toast.verified": "Account verified!",
  "toast.error": "Something went wrong",
  "toast.passwordUpdated": "Password updated. Please log in.",
  "toast.demoMode": "Demo mode active",
  "toast.demoFallback": "Backend unreachable. Demo mode active.",
  "toast.network": "Network issue. Try again.",
  "err.emailNotConfirmed": "Email is not confirmed. Check your inbox.",
  "err.emailFormat": "Email format is invalid",
  "err.badCredentials": "Incorrect email or password",
  "err.rateLimit": "Too many attempts. Please wait a moment, then try again.",
  "err.weakPassword": "Password is too short or weak",
  "err.notImage": "File must be a JPG, PNG, or WebP image",
  "err.signupClosed": "Sign-ups are currently closed.",
  "err.loginFailed": "Sign-in failed. Try again.",
  "err.registerFailed": "Sign-up failed. Try again.",
  "err.otpInvalid": "Code is wrong or expired. Try again.",

  "toast.hello": "Hello, {name}!",
  "toast.demoActive": "Demo mode active",
  "toast.networkLogin": "Backend unreachable. Demo mode active.",
  "toast.networkErr": "Network problem. Try again.",
  "toast.reset": "Data reset",

  "home.greet.morning": "Good morning",
  "home.greet.afternoon": "Good afternoon",
  "home.greet.evening": "Good evening",
  "home.greet.night": "Good night",
  "home.headline": "One small habit today.",
  "home.limitOver": "Over budget",
  "home.limitNear": "Close to the limit",
  "home.limitBody": "This month you spent {spent} of {budget} ({pct}%).",
  "home.limitHintOver": "You are past your budget. Check your spending pattern in Limit Warning.",
  "home.limitHintWarn": "Do not go over: review your spending now.",
  "home.scoreLabel": "Financial Habit Score",
  "home.scoreUp": "Up {n} points",
  "home.scoreDown": "Down {n} points",
  "home.scoreWeek": "from last week.",
  "home.progressTitle": "Today's progress",
  "home.progressSub": "{done} of {total} daily activities done.",
  "home.dailyLabel": "Daily Challenge",
  "home.challengeDone": "Done today ✓",
  "home.challengeStart": "Start Challenge",
  "home.quickTitle": "Quick Actions",
  "home.quickExpenses": "Track Spending",
  "home.quickBudget": "Limit Warning",
  "home.quickSaving": "Saving Goals",
  "home.quickDecide": "Decision Lab",
  "home.quickLearn": "Learn",
  "home.quickFamily": "Family Mission",
  "home.quickLeaderboard": "Leaderboard",
  "home.quickAdmin": "Admin",
  "home.statStreak": "Day streak",
  "home.statPoints": "Total points",
  "home.statChallenge": "Challenge",

  "score.title": "Financial Habit Score",
  "score.sr": "Score {value} out of 100",
  "score.week": "Last week {last} → this week {now} ({diff})",
  "score.breakdown": "Breakdown",
  "score.progress": "Your Progress",
  "score.weekHint": "Score for the last 7 days.",
  "score.tStarter": "Financial Starter",
  "score.tSteady": "Getting Steady",
  "score.tSmart": "Financial Smart",
  "score.tMaster": "Financial Master",
  "level.beginner": "Financial Beginner",
  "level.explorer": "Financial Explorer",
  "level.achiever": "Financial Achiever",
  "level.master": "Financial Master",

  "learn.title": "Learn",
  "learn.sub": "Short lessons, then put them into practice.",
  "learn.progressTitle": "Lesson progress",
  "learn.progressSub": "{done} of {total} lessons done.",
  "learn.done": "Done ✓",
  "learn.markDone": "Mark done (+10 points)",
  "learn.readAgain": "Read again",
  "learn.study": "Study",
  "learn.count": "{done}/{n} lessons",
  "learn.doneTitle": "Lesson finished!",

  "ch.title": "Daily Challenge",
  "ch.sub": "One real challenge a day. Watch, read, or work through it to the end, then write down what you took from it.",
  "ch.steps": "Follow these steps",
  "ch.checkAll": "Tick every step first",
  "ch.reflection": "Your reflection",
  "ch.reflectionHint": "Write one thing you took away from this challenge.",
  "ch.reflectionShort": "Your reflection is too short, write at least 15 characters.",
  "ch.openSource": "Open the original source",
  "ch.source": "Source",
  "ch.inApp": "No link, do it right inside the app.",
  "ch.stepCount": "Step {done} of {total}",
  "ch.filterAll": "All",
  "ch.kind.video": "Video",
  "ch.kind.read": "Read",
  "ch.kind.quiz": "Quiz",
  "ch.kind.practice": "Practice",
  "ch.newPicked": "New challenge picked",
  "ch.other": "Other challenges",
  "ch.sourceOpened": "Source opened ✓",
  "ch.openFirst": "Open the source link before completing the challenge.",
  "ch.gateHint": "Open the source link above so this challenge counts as done.",
  "ch.todayList": "Today's picks",
  "ch.todayCount": "{done} of {total} challenges done today",
  "ch.shuffle": "Pick another",
  "ch.doneToday": "Already done today ✓",
  "ch.doIt": "Complete Challenge",
  "ch.doneTitle": "Challenge completed!",
  "ch.doneMark": " · done ✓",

  "ex.title": "Track Spending",
  "ex.sub": "Track where your money goes: snacks, rides, top-ups.",
  "ex.thisMonth": "This month",
  "ex.aman": "Safe",
  "ex.perhatian": "Watch out",
  "ex.berlebihan": "Over the top",
  "ex.fromBudget": "of budget {budget}",
  "ex.pctHint": "{pct}% of the monthly limit.",
  "ex.formTitle": "Add expense",
  "ex.phNote": "Note (optional)",
  "ex.btnAdd": "Add expense (+5 points)",
  "ex.history": "History",
  "ex.empty": "No expenses this month.",
  "ex.errAmount": "Enter an amount above 0",
  "ex.added": "Expense recorded",
  "ex.delete": "Delete",

  "bu.title": "Limit Warning",
  "bu.sub": "Know when your spending gets out of hand before your wallet cries.",
  "bu.loading": "Loading budget data...",
  "bu.safeTag": "Safe",
  "bu.safeTitle": "Your spending is under control.",
  "bu.safeHint": "You are nowhere near your monthly budget. Keep the pace.",
  "bu.warnTag": "Watch out",
  "bu.warnTitle": "Your spending is getting out of hand.",
  "bu.warnHint": "You have used most of the monthly budget. Not much is left. Tighten up before your wallet cries.",
  "bu.overTag": "Over the top",
  "bu.overTitle": "The monthly budget is already over.",
  "bu.overHint": "You went past the limit. Focus the rest of the month on non-essential spending.",
  "bu.noneTag": "Not set",
  "bu.noneTitle": "Set your monthly budget.",
  "bu.noneHint": "Set a limit so the app can warn you.",
  "bu.formTitle": "Monthly budget",
  "bu.fieldLabel": "Budget amount (Rp)",
  "bu.fromSpent": "of {budget} · {pct}%",
  "bu.btnSave": "Save budget",
  "bu.saved": "Budget saved",
  "bu.err": "Enter a budget above 0",
  "bu.level": "Levels: {a} (<80%), {b} (80-100%), {c} (>100%). The app marks your status on Home automatically.",


  // 52 string untuk halaman tabungan
  "g.title": "Savings",
  "g.sub": "Split each target into its own pot, with its own history.",
  "g.newTitle": "New savings goal",
  "g.create": "Create goal",
  "g.createFirst": "Create your first goal",
  "g.editTitle": "Edit goal",
  "g.save": "Save",
  "g.edit": "Edit",
  "g.menu": "Options for {name}",
  "g.deleteGoal": "Delete goal",
  "g.deleteGoalTitle": "Delete this goal?",
  "g.deleteGoalBody": "\"{name}\" will be deleted permanently, including {count} entries in it. Deleted entries cannot be restored.",
  "g.goalDeleted": "Goal deleted",
  "g.empty": "No savings goals yet. Create one to start.",
  "g.notFound": "Goal not found.",
  "g.name": "Goal name",
  "g.phName": "e.g. New laptop",
  "g.target": "Target",
  "g.phTarget": "e.g. 3000000",
  "g.cadence": "Save per",
  "g.cadenceUnit": "Unit",
  "g.cadenceHint": "Leave blank if you have no plan yet.",
  "g.unitDay": "day",
  "g.unitWeek": "week",
  "g.unitMonth": "month",
  "g.collected": "Collected",
  "g.reached": "Target reached.",
  "g.noPlan": "No plan yet",
  "g.daysLeft": "{days} days left",
  "g.daysLabel": "Days left",
  "g.ringMoney": "Amount collected",
  "g.ringDays": "Pace against plan",
  "g.paceAhead": "Ahead of plan",
  "g.paceOnTrack": "On track",
  "g.paceLate": "Behind plan",
  "g.paceDone": "Achieved",
  "g.paceUnknown": "No plan yet",
  "g.planNote": "{remain} left of your target.",
  "g.history": "History",
  "g.txEmpty": "No deposits or withdrawals yet.",
  "g.txTitle": "Add entry",
  "g.txSave": "Save",
  "g.txSaved": "Saved",
  "g.income": "Deposit",
  "g.expense": "Withdrawal",
  "g.amount": "Amount",
  "g.phAmount": "e.g. 50000",
  "g.note": "Note",
  "g.phNote": "Optional, e.g. weekly deposit",
  "g.delete": "Delete entry",
  "g.deleteTitle": "Delete this entry?",
  "g.deleteBody": "Your balance will drop by {amount}. Deleted entries cannot be restored.",
  "g.deleteConfirm": "Delete",
  "g.cancel": "Cancel",
  "g.deleted": "Entry deleted",
  "g.changePhoto": "Change photo",
  "g.uploading": "Uploading...",

  "de.title": "Decision Lab",
  "de.sub": "Decision quiz: a correct answer adds points, a wrong one subtracts.",
  "de.caseOf": "Case {n} of {total}",
  "de.ptsGain": "+{n} points",
  "de.noPts": "No points for this choice",
  "de.resultTitle": "You chose {choice}",
  "de.next": "Next",
  "de.hardMode": "Hard Mode",
  "de.wrongCount": "Wrong: {n}/{max}",
  "de.freeTag": "No Points",
  "de.finishBtn": "Finish Quiz",
  "de.startTitle": "Start Quiz",
  "de.startSub": "Help Bailey make the right call. Correct answers add points, wrong ones subtract.",
  "de.startBtn": "Start Quiz",
  "de.warnTitle": "Sorry, your point quiz is used up.",
  "de.warnSub": "Continue without points?",
  "de.warnContinue": "Continue Without Points",
  "de.warnEnd": "Finish",
  "de.freeGood": "Correct!",
  "de.freeBad": "Not quite.",
  "de.correctToast": "Correct! +{n} points",
  "de.wrongToast": "Not quite. −{n} points",
  "de.resultCorrect": "Correct! +{pts} points",
  "de.resultWrong": "Not quite. −{pts} points",
  "de.doneEarned": "Points today: {earned}",
  "de.hiddenBonus": "Hidden bonus: +{n} points",
  "de.allDoneTitle": "All quizzes done for today!",
  "de.allDoneSub": "Come back tomorrow for new quizzes and points.",

  "fa.title": "Family Mission",
  "fa.sub": "Missions you do with your family at home.",
  "fa.budget": "Budget",
  "fa.duration": "Duration",
  "fa.status": "Status",
  "fa.done": "Done",
  "fa.running": "In progress",
  "fa.doneLabel": "Mission done ✓",
  "fa.complete": "Complete Mission",
  "fa.success": "Family mission complete!",

  "pf.title": "Profile",
  "pf.editIdentity": "Name & photo",
  "pf.nameLabel": "Display name",
  "pf.namePlaceholder": "Your name",
  "pf.photoLabel": "Profile photo",
  "pf.changePhoto": "Change photo",
  "pf.removePhoto": "Remove photo",
  "pf.photoHint": "PNG, JPG, or WebP. 2 MB maximum.",
  "pf.photoTooBig": "The photo must be 2 MB or smaller.",
  "pf.photoBadType": "The photo must be a PNG, JPG, or WebP file.",
  "pf.save": "Save changes",
  "pf.saved": "Profile updated",
  "pf.nameTooLong": "The name can be at most 40 characters.",
  "pf.needName": "The name cannot be empty.",
  "pf.photoUploading": "Uploading photo...",
  "pf.streak": "Streak",
  "pf.challenge": "Challenge",
  "pf.points": "Points",
  "pf.badges": "Badges",
  "pf.data": "Data",
  "pf.demoNote": "Demo mode. Data is stored only in this browser.",
  "pf.liveNote": "Data is synced to your account.",
  "pf.resetBtn": "Reset Demo Data",
  "pf.logout": "Log out",
  "pf.language": "Language",
  "pf.languageSub": "Choose the app language.",
  "pf.resetConfirm": "Reset all data to its initial state?",

  "lb.title": "Leaderboard",
  "lb.sub": "Ranking is based on total points. The more good habits, the higher you go.",
  "lb.posTitle": "Your position",
  "lb.myPos": "You are at rank #{rank} of {total} players.",
  "lb.streak": "streak {n}",
  "lb.you": "You",
  "lb.empty": "No players yet.",
  "lb.loading": "Loading leaderboard...",

  "ad.title": "Admin Panel",
  "ad.forbidden": "This page is only for admin accounts.",
  "ad.totalUsers": "Total users",
  "ad.challengesDoneShort": "challenges done",
  "ad.transactions": "Transactions",
  "ad.activeToday": "Active today",
  "ad.avgTitle": "User averages",
  "ad.avgScore": "Financial score",
  "ad.avgPoints": "Points",
  "ad.avgStreak": "Day streak",
  "ad.spent": "Total recorded spending: {value}",
  "ad.users": "Users",
  "ad.promote": "Make admin",
  "ad.demote": "Demote",
  "ad.confirmPromote": "Make {name} an admin?",
  "ad.confirmDemote": "Demote {name} to user?",
  "ad.roleChanged": "Your role changed. Log in again to refresh.",
  "ad.activity": "Recent activity",
  "ad.emptyActivity": "No transactions yet.",
  "ad.userLine": "{points} points · streak {streak} · {badges} badge · {done} challenge",
  "ad.subtitle": "Manage users, monitor spending, and keep teens' finances healthy.",
  "ad.overview": "Overview",
  "ad.rank": "Rank",
  "ad.name": "Name",
  "ad.role": "Role",
  "ad.points": "Points",
  "ad.streak": "Streak",
  "ad.badges": "Badges",
  "ad.challenges": "Challenges",
  "ad.adminRole": "Admin",
  "ad.userRole": "User",
  "ad.forbiddenDesc": "This page is only for admin accounts.",
  "ad.date": "Date",
  "ad.category": "Category",
  "ad.note": "Note",
  "ad.user": "User",
  "ad.amount": "Amount",
  "ad.ban": "Ban",
  "ad.unban": "Unban",
  "ad.banned": "Banned",
  "ad.confirmBan": "Ban {name}? They won't be able to sign in.",
  "ad.confirmUnban": "Restore {name}?",
  "ad.leaderboard": "Leaderboard",
  "ad.detail": "Details",
  "ad.profileDetail": "Profile details",
  "ad.dims": "Financial dimensions",
  "ad.weekly": "Weekly points",
  "ad.spendByCat": "Spending by category",
  "ad.emptyChart": "No data yet",
  "ad.backToApp": "Back to app",
  "ad.finance": "Finance",
  "ad.totalSpent": "Total spent",
  "ad.withAvatar": "With photo",
  "ad.pointsSpread": "Points spread",
  "ad.avgScore": "Average score",
  "ad.avgStreak": "Average streak",
  "ad.spendTrend": "Spending trend, 14 days",
  "ad.scoreBands": "Habit score bands",
  "ad.skillRadar": "Skill profile (average)",
  "ad.literacyGood": "high literacy",
  "ad.topUsers": "Top of the board",
  "ad.savingTotal": "Total saved",
  "ad.band2.starter": "Starter",
  "ad.band2.steady": "Steady",
  "ad.band2.smart": "Smart",
  "ad.band2.master": "Master",
  "ad.band.0_99": "0-99",
  "ad.band.100_299": "100-299",
  "ad.band.300_599": "300-599",
  "ad.band.600_1199": "600-1199",
  "ad.band.1200plus": "1200+",
  "ch.custom": "custom",
  "ch.builtin": "built-in",
  "ch.crSub": "Built-in challenges can't be edited here. Anything you create shows up in the daily picks alongside them.",
  "ch.form.kind": "Type",
  "ch.form.dim": "Dimension",
  "ch.form.title": "Title",
  "ch.form.desc": "Short description",
  "ch.form.source": "Source",
  "ch.form.url": "Source link (https)",
  "ch.form.steps": "Steps",
  "ch.form.stepN": "Step {n}",
  "ch.form.addStep": "Add step",
  "ch.form.minutes": "Minutes",
  "ch.form.points": "Points",
  "ch.form.position": "Order",
  "ch.form.saveEdit": "Save changes",
  "ch.form.create": "Create challenge",
  "ch.form.cancel": "Cancel edit",
  "ch.customList": "Admin-created challenges",
  "ch.noCustom": "No admin-created challenges yet.",
  "ch.active": "Active",
  "ch.inactive": "Inactive",
  "ch.activate": "Activate",
  "ch.deactivate": "Deactivate",
  "chErr.title": "Title needs at least 3 characters.",
  "chErr.steps": "Fill in at least one step.",
  "chErr.url": "The source link must start with https://",
  "chErr.saved": "Challenge updated",
  "chErr.created": "Challenge created",
  "chErr.delete": "Delete this challenge",
  "chErr.deleted": "Challenge deleted",
  "ad.joined": "Joined",
  "ad.lastActive": "Last active",
  "ad.savingProgress": "Savings",
  "ad.budgetInfo": "Monthly budget",
  "ad.banners": "Home Banners",
  "ad.bannerSub": "Promo images shown as a carousel on the Home page.",
  "ad.bannerAdd": "Add banner",
  "ad.bannerImage": "Image",
  "ad.bannerResize": "Recommended 750×280. Images are resized automatically.",
  "ad.bannerCaption": "Caption (optional)",
  "ad.bannerLink": "Target link (optional)",
  "ad.bannerPosition": "Order",
  "ad.bannerActive": "Active",
  "ad.bannerInactive": "Inactive",
  "ad.bannerDelete": "Delete",
  "ad.bannerAdded": "Banner added",
  "ad.bannerUpdated": "Banner updated",
  "ad.bannerDeleted": "Banner deleted",
  "ad.bannerNoImage": "Pick an image first",
  "err.banned": "Your account has been suspended by an admin.",
};

const TOPICS_ID = [
  {
    id: "saving",
    icon: "piggy",
    title: "Menabung",
    desc: "Menabung adalah kebiasaan menyisihkan sebagian uang untuk tujuan tertentu.",
    lessons: [
      { id: "sav1", title: "Menabung itu keputusan, bukan sisa", body: "Menabung bukan uang yang tersisa di akhir hari, tapi uang yang kamu sisihkan di awal. Begitu menerima uang saku, pisahkan dulu bagian tabungan, baru sisanya dipakai." },
      { id: "sav2", title: "Aturan 20% uang saku", body: "Coba sisihkan 20% dari uang saku. Kalau uang sakumu Rp25.000 per hari, berarti Rp5.000 masuk tabungan. Dalam satu bulan sekolah, itu sekitar Rp100.000." },
      { id: "sav3", title: "Pisahkan tempatnya", body: "Uang tabungan yang bercampur dengan uang jajan hampir selalu terpakai. Gunakan amplop, celengan, atau rekening terpisah supaya tidak tergoda." }
    ]
  },
  {
    id: "spending",
    icon: "cart",
    title: "Belanja Cerdas",
    desc: "Membelanjakan uang untuk hal yang benar-benar kamu butuhkan dan hargai.",
    lessons: [
      { id: "sp1", title: "Kebutuhan vs keinginan", body: "Kebutuhan membuatmu tetap berfungsi: makan, transportasi, alat sekolah. Keinginan membuatmu senang sesaat. Keduanya boleh, tapi kebutuhan didahulukan." },
      { id: "sp2", title: "Jeda 24 jam", body: "Untuk pembelian di atas Rp50.000 yang tidak mendesak, tunggu satu hari. Kalau besok kamu masih menginginkannya, kemungkinan itu memang bernilai untukmu." },
      { id: "sp3", title: "Hitung dalam jam, bukan rupiah", body: "Kalau kamu menabung Rp5.000 per hari, minuman Rp25.000 sama dengan 5 hari menabung. Cara ini membuat harga terasa lebih nyata." }
    ]
  },
  {
    id: "budget",
    icon: "clipboard",
    title: "Anggaran",
    desc: "Merencanakan ke mana uangmu pergi sebelum uang itu habis.",
    lessons: [
      { id: "bd1", title: "Pola 50-30-20 versi pelajar", body: "50% kebutuhan harian (makan, transport), 30% keinginan (jajan, hiburan), 20% tabungan. Sesuaikan angkanya dengan kondisimu." },
      { id: "bd2", title: "Catat 7 hari", body: "Sebelum membuat anggaran, catat pengeluaran selama seminggu. Kebanyakan orang kaget melihat total jajannya." },
      { id: "bd3", title: "Anggaran boleh meleset", body: "Anggaran adalah rencana, bukan hukuman. Kalau meleset, perbaiki angkanya minggu depan, jangan berhenti mencatat." }
    ]
  },
  {
    id: "goal",
    icon: "target",
    title: "Target",
    desc: "Tujuan yang jelas membuat menabung terasa masuk akal.",
    lessons: [
      { id: "gl1", title: "Tujuan yang spesifik", body: "\"Ingin menabung\" terlalu kabur. \"Sepatu futsal Rp300.000 dalam 3 bulan\" jelas: berarti Rp3.400 per hari." },
      { id: "gl2", title: "Pecah jadi target kecil", body: "Target Rp300.000 terasa jauh. Pecah jadi Rp25.000 per minggu selama 12 minggu, lalu rayakan setiap 25% tercapai." },
      { id: "gl3", title: "Tulis dan lihat setiap hari", body: "Tujuan yang ditulis dan terlihat (di buku, di dinding, di aplikasi) jauh lebih sering tercapai daripada yang hanya dipikirkan." }
    ]
  },
  {
    id: "risk",
    icon: "shield",
    title: "Kewaspadaan Risiko",
    desc: "Mengenali tawaran yang berisiko, penipuan, dan pengeluaran mendadak.",
    lessons: [
      { id: "rs1", title: "Dana darurat kecil", body: "Sisihkan sedikit uang untuk hal tak terduga: fotokopi mendadak, ban bocor, atau ongkos pulang. Rp50.000 sudah membantu." },
      { id: "rs2", title: "Untung besar, cepat, pasti", body: "Tiga kata itu muncul bersamaan hampir selalu berarti penipuan. Keuntungan yang tinggi selalu datang bersama risiko yang tinggi." },
      { id: "rs3", title: "Jangan bagikan data pribadi", body: "OTP, PIN, dan foto kartu tidak pernah diminta oleh pihak resmi. Sekali dibagikan, uangmu bisa hilang dalam hitungan detik." }
    ]
  }
];

const TOPICS_EN = [
  {
    id: "saving",
    icon: "piggy",
    title: "Saving",
    desc: "Saving is the habit of setting aside part of your money for a purpose.",
    lessons: [
      { id: "sav1", title: "Saving is a decision, not a leftover", body: "Saving is not the money left at the end of the day, but the money you put aside first. When you get your allowance, split the savings part first, then use the rest." },
      { id: "sav2", title: "The 20% rule", body: "Try setting aside 20% of your allowance. If you get Rp25.000 a day, that means Rp5.000 goes into savings. Over one school month, that is around Rp100.000." },
      { id: "sav3", title: "Keep it separate", body: "Savings mixed with spending money almost always get spent. Use an envelope, a piggy bank, or a separate account so you are not tempted." }
    ]
  },
  {
    id: "spending",
    icon: "cart",
    title: "Smart Spending",
    desc: "Spending money on things you really need and value.",
    lessons: [
      { id: "sp1", title: "Needs vs wants", body: "Needs keep you going: food, transport, school gear. Wants make you happy for a moment. Both are fine, but needs come first." },
      { id: "sp2", title: "The 24-hour pause", body: "For purchases above Rp50.000 that are not urgent, wait one day. If you still want it tomorrow, it is probably worth it." },
      { id: "sp3", title: "Think in days, not rupiah", body: "If you save Rp5.000 a day, a Rp25.000 drink equals 5 days of saving. That makes the price feel more real." }
    ]
  },
  {
    id: "budget",
    icon: "clipboard",
    title: "Budgeting",
    desc: "Planning where your money goes before it runs out.",
    lessons: [
      { id: "bd1", title: "The student 50-30-20", body: "50% daily needs (food, transport), 30% wants (snacks, fun), 20% savings. Adjust the numbers to your situation." },
      { id: "bd2", title: "Track 7 days", body: "Before making a budget, record your spending for a week. Most people are shocked by their snack total." },
      { id: "bd3", title: "Budgets can miss", body: "A budget is a plan, not a punishment. If you miss, fix the numbers next week, do not stop tracking." }
    ]
  },
  {
    id: "goal",
    icon: "target",
    title: "Goal Setting",
    desc: "Clear goals make saving feel sensible.",
    lessons: [
      { id: "gl1", title: "Be specific", body: "\"I want to save\" is too vague. \"Futsal shoes, Rp300.000, in 3 months\" is clear: that is Rp3.400 a day." },
      { id: "gl2", title: "Break it into small targets", body: "A Rp300.000 goal feels far. Break it into Rp25.000 a week for 12 weeks, and celebrate every 25%." },
      { id: "gl3", title: "Write it down and look at it", body: "A goal that is written and visible (in a book, on the wall, in the app) is far more often achieved than one only kept in your head." }
    ]
  },
  {
    id: "risk",
    icon: "shield",
    title: "Risk Awareness",
    desc: "Spotting risky offers, scams, and surprise expenses.",
    lessons: [
      { id: "rs1", title: "A small emergency fund", body: "Set aside a little money for the unexpected: sudden photocopies, a flat tire, or bus fare home. Rp50.000 already helps." },
      { id: "rs2", title: "Big profit, fast, guaranteed", body: "Those three words together almost always mean a scam. High returns always come with high risk." },
      { id: "rs3", title: "Never share personal data", body: "OTP, PIN, and card photos are never asked for by legitimate parties. Once shared, your money can vanish in seconds." }
    ]
  }
];

const CHALLENGES_ID = CHALLENGES;

const CHALLENGES_EN = [
  {
    id: "c1",
    cat: "Video",
    kind: "video",
    title: "Watch: SparkTheDream Session 1, Money that Matters",
    desc: "The opening session of JA SparktheDream. Explains where money comes from and why it matters in daily life.",
    source: "SparkTheDream PH",
    url: "https://www.youtube.com/watch?v=t_sx5UB1jlA",
    steps: [
      "Open the video and watch until the closing, do not skip.",
      "Write down three roles of money you remember: spending, saving, or sharing.",
      "Pick the one role you do most often this week."
    ],
    min: 8,
    pts: 30,
    dim: "saving"
  },
  {
    id: "c2",
    cat: "Video",
    kind: "video",
    title: "Watch: Needs versus Wants",
    desc: "How to tell what you need from what you want, and why the gap gets expensive at the end of the month.",
    source: "Uanglogy",
    url: "https://www.youtube.com/watch?v=A_X_UYplTc0",
    steps: [
      "Watch it all the way through and note the examples of needs and wants.",
      "Write down one need and two wants you have this month.",
      "Pick one want to delay this week, and say why."
    ],
    min: 6,
    pts: 30,
    dim: "spending"
  },
  {
    id: "c3",
    cat: "Video",
    kind: "video",
    title: "Watch: 5 Saving Tips for Students",
    desc: "Practical saving tips for school and university students, including how to start with a small allowance.",
    source: "Ayo Nabung",
    url: "https://www.youtube.com/watch?v=i1Ly15c3Npo",
    steps: [
      "Watch until the end and write the three tips you can actually use.",
      "Decide a realistic first deposit from your allowance.",
      "Write that number on the Saving page as your weekly target."
    ],
    min: 7,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c4",
    cat: "Video",
    kind: "video",
    title: "Watch: Financial Literacy in 20 Minutes",
    desc: "A compact recap from the basics to a personal money plan. Good warm-up before you start tracking expenses.",
    source: "Sulianto Indria Putra",
    url: "https://www.youtube.com/watch?v=CKqjmdvdMkE",
    steps: [
      "Watch it through and note any point that was new to you.",
      "Write down three new terms you learned and what they mean.",
      "Apply one of those terms to today's expense entry."
    ],
    min: 20,
    pts: 35,
    dim: "decision"
  },
  {
    id: "c5",
    cat: "Video",
    kind: "video",
    title: "Watch: Smart Finance, a Guide for Students",
    desc: "Material for high school students that explains financial literacy the way the curriculum frames it.",
    source: "Erwan Dimantara SE",
    url: "https://www.youtube.com/watch?v=pdT_TE9XKYY",
    steps: [
      "Watch the video until it ends.",
      "Write down one idea you can use to manage your snack and meal money.",
      "Set one simple target for this week based on that idea."
    ],
    min: 10,
    pts: 30,
    dim: "goal"
  },
  {
    id: "c6",
    cat: "Video",
    kind: "video",
    title: "Watch: OJK on Young People Trapped in Illegal Payday Loans",
    desc: "OJK data on young people caught in illegal online loans, and what it does to your wallet.",
    source: "Bisniscom",
    url: "https://www.youtube.com/watch?v=UvvPzg8ijaQ",
    steps: [
      "Watch until the end and note the number that surprised you most.",
      "Write down three warning signs of a payday loan app.",
      "Check your phone: is any app still asking for personal data? Write your answer."
    ],
    min: 6,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c7",
    cat: "Video",
    kind: "video",
    title: "Watch: OJK Tips for Clearing Payday Loan Debt",
    desc: "How to work out and clear debt so it does not get worse, straight from the regulator.",
    source: "Kompas.com",
    url: "https://www.youtube.com/watch?v=tLMJGwJavx8",
    steps: [
      "Watch it through and write down the order of the steps.",
      "Write down one risk you have seen a friend go through.",
      "Write your own limit: the most you are willing to borrow this month."
    ],
    min: 7,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c8",
    cat: "Video",
    kind: "video",
    title: "Watch: What Is a Share, an Introduction for Beginners",
    desc: "The most basic explanation of shares, using an analogy a beginner can follow.",
    source: "Saham dari Nol",
    url: "https://www.youtube.com/watch?v=uGzToPCX8nU",
    steps: [
      "Watch it all the way through and write three keywords about shares.",
      "Write one reason people invest and one risk of it.",
      "Write your conclusion: are you ready to start?"
    ],
    min: 8,
    pts: 25,
    dim: "risk"
  },
  {
    id: "c9",
    cat: "Video",
    kind: "video",
    title: "Watch: Understand Shares in 30 Minutes",
    desc: "A relaxed walkthrough of shares, including how to read a price and what makes it move.",
    source: "Timothy Ronald",
    url: "https://www.youtube.com/watch?v=tQXX-npOeUY",
    steps: [
      "Watch it through and write three reasons a share price goes up.",
      "Write three reasons a share price goes down.",
      "Note one capital market term you just understood."
    ],
    min: 30,
    pts: 35,
    dim: "risk"
  },
  {
    id: "c10",
    cat: "Video",
    kind: "video",
    title: "Watch: 5 Saving Tips",
    desc: "Five quick saving tips, including the one people usually treat as trivial but that matters most.",
    source: "cclaracr",
    url: "https://www.youtube.com/watch?v=JfjevexbVVI",
    steps: [
      "Watch it through and write down all five tips.",
      "Pick one tip you have never tried.",
      "Write the small step you will run tonight for that tip."
    ],
    min: 6,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c11",
    cat: "Video",
    kind: "video",
    title: "Watch: Five Money Management Tips for Teens",
    desc: "Five money management tips that fit teenagers, covering budgets, saving, and spending on impulse.",
    source: "Transformasi Indonesia",
    url: "https://www.youtube.com/watch?v=U5cssZCvmso",
    steps: [
      "Watch until the end.",
      "Write down which tip matches your situation most closely.",
      "Turn that tip into one small rule for this week."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c12",
    cat: "Video",
    kind: "video",
    title: "Watch: JA SparktheDream 2025 Programme",
    desc: "A look inside the financial literacy programme run for Indonesian junior high students with FWD Insurance.",
    source: "FWD Insurance Indonesia",
    url: "https://www.youtube.com/watch?v=54F1TeVUlUo",
    steps: [
      "Watch until the end and notice how the programme is run.",
      "Write down one activity from it that you liked.",
      "Write one simple activity you could try at school or at home."
    ],
    min: 6,
    pts: 25,
    dim: "goal"
  },
  {
    id: "c13",
    cat: "Video",
    kind: "video",
    title: "Watch: Intro to the SparktheDream Learning Sessions",
    desc: "How the JA SparktheDream learning sessions work, useful for understanding the literacy flow used in schools.",
    source: "SparkTheDream PH",
    url: "https://www.youtube.com/watch?v=ZJgwHHZ_mbw",
    steps: [
      "Watch it through as an introduction to the programme.",
      "Write down three things JA SparktheDream covers.",
      "Pick one topic you want to go deeper on this week."
    ],
    min: 5,
    pts: 20,
    dim: "saving"
  },
  {
    id: "c14",
    cat: "Read",
    kind: "read",
    title: "Read: The Official JA SparktheDream Page",
    desc: "The official JA SparktheDream page by Prestasi Junior Indonesia. Read to the bottom to see the sessions and who they are for.",
    source: "JA SparktheDream (PJI)",
    url: "https://id.jasparkthedream.org/id/about",
    steps: [
      "Open the page and scroll to the footer.",
      "Write down the four areas the programme covers.",
      "Write the goal that interests you most."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c15",
    cat: "Read",
    kind: "read",
    title: "Read: OJK Financial Literacy Materials",
    desc: "The OJK education hub. Pick one topic and read it to the end.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Home",
    steps: [
      "Open the site and pick a topic that catches your eye.",
      "Read the article to the end instead of stopping at the headline.",
      "Write down two new facts you took from it."
    ],
    min: 8,
    pts: 30,
    dim: "decision"
  },
  {
    id: "c16",
    cat: "Read",
    kind: "read",
    title: "Read: OJK on Financial Literacy",
    desc: "The official OJK page explaining what financial literacy means and how to raise it.",
    source: "OJK",
    url: "https://ojk.go.id/id/kanal/edukasi-dan-perlindungan-konsumen/pages/literasi-keuangan.aspx",
    steps: [
      "Read the definition and the literacy figures.",
      "Write down the financial literacy figure quoted and what it means to you.",
      "Write one thing you can do to raise your own money literacy."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c17",
    cat: "Read",
    kind: "read",
    title: "Read: Handling Fake Text Messages",
    desc: "How to recognise and report scam messages, one of the schemes that shows up most often on phones.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Article/375",
    steps: [
      "Read the article through to the reporting section.",
      "Write down three signs of a fake message.",
      "Write the official number or site you would use to report it."
    ],
    min: 5,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c18",
    cat: "Read",
    kind: "read",
    title: "Read: Do Not Blindly Follow Finfluencers",
    desc: "OJK on judging whether a financial influencer is credible before you act on their advice.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Article/40959",
    steps: [
      "Read through to the checklist.",
      "Write three signs of a trustworthy finfluencer and one to avoid.",
      "Write one finfluencer you follow and your own verdict on them."
    ],
    min: 6,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c19",
    cat: "Quiz",
    kind: "quiz",
    title: "Complete: JA SparktheDream Money Quiz",
    desc: "A 13 question quiz from JA SparktheDream. Earn the Financial Expert badge with nine or more correct answers.",
    source: "JA SparktheDream",
    url: "https://id.jasparkthedream.org/id/money-quiz",
    steps: [
      "Open the quiz and answer all 13 questions.",
      "Write down the score you got.",
      "Write one question that made you think, and why."
    ],
    min: 10,
    pts: 35,
    dim: "decision"
  },
  {
    id: "c20",
    cat: "Quiz",
    kind: "quiz",
    title: "Play: OJK Saving Games",
    desc: "Ayo Menabung and Puzzle Tabunganku from OJK. A way to practise saving while playing.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/GameList",
    steps: [
      "Open the game list and pick one.",
      "Play until you finish, and try a second one if you still have time.",
      "Write down one new trick you picked up from it."
    ],
    min: 10,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c21",
    cat: "Quiz",
    kind: "quiz",
    title: "Try: JA SparktheDream Money Simulation",
    desc: "A simulation of spending and saving choices from JA SparktheDream. Good practice before you move real allowance money.",
    source: "JA SparktheDream",
    url: "https://id.jasparkthedream.org/id/student",
    steps: [
      "Start the simulation and pick answers on instinct.",
      "Finish one full round.",
      "Write one decision you would change if you ran it again."
    ],
    min: 10,
    pts: 30,
    dim: "decision"
  },
  {
    id: "c22",
    cat: "Practice",
    kind: "practice",
    title: "Record every expense you made today",
    desc: "Write down every expense today, however small, then see which category is the largest.",
    source: "In the app",
    url: "",
    steps: [
      "Open the Expenses page and record every expense from today, one by one.",
      "Write down the total you recorded today.",
      "Write one expense that you think could actually have been avoided."
    ],
    min: 6,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c23",
    cat: "Practice",
    kind: "practice",
    title: "Set aside savings before you spend",
    desc: "Separate your savings at the start of the day, before the allowance is gone, instead of saving from what is left.",
    source: "In the app",
    url: "",
    steps: [
      "Separate today's savings and write down the amount.",
      "Enter that amount on the Saving page.",
      "Write down what is left of the allowance and check it covers tomorrow."
    ],
    min: 3,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c24",
    cat: "Practice",
    kind: "practice",
    title: "Delay one impulse buy by 24 hours",
    desc: "Find one thing you want to buy today, then wait 24 hours before deciding.",
    source: "In the app",
    url: "",
    steps: [
      "Write down the item you want and its price.",
      "Work out how many days of saving at Rp5.000 a day it would take.",
      "Write your decision: buy now, delay to tomorrow, or drop it."
    ],
    min: 4,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c25",
    cat: "Practice",
    kind: "practice",
    title: "Set tomorrow's spending budget",
    desc: "Decide the maximum you will spend tomorrow before the day starts, and write it down.",
    source: "In the app",
    url: "",
    steps: [
      "Write your maximum spending for tomorrow in rupiah.",
      "Write the three categories most likely to take money tomorrow.",
      "Write a simple rule: what you will do once you hit the limit."
    ],
    min: 5,
    pts: 25,
    dim: "goal"
  },
  {
    id: "c26",
    cat: "Practice",
    kind: "practice",
    title: "Check one offer that sounds too good",
    desc: "Find one message or offer that sounds very rewarding, then check the risks before believing it.",
    source: "In the app",
    url: "",
    steps: [
      "Write down the offer or message you found, without sending any data.",
      "Write two signs that it is risky or suspicious.",
      "Write the verification step you would take."
    ],
    min: 5,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c27",
    cat: "Practice",
    kind: "practice",
    title: "Write one monthly budget",
    desc: "Build a 50/30/20 plan: 50 percent needs, 30 percent savings, 20 percent fun, then check whether your allowance covers it.",
    source: "In the app",
    url: "",
    steps: [
      "Write down the total money you receive this month.",
      "Apply the 50/30/20 split and write the amount for each part.",
      "Write one adjustment that makes the plan actually workable."
    ],
    min: 6,
    pts: 30,
    dim: "goal"
  },
  {
    id: "c28",
    cat: "Practice",
    kind: "practice",
    title: "Compare prices in three places",
    desc: "Check at least three shops or marketplaces for the same item, then see which price makes sense.",
    source: "In the app",
    url: "",
    steps: [
      "Pick one item you buy often.",
      "Write the price from at least three different places.",
      "Write your best option and the price gap."
    ],
    min: 5,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c29",
    cat: "Practice",
    kind: "practice",
    title: "Update your saving target",
    desc: "Open the Saving page and check whether your target still fits the allowance you actually get.",
    source: "In the app",
    url: "",
    steps: [
      "Write down your current saving target.",
      "Work out how many days your daily deposit would take.",
      "Write a more realistic target if the number did not add up."
    ],
    min: 4,
    pts: 20,
    dim: "goal"
  },
  {
    id: "c30",
    cat: "Practice",
    kind: "practice",
    title: "Review your last seven days",
    desc: "Look at this week's spending summary, group it by category, then pick one thing to fix.",
    source: "In the app",
    url: "",
    steps: [
      "Open the Expenses page and look at this week's total.",
      "Write which category is the largest and what share it is.",
      "Write one improvement for next week."
    ],
    min: 8,
    pts: 30,
    dim: "decision"
  }
];

const CASES_ID = [
  {
    text: "Kamu memiliki Rp50.000. Temanmu mengajak membeli minuman seharga Rp25.000, tetapi kamu sedang menabung untuk membeli barang seharga Rp300.000.",
    correct: 2,
    hard: false,
    options: [
      { label: "Ikut membeli karena semua teman membeli.", consequence: "Uangmu tersisa Rp25.000 dan tabungan tidak bertambah hari ini.", impact: "Saldo −Rp25.000 · Target mundur ± 5 hari", lesson: "Tekanan teman adalah pengeluaran yang paling sering tidak disadari. Ikut sesekali tidak masalah, tapi kalau menjadi kebiasaan mingguan, biayanya Rp100.000 per bulan.", pts: 5, dim: "decision", d: 0 },
      { label: "Tidak membeli.", consequence: "Rp25.000 bisa langsung masuk tabungan dan targetmu lebih cepat 5 hari.", impact: "Tabungan +Rp25.000 · Target maju ± 5 hari", lesson: "Pilihan paling hemat, tapi perhatikan sisi sosialnya. Kamu tetap bisa ikut berkumpul tanpa harus membeli.", pts: 20, dim: "saving", d: 3 },
      { label: "Mencari alternatif yang lebih murah.", consequence: "Kamu ikut berkumpul dengan minuman Rp8.000, dan Rp17.000 tetap bisa ditabung.", impact: "Tabungan +Rp17.000 · Tetap ikut bersama teman", lesson: "Sering kali pilihan terbaik bukan ya atau tidak, melainkan versi yang lebih murah dari keinginan yang sama.", pts: 25, dim: "decision", d: 3 },
      { label: "Membeli tetapi mengurangi pengeluaran lain.", consequence: "Tabungan tetap aman, tapi kamu harus disiplin memotong jajan berikutnya.", impact: "Tabungan tetap · Butuh disiplin tambahan", lesson: "Ini berhasil kalau kamu benar-benar mencatat. Tanpa catatan, 'nanti dikurangi' biasanya tidak pernah terjadi.", pts: 15, dim: "spending", d: 2 }
    ]
  },
  {
    text: "Kamu menerima uang kaget Rp200.000 dari saudaramu. Ponselmu masih berfungsi, tetapi model terbaru sedang diskon dan teman-temanmu sudah memilikinya.",
    correct: 2,
    hard: false,
    options: [
      { label: "Langsung membeli aksesori ponsel baru.", consequence: "Uang habis dalam satu hari dan tidak ada yang tersisa untuk kebutuhan mendadak.", impact: "Saldo −Rp200.000 · Dana darurat kosong", lesson: "Uang tak terduga paling mudah menguap karena terasa 'bukan uang sendiri'. Perlakukan sama seperti uang hasil menabung.", pts: 5, dim: "decision", d: 0 },
      { label: "Menabung seluruhnya untuk target yang sudah ada.", consequence: "Targetmu melompat jauh dan hampir tercapai.", impact: "Tabungan +Rp200.000 · Target 67% tercapai", lesson: "Sangat kuat secara finansial. Pastikan target itu memang masih kamu inginkan agar motivasimu tidak padam.", pts: 25, dim: "saving", d: 3 },
      { label: "Membagi: 50% tabungan, 30% kebutuhan, 20% hiburan.", consequence: "Rp100.000 masuk tabungan, Rp60.000 untuk kebutuhan sekolah, Rp40.000 untuk senang-senang.", impact: "Tabungan +Rp100.000 · Keseimbangan terjaga", lesson: "Pembagian membuat kebiasaan menabung bertahan lama karena kamu tidak merasa dihukum.", pts: 30, dim: "goal", d: 4 },
      { label: "Meminjamkan seluruhnya ke teman tanpa kesepakatan.", consequence: "Uangmu tidak jelas kapan kembali dan hubungan bisa menjadi canggung.", impact: "Saldo tidak pasti · Risiko tinggi", lesson: "Meminjamkan uang bukan hal buruk, tetapi tanpa jumlah dan tanggal yang disepakati, risikonya ditanggung kamu sendiri.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Sebuah akun menawarkan 'modal Rp100.000 jadi Rp500.000 dalam 3 hari, dijamin pasti untung'. Banyak komentar mengaku berhasil.",
    correct: 2,
    hard: true,
    options: [
      { label: "Ikut karena banyak yang mengaku berhasil.", consequence: "Uangmu kemungkinan besar hilang dan akun tersebut tidak bisa dihubungi lagi.", impact: "Saldo −Rp100.000 · Risiko penipuan", lesson: "Komentar bisa dibeli atau dibuat oleh akun palsu. Bukti sosial bukan bukti keamanan.", pts: 0, dim: "risk", d: 0 },
      { label: "Mencoba dengan uang kecil dulu.", consequence: "Kamu mungkin menerima 'untung' kecil pertama, lalu diajak menyetor lebih besar.", impact: "Saldo −Rp20.000 · Umpan awal", lesson: "Keuntungan pertama yang kecil adalah taktik klasik untuk membangun kepercayaan sebelum kerugian besar.", pts: 5, dim: "risk", d: 1 },
      { label: "Menolak dan mencari tahu dulu legalitasnya.", consequence: "Uangmu aman dan kamu belajar memeriksa izin resmi sebelum menaruh uang.", impact: "Saldo aman · Kemampuan verifikasi naik", lesson: "Keuntungan tinggi yang 'dijamin pasti' bertentangan dengan prinsip dasar investasi: makin tinggi imbal hasil, makin tinggi risikonya.", pts: 30, dim: "risk", d: 4 },
      { label: "Melaporkan akun tersebut dan memberi tahu teman.", consequence: "Kamu melindungi diri sendiri sekaligus orang lain di sekitarmu.", impact: "Saldo aman · Dampak positif ke sekitar", lesson: "Literasi keuangan menjadi jauh lebih kuat ketika dibagikan, bukan disimpan sendiri.", pts: 30, dim: "risk", d: 4 }
    ]
  },
  {
    text: "Kamu menyisihkan Rp300.000 untuk beli sepatu sepak bola. Temanmu menawari kelas komedi ekstra yang membuatmu senang, seharga Rp175.000.",
    correct: 2,
    hard: false,
    options: [
      { label: "Belanja sepatu sekalian, jangan sampai kehabisan.", consequence: "Sepatu didapat, tapi target habis dan uang kas tidak ada cadangan.", impact: "Target −Rp300.000 · Tanpa dana darurat", lesson: "Membeli karena takut kehabisan adalah keputusan yang didorong rasa takut, bukan alasan.", pts: 5, dim: "decision", d: 0 },
      { label: "Masuk kelas komedi, sepatu ditunda.", consequence: "Kesenangan sesaat, tapi target kebutuhan jadi mundur cukup jauh.", impact: "Target mundur · Dana Rp175.000 berkurang", lesson: "Hiburan sah-sah saja, tapi jangan sampai menggeser kebutuhan yang sudah direncanakan.", pts: 15, dim: "goal", d: 2 },
      { label: "Tetap di target, tapi sisihkan Rp25.000 untuk hiburan.", consequence: "Sepatu tetap tercapai dan kamu tetap punya jatah senang-senang.", impact: "Target +Rp300.000 · Hiburan Rp25.000", lesson: "Memberi ruang kecil untuk hiburan menjaga konsistensi, tanpa mengorbankan kebutuhan.", pts: 25, dim: "goal", d: 3 },
      { label: "Pinjam uang ke kakak untuk ikut kelas komedi.", consequence: "Utang bertambah dan tanggung jawab membayar ke kakak.", impact: "Utang baru · Risiko berulang", lesson: "Meminjam untuk hiburan menciptakan siklus yang bisa membuatmu terus tergantung.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Iklan pemain game menawarkan item langka murah 'untuk penggemar', diskon Rp80.000. Kamu tidak benar-benar butuh item itu.",
    correct: 1,
    hard: true,
    options: [
      { label: "Segera beli sebelum harganya naik.", consequence: "Uang keluar untuk barang yang tidak kamu butuhkan.", impact: "Saldo −Rp80.000 · Impulsif", lesson: "Takut 'kehilangan diskon' membuatmu membeli di luar rencana.", pts: 5, dim: "spending", d: 0 },
      { label: "Lewati, karena memang tidak butuh.", consequence: "Uang tetap aman dan kamu tidak terbujuk citra eksklusif.", impact: "Saldo aman · Kontrol diri", lesson: "Pertanyaan terbaik sebelum membeli: apakah aku butuh, atau hanya ingin karena dipasarkan?", pts: 25, dim: "goal", d: 3 },
      { label: "Beli tapi pakai uang casual top-up.", consequence: "Kamu mengorbankan jatah game lain bulan ini.", impact: "Jatah game −Rp80.000 · Budget top-up habis", lesson: "Menukar satu jatah dengan jatah lain tetap mengurangi kemampuanmu nanti.", pts: 15, dim: "spending", d: 2 },
      { label: "Minta bonus top-up dari teman.", consequence: "Memanfaatkan teman untuk keputusan yang sebenarnya milikmu sendiri.", impact: "Social risk · Tidak mandiri", lesson: "Keputusan finansial sebaiknya dari budget pribadi, bukan meminta teman membayar.", pts: 10, dim: "decision", d: 1 }
    ]
  },
  {
    text: "Teman dekat meminjam uang Rp150.000, bilang akan mengembalikan 'besok'. Kamu sudah punya rencana menabung mingguan.",
    correct: 1,
    hard: true,
    options: [
      { label: "Pinjamkan penuh, karena takut dibilang pelit.", consequence: "Uangmu hilang dari rencana dan kamu khawatir tidak kembali.", impact: "Saldo −Rp150.000 · Rencana terganggu", lesson: "Meminjamkan karena takut penilaian orang menghilangkan kendalimu sendiri.", pts: 5, dim: "decision", d: 0 },
      { label: "Pinjamkan sebagian yang memang tidak mengganggu rencana.", consequence: "Kamu membantu namun rencana tabungan tidak terguncang.", impact: "Sisa target aman · Hubungan tetap", lesson: "Menolong tetap bisa dilakukan tanpa mengorbankan seluruh rencana.", pts: 25, dim: "goal", d: 3 },
      { label: "Pinjamkan dan abaikan rencana mingguan.", consequence: "Target menabung jadi molor, minggu depan kamu menyesal.", impact: "Rencana mundur · Penyesalan berulang", lesson: "Menolong sekali jangan menggoyahkan kebiasaan yang sudah kamu bangun.", pts: 10, dim: "saving", d: 1 },
      { label: "Bilang tidak punya, padahal punya.", consequence: "Menghindari konflik tapi membuatmu berbohong.", impact: "Kepercayaan memburuk · Dilema", lesson: "Berkomunikasi jujur tentang batasmu lebih sehat daripada berpura-pura.", pts: 15, dim: "decision", d: 2 }
    ]
  },
  {
    text: "Setiap minggu kamu menerima uang saku Rp100.000. Teman-teman jajan setiap hari, dan kalau kamu tidak ikut kamu merasa dikucilkan.",
    correct: 2,
    hard: false,
    options: [
      { label: "Ikut jajan setiap hari agar tetap dianggap teman.", consequence: "Uang saku habis sebelum akhir minggu.", impact: "Saldo −Rp100.000 · Habis di hari Kamis", lesson: "Rasa takut dikucilkan adalah pembelanja paling mahal.", pts: 5, dim: "decision", d: 0 },
      { label: "Tidak pernah jajan, menabung semuanya.", consequence: "Target cepat tercapai, tapi kebiasaan ini sukar bertahan.", impact: "Tabungan utuh · Sosial terkorbankan", lesson: "Menabung 100% biasanya tidak bertahan karena tidak ada ruang bersenang-senang.", pts: 20, dim: "saving", d: 3 },
      { label: "Beri jatah jajan Rp10.000 per hari, sisanya ditabung.", consequence: "Kamu tetap bisa kumpul dan tabungan terus bertambah.", impact: "Jatah jajan Rp50.000 · Tabungan +Rp50.000", lesson: "Konsistensi menabung bertahan ketika ada ruang kecil untuk menikmati hidup.", pts: 30, dim: "goal", d: 4 },
      { label: "Pinjam dari teman agar tetap bisa jajan.", consequence: "Utang menumpuk dan kamu harus membayar minggu depan.", impact: "Utang baru · Minggu depan menjepit", lesson: "Meminjam untuk jajan menunda masalah, bukan menyelesaikannya.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Pesan masuk di dompet digitalmu: 'Bayar Rp200.000 untuk verifikasi, sebelum itu bagikan OTP yang kami kirim'.",
    correct: 3,
    hard: true,
    options: [
      { label: "Kirim OTP, biar verifikasi cepat selesai.", consequence: "Akunmu bisa dibobol dan saldo terkuras.", impact: "Saldo −Rp200.000 · Akun diretas", lesson: "OTP adalah kunci akun. Tidak ada lembaga resmi yang memintanya lewat chat.", pts: 0, dim: "risk", d: 0 },
      { label: "Kirim OTP ke teman dulu untuk didiskusikan.", consequence: "OTP bocor ke pihak ketiga dan akunmu berisiko.", impact: "Risiko akun · Data bocor", lesson: "OTP tidak boleh dibagikan ke siapa pun, termasuk teman.", pts: 5, dim: "risk", d: 1 },
      { label: "Balas dengan bertanya siapa yang minta.", consequence: "Kamu tidak kehilangan uang, tapi masih berisiko termanipulasi.", impact: "Saldo aman · Respons meragukan", lesson: "Jangan menekan tautan atau membalas permintaan OTP; selalu buka aplikasi resmi.", pts: 15, dim: "decision", d: 2 },
      { label: "Tolak dan laporkan ke dukungan aplikasi resmi.", consequence: "Akunmu aman dan laporan membantu menutup penipuan.", impact: "Saldo aman · Penipuan dilaporkan", lesson: "Mengecek lewat aplikasi resmi dan melaporkan adalah refleks keuangan yang benar.", pts: 30, dim: "risk", d: 4 }
    ]
  },
  {
    text: "Toko online menawarkan sepatu favoritmu diskon 70% 'hari ini saja'. Kamu sedang menabung untuk membeli laptop.",
    correct: 1,
    hard: false,
    options: [
      { label: "Beli sekarang sebelum diskon hilang.", consequence: "Diskon besar membuatmu menguras tabungan laptop.", impact: "Tabungan laptop −Rp150.000 · Fokus terganggu", lesson: "'Hari ini saja' dibuat agar kamu memutuskan dengan buru-buru.", pts: 5, dim: "spending", d: 0 },
      { label: "Lewati karena tidak ada dalam rencana.", consequence: "Tabungan laptop tetap aman.", impact: "Tabungan aman · Fokus laptop", lesson: "Harga murah tidak pernah mengalahkan kebutuhan yang sedang kamu kejar.", pts: 25, dim: "goal", d: 3 },
      { label: "Beli sebagai hadiah ulang tahun kakak.", consequence: "Kamu menyenangkan orang lain tapi mengganggu rencanamu sendiri.", impact: "Tabungan berkurang · Hadiah mahal", lesson: "Hadiah tidak harus mahal; sering kali kehadiran lebih berharga.", pts: 10, dim: "decision", d: 1 },
      { label: "Beli pakai uang untuk kebutuhan sekolah.", consequence: "Kebutuhan sekolah jadi terancam.", impact: "Uang kebutuhan −Rp150.000 · Risiko besar", lesson: "Jangan pernah menyentuh uang kebutuhan pokok demi barang konsumtif.", pts: 0, dim: "spending", d: 0 }
    ]
  },
  {
    text: "Event game favoritmu menawarkan 'pasti dapat item langka' dengan biaya top-up Rp50.000 per undian. Kamu sudah menghabiskan Rp100.000 hari ini.",
    correct: 1,
    hard: false,
    options: [
      { label: "Lanjut undian sampai dapat item langka.", consequence: "Uang terus mengalir dan tabungan daruratmu kosong.", impact: "Saldo −Rp150.000 · Kecanduan undian", lesson: "Mengejar 'biar tidak sia-sia' justru membuat kerugian semakin besar.", pts: 0, dim: "risk", d: 0 },
      { label: "Berhenti sekarang, tidak top-up lagi hari ini.", consequence: "Kamu menghentikan kerugian dan merasa lebih tenang.", impact: "Kerugian dihentikan · Kontrol diri", lesson: "Berhenti setelah rugi adalah keputusan finansial yang dewasa.", pts: 25, dim: "goal", d: 3 },
      { label: "Top-up sekali lagi pakai uang saku bulan depan.", consequence: "Uang bulan depan sudah habis sebelum diterima.", impact: "Budget bulan depan −Rp50.000 · Menjepit", lesson: "Memakai uang masa depan untuk game adalah utang tersembunyi.", pts: 10, dim: "spending", d: 1 },
      { label: "Ngajak teman ikut biar bareng-bareng.", consequence: "Orang lain ikut rugi karena keputusanmu.", impact: "Sosial rusak · Kerugian bersama", lesson: "Mengajak orang lain tidak membuat keputusan itu lebih benar.", pts: 5, dim: "decision", d: 0 }
    ]
  },
  {
    text: "Kamu mendapat bonus Rp150.000 di dompet digital yang hampir kedaluwarsa besok.",
    correct: 1,
    hard: false,
    options: [
      { label: "Beli skincare mahal karena uangnya 'bonus'.", consequence: "Uang bonus habis untuk hal yang tidak direncanakan.", impact: "Saldo −Rp150.000 · Impulsif", lesson: "Uang bonus tetap uang; perlakukan sesuai rencana.", pts: 5, dim: "spending", d: 0 },
      { label: "Pindahkan 60% ke tabungan dan 40% untuk kebutuhan.", consequence: "Sebagian masuk tabungan, sebagian untuk kebutuhan riil.", impact: "Tabungan +Rp90.000 · Kebutuhan terpenuhi", lesson: "Uang tak terduga paling baik didistribusikan, bukan dihabiskan di satu tempat.", pts: 30, dim: "goal", d: 4 },
      { label: "Belikan hadiah untuk semua orang di grup.", consequence: "Kesenangan sesaat, tabungan kosong.", impact: "Saldo −Rp150.000 · Pesta selesai", lesson: "Membeli perhatian orang lain dengan uang tak terduga jarang sepadan.", pts: 10, dim: "decision", d: 1 },
      { label: "Bagikan kode bonus ke teman.", consequence: "Bonus berpindah tangan dan kamu tidak mendapat apa-apa.", impact: "Bonus hilang · Rugi", lesson: "Jangan membagikan kode atau OTP transaksi kepada siapa pun.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Temanmu belum mengembalikan Rp100.000 sudah 3 minggu, dan kini meminjam lagi Rp50.000.",
    correct: 1,
    hard: false,
    options: [
      { label: "Pinjamkan lagi supaya dia senang.", consequence: "Utang lama dan baru menumpuk, potensi tidak kembali makin besar.", impact: "Piutang Rp150.000 · Berisiko", lesson: "Meminjamkan lagi untuk menutupi yang lama adalah siklus berbahaya.", pts: 5, dim: "decision", d: 0 },
      { label: "Tegur dengan sopan dan tanyakan jadwal pengembalian.", consequence: "Kamu menjaga hubungan sekaligus memperjelas utang.", impact: "Hubungan aman · Jadwal jelas", lesson: "Batas waktu yang jelas membuat meminjam tidak merusak hubungan.", pts: 25, dim: "goal", d: 3 },
      { label: "Diam saja, takut menyakiti perasaannya.", consequence: "Kepercayaan terkikis pelan-pelan.", impact: "Utang menggantung · Suasana canggung", lesson: "Diam tidak menyelesaikan masalah uang.", pts: 15, dim: "decision", d: 2 },
      { label: "Pinjamkan dengan bunga tinggi.", consequence: "Kamu memakai kesulitan teman untuk untung.", impact: "Eksploitasi · Hubungan rusak", lesson: "Memanfaatkan utang teman untuk untung bukan cara yang sehat.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Kamu menerima uang bulanan Rp300.000 untuk semua kebutuhan: makan, transport, dan tabungan.",
    correct: 2,
    hard: false,
    options: [
      { label: "Habiskan sesuka hati, sisanya ditabung.", consequence: "Pertengahan bulan uang sudah habis.", impact: "Budget −Rp300.000 · Kosong lebih cepat", lesson: "Menabung dari 'sisa' membuat sisa itu selalu nol.", pts: 5, dim: "spending", d: 0 },
      { label: "Tidak usah menabung, toh masih ada orang tua.", consequence: "Tidak belajar mengelola dan kebiasaan menabung hilang.", impact: "Tabungan Rp0 · Kebiasaan hilang", lesson: "Kemandirian finansial tumbuh dari menabung sejak kecil, bukan menunggu dewasa.", pts: 10, dim: "saving", d: 1 },
      { label: "Bagi rencana: 50% kebutuhan, 30% tabungan, 20% hiburan, dan catat semuanya.", consequence: "Semua terkelola dan tabungan pasti bertambah.", impact: "Tabungan +Rp90.000 · Terkendali", lesson: "Anggaran 50/30/20 sederhana dan membuat uang bekerja untukmu.", pts: 30, dim: "goal", d: 4 },
      { label: "Pinjam dulu untuk kebutuhan yang belum sampai.", consequence: "Utang menumpuk sebelum uang bulan depan datang.", impact: "Utang baru · Risiko", lesson: "Meminjam untuk rutinitas mingguan adalah cara memperbesar pengeluaran.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Sebuah komunitas menawarkan 'investasi emas digital' dengan hasil 2x sebulan dan meminta kamu tidak membocorkannya ke orang lain.",
    correct: 1,
    hard: true,
    options: [
      { label: "Ikut dan sebarkan ke teman-teman.", consequence: "Merugikan teman jika ternyata skema penipuan.", impact: "Kerugian bersama · Risiko tinggi", lesson: "Ajak orang lain untuk memverifikasi, bukan untuk ikut tanpa cek.", pts: 0, dim: "risk", d: 0 },
      { label: "Cek dulu ke OJK atau konsultasi orang tua.", consequence: "Kamu tahu legalitas sebelum menaruh uang.", impact: "Saldo aman · Terverifikasi", lesson: "Memeriksa izin resmi adalah langkah pertama sebelum berinvestasi.", pts: 30, dim: "risk", d: 4 },
      { label: "Investasikan sebagian kecil saja.", consequence: "Jika penipuan, kamu tetap ikut rugi.", impact: "Saldo −Rp50.000 · Risiko sisa", lesson: "'Taruh dikit' tetap menumbuhkan harapan palsu.", pts: 10, dim: "decision", d: 1 },
      { label: "Minta persen lebih dulu dari pengelola.", consequence: "Kamu sudah menaruh uang sebelum mengecek legalitas.", impact: "Sama berisiko · Tanpa verifikasi", lesson: "Menanyakan pembagian untung tidak sama dengan memeriksa izin resmi.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Tiket konser idolamu 'dijamin pasti dapat' oleh akun reseller dengan harga 2x lipat dari harga resmi.",
    correct: 1,
    hard: false,
    options: [
      { label: "Beli cepat sebelum kehabisan.", consequence: "Harga 2x lipat menguras tabunganmu.", impact: "Saldo −Rp400.000 · Harga 2x", lesson: "Jalur resmi selalu lebih murah daripada calo.", pts: 5, dim: "spending", d: 0 },
      { label: "Cek dulu ke sumber resmi, bisa jadi sudah habis.", consequence: "Tiket reseller sering fiktif.", impact: "Saldo aman · Terverifikasi", lesson: "Membeli lewat jalur resmi melindungi uangmu.", pts: 25, dim: "goal", d: 3 },
      { label: "Transfer DP dulu, sisanya belakangan.", consequence: "DP bisa hilang jika akunnya palsu.", impact: "DP −Rp100.000 · Hilang", lesson: "Transfer sebelum barang atau tiket ada adalah risiko.", pts: 5, dim: "risk", d: 0 },
      { label: "Ngajak teman patungan beli.", consequence: "Keputusan yang buruk jadi ditanggung berdua.", impact: "Rugi bersama · Sosial", lesson: "Berbagi biaya bukan berarti keputusan itu lebih benar.", pts: 10, dim: "decision", d: 1 }
    ]
  },
  {
    text: "Kamu butuh buku referensi seharga Rp120.000. Kakak kelas menawarkan buku bekas yang sama dengan kondisi bagus seharga Rp40.000.",
    correct: 1,
    hard: false,
    options: [
      { label: "Beli yang baru, biar tidak malu.", consequence: "Selisih Rp80.000 hilang untuk barang yang sama persis.", impact: "Pengeluaran +Rp80.000 · Gengsi", lesson: "Membeli baru demi gengsi adalah pajak yang tidak perlu.", pts: 5, dim: "decision", d: 0 },
      { label: "Beli yang bekas, kualitasnya sama.", consequence: "Fungsinya sama, kamu hemat Rp80.000.", impact: "Hemat Rp80.000 · Buku sama", lesson: "Memilih barang bekas berkualitas adalah keputusan hemat yang cerdas.", pts: 25, dim: "goal", d: 3 },
      { label: "Beli keduanya.", consequence: "Dua buku yang sama, biaya double.", impact: "Pengeluaran −Rp160.000 · Boros", lesson: "Lebih banyak barang tidak selalu lebih banyak manfaat.", pts: 5, dim: "spending", d: 0 },
      { label: "Fotokopi seluruh buku agar murah.", consequence: "Bisa melanggar hak cipta meski uangmu hemat.", impact: "Risiko legal · Hemat fisik", lesson: "Menghemat tidak boleh sampai melanggar aturan.", pts: 10, dim: "risk", d: 1 }
    ]
  },
  {
    text: "Di pertengahan bulan, saldomu tinggal Rp20.000, padahal masih perlu makan siang dan ongkos selama seminggu.",
    correct: 0,
    hard: false,
    options: [
      { label: "Hitung kebutuhan minimum dan alokasikan per hari.", consequence: "Uangmu cukup terjadwal untuk seminggu.", impact: "Sisa sehat · Terjadwal", lesson: "Menjatah sisa uang sesuai kebutuhan adalah kunci selesai tanpa utang.", pts: 25, dim: "goal", d: 3 },
      { label: "Habiskan untuk jajan favorit sekali saja.", consequence: "Sisa langsung habis, kebutuhan lain terbengkalai.", impact: "Saldo Rp0 · Jajan senang", lesson: "Satu momen menyenangkan bisa mengorbankan kebutuhan seminggu.", pts: 5, dim: "spending", d: 0 },
      { label: "Pinjam dari teman untuk menambal.", consequence: "Utang menggantung sampai bulan depan.", impact: "Utang Rp20.000+ · Menjepit", lesson: "Meminjam untuk rutinitas mingguan membentuk kebiasaan utang.", pts: 5, dim: "risk", d: 0 },
      { label: "Lewati makan siang agar uang aman.", consequence: "Menghemat dengan cara membahayakan kesehatan.", impact: "Kesehatan terancam · Hemat salah arah", lesson: "Penghematan tidak boleh mengorbankan kebutuhan dasar.", pts: 10, dim: "saving", d: 1 }
    ]
  },
  {
    text: "Teman-teman mendorongmu berdonasi besar untuk acara amal, sementara uang jajanmu pas-pasan bulan ini.",
    correct: 2,
    hard: false,
    options: [
      { label: "Donasi besar agar terlihat dermawan.", consequence: "Bulan ini jadi kekurangan kebutuhan dasar.", impact: "Budget −Rp100.000 · Menjepit", lesson: "Memberi demi citra, bukan demi kebutuhan, membuatmu rugi ganda.", pts: 5, dim: "decision", d: 0 },
      { label: "Tolak total dan tidak peduli.", consequence: "Uangmu aman tapi hubungan sosial melemah.", impact: "Saldo aman · Sosial dingin", lesson: "Boleh menolak tanpa harus kasar.", pts: 15, dim: "decision", d: 2 },
      { label: "Donasi kecil sesuai kemampuan dan jelaskan jujur.", consequence: "Kamu ikut beramal tanpa mengorbankan kebutuhan.", impact: "Donasi Rp10.000 · Niat tulus", lesson: "Berdonasi sesuai kemampuan adalah amal yang berkelanjutan.", pts: 25, dim: "goal", d: 3 },
      { label: "Pinjam uang untuk donasi besar.", consequence: "Berutang untuk berderma adalah kontradiksi.", impact: "Utang Rp100.000 · Ironis", lesson: "Memberi sebaiknya dari kelebihan, bukan dari utang.", pts: 5, dim: "risk", d: 0 }
    ]
  }
];

const CASES_EN = [
  {
    text: "You have Rp50.000. A friend asks you to buy a Rp25.000 drink together, but you are saving up for something that costs Rp300.000.",
    correct: 2,
    hard: false,
    options: [
      { label: "Buy along because everyone else is.", consequence: "You are left with Rp25.000 and your savings do not grow today.", impact: "Balance −Rp25.000 · Goal delayed ± 5 days", lesson: "Peer pressure is the most unnoticed expense. Joining once is fine, but as a weekly habit it costs Rp100.000 a month.", pts: 5, dim: "decision", d: 0 },
      { label: "Do not buy.", consequence: "Rp25.000 can go straight into savings and your goal gets 5 days closer.", impact: "Savings +Rp25.000 · Goal 5 days sooner", lesson: "The most frugal choice, but mind the social side. You can still hang out without buying.", pts: 20, dim: "saving", d: 3 },
      { label: "Find a cheaper alternative.", consequence: "You join the group with an Rp8.000 drink, and Rp17.000 still goes to savings.", impact: "Savings +Rp17.000 · Still with friends", lesson: "Often the best choice is not yes or no, but a cheaper version of the same want.", pts: 25, dim: "decision", d: 3 },
      { label: "Buy it but cut other spending.", consequence: "Savings stay safe, but you must stay disciplined on your next snacks.", impact: "Savings safe · Extra discipline needed", lesson: "This works only if you really track. Without tracking, 'I will cut back later' usually never happens.", pts: 15, dim: "spending", d: 2 }
    ]
  },
  {
    text: "A relative gives you Rp200.000 as a surprise gift. Your phone works fine, but the newest model is on sale and all your friends have it.",
    correct: 2,
    hard: false,
    options: [
      { label: "Buy new phone accessories right away.", consequence: "The money is gone in one day and nothing is left for emergencies.", impact: "Balance −Rp200.000 · No emergency fund", lesson: "Unexpected money evaporates fastest because it feels like 'free money'. Treat it like money you saved.", pts: 5, dim: "decision", d: 0 },
      { label: "Save it all for your existing goal.", consequence: "Your goal jumps far ahead and is almost reached.", impact: "Savings +Rp200.000 · Goal 67% reached", lesson: "Very strong financially. Make sure the goal is still what you want so your motivation stays.", pts: 25, dim: "saving", d: 3 },
      { label: "Split it: 50% savings, 30% needs, 20% fun.", consequence: "Rp100.000 to savings, Rp60.000 for school needs, Rp40.000 for fun.", impact: "Savings +Rp100.000 · Balance kept", lesson: "Splitting keeps the saving habit going because you do not feel punished.", pts: 30, dim: "goal", d: 4 },
      { label: "Lend it all to a friend without an agreement.", consequence: "It is unclear when you will get it back and the friendship may get awkward.", impact: "Balance uncertain · High risk", lesson: "Lending money is not bad, but without an agreed amount and date, you carry the risk.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "An account offers 'turn Rp100.000 into Rp500.000 in 3 days, guaranteed profit'. Many comments claim it worked.",
    correct: 2,
    hard: true,
    options: [
      { label: "Join because many say it worked.", consequence: "Your money is likely gone and the account cannot be reached anymore.", impact: "Balance −Rp100.000 · Scam risk", lesson: "Comments can be bought or posted by fake accounts. Social proof is not proof of safety.", pts: 0, dim: "risk", d: 0 },
      { label: "Try with a small amount first.", consequence: "You may receive a small first 'profit', then be invited to deposit more.", impact: "Balance −Rp20.000 · Bait", lesson: "A small first profit is a classic tactic to build trust before a big loss.", pts: 5, dim: "risk", d: 1 },
      { label: "Refuse and check its legitimacy first.", consequence: "Your money is safe and you learn to check official licenses before investing.", impact: "Balance safe · Better verification skills", lesson: "High guaranteed returns contradict basic investing: the higher the return, the higher the risk.", pts: 30, dim: "risk", d: 4 },
      { label: "Report the account and warn friends.", consequence: "You protect yourself and the people around you.", impact: "Balance safe · Positive impact around you", lesson: "Financial literacy becomes far stronger when shared, not kept to yourself.", pts: 30, dim: "risk", d: 4 }
    ]
  },
  {
    text: "You set aside Rp300.000 for a football shoe. A friend offers a fun comedy class for Rp175.000.",
    correct: 2,
    hard: false,
    options: [
      { label: "Also buy the shoe, before it runs out.", consequence: "Shoe in hand, but the goal is gone and there is no cash reserve.", impact: "Goal −Rp300.000 · No emergency fund", lesson: "Buying out of fear of missing out is driven by fear, not reason.", pts: 5, dim: "decision", d: 0 },
      { label: "Join the comedy class, delay the shoes.", consequence: "Short-term fun, but a planned need slips far back.", impact: "Goal delayed · Rp175.000 spent", lesson: "Fun is fine, but not when it pushes aside a need you already planned.", pts: 15, dim: "goal", d: 2 },
      { label: "Stay on target, set aside Rp25.000 for fun.", consequence: "The shoes are still reached and you keep a little fun budget.", impact: "Goal +Rp300.000 · Fun Rp25.000", lesson: "A small allowance for fun keeps you consistent without hurting needs.", pts: 25, dim: "goal", d: 3 },
      { label: "Borrow money from an older sibling for the class.", consequence: "Debt grows and you owe your sibling.", impact: "New debt · Habit risk", lesson: "Borrowing for fun creates a cycle that keeps you dependent.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "A game ad sells a rare cheap item 'for fans', Rp80.000 off. You do not really need it.",
    correct: 1,
    hard: true,
    options: [
      { label: "Buy it now before the price goes up.", consequence: "Money goes out for something you do not need.", impact: "Balance −Rp80.000 · Impulsive", lesson: "Fear of 'losing a discount' makes you buy off-plan.", pts: 5, dim: "spending", d: 0 },
      { label: "Skip it, because you do not need it.", consequence: "Money stays safe and you are not lured by exclusivity.", impact: "Balance safe · Self-control", lesson: "Best question before buying: do I need it, or just want it because it is marketed?", pts: 25, dim: "goal", d: 3 },
      { label: "Buy it using casual top-up money.", consequence: "You sacrifice another game budget this month.", impact: "Game budget −Rp80.000 · Top-up gone", lesson: "Trading one budget for another still reduces your future options.", pts: 15, dim: "spending", d: 2 },
      { label: "Ask a friend to gift the top-up bonus.", consequence: "You lean on a friend for a decision that is yours.", impact: "Social risk · Not independent", lesson: "Financial decisions should come from your own budget, not a friend paying.", pts: 10, dim: "decision", d: 1 }
    ]
  },
  {
    text: "A close friend borrows Rp150.000 and says 'I'll pay you back tomorrow'. You already have a weekly saving plan.",
    correct: 1,
    hard: true,
    options: [
      { label: "Lend it all, afraid of being called stingy.", consequence: "Your money leaves the plan and you worry it won't return.", impact: "Balance −Rp150.000 · Plan disrupted", lesson: "Lending out of fear of judgment takes away your own control.", pts: 5, dim: "decision", d: 0 },
      { label: "Lend the part that does not break your plan.", consequence: "You help without shaking your saving plan.", impact: "Goal safe · Friendship kept", lesson: "Helping can still happen without sacrificing your whole plan.", pts: 25, dim: "goal", d: 3 },
      { label: "Lend it and ignore the weekly plan.", consequence: "Saving falls behind and you regret it next week.", impact: "Plan delayed · Regret", lesson: "One act of help should not shake the habit you built.", pts: 10, dim: "saving", d: 1 },
      { label: "Say you have no money, even though you do.", consequence: "Avoids conflict but makes you lie.", impact: "Trust worsens · Dilemma", lesson: "Honest communication about your limits is healthier than pretending.", pts: 15, dim: "decision", d: 2 }
    ]
  },
  {
    text: "Every week you get Rp100.000 in pocket money. Your friends snack every day, and if you do not join you feel left out.",
    correct: 2,
    hard: false,
    options: [
      { label: "Snack daily so friends still see you as part of the group.", consequence: "Your allowance is gone before the weekend.", impact: "Balance −Rp100.000 · Empty by Thursday", lesson: "Fear of being left out is the most expensive shopper of all.", pts: 5, dim: "decision", d: 0 },
      { label: "Never snack, save everything.", consequence: "Your goal is reached fast, but this habit is hard to keep.", impact: "Savings full · Social life suffers", lesson: "Saving 100% rarely lasts because there is no room to enjoy life.", pts: 20, dim: "saving", d: 3 },
      { label: "Set a Rp10.000 daily snack budget, save the rest.", consequence: "You still hang out and your savings keep growing.", impact: "Snack budget Rp50.000 · Savings +Rp50.000", lesson: "Saving habits last when there is a small space to enjoy life.", pts: 30, dim: "goal", d: 4 },
      { label: "Borrow from a friend so you can keep snacking.", consequence: "Debt piles up and you must repay next week.", impact: "New debt · Squeezed next week", lesson: "Borrowing for snacks postpones the problem, it does not solve it.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "A message appears in your digital wallet: 'Pay Rp200.000 for verification; before that, share the OTP we sent you'.",
    correct: 3,
    hard: true,
    options: [
      { label: "Send the OTP so verification finishes fast.", consequence: "Your account can be hacked and your balance drained.", impact: "Balance −Rp200.000 · Account hacked", lesson: "OTP is the key to your account. No official institution asks for it in chat.", pts: 0, dim: "risk", d: 0 },
      { label: "Send the OTP to a friend first to discuss it.", consequence: "OTP leaks to a third party and your account is at risk.", impact: "Account risk · Data leaked", lesson: "OTP must never be shared with anyone, even friends.", pts: 5, dim: "risk", d: 1 },
      { label: "Reply asking who is asking.", consequence: "You keep your money, but you can still be manipulated.", impact: "Balance safe · Suspicious reply", lesson: "Do not tap links or reply to OTP requests; always open the official app.", pts: 15, dim: "decision", d: 2 },
      { label: "Refuse and report it to official app support.", consequence: "Your account is safe and the report helps shut down the scam.", impact: "Balance safe · Scam reported", lesson: "Checking via the official app and reporting is the right financial reflex.", pts: 30, dim: "risk", d: 4 }
    ]
  },
  {
    text: "An online store offers your favorite shoes at 70% off 'today only'. You are saving up to buy a laptop.",
    correct: 1,
    hard: false,
    options: [
      { label: "Buy now before the discount disappears.", consequence: "The big discount drains your laptop savings.", impact: "Laptop savings −Rp150.000 · Focus lost", lesson: "'Today only' is designed to make you decide in a hurry.", pts: 5, dim: "spending", d: 0 },
      { label: "Skip it, it is not in your plan.", consequence: "Your laptop savings stay safe.", impact: "Savings safe · Laptop focus", lesson: "A cheap price never beats the need you are chasing.", pts: 25, dim: "goal", d: 3 },
      { label: "Buy it as a birthday gift for your sibling.", consequence: "You please someone else but disturb your own plan.", impact: "Savings shrink · Expensive gift", lesson: "Gifts do not have to be expensive; being present often matters more.", pts: 10, dim: "decision", d: 1 },
      { label: "Buy it using money for school needs.", consequence: "Your school needs are now at risk.", impact: "School money −Rp150.000 · Big risk", lesson: "Never touch money for basic needs to buy consumer goods.", pts: 0, dim: "spending", d: 0 }
    ]
  },
  {
    text: "Your favorite game event offers 'guaranteed rare item' for a Rp50.000 top-up per draw. You have already spent Rp100.000 today.",
    correct: 1,
    hard: false,
    options: [
      { label: "Keep drawing until you get the rare item.", consequence: "Money keeps flowing out and your emergency savings are empty.", impact: "Balance −Rp150.000 · Draw addiction", lesson: "Chasing 'so it is not wasted' actually makes the loss bigger.", pts: 0, dim: "risk", d: 0 },
      { label: "Stop now, no more top-ups today.", consequence: "You stop the loss and feel calmer.", impact: "Loss stopped · Self-control", lesson: "Stopping after a loss is a mature financial decision.", pts: 25, dim: "goal", d: 3 },
      { label: "Top up once more using next month's allowance.", consequence: "Next month's money is already gone before you receive it.", impact: "Next month −Rp50.000 · Squeezed", lesson: "Using future money for games is hidden debt.", pts: 10, dim: "spending", d: 1 },
      { label: "Invite a friend to join you.", consequence: "Someone else loses too because of your decision.", impact: "Social damage · Shared loss", lesson: "Inviting others does not make the decision more correct.", pts: 5, dim: "decision", d: 0 }
    ]
  },
  {
    text: "You get a Rp150.000 bonus in your digital wallet that expires almost tomorrow.",
    correct: 1,
    hard: false,
    options: [
      { label: "Buy expensive skincare because the money is a 'bonus'.", consequence: "The bonus is gone for something you never planned.", impact: "Balance −Rp150.000 · Impulsive", lesson: "Bonus money is still money; treat it according to a plan.", pts: 5, dim: "spending", d: 0 },
      { label: "Move 60% to savings and 40% to real needs.", consequence: "Part goes to savings, part covers a real need.", impact: "Savings +Rp90.000 · Needs met", lesson: "Unexpected money is best distributed, not spent in one place.", pts: 30, dim: "goal", d: 4 },
      { label: "Buy gifts for everyone in the group.", consequence: "A moment of fun, an empty savings account.", impact: "Balance −Rp150.000 · Party over", lesson: "Buying people's attention with unexpected money is rarely worth it.", pts: 10, dim: "decision", d: 1 },
      { label: "Share the bonus code with a friend.", consequence: "The bonus moves to someone else and you get nothing.", impact: "Bonus lost · Loss", lesson: "Never share transaction codes or OTPs with anyone.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "A friend has not returned Rp100.000 for 3 weeks, and now wants to borrow another Rp50.000.",
    correct: 1,
    hard: false,
    options: [
      { label: "Lend it again to keep them happy.", consequence: "Old and new debts pile up, and the chance of no return grows.", impact: "Receivable Rp150.000 · Risky", lesson: "Lending again to cover an old debt is a dangerous cycle.", pts: 5, dim: "decision", d: 0 },
      { label: "Politely ask about a repayment schedule.", consequence: "You keep the friendship and make the debt clear.", impact: "Friendship safe · Clear schedule", lesson: "A clear deadline keeps lending from damaging the relationship.", pts: 25, dim: "goal", d: 3 },
      { label: "Stay silent, afraid of hurting their feelings.", consequence: "Trust erodes slowly.", impact: "Debt hanging · Awkward mood", lesson: "Silence does not solve money problems.", pts: 15, dim: "decision", d: 2 },
      { label: "Lend it with high interest.", consequence: "You profit from a friend's difficulty.", impact: "Exploitation · Friendship broken", lesson: "Profiting from a friend's debt is not healthy.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "You receive Rp300.000 monthly for all your needs: food, transport, and savings.",
    correct: 2,
    hard: false,
    options: [
      { label: "Spend freely, save whatever is left.", consequence: "Mid-month the money is already gone.", impact: "Budget −Rp300.000 · Gone faster", lesson: "Saving from 'whatever is left' makes that leftover always zero.", pts: 5, dim: "spending", d: 0 },
      { label: "Do not bother saving, your parents are still there.", consequence: "You never learn to manage and lose the saving habit.", impact: "Savings Rp0 · Habit lost", lesson: "Financial independence grows from saving young, not waiting until adulthood.", pts: 10, dim: "saving", d: 1 },
      { label: "Plan the split: 50% needs, 30% savings, 20% fun, and track it all.", consequence: "Everything is managed and savings surely grow.", impact: "Savings +Rp90.000 · Under control", lesson: "A 50/30/20 budget is simple and makes money work for you.", pts: 30, dim: "goal", d: 4 },
      { label: "Borrow for needs before the money arrives.", consequence: "Debt piles up before next month's money comes.", impact: "New debt · Risk", lesson: "Borrowing for weekly routines is a way to grow your spending.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "A community offers 'digital gold investment' with 2x returns a month and asks you not to tell anyone.",
    correct: 1,
    hard: true,
    options: [
      { label: "Join and spread it to your friends.", consequence: "Friends lose too if it turns out to be a scam.", impact: "Shared loss · High risk", lesson: "Invite others to verify, not to join without checking.", pts: 0, dim: "risk", d: 0 },
      { label: "Check with OJK or ask your parents first.", consequence: "You know the legality before putting money in.", impact: "Balance safe · Verified", lesson: "Checking official licenses is the first step before investing.", pts: 30, dim: "risk", d: 4 },
      { label: "Invest only a small part.", consequence: "If it is a scam, you still lose.", impact: "Balance −Rp50.000 · Remaining risk", lesson: "'Put in a little' still feeds false hope.", pts: 10, dim: "decision", d: 1 },
      { label: "Ask for your cut first from the manager.", consequence: "You already put money in before checking legality.", impact: "Equally risky · No verification", lesson: "Asking for a profit share is not the same as checking an official license.", pts: 5, dim: "risk", d: 0 }
    ]
  },
  {
    text: "Your idol's concert tickets are 'guaranteed available' through a reseller account at double the official price.",
    correct: 1,
    hard: false,
    options: [
      { label: "Buy fast before they sell out.", consequence: "The double price drains your savings.", impact: "Balance −Rp400.000 · Double price", lesson: "The official route is always cheaper than scalpers.", pts: 5, dim: "spending", d: 0 },
      { label: "Check the official source first, they may already be gone.", consequence: "Reseller tickets are often fake.", impact: "Balance safe · Verified", lesson: "Buying through the official channel protects your money.", pts: 25, dim: "goal", d: 3 },
      { label: "Send a deposit first, pay the rest later.", consequence: "The deposit can be lost if the account is fake.", impact: "Deposit −Rp100.000 · Lost", lesson: "Transferring before the ticket or item exists is a risk.", pts: 5, dim: "risk", d: 0 },
      { label: "Ask a friend to split the cost.", consequence: "A bad decision is now shared by two.", impact: "Shared loss · Social", lesson: "Sharing the cost does not make the decision more correct.", pts: 10, dim: "decision", d: 1 }
    ]
  },
  {
    text: "You need a reference book that costs Rp120.000. A senior offers the same book, used but in good condition, for Rp40.000.",
    correct: 1,
    hard: false,
    options: [
      { label: "Buy the new one so you do not feel embarrassed.", consequence: "The Rp80.000 difference is wasted on the exact same item.", impact: "Spending +Rp80.000 · Pride", lesson: "Buying new for pride is an unnecessary tax.", pts: 5, dim: "decision", d: 0 },
      { label: "Buy the used one, same quality.", consequence: "Same function, you save Rp80.000.", impact: "Saved Rp80.000 · Same book", lesson: "Choosing good-quality used goods is a smart, thrifty decision.", pts: 25, dim: "goal", d: 3 },
      { label: "Buy both.", consequence: "Two identical books, twice the cost.", impact: "Spending −Rp160.000 · Wasteful", lesson: "More items does not always mean more value.", pts: 5, dim: "spending", d: 0 },
      { label: "Photocopy the whole book to save money.", consequence: "This may violate copyright even though you save money.", impact: "Legal risk · Physically cheap", lesson: "Saving money should never mean breaking rules.", pts: 10, dim: "risk", d: 1 }
    ]
  },
  {
    text: "Mid-month, your balance is only Rp20.000, but you still need lunch and transport for a week.",
    correct: 0,
    hard: false,
    options: [
      { label: "Calculate minimum needs and allocate them per day.", consequence: "Your money is enough and scheduled for the week.", impact: "Healthy leftover · Scheduled", lesson: "Rationing leftover money by need is the key to finishing without debt.", pts: 25, dim: "goal", d: 3 },
      { label: "Spend it all on one favorite snack.", consequence: "The leftover is gone and other needs are neglected.", impact: "Balance Rp0 · Happy snack", lesson: "One fun moment can cost you a week of needs.", pts: 5, dim: "spending", d: 0 },
      { label: "Borrow from a friend to cover it.", consequence: "Debt hangs over you until next month.", impact: "Debt Rp20.000+ · Squeezed", lesson: "Borrowing for weekly routines builds a debt habit.", pts: 5, dim: "risk", d: 0 },
      { label: "Skip lunch so the money stays safe.", consequence: "You save money by endangering your health.", impact: "Health at risk · False saving", lesson: "Saving money must never sacrifice basic needs.", pts: 10, dim: "saving", d: 1 }
    ]
  },
  {
    text: "Friends pressure you to donate a big amount to a charity event, while your allowance is just enough this month.",
    correct: 2,
    hard: false,
    options: [
      { label: "Donate big to look generous.", consequence: "This month you lack basic needs.", impact: "Budget −Rp100.000 · Squeezed", lesson: "Giving for image, not for need, makes you lose twice.", pts: 5, dim: "decision", d: 0 },
      { label: "Refuse completely and do not care.", consequence: "Your money is safe but your social relationships weaken.", impact: "Balance safe · Cold social life", lesson: "You may say no without being rude.", pts: 15, dim: "decision", d: 2 },
      { label: "Donate a small amount within your ability and explain honestly.", consequence: "You give and do not sacrifice your needs.", impact: "Donation Rp10.000 · Sincere intent", lesson: "Donating within your ability is sustainable charity.", pts: 25, dim: "goal", d: 3 },
      { label: "Borrow money to donate big.", consequence: "Going into debt to give is a contradiction.", impact: "Debt Rp100.000 · Ironic", lesson: "Give from surplus, not from borrowed money.", pts: 5, dim: "risk", d: 0 }
    ]
  }
];

const MISSIONS_ID = [
  { id: "m1", icon: "bag", title: "Family Shopping Challenge", desc: "Susun daftar belanja mingguan bersama orang tua dan tetap di dalam budget.", budget: "Rp100.000", time: "1 hari", reward: "Budget Keeper · +40 poin", pts: 40, dim: "spending" },
  { id: "m2", icon: "soup", title: "Bekal Seminggu", desc: "Bandingkan biaya jajan di sekolah dengan membawa bekal selama 5 hari.", budget: "Rp75.000", time: "5 hari", reward: "Meal Planner · +50 poin", pts: 50, dim: "saving" },
  { id: "m3", icon: "bulb", title: "Hemat Listrik Keluarga", desc: "Catat pemakaian listrik dan cari 3 kebiasaan yang bisa dihemat bulan ini.", budget: "Bebas", time: "7 hari", reward: "Energy Saver · +45 poin", pts: 45, dim: "goal" }
];

const MISSIONS_EN = [
  { id: "m1", icon: "bag", title: "Family Shopping Challenge", desc: "Plan a weekly grocery list with your parents and stay within budget.", budget: "Rp100.000", time: "1 day", reward: "Budget Keeper · +40 points", pts: 40, dim: "spending" },
  { id: "m2", icon: "soup", title: "A Week of Packed Lunch", desc: "Compare school snack costs against packing lunch for 5 days.", budget: "Rp75.000", time: "5 days", reward: "Meal Planner · +50 points", pts: 50, dim: "saving" },
  { id: "m3", icon: "bulb", title: "Family Electricity Savings", desc: "Track electricity use and find 3 habits to cut this month.", budget: "Free", time: "7 days", reward: "Energy Saver · +45 points", pts: 45, dim: "goal" }
];

const BADGES_ID = [
  { id: "first-saver", icon: "trophy", name: "Penabung Pertama" },
  { id: "streak-7", icon: "flame", name: "Streak 7 Hari" },
  { id: "smart-saver", icon: "piggy", name: "Penabung Cerdas" },
  { id: "tracker", icon: "receipt", name: "Pencatat Pengeluaran" },
  { id: "scholar", icon: "book", name: "Cendekia (5 materi)" },
  { id: "decider", icon: "scale", name: "Pengambil Keputusan" },
  { id: "family-hero", icon: "users", name: "Pahlawan Keluarga" }
];

const BADGES_EN = [
  { id: "first-saver", icon: "trophy", name: "First Saver" },
  { id: "streak-7", icon: "flame", name: "7 Day Streak" },
  { id: "smart-saver", icon: "piggy", name: "Smart Saver" },
  { id: "tracker", icon: "receipt", name: "Spending Tracker" },
  { id: "scholar", icon: "book", name: "Scholar (5 lessons)" },
  { id: "decider", icon: "scale", name: "Decision Maker" },
  { id: "family-hero", icon: "users", name: "Family Hero" }
];

const DIM_LABELS_ID = {
  saving: "Menabung",
  spending: "Belanja Cerdas",
  decision: "Pengambilan Keputusan",
  goal: "Penetapan Target",
  risk: "Kewaspadaan Risiko"
};

const DIM_LABELS_EN = {
  saving: "Saving",
  spending: "Smart Spending",
  decision: "Decision Making",
  goal: "Goal Setting",
  risk: "Risk Awareness"
};

const DAY_LABELS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EXPENSE_CATEGORIES_ID = [
  { id: "food", icon: "utensils", label: "Makanan" },
  { id: "drink", icon: "coffee", label: "Minuman" },
  { id: "transport", icon: "bus", label: "Transportasi" },
  { id: "game", icon: "gamepad", label: "Game" },
  { id: "shop", icon: "bag", label: "Belanja" },
  { id: "other", icon: "package", label: "Lainnya" }
];

const EXPENSE_CATEGORIES_EN = [
  { id: "food", icon: "utensils", label: "Food" },
  { id: "drink", icon: "coffee", label: "Drinks" },
  { id: "transport", icon: "bus", label: "Transport" },
  { id: "game", icon: "gamepad", label: "Games" },
  { id: "shop", icon: "bag", label: "Shopping" },
  { id: "other", icon: "package", label: "Other" }
];

export const UI = { id: UI_ID, en: UI_EN };

export const CONTENT = {
  id: {
    TOPICS: TOPICS_ID,
    CHALLENGES: CHALLENGES_ID,
    CASES: CASES_ID,
    MISSIONS: MISSIONS_ID,
    BADGES: BADGES_ID,
    DIM_LABELS: DIM_LABELS_ID,
    DAY_LABELS: DAY_LABELS_ID,
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES_ID
  },
  en: {
    TOPICS: TOPICS_EN,
    CHALLENGES: CHALLENGES_EN,
    CASES: CASES_EN,
    MISSIONS: MISSIONS_EN,
    BADGES: BADGES_EN,
    DIM_LABELS: DIM_LABELS_EN,
    DAY_LABELS: DAY_LABELS_EN,
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES_EN
  }
};