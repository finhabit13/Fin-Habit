export const DEFAULT_DATA = {
  name: "Bailey",
  email: "demo@finhabit.app",
  points: 860,
  streak: 7,
  challengesDone: 18,
  dims: { saving: 90, spending: 85, decision: 88, goal: 82, risk: 84 },
  lastWeek: 78,
  weekly: [78, 79, 81, 82, 84, 85, 86],
  todayDone: 4,
  todayTotal: 3,
  lessonsDone: [],
  doneChallenges: [],
  challengeDate: {},
  caseIndex: 0,
  doneMissions: [],
  badges: ["first-saver", "streak-7", "smart-saver"],
  savingGoal: 300000,
  savingCurrent: 125000,
  monthlyBudget: 500000,
  lastActiveDay: null
};

export const TOPICS = [
  {
    id: "saving",
    icon: "piggy",
    title: "Saving",
    desc: "Menabung adalah kebiasaan menyisihkan sebagian uang untuk tujuan tertentu.",
    lessons: [
      {
        id: "sav1",
        title: "Menabung itu keputusan, bukan sisa",
        body: "Menabung bukan uang yang tersisa di akhir hari, tapi uang yang kamu sisihkan di awal. Begitu menerima uang saku, pisahkan dulu bagian tabungan, baru sisanya dipakai."
      },
      {
        id: "sav2",
        title: "Aturan 20% uang saku",
        body: "Coba sisihkan 20% dari uang saku. Kalau uang sakumu Rp25.000 per hari, berarti Rp5.000 masuk tabungan. Dalam satu bulan sekolah, itu sekitar Rp100.000."
      },
      {
        id: "sav3",
        title: "Pisahkan tempatnya",
        body: "Uang tabungan yang bercampur dengan uang jajan hampir selalu terpakai. Gunakan amplop, celengan, atau rekening terpisah supaya tidak tergoda."
      }
    ]
  },
  {
    id: "spending",
    icon: "cart",
    title: "Smart Spending",
    desc: "Membelanjakan uang untuk hal yang benar-benar kamu butuhkan dan hargai.",
    lessons: [
      {
        id: "sp1",
        title: "Kebutuhan vs keinginan",
        body: "Kebutuhan membuatmu tetap berfungsi: makan, transportasi, alat sekolah. Keinginan membuatmu senang sesaat. Keduanya boleh, tapi kebutuhan didahulukan."
      },
      {
        id: "sp2",
        title: "Jeda 24 jam",
        body: "Untuk pembelian di atas Rp50.000 yang tidak mendesak, tunggu satu hari. Kalau besok kamu masih menginginkannya, kemungkinan itu memang bernilai untukmu."
      },
      {
        id: "sp3",
        title: "Hitung dalam jam, bukan rupiah",
        body: "Kalau kamu menabung Rp5.000 per hari, minuman Rp25.000 sama dengan 5 hari menabung. Cara ini membuat harga terasa lebih nyata."
      }
    ]
  },
  {
    id: "budget",
    icon: "clipboard",
    title: "Budgeting",
    desc: "Merencanakan ke mana uangmu pergi sebelum uang itu habis.",
    lessons: [
      {
        id: "bd1",
        title: "Pola 50-30-20 versi pelajar",
        body: "50% kebutuhan harian (makan, transport), 30% keinginan (jajan, hiburan), 20% tabungan. Sesuaikan angkanya dengan kondisimu."
      },
      {
        id: "bd2",
        title: "Catat 7 hari",
        body: "Sebelum membuat anggaran, catat pengeluaran selama seminggu. Kebanyakan orang kaget melihat total jajannya."
      },
      {
        id: "bd3",
        title: "Anggaran boleh meleset",
        body: "Anggaran adalah rencana, bukan hukuman. Kalau meleset, perbaiki angkanya minggu depan, jangan berhenti mencatat."
      }
    ]
  },
  {
    id: "goal",
    icon: "target",
    title: "Goal Setting",
    desc: "Tujuan yang jelas membuat menabung terasa masuk akal.",
    lessons: [
      {
        id: "gl1",
        title: "Tujuan yang spesifik",
        body: '"Ingin menabung" terlalu kabur. "Sepatu futsal Rp300.000 dalam 3 bulan" jelas: berarti Rp3.400 per hari.'
      },
      {
        id: "gl2",
        title: "Pecah jadi target kecil",
        body: "Target Rp300.000 terasa jauh. Pecah jadi Rp25.000 per minggu selama 12 minggu, lalu rayakan setiap 25% tercapai."
      },
      {
        id: "gl3",
        title: "Tulis dan lihat setiap hari",
        body: "Tujuan yang ditulis dan terlihat (di buku, di dinding, di aplikasi) jauh lebih sering tercapai daripada yang hanya dipikirkan."
      }
    ]
  },
  {
    id: "risk",
    icon: "shield",
    title: "Risk Awareness",
    desc: "Mengenali tawaran yang berisiko, penipuan, dan pengeluaran mendadak.",
    lessons: [
      {
        id: "rs1",
        title: "Dana darurat kecil",
        body: "Sisihkan sedikit uang untuk hal tak terduga: fotokopi mendadak, ban bocor, atau ongkos pulang. Rp50.000 sudah membantu."
      },
      {
        id: "rs2",
        title: "Untung besar, cepat, pasti",
        body: "Tiga kata itu muncul bersamaan hampir selalu berarti penipuan. Keuntungan yang tinggi selalu datang bersama risiko yang tinggi."
      },
      {
        id: "rs3",
        title: "Jangan bagikan data pribadi",
        body: "OTP, PIN, dan foto kartu tidak pernah diminta oleh pihak resmi. Sekali dibagikan, uangmu bisa hilang dalam hitungan detik."
      }
    ]
  }
];

export const TOPIC_DIM = { saving: "saving", spending: "spending", budget: "goal", goal: "goal", risk: "risk" };

export const CHALLENGES = [
  { id: "c1", cat: "Tracking", title: "Catat seluruh pengeluaranmu hari ini.", desc: "Tulis setiap pengeluaran, sekecil apa pun.", chips: ["Food", "Transport", "Shopping", "Others"], min: 5, pts: 20, dim: "spending" },
  { id: "c2", cat: "Saving", title: "Sisihkan Rp5.000 sebelum jajan.", desc: "Pisahkan uang tabungan di awal hari, bukan di akhir.", chips: ["Celengan", "Amplop", "Rekening"], min: 3, pts: 25, dim: "saving" },
  { id: "c3", cat: "Spending", title: "Lewati satu pembelian impulsif.", desc: "Temukan satu hal yang ingin kamu beli hari ini, lalu tunda 24 jam.", chips: ["Jajan", "Game", "Online shop"], min: 2, pts: 20, dim: "spending" },
  { id: "c4", cat: "Budgeting", title: "Buat anggaran jajan untuk besok.", desc: "Tentukan batas maksimal pengeluaran besok sebelum hari itu dimulai.", chips: ["Food", "Transport", "Others"], min: 5, pts: 25, dim: "goal" },
  { id: "c5", cat: "Risk", title: "Periksa satu tawaran yang terlalu bagus.", desc: "Cari satu iklan atau pesan mencurigakan, lalu tulis kenapa itu berisiko.", chips: ["Chat", "Media sosial", "Iklan"], min: 5, pts: 30, dim: "risk" },
  { id: "c6", cat: "Goal", title: "Perbarui progres saving goal-mu.", desc: "Masukkan tabungan hari ini ke halaman Saving.", chips: ["Target", "Progress"], min: 3, pts: 20, dim: "goal" },
  { id: "c7", cat: "Tracking", title: "Catat 3 pengeluaran tertinggi minggu ini.", desc: "Lihat kategori mana yang paling banyak menguras uangmu.", chips: ["Food", "Transport", "Game", "Lainnya"], min: 5, pts: 20, dim: "spending" },
  { id: "c8", cat: "Saving", title: "Terapkan pola 20% uang saku.", desc: "Sisihkan 20% dari uang saku hari ini sebelum dipakai.", chips: ["20%", "Uang saku"], min: 3, pts: 25, dim: "saving" },
  { id: "c9", cat: "Spending", title: "Jeda 24 jam sebelum beli.", desc: "Pilih satu barang di atas Rp50.000 dan tunda satu hari.", chips: ["Barang", "Harga", "H-1"], min: 2, pts: 20, dim: "spending" },
  { id: "c10", cat: "Budgeting", title: "Bandingkan harga 3 tempat jualan.", desc: "Cek toko/warung lain untuk barang yang sama.", chips: ["Toko A", "Toko B", "Online"], min: 3, pts: 20, dim: "goal" },
  { id: "c11", cat: "Risk", title: "Identifikasi 1 tautan mencurigakan.", desc: "Jangan klik. Catat alamatnya dan kenapa mencurigakan.", chips: ["Chat", "SMS", "Email"], min: 5, pts: 30, dim: "risk" },
  { id: "c12", cat: "Goal", title: "Tulis target jangka pendekmu.", desc: "Satu barang/tujuan dengan nominal dan batas waktu.", chips: ["Target", "Nominal", "Deadline"], min: 5, pts: 20, dim: "goal" },
  { id: "c13", cat: "Tracking", title: "Kelompokkan pengeluaran seminggu.", desc: "Buat ringkasan: berapa per kategori dalam 7 hari terakhir.", chips: ["Makan", "Transport", "Game", "Lainnya"], min: 10, pts: 30, dim: "spending" },
  { id: "c14", cat: "Saving", title: "Amplop terpisah.", desc: "Siapkan satu amplop khusus tabungan dan labeli tujuannya.", chips: ["Amplop", "Label", "Uang"], min: 3, pts: 25, dim: "saving" },
  { id: "c15", cat: "Spending", title: "Hitung harga dalam hari menabung.", desc: "Ubah harga barang ke jumlah hari menabung Rp5.000.", chips: ["Rp5.000", "Hari", "Harga"], min: 3, pts: 20, dim: "spending" },
  { id: "c16", cat: "Budgeting", title: "Pakai uang saku sampai besok tanpa jajan.", desc: "Habisi hari ini tanpa pembelian di luar rencana.", chips: ["Bekal", "Air minum", "Disiplin"], min: 5, pts: 30, dim: "goal" },
  { id: "c17", cat: "Risk", title: "Buat kata sandi yang kuat.", desc: "Ganti satu password lemah dengan yang panjang & unik.", chips: ["16+ karakter", "Password manager"], min: 5, pts: 25, dim: "risk" },
  { id: "c18", cat: "Goal", title: "Rayakan progres 25% tujuan.", desc: "Saat tabunganmu mencapai 1/4 target, rayakan tanpa boros.", chips: ["25%", "Target", "Hadiah kecil"], min: 3, pts: 20, dim: "goal" },
  { id: "c19", cat: "Tracking", title: "Foto bukti transaksi.", desc: "Foto struk/history HP untuk 3 pengeluaran hari ini.", chips: ["Struk", "History", "3 transaksi"], min: 5, pts: 20, dim: "spending" },
  { id: "c20", cat: "Saving", title: "Tantangan senin tanpa beli.", desc: "Senin ini jangan beli apa pun di luar kebutuhan pokok.", chips: ["Senin", "Nol jajan", "Fokus"], min: 5, pts: 30, dim: "saving" },
  { id: "c21", cat: "Spending", title: "Cek diskon vs harga normal.", desc: "Pilih satu promo dan cek benar-benar lebih murah atau tidak.", chips: ["Diskon", "Harga asli", "Bandingkan"], min: 3, pts: 20, dim: "spending" },
  { id: "c22", cat: "Budgeting", title: "Anggaran mingguan Rp50.000.", desc: "Buat pakem 1 minggu hanya memakai Rp50.000 untuk jajan.", chips: ["Rp50.000", "Minggu", "Catat"], min: 7, pts: 35, dim: "goal" },
  { id: "c23", cat: "Risk", title: "Verifikasi legalitas satu aplikasi.", desc: "Cek izin OJK/Play Store untuk aplikasi yang meminta uang.", chips: ["OJK", "Izin resmi", "Ulasan"], min: 5, pts: 30, dim: "risk" },
  { id: "c24", cat: "Goal", title: "Naikkan tabungan harian.", desc: "Tambah Rp1.000 setoran rutinmu mulai hari ini.", chips: ["+Rp1.000", "Rutin"], min: 3, pts: 20, dim: "saving" },
  { id: "c25", cat: "Tracking", title: "Catat ulang semalam.", desc: "Bangun kebiasaan: isi catatan pengeluaran tadi malam.", chips: ["Malam", "Refleksi"], min: 5, pts: 20, dim: "spending" },
  { id: "c26", cat: "Saving", title: "Celengan visual.", desc: "Gambar/bagan progres tabungan dan tempel di kamar.", chips: ["Bagan", "Tempel", "Terlihat"], min: 3, pts: 25, dim: "goal" },
  { id: "c27", cat: "Spending", title: "Jajanan rumahan.", desc: "Ganti satu jajan di luar dengan camilan dari rumah.", chips: ["Bekal", "Camilan"], min: 2, pts: 15, dim: "spending" },
  { id: "c28", cat: "Budgeting", title: "Jangan pinjam uang hari ini.", desc: "Kelola dengan sisa yang ada tanpa utang/nyicil sekarang.", chips: ["Tanpa utang", "Sisa"], min: 5, pts: 25, dim: "goal" },
  { id: "c29", cat: "Risk", title: "Jangan bagikan OTP/PIN.", desc: "Tolak satu permintaan data pribadi yang mencurigakan.", chips: ["OTP", "PIN", "Tolak"], min: 3, pts: 30, dim: "risk" },
  { id: "c30", cat: "Goal", title: "Review target bulanan.", desc: "Cek tujuan bulan ini: tercapai, kurang, atau perlu diubah?", chips: ["Review", "Refleksi", "Perbaiki"], min: 5, pts: 25, dim: "goal" }
];

export const CASES = [
  {
    text: "Kamu memiliki Rp50.000. Temanmu mengajak membeli minuman seharga Rp25.000, tetapi kamu sedang menabung untuk membeli barang seharga Rp300.000.",
    options: [
      {
        label: "Ikut membeli karena semua teman membeli.",
        consequence: "Uangmu tersisa Rp25.000 dan tabungan tidak bertambah hari ini.",
        impact: "Saldo −Rp25.000 · Target mundur ± 5 hari",
        lesson: "Tekanan teman adalah pengeluaran yang paling sering tidak disadari. Ikut sesekali tidak masalah, tapi kalau menjadi kebiasaan mingguan, biayanya Rp100.000 per bulan.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Tidak membeli.",
        consequence: "Rp25.000 bisa langsung masuk tabungan dan targetmu lebih cepat 5 hari.",
        impact: "Tabungan +Rp25.000 · Target maju ± 5 hari",
        lesson: "Pilihan paling hemat, tapi perhatikan sisi sosialnya. Kamu tetap bisa ikut berkumpul tanpa harus membeli.",
        pts: 20,
        dim: "saving",
        d: 3
      },
      {
        label: "Mencari alternatif yang lebih murah.",
        consequence: "Kamu ikut berkumpul dengan minuman Rp8.000, dan Rp17.000 tetap bisa ditabung.",
        impact: "Tabungan +Rp17.000 · Tetap ikut bersama teman",
        lesson: "Sering kali pilihan terbaik bukan ya atau tidak, melainkan versi yang lebih murah dari keinginan yang sama.",
        pts: 25,
        dim: "decision",
        d: 3
      },
      {
        label: "Membeli tetapi mengurangi pengeluaran lain.",
        consequence: "Tabungan tetap aman, tapi kamu harus disiplin memotong jajan berikutnya.",
        impact: "Tabungan tetap · Butuh disiplin tambahan",
        lesson: "Ini berhasil kalau kamu benar-benar mencatat. Tanpa catatan, 'nanti dikurangi' biasanya tidak pernah terjadi.",
        pts: 15,
        dim: "spending",
        d: 2
      }
    ]
  },
  {
    text: "Kamu menerima uang kaget Rp200.000 dari saudaramu. Ponselmu masih berfungsi, tetapi model terbaru sedang diskon dan teman-temanmu sudah memilikinya.",
    options: [
      {
        label: "Langsung membeli aksesori ponsel baru.",
        consequence: "Uang habis dalam satu hari dan tidak ada yang tersisa untuk kebutuhan mendadak.",
        impact: "Saldo −Rp200.000 · Dana darurat kosong",
        lesson: "Uang tak terduga paling mudah menguap karena terasa 'bukan uang sendiri'. Perlakukan sama seperti uang hasil menabung.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Menabung seluruhnya untuk target yang sudah ada.",
        consequence: "Targetmu melompat jauh dan hampir tercapai.",
        impact: "Tabungan +Rp200.000 · Target 67% tercapai",
        lesson: "Sangat kuat secara finansial. Pastikan target itu memang masih kamu inginkan agar motivasimu tidak padam.",
        pts: 25,
        dim: "saving",
        d: 3
      },
      {
        label: "Membagi: 50% tabungan, 30% kebutuhan, 20% hiburan.",
        consequence: "Rp100.000 masuk tabungan, Rp60.000 untuk kebutuhan sekolah, Rp40.000 untuk senang-senang.",
        impact: "Tabungan +Rp100.000 · Keseimbangan terjaga",
        lesson: "Pembagian membuat kebiasaan menabung bertahan lama karena kamu tidak merasa dihukum.",
        pts: 30,
        dim: "goal",
        d: 4
      },
      {
        label: "Meminjamkan seluruhnya ke teman tanpa kesepakatan.",
        consequence: "Uangmu tidak jelas kapan kembali dan hubungan bisa menjadi canggung.",
        impact: "Saldo tidak pasti · Risiko tinggi",
        lesson: "Meminjamkan uang bukan hal buruk, tetapi tanpa jumlah dan tanggal yang disepakati, risikonya ditanggung kamu sendiri.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Sebuah akun menawarkan 'modal Rp100.000 jadi Rp500.000 dalam 3 hari, dijamin pasti untung'. Banyak komentar mengaku berhasil.",
    options: [
      {
        label: "Ikut karena banyak yang mengaku berhasil.",
        consequence: "Uangmu kemungkinan besar hilang dan akun tersebut tidak bisa dihubungi lagi.",
        impact: "Saldo −Rp100.000 · Risiko penipuan",
        lesson: "Komentar bisa dibeli atau dibuat oleh akun palsu. Bukti sosial bukan bukti keamanan.",
        pts: 0,
        dim: "risk",
        d: 0
      },
      {
        label: "Mencoba dengan uang kecil dulu.",
        consequence: "Kamu mungkin menerima 'untung' kecil pertama, lalu diajak menyetor lebih besar.",
        impact: "Saldo −Rp20.000 · Umpan awal",
        lesson: "Keuntungan pertama yang kecil adalah taktik klasik untuk membangun kepercayaan sebelum kerugian besar.",
        pts: 5,
        dim: "risk",
        d: 1
      },
      {
        label: "Menolak dan mencari tahu dulu legalitasnya.",
        consequence: "Uangmu aman dan kamu belajar memeriksa izin resmi sebelum menaruh uang.",
        impact: "Saldo aman · Kemampuan verifikasi naik",
        lesson: "Keuntungan tinggi yang 'dijamin pasti' bertentangan dengan prinsip dasar investasi: makin tinggi imbal hasil, makin tinggi risikonya.",
        pts: 30,
        dim: "risk",
        d: 4
      },
      {
        label: "Melaporkan akun tersebut dan memberi tahu teman.",
        consequence: "Kamu melindungi diri sendiri sekaligus orang lain di sekitarmu.",
        impact: "Saldo aman · Dampak positif ke sekitar",
        lesson: "Literasi keuangan menjadi jauh lebih kuat ketika dibagikan, bukan disimpan sendiri.",
        pts: 30,
        dim: "risk",
        d: 4
      }
    ]
  }
];

export const MISSIONS = [
  { id: "m1", icon: "bag", title: "Family Shopping Challenge", desc: "Susun daftar belanja mingguan bersama orang tua dan tetap di dalam budget.", budget: "Rp100.000", time: "1 hari", reward: "Budget Keeper · +40 poin", pts: 40, dim: "spending" },
  { id: "m2", icon: "soup", title: "Bekal Seminggu", desc: "Bandingkan biaya jajan di sekolah dengan membawa bekal selama 5 hari.", budget: "Rp75.000", time: "5 hari", reward: "Meal Planner · +50 poin", pts: 50, dim: "saving" },
  { id: "m3", icon: "bulb", title: "Hemat Listrik Keluarga", desc: "Catat pemakaian listrik dan cari 3 kebiasaan yang bisa dihemat bulan ini.", budget: "Bebas", time: "7 hari", reward: "Energy Saver · +45 poin", pts: 45, dim: "goal" }
];

export const BADGES = [
  { id: "first-saver", icon: "trophy", name: "First Saver" },
  { id: "streak-7", icon: "flame", name: "7 Day Streak" },
  { id: "smart-saver", icon: "piggy", name: "Smart Saver" },
  { id: "tracker", icon: "receipt", name: "Spending Tracker" },
  { id: "scholar", icon: "book", name: "Scholar (5 materi)" },
  { id: "decider", icon: "scale", name: "Decision Maker" },
  { id: "family-hero", icon: "users", name: "Family Hero" }
];

export const EXPENSE_CATEGORIES = [
  { id: "food", icon: "utensils", label: "Makanan" },
  { id: "drink", icon: "coffee", label: "Minuman" },
  { id: "transport", icon: "bus", label: "Transportasi" },
  { id: "game", icon: "gamepad", label: "Game" },
  { id: "shop", icon: "bag", label: "Belanja" },
  { id: "other", icon: "package", label: "Lainnya" }
];

export const categoryFor = (id) =>
  EXPENSE_CATEGORIES.find((c) => c.id === id) || { id, icon: "package", label: id };

export const DIM_LABELS = {
  saving: "Saving",
  spending: "Smart Spending",
  decision: "Decision Making",
  goal: "Goal Setting",
  risk: "Risk Awareness"
};

export const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];