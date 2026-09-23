import { useApp } from "../context/AppContext";

export default function BackLink({ label = "Home", target = "home" }) {
  const { go } = useApp();
  return (
    <button className="back-link" onClick={() => go(target)}>
      ← {label}
    </button>
  );
}