import { useEffect, useRef } from "react";

import { formatThousands, nextCaret } from "../lib/money";

/**
 * Input nominal dengan pemisah ribuan yang muncul sambil mengetik.
 *
 * Kenapa bukan type="number": browser membuang karakter non-numerik dari
 * value input number, jadi titik ribuan mustahil ditampilkan di sana.
 * Karena itu field ini type="text" dengan inputMode="numeric" supaya
 * keyboard angka tetap muncul di HP.
 *
 * Kontrak: `value` boleh string atau number, `onChange` selalu mengirim
 * string berformat ("1.234.567"). Nilai untuk disimpan dikonversi di sisi
 * pemanggil dengan parseThousands, bukan dengan Number: Number("1.234.567")
 * membaca titik sebagai desimal dan menghasilkan 1.
 *
* `required` diteruskan apa adanya supaya pesan error bawaan browser masih
 * muncul kalau field kosong. Aturan min/max tidak ada di sini: keduanya
 * tidak berlaku pada input text, dan pemanggil sudah memeriksa nilainya
 * saat submit.
 */
export default function AmountInput({
  value,
  onChange,
  placeholder,
  required,
  id,
  name,
  className,
  autoFocus,
  onBlur,
  ariaLabel
}) {
  const ref = useRef(null);
  const pendingCaret = useRef(null);

  const display = formatThousands(value);

  useEffect(() => {
    const el = ref.current;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    if (!el || pos === null) return;
    el.setSelectionRange(pos, pos);
  });

  const handleChange = (e) => {
    const el = e.target;
    const next = formatThousands(el.value);
    pendingCaret.current = nextCaret(
      el.value,
      el.selectionStart ?? el.value.length,
      el.selectionEnd ?? el.value.length,
      next
    );
    onChange(next);
  };

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      aria-label={ariaLabel}
      value={display}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
}