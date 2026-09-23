import mascotUrl from "../assets/mascot.png";
import { useApp } from "../context/AppContext";

export default function Success() {
  const { success } = useApp();
  if (!success) return null;

  return (
    <div className="success-overlay open" role="status" aria-live="assertive">
      <div className="success-box">
        <img className="mascot-success" src={mascotUrl} alt="" />
        <div className="success-check">✓</div>
        <h2>{success.title}</h2>
        <p>{success.text}</p>
      </div>
    </div>
  );
}