import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { api, ApiError, NetworkError, clearToken, hasToken, setToken } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { store } from "../lib/store";

const AppCtx = createContext(null);

const NAV_TABS = ["home", "learn", "challenge", "score", "leaderboard", "profile"];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demo, setDemo] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [page, setPage] = useState("home");
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [success, setSuccess] = useState(null);
  const [modal, setModal] = useState(null);
  const [recovering, setRecovering] = useState(false);

  const toastTimer = useRef(null);
  const successTimer = useRef(null);

  const { t } = useI18n();

  const service = demo ? store : api;

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastShow(true);
    toastTimer.current = setTimeout(() => setToastShow(false), 2400);
  }, []);

  const showSuccess = useCallback((title, text) => {
    clearTimeout(successTimer.current);
    setSuccess({ title, text });
    successTimer.current = setTimeout(() => setSuccess(null), 1700);
  }, []);

  const go = useCallback((p) => {
    setPage(p);
    document.getElementById("screenArea")?.scrollTo({ top: 0 });
  }, []);

  const isTab = NAV_TABS.includes(page);

  const enterDemo = useCallback(
    (msg) => {
      if (demo) return;
      setDemo(true);
      store.getSessionUser().then(setUser);
      if (msg) showToast(msg);
    },
    [demo, showToast]
  );

  const loggerIn = useCallback(
    (username) => showToast(t("toast.hello", { name: username })),
    [showToast, t]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setDemo(false);
    setPage("home");
  }, []);

  const verifyMagicLink = useCallback(async (opts = {}) => {
    const params = new URLSearchParams(window.location.search);
    const token = opts.token ?? params.get("token");
    const tokenHash = opts.tokenHash ?? params.get("token_hash");
    const type = opts.type ?? params.get("type");
    if ((!token && !tokenHash) || !type) return { ok: false };

    try {
      const target = demo ? store : api;
      const data = await target.verifyMagicLink({ token, tokenHash, type });
      if (type === "recovery") {
        if (!demo) setToken(data.token);
        setRecovering(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        return { ok: true };
      }
      if (!demo) setToken(data.token);
      setUser(data.user);
      if (data.user.role === "admin") {
        window.location.replace("/admin");
        return { ok: true };
      }
      setPage("home");
      showToast(t("toast.verified"));
      window.history.replaceState({}, document.title, window.location.pathname);
      return { ok: true };
    } catch (err) {
      if (err instanceof NetworkError) {
        enterDemo();
      } else if (err instanceof ApiError) {
        showToast(err.key ? t(err.key) : err.message);
      } else {
        showToast(err.message || t("toast.error"));
      }
      return { ok: false };
    }
  }, [demo, showToast, t, enterDemo]);

  useEffect(() => {
    let sub;
    try {
      sub = api.subscribeRecovery(() => setRecovering(true));
    } catch {}
    return () => sub?.unsubscribe?.();
  }, []);

  /** Jalan kan aksi pada service aktif; tangani error & ambil user terbaru. */
  const run = useCallback(
    async (fn, { silent = false } = {}) => {
      try {
        const data = await fn(service);
        if (data && data.user) setUser(data.user);
        return { ok: true, data };
      } catch (err) {
        if (err instanceof NetworkError) {
          enterDemo(t("toast.demoMode"));
        } else if (err instanceof ApiError) {
          if (err.status === 401) {
            logout();
            return { ok: false };
          }
          if (!silent) showToast(err.key ? t(err.key) : err.message);
        } else {
          if (!silent) showToast(err.message || t("toast.error"));
        }
        return { ok: false };
      }
    },
    [demo, enterDemo, logout, showToast, service, t]
  );

  /**
   * Muat ulang data user. Dipanggil saat boot (kalau ada token) supaya
   * backend/demo tersambung tanpa halaman login.
   */
  const boot = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if ((token || tokenHash) && type) {
      await verifyMagicLink({ token, tokenHash, type });
      setResolved(true);
      return;
    }

    if (hasToken()) {
      try {
        const data = await api.me();
        setToken(data.token || null);
        setUser(data);
        const onAdminPath = window.location.pathname.startsWith("/admin");
        if (data.role === "admin" && !onAdminPath) {
          window.location.replace("/admin");
          return;
        }
        setResolved(true);
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          clearToken();
          setDemo(false);
          setUser(null);
          if (err.key === "err.banned") showToast(t("err.banned"));
        } else if (err instanceof NetworkError) {
          enterDemo();
        }
      }
    }
    setResolved(true);
  }, [enterDemo, verifyMagicLink, showToast, t]);

  const auth = useCallback(
    async (kind, body) => {
      try {
        const target = demo ? store : api;
        const data = await target[kind](body);
        if (data.needVerification) {
          return { ok: true, needVerification: true, email: data.email };
        }
        if (!demo) setToken(data.token);
        setUser(data.user);
        if (data.user.role === "admin") {
          window.location.replace("/admin");
          return { ok: true };
        }
        setPage("home");
        showToast(demo ? t("toast.demoMode") : t("toast.hello", { name: data.user.name }));
        return { ok: true };
      } catch (err) {
        if (err instanceof NetworkError) {
          if (!demo) {
            setDemo(true);
            const demoUser = await store.login(body);
            setUser(demoUser.user);
            setPage("home");
            showToast(t("toast.demoFallback"));
            return { ok: true };
          }
          return { ok: false, message: t("toast.network") };
        }
        const key = err.key || null;
        const msg = key ? t(key) : err.message || t("toast.error");
        showToast(msg);
        return { ok: false, message: msg, key };
      }
    },
    [demo, showToast, t]
  );

  const resetPassword = useCallback(
    async ({ email }) => {
      try {
        const target = demo ? store : api;
        const data = await target.resetPassword({ email });
        return { ok: true, email: data.email };
      } catch (err) {
        const key = err.key || null;
        const msg = key ? t(key) : err.message || t("toast.error");
        showToast(msg);
        return { ok: false, message: msg, key };
      }
    },
    [demo, showToast, t]
  );

  const updatePassword = useCallback(
    async ({ password }) => {
      try {
        const target = demo ? store : api;
        await target.updatePassword({ password });
        setRecovering(false);
        setUser(null);
        showToast(t("toast.passwordUpdated"));
        return { ok: true };
      } catch (err) {
        const key = err.key || null;
        const msg = key ? t(key) : err.message || t("toast.error");
        showToast(msg);
        return { ok: false, message: msg, key };
      }
    },
    [demo, showToast, t]
  );

  const verify = useCallback(
    async (body) => {
      try {
        if (demo) {
          const data = await store.login({ email: body.email, password: body.password });
          setUser(data.user);
          setPage("home");
          showToast(t("toast.demoMode"));
          return { ok: true };
        }
        const data = await api.verify(body);
        if (data.token) setToken(data.token);
        setUser(data.user);
        if (data.user.role === "admin") {
          window.location.replace("/admin");
          return { ok: true };
        }
        setPage("home");
        showToast(t("toast.verified"));
        return { ok: true };
      } catch (err) {
        if (err instanceof NetworkError) {
          const { ok, message, key } = await auth("login", { email: body.email, password: body.password });
          return ok ? { ok: true } : { ok: false, message, key };
        }
        const key = err.key || null;
        const msg = key ? t(key) : err.message || t("toast.error");
        showToast(msg);
        return { ok: false, message: msg, key };
      }
    },
    [demo, showToast, t, auth]
  );

  const value = {
    user,
    demo,
    resolved,
    page,
    go,
    isTab,
    toastMsg,
    toastShow,
    success,
    modal,
    showToast,
    showSuccess,
    openModal: (title, body) => setModal({ title, body }),
    closeModal: () => setModal(null),
    run,
    boot,
    auth,
    verify,
    resetPassword,
    updatePassword,
    recovering,
    logout,
    enterDemo
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);