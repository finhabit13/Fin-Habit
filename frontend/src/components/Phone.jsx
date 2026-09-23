import Glyph from "../lib/glyphs";
import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";

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
import Leaderboard from "../pages/Leaderboard";
import Admin from "../pages/Admin";

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
  profile: Profile,
  leaderboard: Leaderboard,
  admin: Admin
};

const NAV = [
  { id: "home", icon: "home" },
  { id: "learn", icon: "book" },
  { id: "challenge", icon: "target" },
  { id: "score", icon: "chart" },
  { id: "leaderboard", icon: "crown" },
  { id: "profile", icon: "user" }
];

const TOOLS = [
  { id: "expenses", icon: "receipt" },
  { id: "budget", icon: "sliders" },
  { id: "saving", icon: "piggy" },
  { id: "decide", icon: "scale" },
  { id: "family", icon: "users" }
];

export default function Phone() {
  const { user, page, go, demo } = useApp();
  const { t } = useI18n();
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
        {t("nav." + n.id)}
      </button>
    </li>
  );

  return (
    <div className="app">
      <nav className="sidebar" aria-label={t("nav.mainMenu")}>
        <div className="brand">
          <span className="brand-mark">₣</span>
          <span className="brand-name">FINHABIT</span>
          <span className="brand-tag">{t("nav.brandTag")}</span>
        </div>

        <p className="nav-group-label">{t("nav.groupMain")}</p>
        <ul className="side-nav">{NAV.map(renderLink)}</ul>

        <p className="nav-group-label">{t("nav.groupTools")}</p>
        <ul className="side-nav">
          {TOOLS.map(renderLink)}
          {user && user.role === "admin" && renderLink({ id: "admin", icon: "shieldCheck" })}
        </ul>

        <div className="side-foot">
          {demo && <div className="demo-banner demo-banner-side">{t("nav.demoBanner")}</div>}
          <div className="side-user">
            <button className="avatar" onClick={() => go("profile")} aria-label={t("nav.openProfile")}>
              {initial}
            </button>
            <div className="side-user-meta">
              <p className="side-user-name">{user?.name || t("nav.user")}</p>
              <p className="side-user-stat">
                {t("nav.userStat", { points: user?.points ?? 0, streak: user?.streak ?? 0 })}
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
        <button className="avatar" onClick={() => go("profile")} aria-label={t("nav.openProfile")}>
          {initial}
        </button>
      </header>

      {demo && <div className="demo-banner demo-banner-mobile">{t("nav.demoBanner")}</div>}

      <main className="screen-area" id="screenArea">
        <Page />
      </main>

      <nav className="bottom-nav" aria-label={t("nav.mainMenu")}>
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
            <span className="nav-label">{t("nav." + n.id)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}