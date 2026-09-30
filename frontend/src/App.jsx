import { useEffect, useState } from "react";

import Modal from "./components/Modal";
import Phone from "./components/Phone";
import Success from "./components/Success";
import Toast from "./components/Toast";
import { AppProvider, useApp } from "./context/AppContext";
import { LangProvider } from "./lib/i18n";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Activity from "./pages/admin/Activity";
import AdminShell from "./pages/admin/AdminShell";
import Banners from "./pages/admin/Banners";
import Challenges from "./pages/admin/Challenges";
import Leaderboard from "./pages/admin/Leaderboard";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";

function adminPageFor(path) {
  if (path.startsWith("/admin/users")) return <Users />;
  if (path.startsWith("/admin/activity")) return <Activity />;
  if (path.startsWith("/admin/leaderboard")) return <Leaderboard />;
  if (path.startsWith("/admin/challenges")) return <Challenges />;
  if (path.startsWith("/admin/banners")) return <Banners />;
  return <Overview />;
}

function Root() {
  const { resolved, user, recovering, boot } = useApp();
  const [path, setPath] = useState(window.location.pathname);
  const isAdminPath = path.startsWith("/admin");

  useEffect(() => {
    boot();
  }, [boot]);

  const go = (p) => {
    if (p === window.location.pathname) return;
    window.history.pushState({}, "", p);
    setPath(p);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!resolved) {
    return (
      <div className="phone boot-screen">
        <img className="boot-logo" src="/finhabit-logo.jpeg" alt="" />
        <p>FINHABIT</p>
      </div>
    );
  }

  if (recovering) return <ForgotPassword go={go} recovery />;

  if (!user) {
    if (path === "/register") return <Register go={go} />;
    if (path === "/forgot") return <ForgotPassword go={go} />;
    return <Login go={go} />;
  }

  if (isAdminPath) {
    const page = adminPageFor(path);
    return (
      <>
        <AdminShell path={path} go={go}>
          <div key={path} className="page-enter">
            {page}
          </div>
        </AdminShell>
        <Toast />
      </>
    );
  }

  if (user.role === "admin") {
    window.location.replace("/admin");
    return null;
  }

  return (
    <>
      <Phone />
      <Modal />
      <Toast />
      <Success />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </LangProvider>
  );
}