import { toAmount } from "./money";
import { balanceOf } from "./savings";

/**
 * Lapisan data untuk tabungan goals.
 *
 * Saldo tidak pernah diambil dari kolom yang bisa ditulis user. Semua diambil
 * dari daftar transaksi lalu dijumlahkan di sini dengan balanceOf(), supaya
 * angka yang tampil di layar sama persis dengan angka yang bisa dihitung ulang
 * dari riwayat yang terlihat user.
 *
 * Fungsi-fungsi ini menerima client Supabase, bukan membuatnya sendiri, supaya
 * bisa dipakai ulang oleh store.js untuk mode demo tanpa menarik modul
 * supabase ke jalur yang tidak butuh.
 */

const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  targetAmount: Number(r.target_amount),
  cadenceAmount: Number(r.cadence_amount),
  cadenceUnit: r.cadence_unit,
  coverUrl: r.cover_url || null,
  createdAt: r.created_at
});

const txFromRow = (r) => ({
  id: r.id,
  goalId: r.goal_id,
  kind: r.kind,
  amount: Number(r.amount),
  note: r.note || "",
  occurredOn: r.occurred_on,
  createdAt: r.created_at
});

/** Ambil daftar goal milik user. */
export async function loadGoals(c, userId) {
  const { data, error } = await c
    .from("saving_goals")
    .select("id, name, target_amount, cadence_amount, cadence_unit, cover_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

/** Semua transaksi milik user, dikelompokkan per goal. */
export async function loadTransactions(c, userId) {
  const { data, error } = await c
    .from("saving_transactions")
    .select("id, goal_id, kind, amount, note, occurred_on, created_at")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;

  const grouped = {};
  for (const r of data || []) {
    const tx = txFromRow(r);
    (grouped[tx.goalId] ||= []).push(tx);
  }
  return grouped;
}

/** Goal lengkap dengan saldo, transaksi, dan ringkasan perhitungannya. */
export async function loadGoalsWithBalance(c, userId) {
  const [goals, grouped] = await Promise.all([loadGoals(c, userId), loadTransactions(c, userId)]);
  return goals.map((goal) => {
    const transactions = grouped[goal.id] || [];
    return { ...goal, transactions, balance: balanceOf(transactions) };
  });
}

export async function createGoal(c, userId, input) {
  const name = String(input.name || "").trim();
  const target = toAmount(input.targetAmount);
  if (!name) throw new Error("Nama tujuan wajib diisi");
  if (!Number.isFinite(target) || target <= 0) throw new Error("Target harus lebih dari 0");

  const cadence = toAmount(input.cadenceAmount);
  const unit = ["day", "week", "month"].includes(input.cadenceUnit) ? input.cadenceUnit : "day";

  const { data, error } = await c
    .from("saving_goals")
    .insert({
      user_id: userId,
      name,
      target_amount: target,
      // Cadence 0 berarti tidak punya rencana. Menolak angka negatif di sini
      // juga menjaga kolom ini tidak pernah berisi yang tidak masuk akal.
      cadence_amount: Number.isFinite(cadence) && cadence > 0 ? cadence : 0,
      cadence_unit: unit,
      cover_url: input.coverUrl || null
    })
    .select("id, name, target_amount, cadence_amount, cadence_unit, cover_url, created_at")
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGoal(c, userId, goalId, patch) {
  const body = {};
  if (patch.name !== undefined) {
    const name = String(patch.name).trim();
    if (!name) throw new Error("Nama tujuan wajib diisi");
    body.name = name;
  }
  if (patch.targetAmount !== undefined) {
    const target = Number(patch.targetAmount);
    if (!Number.isFinite(target) || target <= 0) throw new Error("Target harus lebih dari 0");
    body.target_amount = target;
  }
  if (patch.cadenceAmount !== undefined) {
    const cadence = Number(patch.cadenceAmount);
    body.cadence_amount = Number.isFinite(cadence) && cadence > 0 ? cadence : 0;
  }
  if (patch.cadenceUnit !== undefined) {
    body.cadence_unit = ["day", "week", "month"].includes(patch.cadenceUnit) ? patch.cadenceUnit : "day";
  }
  if (patch.coverUrl !== undefined) body.cover_url = patch.coverUrl || null;

  // Sengaja tidak mengirim kolom lain. Patch kosong berarti tidak ada yang perlu
  // diubah, dan mengirim objek kosong hanya menambah satu request sia-sia.
  if (Object.keys(body).length === 0) return null;

  const { data, error } = await c
    .from("saving_goals")
    .update(body)
    .eq("id", goalId)
    .eq("user_id", userId)
    .select("id, name, target_amount, cadence_amount, cadence_unit, cover_url, created_at")
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

/**
 * Hapus goal beserta seluruh transaksinya.
 *
 * Transaksi ikut terhapus karena cascade di level tabel. Kalau tidak, transaksi
 * yatim akan tetap ikut terhitung di leaderboard padahal tidak ada goal-nya.
 */
export async function deleteGoal(c, userId, goalId) {
  const { error } = await c
    .from("saving_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

export async function addTransaction(c, userId, input) {
  const amount = toAmount(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Nominal harus lebih dari 0");
  const kind = input.kind === "expense" ? "expense" : "income";

  const note = String(input.note || "").trim();
  const { data, error } = await c
    .from("saving_transactions")
    .insert({
      goal_id: input.goalId,
      user_id: userId,
      kind,
      amount,
      // Catatan opsional: string kosong disimpan sebagai null supaya tidak
      // memenuhi daftar dengan baris kosong.
      note: note || null,
      occurred_on: input.occurredOn || new Date().toISOString().slice(0, 10)
    })
    .select("id, goal_id, kind, amount, note, occurred_on, created_at")
    .single();
  if (error) throw error;
  return txFromRow(data);
}

/**
 * Hapus satu riwayat. Saldo ikut turun karena tidak ada kolom saldo yang
 * perlu dikoreksi: dihitung ulang dari sisa transaksi.
 */
export async function deleteTransaction(c, userId, txId) {
  const { error } = await c
    .from("saving_transactions")
    .delete()
    .eq("id", txId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

/**
 * Unggah gambar tujuan ke bucket saving-covers.
 *
 * Folder pertama pada path nama file harus sama dengan id user, karena policy
 * storage memaksa itu. Kalau tidak, upload ditolak tanpa pesan yang jelas.
 */
export async function uploadCover(c, userId, file) {
  // Bucket hanya menerima ketiga tipe ini, jadi tolak lebih awal supaya
  // pesannya diterjemahkan, bukan pesan error mentah dari Storage.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type || "")) {
    const err = new Error("Berkas harus berupa gambar JPG, PNG, atau WebP");
    err.key = "err.notImage";
    throw err;
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await c.storage.from("saving-covers").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  // Path, bukan URL publik. Bucket-nya privat, jadi URL publik tidak bisa
  // dipakai dan akan kedaluwarsa. Penandatanganan dilakukan saat render.
  return path;
}

/**
 * Ubah nilai cover yang tersimpan menjadi URL yang bisa dipakai <img>.
 *
 * Tiga bentuk nilai yang mungkin muncul:
 *   - path relatif di bucket saving-covers -> ditandatangani
 *   - data:...                            -> mode demo, langsung dipakai
 *   - http(s)://...                       -> URL lama atau gambar eksternal
 */
export async function signCover(c, value) {
  if (!value) return null;
  if (value.startsWith("data:") || /^https?:\/\//i.test(value)) return value;
  const { data, error } = await c.storage.from("saving-covers").createSignedUrl(value, 3600);
  if (error) return null;
  return data?.signedUrl || null;
}