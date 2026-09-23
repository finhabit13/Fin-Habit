import Glyph from "../lib/glyphs";
import { useApp } from "../context/AppContext";

import Home from "../pages/Home";
import Learn from "../pages/Learn";
import Challenge from "../pages/Challenge";
import Expenses from "../pages/Expenses";
import Budget from "../pages/Budget";
import Saving from "../pages/Saving";
import Decision from "../pages/Decision";
import Family from "../pages/Family";
import Score from "../pages/Score";
import Profile from "../pages/Profile";

const PAGES = {
  home: Home,
  learn: Learn,
  challenge: Challenge,
  expenses: Expenses,
  budget: Budget,
  saving: Saving,
  decide: Decision,
  family: Family,
  score: Score,
  profile: Profile
};

const NAV = [
  { id: "home", icon: "home", label: "Home" },
  { id: "learn", icon: "book", label: "Learn" },
  { id: "challenge", icon: "target", label: "Challenge" },
  { id: "score", icon: "chart", label: "Score" },
  { id: "profile", icon: "user", label: "Profile" }
];

const TOOLS = [
  { id: "expenses", icon: "receipt", label: "Track Spending" },
  { id: "budget", icon: "sliders", label: "Budget" },
  { id: "saving", icon: "piggy", label: "Saving" },
  { id: "decide", icon: "scale", label: "Decision Lab" },
  { id: "family", icon: "users", label: "Family" }
];

export default function Phone() {
  const { user, page, go, demo } = useApp();
  const Page = PAGES[page] || Home;
  const initial = (user?.name || "B").trim().charAt(0).toUpperCase();

  const renderLink = (n) => (
    <li key={n.id}>
      <button
        className={"side-link" + (page === n.id ? " is-active" : "")}
        onClick={() => go(n.id)}
        aria-current={page === n.id ? "page" : undefined}
      >
        <span className="side-ico">
          <Glyph name={n.icon} size={19} />
        </span>
        {n.label}
      </button>
    </li>
  );

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Menu utama">
        <div className="brand">
          <span className="brand-mark">₣</span>
          <span className="brand-name">FINHABIT</span>
          <span className="brand-tag">Kebiasaan finansial remaja</span>
        </div>

        <p className="nav-group-label">Utama</p>
        <ul className="side-nav">{NAV.map(renderLink)}</ul>

        <p className="nav-group-label">Alat</p>
        <ul className="side-nav">{TOOLS.map(renderLink)}</ul>

        <div className="side-foot">
          {demo && <div className="demo-banner demo-banner-side">Mode demo (data lokal)</div>}
          <div className="side-user">
            <button className="avatar" onClick={() => go("profile")} aria-label="Buka profil">
              {initial}
            </button>
            <div className="side-user-meta">
              <p className="side-user-name">{user?.name || "Pengguna"}</p>
              <p className="side-user-stat">
                {user?.points ?? 0} poin · streak {user?.streak ?? 0}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">₣</span>
          <span className="brand-name">FINHABIT</span>
        </div>
        <button className="avatar" onClick={() => go("profile")} aria-label="Buka profil">
          {initial}
        </button>
      </header>

      {demo && <div className="demo-banner demo-banner-mobile">Mode demo (data lokal)</div>}

      <main className="screen-area" id="screenArea">
        <Page />
      </main>

      <nav className="bottom-nav" aria-label="Menu utama">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={"nav-item" + (page === n.id ? " is-active" : "")}
            onClick={() => go(n.id)}
            aria-current={page === n.id ? "page" : undefined}
          >
            <span className="nav-ico">
              <Glyph name={n.icon} size={21} />
            </span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}