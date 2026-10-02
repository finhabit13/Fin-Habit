import useSweep from "../lib/useSweep";

const R = 52;
const TOTAL = 2 * Math.PI * R;

/**
 * Cincin untuk halaman tabungan.
 *
 * Berbeda dari ScoreRing, yang selalu menampilkan "/100" di tengah. Di sini
 * isi tengah bisa apa saja: rupiah, jumlah hari, atau tanda centang. Jadi
 * children-nya dibiarkan apa adanya dan animasi hanya menyentuh lingkarannya.
 *
 * Warna berasal dari status kecepatan, bukan dari pilihan random: hijau kalau
 * lebih cepat dari rencana, kuning tepat, merah telat.
 */
export default function SavingRing({
  value,
  tone = "green",
  size = 128,
  stroke = 11,
  label,
  children,
  duration = 1150
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const sweep = useSweep(duration);
  const shown = Math.round(pct * sweep);
  const offset = TOTAL - (TOTAL * shown) / 100;

  return (
    <div className={"goal-ring tone-" + tone} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label}>
        <circle className="ring-bg" cx="60" cy="60" r={R} style={{ strokeWidth: stroke }} />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r={R}
          style={{ strokeWidth: stroke, strokeDasharray: TOTAL, strokeDashoffset: offset }}
        />
      </svg>
      <div className="goal-ring-center">{children}</div>
    </div>
  );
}