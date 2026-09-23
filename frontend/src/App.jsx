import { useEffect } from "react";

import Modal from "./components/Modal";
import Phone from "./components/Phone";
import Success from "./components/Success";
import Toast from "./components/Toast";
import { AppProvider, useApp } from "./context/AppContext";
import { LangProvider } from "./lib/i18n";
import Auth from "./pages/Auth";

function Root() {
  const { resolved, user, boot } = useApp();

  useEffect(() => {
    boot();
  }, [boot]);

  if (!resolved) {
    return (
      <div className="phone boot-screen">
        <div className="boot-logo">₣</div>
        <p>FINHABIT</p>
      </div>
    );
  }

  if (!user) return <Auth />;

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