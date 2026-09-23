export const rupiah = (n) => "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");

export const overallScore = (dims) =>
  Math.round((dims.saving + dims.spending + dims.decision + dims.goal + dims.risk) / 5);

export const scoreTitle = (s) => {
  if (s >= 90) return "Financial Master";
  if (s >= 80) return "Financial Smart";
  if (s >= 65) return "Getting Steady";
  return "Financial Starter";
};

export const levelName = (points) => {
  if (points >= 2000) return "Financial Master";
  if (points >= 1200) return "Financial Achiever";
  if (points >= 600) return "Financial Explorer";
  return "Financial Beginner";
};

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const dayLabel = (dateStr) => {
  const today = todayKey();
  if (dateStr === today) return "Hari ini";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  if (dateStr === yesterday) return "Kemarin";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
};

export const budgetStatus = (spent, budget) => {
  if (!budget || budget <= 0) return "none";
  const pct = spent / budget;
  if (pct >= 1) return "over";
  if (pct >= 0.8) return "warn";
  return "safe";
};

export const budgetInfo = (spent, budget) => {
  const status = budgetStatus(spent, budget);
  const pct = budget > 0 ? Math.min(150, Math.round((spent / budget) * 100)) : 0;
  return { status, pct };
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 15) return "Good afternoon";
  if (h < 19) return "Good evening";
  return "Good night";
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
};

export const challengeOfTheDay = (challenges) => {
  const idx = Math.max(0, dayOfYear()) % challenges.length;
  return challenges[idx];
};