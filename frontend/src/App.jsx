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
import AdminDashboard from "./pages/AdminDashboard";

function Root() {
  const { resolved, user, recovering, boot } = useApp();
  const [path, setPath] = useState(window.location.pathname);
  const isAdminPath = path.startsWith("/admin");

  useEffect(() => {
    boot();
  }, [boot]);

  const go = (p) => {
    window.history.pushState({}, "", p);
    setPath(p);
  };

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!resolved) {
    return (
      <div className="phone boot-screen">
        <div className="boot-logo">₣</div>
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
    return (
      <>
        <AdminDashboard />
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