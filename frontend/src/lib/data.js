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
  lastActiveDay: null,
  quizState: {}
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

// Tantangan harian. Empat jenis: "video" (tonton sampai habis), "read" (baca
// sumber sampai bawah), "quiz" (kerjakan kuis atau permainan di situs sumber),
// "practice" (kerjakan langsung di aplikasi atau di rumah).
// Setiap challenge punya langkah yang dicentang satu per satu, lalu satu
// refleksi singkat. Jadi bukan sekadar menekan tombol.
// Semua URL di bawah sudah diverifikasi hidup, bukan placeholder.
export const CHALLENGES = [
  {
    id: "c1",
    cat: "Video",
    kind: "video",
    title: "Tonton: SparkTheDream Session 1, Money that Matters",
    desc: "Sesi pembuka JA SparktheDream. Menceritakan dari mana uang datang dan kenapa uang penting dalam keseharian.",
    source: "SparkTheDream PH",
    url: "https://www.youtube.com/watch?v=t_sx5UB1jlA",
    steps: [
      "Buka videonya dan tonton sampai penutup, jangan di-skip.",
      "Tulis tiga peran uang yang kamu ingat: membeli, menabung, atau berbagi.",
      "Pilih satu peran yang paling sering kamu lakukan minggu ini."
    ],
    min: 8,
    pts: 30,
    dim: "saving"
  },
  {
    id: "c2",
    cat: "Video",
    kind: "video",
    title: "Tonton: Kebutuhan vs Keinginan",
    desc: "Cara membedakan yang kamu butuhkan dari yang kamu mau, dan kenapa selisihnya jadi mahal di akhir bulan.",
    source: "Uanglogy",
    url: "https://www.youtube.com/watch?v=A_X_UYplTc0",
    steps: [
      "Tonton penuh dan catat contoh kebutuhan dan keinginan yang disebut.",
      "Tulis satu kebutuhan dan dua keinginan yang kamu punya bulan ini.",
      "Pilih satu keinginan untuk ditunda minggu ini, lengkap dengan alasannya."
    ],
    min: 6,
    pts: 30,
    dim: "spending"
  },
  {
    id: "c3",
    cat: "Video",
    kind: "video",
    title: "Tonton: 5 Tips Menabung untuk Pelajar",
    desc: "Tips menabung untuk pelajar dan mahasiswa, termasuk cara mulai saat uang saku masih kecil.",
    source: "Ayo Nabung",
    url: "https://www.youtube.com/watch?v=i1Ly15c3Npo",
    steps: [
      "Tonton sampai akhir dan tulis tiga tips yang paling bisa kamu jalankan.",
      "Tentukan nominal setoran pertama yang realistis dari uang sakumu.",
      "Catat angka itu di halaman Saving sebagai target mingguan."
    ],
    min: 7,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c4",
    cat: "Video",
    kind: "video",
    title: "Tonton: Belajar Literasi Keuangan dalam 20 Menit",
    desc: "Rangkuman konsep dasar sampai rencana keuangan pribadi. Bagus sebagai penguat sebelum mulai mencatat pengeluaran.",
    source: "Sulianto Indria Putra",
    url: "https://www.youtube.com/watch?v=CKqjmdvdMkE",
    steps: [
      "Tonton penuh sambil mencatat poin yang belum kamu kenal.",
      "Tulis tiga istilah baru yang kamu pelajari beserta artinya.",
      "Terapkan satu istilah itu pada catatan pengeluaran hari ini."
    ],
    min: 20,
    pts: 35,
    dim: "decision"
  },
  {
    id: "c5",
    cat: "Video",
    kind: "video",
    title: "Tonton: Cerdas Finansial, Panduan Pelajar",
    desc: "Materi untuk siswa SMA Fase F yang menjelaskan literasi keuangan dari sudut kurikulum.",
    source: "Erwan Dimantara SE",
    url: "https://www.youtube.com/watch?v=pdT_TE9XKYY",
    steps: [
      "Tonton video sampai selesai.",
      "Tulis satu konsep yang bisa kamu pakai untuk mengatur uang jajan.",
      "Tentukan target sederhana untuk minggu ini berdasarkan konsep itu."
    ],
    min: 10,
    pts: 30,
    dim: "goal"
  },
  {
    id: "c6",
    cat: "Video",
    kind: "video",
    title: "Tonton: OJK soal Anak Muda Terjerat Pinjol Ilegal",
    desc: "Data OJK tentang anak muda yang terjebak pinjaman online ilegal, termasuk risikonya buat dompet.",
    source: "Bisniscom",
    url: "https://www.youtube.com/watch?v=UvvPzg8ijaQ",
    steps: [
      "Tonton sampai akhir dan catat angka yang paling mengejutkan.",
      "Tulis tiga tanda aplikasi pinjol yang harus diwaspadai.",
      "Periksa HP-mu: masih ada aplikasi yang meminta data pribadi? Tulis jawabannya."
    ],
    min: 6,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c7",
    cat: "Video",
    kind: "video",
    title: "Tonton: Tips OJK untuk Melunasi Utang Pinjol",
    desc: "Cara menghitung dan melunasi utang supaya tidak makin dalam, langsung dari sumber resmi.",
    source: "Kompas.com",
    url: "https://www.youtube.com/watch?v=tLMJGwJavx8",
    steps: [
      "Tonton penuh dan tulis urutan langkah yang dijelaskan.",
      "Tulis satu risiko yang pernah kamu lihat temanmu alami.",
      "Tulis batas maksimal yang boleh kamu pinjam bulan ini."
    ],
    min: 7,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c8",
    cat: "Video",
    kind: "video",
    title: "Tonton: Apa Itu Saham untuk Pemula",
    desc: "Penjelasan paling dasar tentang saham, memakai analogi yang mudah dipahami pemula.",
    source: "Saham dari Nol",
    url: "https://www.youtube.com/watch?v=uGzToPCX8nU",
    steps: [
      "Tonton sampai habis dan tulis tiga kata kunci soal saham.",
      "Tulis satu alasan orang invest dan satu risikonya.",
      "Tulis kesimpulanmu: apakah kamu siap mulai?"
    ],
    min: 8,
    pts: 25,
    dim: "risk"
  },
  {
    id: "c9",
    cat: "Video",
    kind: "video",
    title: "Tonton: Ngerti Saham dalam 30 Menit",
    desc: "Penjelasan saham yang santai, termasuk cara membaca harga dan apa yang membuat harga bergerak.",
    source: "Timothy Ronald",
    url: "https://www.youtube.com/watch?v=tQXX-npOeUY",
    steps: [
      "Tonton penuh dan tulis tiga penyebab harga saham naik.",
      "Tulis tiga penyebab harga saham turun.",
      "Catat satu istilah pasar modal yang baru kamu pahami."
    ],
    min: 30,
    pts: 35,
    dim: "risk"
  },
  {
    id: "c10",
    cat: "Video",
    kind: "video",
    title: "Tonton: 5 Tips Menabung",
    desc: "Lima tips menabung ringkas, termasuk yang biasanya dianggap sepele padahal paling berpengaruh.",
    source: "cclaracr",
    url: "https://www.youtube.com/watch?v=JfjevexbVVI",
    steps: [
      "Tonton penuh dan tulis kelima tipsnya.",
      "Pilih satu tips yang belum pernah kamu lakukan.",
      "Tulis langkah kecil yang kamu jalankan malam ini untuk tips itu."
    ],
    min: 6,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c11",
    cat: "Video",
    kind: "video",
    title: "Tonton: Lima Tips Pengelolaan Uang untuk Remaja",
    desc: "Lima tips pengelolaan uang yang relevan untuk remaja, soal anggaran, tabungan, dan pengeluaran dadakan.",
    source: "Transformasi Indonesia",
    url: "https://www.youtube.com/watch?v=U5cssZCvmso",
    steps: [
      "Tonton sampai selesai.",
      "Tulis tips mana yang paling mirip dengan keadaanmu.",
      "Buat satu aturan kecil untuk minggu ini dari tips itu."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c12",
    cat: "Video",
    kind: "video",
    title: "Tonton: Program JA SparktheDream 2025",
    desc: "Gambaran nyata program literasi keuangan untuk siswa SMP di Indonesia bersama FWD Insurance.",
    source: "FWD Insurance Indonesia",
    url: "https://www.youtube.com/watch?v=54F1TeVUlUo",
    steps: [
      "Tonton sampai akhir dan perhatikan bagaimana program ini dijalankan.",
      "Tulis satu kegiatan yang menarikmu dari program tersebut.",
      "Tulis ide kegiatan sederhana yang bisa kamu coba di sekolah atau rumah."
    ],
    min: 6,
    pts: 25,
    dim: "goal"
  },
  {
    id: "c13",
    cat: "Video",
    kind: "video",
    title: "Tonton: Pengenalan Sesi Belajar JA SparktheDream",
    desc: "Penjelasan cara kerja sesi belajar JA SparktheDream, baik untuk paham alur literasi keuangan di sekolah.",
    source: "SparkTheDream PH",
    url: "https://www.youtube.com/watch?v=ZJgwHHZ_mbw",
    steps: [
      "Tonton penuh sebagai pengenalan program.",
      "Tulis tiga hal yang dipelajari dalam JA SparktheDream.",
      "Pilih satu topik yang ingin kamu dalami minggu ini."
    ],
    min: 5,
    pts: 20,
    dim: "saving"
  },
  {
    id: "c14",
    cat: "Read",
    kind: "read",
    title: "Baca: Profil Resmi JA SparktheDream",
    desc: "Halaman resmi JA SparktheDream dari Prestasi Junior Indonesia. Baca sampai bawah untuk paham sesi dan target pesertanya.",
    source: "JA SparktheDream (PJI)",
    url: "https://id.jasparkthedream.org/id/about",
    steps: [
      "Buka halamannya dan scroll sampai footer.",
      "Tulis empat aspek yang dipelajari dalam program ini.",
      "Tulis satu tujuan yang paling menarikmu dari program ini."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c15",
    cat: "Read",
    kind: "read",
    title: "Baca: Materi Literasi Keuangan OJK",
    desc: "Pusat materi edukasi keuangan milik OJK. Pilih satu topik dan baca sampai selesai.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Home",
    steps: [
      "Buka situsnya dan pilih satu topik yang menarik.",
      "Baca artikel itu sampai selesai, jangan berhenti di judul.",
      "Tulis dua fakta baru yang kamu dapat dari artikel tersebut."
    ],
    min: 8,
    pts: 30,
    dim: "decision"
  },
  {
    id: "c16",
    cat: "Read",
    kind: "read",
    title: "Baca: Edukasi Keuangan di OJK",
    desc: "Halaman resmi OJK yang menjelaskan arti literasi keuangan dan cara meningkatkannya.",
    source: "OJK",
    url: "https://ojk.go.id/id/kanal/edukasi-dan-perlindungan-konsumen/pages/literasi-keuangan.aspx",
    steps: [
      "Baca bagian definisi dan angka literasi keuangan.",
      "Tulis angka literasi keuangan yang disebutkan beserta artinya bagimu.",
      "Tulis satu hal yang bisa kamu lakukan agar literasi uangmu naik."
    ],
    min: 6,
    pts: 25,
    dim: "decision"
  },
  {
    id: "c17",
    cat: "Read",
    kind: "read",
    title: "Baca: Cara Menangani SMS Palsu",
    desc: "Cara mengenali dan melaporkan SMS penipuan, salah satu modus yang paling sering muncul di HP.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Article/375",
    steps: [
      "Baca artikel sampai bagian pelaporan.",
      "Tulis tiga ciri SMS palsu yang disebutkan.",
      "Tulis nomor atau situs resmi yang bisa dipakai untuk melapor."
    ],
    min: 5,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c18",
    cat: "Read",
    kind: "read",
    title: "Baca: Jangan Asal Ikut Saran Finfluencer",
    desc: "OJK membahas cara menilai kredibilitas financial influencer sebelum ikut menaruh uang.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/Article/40959",
    steps: [
      "Baca sampai bagian daftar periksa.",
      "Tulis tiga ciri finfluencer yang layak dipercaya dan satu yang perlu dihindari.",
      "Tulis satu finfluencer yang kamu ikuti beserta penilaianmu tentang dia."
    ],
    min: 6,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c19",
    cat: "Quiz",
    kind: "quiz",
    title: "Kerjakan: Kuis Keuangan JA SparktheDream",
    desc: "Kuis 13 soal dari JA SparktheDream. Dapatkan lencana Ahli Keuangan kalau menjawab sembilan soal atau lebih dengan benar.",
    source: "JA SparktheDream",
    url: "https://id.jasparkthedream.org/id/money-quiz",
    steps: [
      "Buka kuisnya dan kerjakan seluruh 13 soal.",
      "Tulis skor yang kamu dapat.",
      "Tulis satu soal yang sempat membuatmu berpikir lama, beserta alasannya."
    ],
    min: 10,
    pts: 35,
    dim: "decision"
  },
  {
    id: "c20",
    cat: "Quiz",
    kind: "quiz",
    title: "Mainkan: Permainan Tabungan OJK",
    desc: "Ayo Menabung dan Puzzle Tabunganku dari OJK. Cara belajar menabung sambil bermain.",
    source: "OJK, Sikapi Uangmu",
    url: "https://sikapiuangmu.ojk.go.id/FrontEnd/CMS/GameList",
    steps: [
      "Buka daftar permainan dan pilih salah satu.",
      "Mainkan sampai selesai, dan coba yang kedua kalau masih ada waktu.",
      "Tulis satu trik baru yang kamu dapat dari permainan itu."
    ],
    min: 10,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c21",
    cat: "Quiz",
    kind: "quiz",
    title: "Coba: Simulasi Uang JA SparktheDream",
    desc: "Simulasi pilihan pengeluaran dan menabung dari JA SparktheDream. Cocok untuk latihan sebelum mengubah uang saku sungguhan.",
    source: "JA SparktheDream",
    url: "https://id.jasparkthedream.org/id/student",
    steps: [
      "Mulai permainan dan pilih jawaban mengikuti nalurimu.",
      "Selesaikan satu putaran penuh.",
      "Tulis satu keputusan yang kalau diulang akan kamu ubah."
    ],
    min: 10,
    pts: 30,
    dim: "decision"
  },
  {
    id: "c22",
    cat: "Practice",
    kind: "practice",
    title: "Catat semua pengeluaranmu hari ini",
    desc: "Tulis setiap pengeluaran hari ini, sekecil apa pun, lalu lihat kategori mana yang paling besar.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Buka halaman Expenses dan catat semua pengeluaran hari ini satu per satu.",
      "Tulis total nominal yang kamu catat hari ini.",
      "Tulis satu pengeluaran yang menurutmu sebenarnya bisa dihindari."
    ],
    min: 6,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c23",
    cat: "Practice",
    kind: "practice",
    title: "Sisihkan tabungan sebelum jajan",
    desc: "Pisahkan uang tabungan di awal hari sebelum uang saku habis, bukan menabung dari sisa.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Pisahkan uang tabungan hari ini dan tulis nominalnya.",
      "Masukkan nominal itu ke halaman Saving.",
      "Tulis sisa uang saku setelah dipisahkan, lalu cek cukup untuk besok."
    ],
    min: 3,
    pts: 25,
    dim: "saving"
  },
  {
    id: "c24",
    cat: "Practice",
    kind: "practice",
    title: "Tunda satu pembelian impulsif 24 jam",
    desc: "Temukan satu hal yang ingin kamu beli hari ini, lalu tunda 24 jam sebelum memutuskan.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Tulis barang yang ingin kamu beli beserta harganya.",
      "Hitung berapa hari menabung dengan uang Rp5.000 per hari untuk barang itu.",
      "Tulis keputusanmu: beli sekarang, tunda besok, atau batalkan."
    ],
    min: 4,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c25",
    cat: "Practice",
    kind: "practice",
    title: "Buat anggaran jajan untuk besok",
    desc: "Tentukan batas maksimal pengeluaran besok sebelum hari itu dimulai, lalu tulis di catatan.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Tulis batas maksimal jajan besok dalam rupiah.",
      "Tulis tiga kategori yang paling mungkin kamu keluarkan besok.",
      "Tulis aturan sederhana: apa yang kamu lakukan kalau sudah mencapai batas."
    ],
    min: 5,
    pts: 25,
    dim: "goal"
  },
  {
    id: "c26",
    cat: "Practice",
    kind: "practice",
    title: "Periksa satu tawaran yang terlalu bagus",
    desc: "Cari satu pesan atau tawaran yang terdengar sangat menguntungkan, lalu periksa risikonya sebelum percaya.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Tulis tawaran atau pesan yang kamu temui, tanpa mengirim data apa pun.",
      "Tulis dua tanda bahwa tawaran itu berisiko atau mencurigakan.",
      "Tulis langkah verifikasi yang akan kamu lakukan."
    ],
    min: 5,
    pts: 30,
    dim: "risk"
  },
  {
    id: "c27",
    cat: "Practice",
    kind: "practice",
    title: "Tulis satu anggaran bulanan",
    desc: "Buat rencana 50/30/20: 50 persen kebutuhan, 30 persen tabungan, 20 persen hiburan, lalu cek apakah uang sakumu cukup.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Tulis total uang yang kamu terima bulan ini.",
      "Terapkan aturan 50/30/20 dan tulis nominal tiap bagian.",
      "Tulis satu penyesuaian supaya rencana ini bisa kamu jalankan."
    ],
    min: 6,
    pts: 30,
    dim: "goal"
  },
  {
    id: "c28",
    cat: "Practice",
    kind: "practice",
    title: "Bandingkan harga di tiga tempat",
    desc: "Cek minimal tiga toko atau marketplace untuk barang yang sama, lalu lihat mana yang paling masuk akal.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Pilih satu barang yang biasa kamu beli.",
      "Tulis harga di minimal tiga tempat berbeda.",
      "Tulis pilihan terbaikmu beserta selisih harganya."
    ],
    min: 5,
    pts: 25,
    dim: "spending"
  },
  {
    id: "c29",
    cat: "Practice",
    kind: "practice",
    title: "Perbarui target tabunganmu",
    desc: "Buka halaman Saving dan cek apakah targetmu masih realistis dengan uang saku yang kamu terima.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Tulis target tabunganmu saat ini.",
      "Hitung berapa hari yang dibutuhkan dengan setoran harianmu.",
      "Tulis target yang lebih realistis kalau tadi angkanya tidak masuk akal."
    ],
    min: 4,
    pts: 20,
    dim: "goal"
  },
  {
    id: "c30",
    cat: "Practice",
    kind: "practice",
    title: "Tinjau pengeluaran tujuh harimu",
    desc: "Lihat ringkasan pengeluaran seminggu ini, kelompokkan per kategori, lalu tentukan satu langkah perbaikan.",
    source: "Di dalam aplikasi",
    url: "",
    steps: [
      "Buka halaman Expenses dan lihat total minggu ini.",
      "Tulis kategori mana yang paling besar dan berapa persennya.",
      "Tulis satu langkah perbaikan untuk minggu depan."
    ],
    min: 8,
    pts: 30,
    dim: "decision"
  }
];


export const CASES = [
  {
    text: "Kamu memiliki Rp50.000. Temanmu mengajak membeli minuman seharga Rp25.000, tetapi kamu sedang menabung untuk membeli barang seharga Rp300.000.",
    correct: 2,
    hard: false,
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
    correct: 2,
    hard: false,
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
    correct: 2,
    hard: true,
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
  },
  {
    text: "Kamu menyisihkan Rp300.000 untuk beli sepatu sepak bola. Temanmu menawari kelas komedi ekstra yang membuatmu senang, seharga Rp175.000.",
    correct: 2,
    hard: false,
    options: [
      {
        label: "Belanja sepatu sekalian, jangan sampai kehabisan.",
        consequence: "Sepatu didapat, tapi target habis dan uang kas tidak ada cadangan.",
        impact: "Target −Rp300.000 · Tanpa dana darurat",
        lesson: "Membeli karena takut kehabisan adalah keputusan yang didorong rasa takut, bukan alasan.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Masuk kelas komedi, sepatu ditunda.",
        consequence: "Kesenangan sesaat, tapi target kebutuhan jadi mundur cukup jauh.",
        impact: "Target mundur · Dana Rp175.000 berkurang",
        lesson: "Hiburan sah-sah saja, tapi jangan sampai menggeser kebutuhan yang sudah direncanakan.",
        pts: 15,
        dim: "goal",
        d: 2
      },
      {
        label: "Tetap di target, tapi sisihkan Rp25.000 untuk hiburan.",
        consequence: "Sepatu tetap tercapai dan kamu tetap punya jatah senang-senang.",
        impact: "Target +Rp300.000 · Hiburan Rp25.000",
        lesson: "Memberi ruang kecil untuk hiburan menjaga konsistensi, tanpa mengorbankan kebutuhan.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Pinjam uang ke kakak untuk ikut kelas komedi.",
        consequence: "Utang bertambah dan tanggung jawab membayar ke kakak.",
        impact: "Utang baru · Risiko berulang",
        lesson: "Meminjam untuk hiburan menciptakan siklus yang bisa membuatmu terus tergantung.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Iklan pemain game menawarkan item langka murah 'untuk penggemar', diskon Rp80.000. Kamu tidak benar-benar butuh item itu.",
    correct: 1,
    hard: true,
    options: [
      {
        label: "Segera beli sebelum harganya naik.",
        consequence: "Uang keluar untuk barang yang tidak kamu butuhkan.",
        impact: "Saldo −Rp80.000 · Impulsif",
        lesson: "Takut 'kehilangan diskon' membuatmu membeli di luar rencana.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Lewati, karena memang tidak butuh.",
        consequence: "Uang tetap aman dan kamu tidak terbujuk citra eksklusif.",
        impact: "Saldo aman · Kontrol diri",
        lesson: "Pertanyaan terbaik sebelum membeli: apakah aku butuh, atau hanya ingin karena dipasarkan?",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Beli tapi pakai uang casual top-up.",
        consequence: "Kamu mengorbankan jatah game lain bulan ini.",
        impact: "Jatah game −Rp80.000 · Budget top-up habis",
        lesson: "Menukar satu jatah dengan jatah lain tetap mengurangi kemampuanmu nanti.",
        pts: 15,
        dim: "spending",
        d: 2
      },
      {
        label: "Minta bonus top-up dari teman.",
        consequence: "Memanfaatkan teman untuk keputusan yang sebenarnya milikmu sendiri.",
        impact: "Social risk · Tidak mandiri",
        lesson: "Keputusan finansial sebaiknya dari budget pribadi, bukan meminta teman membayar.",
        pts: 10,
        dim: "decision",
        d: 1
      }
    ]
  },
  {
    text: "Teman dekat meminjam uang Rp150.000, bilang akan mengembalikan 'besok'. Kamu sudah punya rencana menabung mingguan.",
    correct: 1,
    hard: true,
    options: [
      {
        label: "Pinjamkan penuh, karena takut dibilang pelit.",
        consequence: "Uangmu hilang dari rencana dan kamu khawatir tidak kembali.",
        impact: "Saldo −Rp150.000 · Rencana terganggu",
        lesson: "Meminjamkan karena takut penilaian orang menghilangkan kendalimu sendiri.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Pinjamkan sebagian yang memang tidak mengganggu rencana.",
        consequence: "Kamu membantu namun rencana tabungan tidak terguncang.",
        impact: "Sisa target aman · Hubungan tetap",
        lesson: "Menolong tetap bisa dilakukan tanpa mengorbankan seluruh rencana.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Pinjamkan dan abaikan rencana mingguan.",
        consequence: "Target menabung jadi molor, minggu depan kamu menyesal.",
        impact: "Rencana mundur · Penyesalan berulang",
        lesson: "Menolong sekali jangan menggoyahkan kebiasaan yang sudah kamu bangun.",
        pts: 10,
        dim: "saving",
        d: 1
      },
      {
        label: "Bilang tidak punya, padahal punya.",
        consequence: "Menghindari konflik tapi membuatmu berbohong.",
        impact: "Kepercayaan memburuk · Dilema",
        lesson: "Berkomunikasi jujur tentang batasmu lebih sehat daripada berpura-pura.",
        pts: 15,
        dim: "decision",
        d: 2
      }
    ]
  },
  {
    text: "Setiap minggu kamu menerima uang saku Rp100.000. Teman-teman jajan setiap hari, dan kalau kamu tidak ikut kamu merasa dikucilkan.",
    correct: 2,
    hard: false,
    options: [
      {
        label: "Ikut jajan setiap hari agar tetap dianggap teman.",
        consequence: "Uang saku habis sebelum akhir minggu.",
        impact: "Saldo −Rp100.000 · Habis di hari Kamis",
        lesson: "Rasa takut dikucilkan adalah pembelanja paling mahal.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Tidak pernah jajan, menabung semuanya.",
        consequence: "Target cepat tercapai, tapi kebiasaan ini sukar bertahan.",
        impact: "Tabungan utuh · Sosial terkorbankan",
        lesson: "Menabung 100% biasanya tidak bertahan karena tidak ada ruang bersenang-senang.",
        pts: 20,
        dim: "saving",
        d: 3
      },
      {
        label: "Beri jatah jajan Rp10.000 per hari, sisanya ditabung.",
        consequence: "Kamu tetap bisa kumpul dan tabungan terus bertambah.",
        impact: "Jatah jajan Rp50.000 · Tabungan +Rp50.000",
        lesson: "Konsistensi menabung bertahan ketika ada ruang kecil untuk menikmati hidup.",
        pts: 30,
        dim: "goal",
        d: 4
      },
      {
        label: "Pinjam dari teman agar tetap bisa jajan.",
        consequence: "Utang menumpuk dan kamu harus membayar minggu depan.",
        impact: "Utang baru · Minggu depan menjepit",
        lesson: "Meminjam untuk jajan menunda masalah, bukan menyelesaikannya.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Pesan masuk di dompet digitalmu: 'Bayar Rp200.000 untuk verifikasi, sebelum itu bagikan OTP yang kami kirim'.",
    correct: 3,
    hard: true,
    options: [
      {
        label: "Kirim OTP, biar verifikasi cepat selesai.",
        consequence: "Akunmu bisa dibobol dan saldo terkuras.",
        impact: "Saldo −Rp200.000 · Akun diretas",
        lesson: "OTP adalah kunci akun. Tidak ada lembaga resmi yang memintanya lewat chat.",
        pts: 0,
        dim: "risk",
        d: 0
      },
      {
        label: "Kirim OTP ke teman dulu untuk didiskusikan.",
        consequence: "OTP bocor ke pihak ketiga dan akunmu berisiko.",
        impact: "Risiko akun · Data bocor",
        lesson: "OTP tidak boleh dibagikan ke siapa pun, termasuk teman.",
        pts: 5,
        dim: "risk",
        d: 1
      },
      {
        label: "Balas dengan bertanya siapa yang minta.",
        consequence: "Kamu tidak kehilangan uang, tapi masih berisiko termanipulasi.",
        impact: "Saldo aman · Respons meragukan",
        lesson: "Jangan menekan tautan atau membalas permintaan OTP; selalu buka aplikasi resmi.",
        pts: 15,
        dim: "decision",
        d: 2
      },
      {
        label: "Tolak dan laporkan ke dukungan aplikasi resmi.",
        consequence: "Akunmu aman dan laporan membantu menutup penipuan.",
        impact: "Saldo aman · Penipuan dilaporkan",
        lesson: "Mengecek lewat aplikasi resmi dan melaporkan adalah refleks keuangan yang benar.",
        pts: 30,
        dim: "risk",
        d: 4
      }
    ]
  },
  {
    text: "Toko online menawarkan sepatu favoritmu diskon 70% 'hari ini saja'. Kamu sedang menabung untuk membeli laptop.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Beli sekarang sebelum diskon hilang.",
        consequence: "Diskon besar membuatmu menguras tabungan laptop.",
        impact: "Tabungan laptop −Rp150.000 · Fokus terganggu",
        lesson: "'Hari ini saja' dibuat agar kamu memutuskan dengan buru-buru.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Lewati karena tidak ada dalam rencana.",
        consequence: "Tabungan laptop tetap aman.",
        impact: "Tabungan aman · Fokus laptop",
        lesson: "Harga murah tidak pernah mengalahkan kebutuhan yang sedang kamu kejar.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Beli sebagai hadiah ulang tahun kakak.",
        consequence: "Kamu menyenangkan orang lain tapi mengganggu rencanamu sendiri.",
        impact: "Tabungan berkurang · Hadiah mahal",
        lesson: "Hadiah tidak harus mahal; sering kali kehadiran lebih berharga.",
        pts: 10,
        dim: "decision",
        d: 1
      },
      {
        label: "Beli pakai uang untuk kebutuhan sekolah.",
        consequence: "Kebutuhan sekolah jadi terancam.",
        impact: "Uang kebutuhan −Rp150.000 · Risiko besar",
        lesson: "Jangan pernah menyentuh uang kebutuhan pokok demi barang konsumtif.",
        pts: 0,
        dim: "spending",
        d: 0
      }
    ]
  },
  {
    text: "Event game favoritmu menawarkan 'pasti dapat item langka' dengan biaya top-up Rp50.000 per undian. Kamu sudah menghabiskan Rp100.000 hari ini.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Lanjut undian sampai dapat item langka.",
        consequence: "Uang terus mengalir dan tabungan daruratmu kosong.",
        impact: "Saldo −Rp150.000 · Kecanduan undian",
        lesson: "Mengejar 'biar tidak sia-sia' justru membuat kerugian semakin besar.",
        pts: 0,
        dim: "risk",
        d: 0
      },
      {
        label: "Berhenti sekarang, tidak top-up lagi hari ini.",
        consequence: "Kamu menghentikan kerugian dan merasa lebih tenang.",
        impact: "Kerugian dihentikan · Kontrol diri",
        lesson: "Berhenti setelah rugi adalah keputusan finansial yang dewasa.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Top-up sekali lagi pakai uang saku bulan depan.",
        consequence: "Uang bulan depan sudah habis sebelum diterima.",
        impact: "Budget bulan depan −Rp50.000 · Menjepit",
        lesson: "Memakai uang masa depan untuk game adalah utang tersembunyi.",
        pts: 10,
        dim: "spending",
        d: 1
      },
      {
        label: "Ngajak teman ikut biar bareng-bareng.",
        consequence: "Orang lain ikut rugi karena keputusanmu.",
        impact: "Sosial rusak · Kerugian bersama",
        lesson: "Mengajak orang lain tidak membuat keputusan itu lebih benar.",
        pts: 5,
        dim: "decision",
        d: 0
      }
    ]
  },
  {
    text: "Kamu mendapat bonus Rp150.000 di dompet digital yang hampir kedaluwarsa besok.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Beli skincare mahal karena uangnya 'bonus'.",
        consequence: "Uang bonus habis untuk hal yang tidak direncanakan.",
        impact: "Saldo −Rp150.000 · Impulsif",
        lesson: "Uang bonus tetap uang; perlakukan sesuai rencana.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Pindahkan 60% ke tabungan dan 40% untuk kebutuhan.",
        consequence: "Sebagian masuk tabungan, sebagian untuk kebutuhan riil.",
        impact: "Tabungan +Rp90.000 · Kebutuhan terpenuhi",
        lesson: "Uang tak terduga paling baik didistribusikan, bukan dihabiskan di satu tempat.",
        pts: 30,
        dim: "goal",
        d: 4
      },
      {
        label: "Belikan hadiah untuk semua orang di grup.",
        consequence: "Kesenangan sesaat, tabungan kosong.",
        impact: "Saldo −Rp150.000 · Pesta selesai",
        lesson: "Membeli perhatian orang lain dengan uang tak terduga jarang sepadan.",
        pts: 10,
        dim: "decision",
        d: 1
      },
      {
        label: "Bagikan kode bonus ke teman.",
        consequence: "Bonus berpindah tangan dan kamu tidak mendapat apa-apa.",
        impact: "Bonus hilang · Rugi",
        lesson: "Jangan membagikan kode atau OTP transaksi kepada siapa pun.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Temanmu belum mengembalikan Rp100.000 sudah 3 minggu, dan kini meminjam lagi Rp50.000.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Pinjamkan lagi supaya dia senang.",
        consequence: "Utang lama dan baru menumpuk, potensi tidak kembali makin besar.",
        impact: "Piutang Rp150.000 · Berisiko",
        lesson: "Meminjamkan lagi untuk menutupi yang lama adalah siklus berbahaya.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Tegur dengan sopan dan tanyakan jadwal pengembalian.",
        consequence: "Kamu menjaga hubungan sekaligus memperjelas utang.",
        impact: "Hubungan aman · Jadwal jelas",
        lesson: "Batas waktu yang jelas membuat meminjam tidak merusak hubungan.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Diam saja, takut menyakiti perasaannya.",
        consequence: "Kepercayaan terkikis pelan-pelan.",
        impact: "Utang menggantung · Suasana canggung",
        lesson: "Diam tidak menyelesaikan masalah uang.",
        pts: 15,
        dim: "decision",
        d: 2
      },
      {
        label: "Pinjamkan dengan bunga tinggi.",
        consequence: "Kamu memakai kesulitan teman untuk untung.",
        impact: "Eksploitasi · Hubungan rusak",
        lesson: "Memanfaatkan utang teman untuk untung bukan cara yang sehat.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Kamu menerima uang bulanan Rp300.000 untuk semua kebutuhan: makan, transport, dan tabungan.",
    correct: 2,
    hard: false,
    options: [
      {
        label: "Habiskan sesuka hati, sisanya ditabung.",
        consequence: "Pertengahan bulan uang sudah habis.",
        impact: "Budget −Rp300.000 · Kosong lebih cepat",
        lesson: "Menabung dari 'sisa' membuat sisa itu selalu nol.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Tidak usah menabung, toh masih ada orang tua.",
        consequence: "Tidak belajar mengelola dan kebiasaan menabung hilang.",
        impact: "Tabungan Rp0 · Kebiasaan hilang",
        lesson: "Kemandirian finansial tumbuh dari menabung sejak kecil, bukan menunggu dewasa.",
        pts: 10,
        dim: "saving",
        d: 1
      },
      {
        label: "Bagi rencana: 50% kebutuhan, 30% tabungan, 20% hiburan, dan catat semuanya.",
        consequence: "Semua terkelola dan tabungan pasti bertambah.",
        impact: "Tabungan +Rp90.000 · Terkendali",
        lesson: "Anggaran 50/30/20 sederhana dan membuat uang bekerja untukmu.",
        pts: 30,
        dim: "goal",
        d: 4
      },
      {
        label: "Pinjam dulu untuk kebutuhan yang belum sampai.",
        consequence: "Utang menumpuk sebelum uang bulan depan datang.",
        impact: "Utang baru · Risiko",
        lesson: "Meminjam untuk rutinitas mingguan adalah cara memperbesar pengeluaran.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Sebuah komunitas menawarkan 'investasi emas digital' dengan hasil 2x sebulan dan meminta kamu tidak membocorkannya ke orang lain.",
    correct: 1,
    hard: true,
    options: [
      {
        label: "Ikut dan sebarkan ke teman-teman.",
        consequence: "Merugikan teman jika ternyata skema penipuan.",
        impact: "Kerugian bersama · Risiko tinggi",
        lesson: "Ajak orang lain untuk memverifikasi, bukan untuk ikut tanpa cek.",
        pts: 0,
        dim: "risk",
        d: 0
      },
      {
        label: "Cek dulu ke OJK atau konsultasi orang tua.",
        consequence: "Kamu tahu legalitas sebelum menaruh uang.",
        impact: "Saldo aman · Terverifikasi",
        lesson: "Memeriksa izin resmi adalah langkah pertama sebelum berinvestasi.",
        pts: 30,
        dim: "risk",
        d: 4
      },
      {
        label: "Investasikan sebagian kecil saja.",
        consequence: "Jika penipuan, kamu tetap ikut rugi.",
        impact: "Saldo −Rp50.000 · Risiko sisa",
        lesson: "'Taruh dikit' tetap menumbuhkan harapan palsu.",
        pts: 10,
        dim: "decision",
        d: 1
      },
      {
        label: "Minta persen lebih dulu dari pengelola.",
        consequence: "Kamu sudah menaruh uang sebelum mengecek legalitas.",
        impact: "Sama berisiko · Tanpa verifikasi",
        lesson: "Menanyakan pembagian untung tidak sama dengan memeriksa izin resmi.",
        pts: 5,
        dim: "risk",
        d: 0
      }
    ]
  },
  {
    text: "Tiket konser idolamu 'dijamin pasti dapat' oleh akun reseller dengan harga 2x lipat dari harga resmi.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Beli cepat sebelum kehabisan.",
        consequence: "Harga 2x lipat menguras tabunganmu.",
        impact: "Saldo −Rp400.000 · Harga 2x",
        lesson: "Jalur resmi selalu lebih murah daripada calo.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Cek dulu ke sumber resmi, bisa jadi sudah habis.",
        consequence: "Tiket reseller sering fiktif.",
        impact: "Saldo aman · Terverifikasi",
        lesson: "Membeli lewat jalur resmi melindungi uangmu.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Transfer DP dulu, sisanya belakangan.",
        consequence: "DP bisa hilang jika akunnya palsu.",
        impact: "DP −Rp100.000 · Hilang",
        lesson: "Transfer sebelum barang atau tiket ada adalah risiko.",
        pts: 5,
        dim: "risk",
        d: 0
      },
      {
        label: "Ngajak teman patungan beli.",
        consequence: "Keputusan yang buruk jadi ditanggung berdua.",
        impact: "Rugi bersama · Sosial",
        lesson: "Berbagi biaya bukan berarti keputusan itu lebih benar.",
        pts: 10,
        dim: "decision",
        d: 1
      }
    ]
  },
  {
    text: "Kamu butuh buku referensi seharga Rp120.000. Kakak kelas menawarkan buku bekas yang sama dengan kondisi bagus seharga Rp40.000.",
    correct: 1,
    hard: false,
    options: [
      {
        label: "Beli yang baru, biar tidak malu.",
        consequence: "Selisih Rp80.000 hilang untuk barang yang sama persis.",
        impact: "Pengeluaran +Rp80.000 · Gengsi",
        lesson: "Membeli baru demi gengsi adalah pajak yang tidak perlu.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Beli yang bekas, kualitasnya sama.",
        consequence: "Fungsinya sama, kamu hemat Rp80.000.",
        impact: "Hemat Rp80.000 · Buku sama",
        lesson: "Memilih barang bekas berkualitas adalah keputusan hemat yang cerdas.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Beli keduanya.",
        consequence: "Dua buku yang sama, biaya double.",
        impact: "Pengeluaran −Rp160.000 · Boros",
        lesson: "Lebih banyak barang tidak selalu lebih banyak manfaat.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Fotokopi seluruh buku agar murah.",
        consequence: "Bisa melanggar hak cipta meski uangmu hemat.",
        impact: "Risiko legal · Hemat fisik",
        lesson: "Menghemat tidak boleh sampai melanggar aturan.",
        pts: 10,
        dim: "risk",
        d: 1
      }
    ]
  },
  {
    text: "Di pertengahan bulan, saldomu tinggal Rp20.000, padahal masih perlu makan siang dan ongkos selama seminggu.",
    correct: 0,
    hard: false,
    options: [
      {
        label: "Hitung kebutuhan minimum dan alokasikan per hari.",
        consequence: "Uangmu cukup terjadwal untuk seminggu.",
        impact: "Sisa sehat · Terjadwal",
        lesson: "Menjatah sisa uang sesuai kebutuhan adalah kunci selesai tanpa utang.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Habiskan untuk jajan favorit sekali saja.",
        consequence: "Sisa langsung habis, kebutuhan lain terbengkalai.",
        impact: "Saldo Rp0 · Jajan senang",
        lesson: "Satu momen menyenangkan bisa mengorbankan kebutuhan seminggu.",
        pts: 5,
        dim: "spending",
        d: 0
      },
      {
        label: "Pinjam dari teman untuk menambal.",
        consequence: "Utang menggantung sampai bulan depan.",
        impact: "Utang Rp20.000+ · Menjepit",
        lesson: "Meminjam untuk rutinitas mingguan membentuk kebiasaan utang.",
        pts: 5,
        dim: "risk",
        d: 0
      },
      {
        label: "Lewati makan siang agar uang aman.",
        consequence: "Menghemat dengan cara membahayakan kesehatan.",
        impact: "Kesehatan terancam · Hemat salah arah",
        lesson: "Penghematan tidak boleh mengorbankan kebutuhan dasar.",
        pts: 10,
        dim: "saving",
        d: 1
      }
    ]
  },
  {
    text: "Teman-teman mendorongmu berdonasi besar untuk acara amal, sementara uang jajanmu pas-pasan bulan ini.",
    correct: 2,
    hard: false,
    options: [
      {
        label: "Donasi besar agar terlihat dermawan.",
        consequence: "Bulan ini jadi kekurangan kebutuhan dasar.",
        impact: "Budget −Rp100.000 · Menjepit",
        lesson: "Memberi demi citra, bukan demi kebutuhan, membuatmu rugi ganda.",
        pts: 5,
        dim: "decision",
        d: 0
      },
      {
        label: "Tolak total dan tidak peduli.",
        consequence: "Uangmu aman tapi hubungan sosial melemah.",
        impact: "Saldo aman · Sosial dingin",
        lesson: "Boleh menolak tanpa harus kasar.",
        pts: 15,
        dim: "decision",
        d: 2
      },
      {
        label: "Donasi kecil sesuai kemampuan dan jelaskan jujur.",
        consequence: "Kamu ikut beramal tanpa mengorbankan kebutuhan.",
        impact: "Donasi Rp10.000 · Niat tulus",
        lesson: "Berdonasi sesuai kemampuan adalah amal yang berkelanjutan.",
        pts: 25,
        dim: "goal",
        d: 3
      },
      {
        label: "Pinjam uang untuk donasi besar.",
        consequence: "Berutang untuk berderma adalah kontradiksi.",
        impact: "Utang Rp100.000 · Ironis",
        lesson: "Memberi sebaiknya dari kelebihan, bukan dari utang.",
        pts: 5,
        dim: "risk",
        d: 0
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