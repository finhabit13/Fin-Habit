import { useEffect, useState } from "react";

import BackLink from "../components/BackLink";
import { useApp } from "../context/AppContext";
import { rupiah } from "../lib/util";

const STATUS_TEXT = {
  safe: {
    tag: "Aman",
    title: "Pengeluaranmu masih terkendali.",
    hint: "Kamu belum mendekati batas budget bulan ini. Pertahankan ritme ini."
  },
  warn: {
    tag: "Perhatian",
    title: "Pengeluaranmu mulai di luar kendali.",
    hint: "Kamu sudah memakai sebagian besar budget bulan ini. Sisa hari ini tidak banyak. Kendalikan sebelum dompetmu menangis."
  },
  over: {
    tag: "Berlebihan",
    title: "Budget bulan ini sudah lewat.",
    hint: "Pengeluaranmu melewati batas. Fokuskan sisa bulan ini untuk menahan pengeluaran non-kebutuhan."
  },
  none: { tag: "Belum diatur", title: "Atur budget bulananmu.", hint: "Tentukan batas agar aplikasi bisa memberi peringatan" }
};

export default function Budget() {
  const { run, showSuccess, showToast } = useApp();
  const [data, setData] = useState(null);
  const [input, setInput] = useState("");

  const load = async () => {
    await run(async (s) => {
      setData(await s.budget());
      return null;
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (!data)
    return (
      <>
        <BackLink />
        <h1 className="page-title">Limit Warning</h1>
        <div className="card">
          <p className="muted">Memuat data budget...</p>
        </div>
      </>
    );

  const st = STATUS_TEXT[data.status] || STATUS_TEXT.safe;
  const pctWidth = Math.min(100, data.pct);

  const save = async () => {
    const n = Number(input);
    if (!n || n <= 0) {
      showToast("Masukkan budget lebih dari 0");
      return;
    }
    const res = await run((s) => s.setBudget(n));
    if (!res.ok) return;
    setData(res.data);
    setInput("");
    showSuccess("Budget disimpan", rupiah(n));
  };

  return (
    <>
      <BackLink />
      <h1 className="page-title">Limit Warning</h1>
      <p className="muted">Ketahui saat pengeluaranmu mulai di luar kendali, sebelum dompetmu menangis.</p>

      <div className="pair">
        <div className={"card limiter " + data.status}>
          <span className="tag">{st.tag}</span>
          <p className="limiter-title">{st.title}</p>
          <p className="limiter-total">{rupiah(data.spent)}</p>
          <p className="limiter-sub">
            dari {rupiah(data.budget)} · {data.pct}%
          </p>
          <div className="bar">
            <span
              className={"bar-fill " + (data.status === "over" ? "danger" : data.status === "warn" ? "warn" : "")}
              style={{ width: pctWidth + "%" }}
            />
          </div>
          <p className="muted small">{st.hint}</p>
        </div>

        <div className="card">
          <h3 className="card-title">Budget bulanan</h3>
          <label className="field">
            <span>Besaran budget (Rp)</span>
            <input
              type="number"
              value={input}
              min="0"
              step="10000"
              placeholder={rupiah(data.budget || 0)}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <button className="btn btn-primary" onClick={save}>
            Simpan budget
          </button>
        </div>
      </div>

      <div className="card soft-blue">
        <p className="muted small">
          Level: <b>Aman</b> (&lt;80%), <b>Perhatian</b> (80-100%), <b>Berlebihan</b> (&gt;100%). Aplikasi
          otomatis menandai kondisimu di halaman Home.
        </p>
      </div>
    </>
  );
}