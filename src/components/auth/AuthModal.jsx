// src/components/auth/AuthModal.jsx
// Full copy-paste popup (login/register) — BULLETPROOF click + z-index + portal.
// Works even if Tailwind breaks or overlays exist.
// Requires: axios instance api with withCredentials:true
// Backend endpoints: POST /api/auth/login, POST /api/auth/register, GET /api/auth/me

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  lang = "he",
  brand = "X-UP MEN SALON",
}) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const t = (he, en) => (lang === "he" ? he : en);

  const [tab, setTab] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // login
  const [lUsername, setLUsername] = useState("");
  const [lPassword, setLPassword] = useState("");

  // register
  const [rUsername, setRUsername] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rPhone, setRPhone] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setLoading(false);
    setTab("login");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // lock background scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (tab === "login") return lUsername.trim() && lPassword.trim();
    return rUsername.trim() && rPassword.trim() && rPhone.trim();
  }, [loading, tab, lUsername, lPassword, rUsername, rPassword, rPhone]);

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr("");
    setLoading(true);

    try {
      if (tab === "login") {
        await api.post("/api/auth/login", {
          username: lUsername.trim(),
          password: lPassword,
        });
      } else {
        await api.post("/api/auth/register", {
          username: rUsername.trim(),
          password: rPassword,
          phone: rPhone.trim(),
          role: "user",
        });
        await api.post("/api/auth/login", {
          username: rUsername.trim(),
          password: rPassword,
        });
      }

      const me = await api.get("/api/auth/me");
      console.log("ME: ", me);
      onSuccess?.(me.data.user);
      onClose?.();
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  // Styles (inline for stability)
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483647, // max z-index
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    pointerEvents: "auto",
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
    background: "linear-gradient(to bottom, #111, #070707)",
    pointerEvents: "auto",
  };

  const topStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.30)",
  };

  const brandBox = {
    background: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: "10px 14px",
    textAlign: "center",
    minWidth: 190,
    lineHeight: 1.05,
  };

  const closeBtn = {
    width: 42,
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
  };

  const tabWrap = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: 14,
  };

  const tabBtn = (active) => ({
    padding: "10px 12px",
    borderRadius: 12,
    border: active ? "1px solid #fff" : "1px solid rgba(255,255,255,0.18)",
    background: active ? "#fff" : "rgba(255,255,255,0.06)",
    color: active ? "#111" : "#fff",
    cursor: "pointer",
    fontWeight: 800,
  });

  const formStyle = { padding: 14, display: "grid", gap: 12 };

  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.80)" };

  const inputStyle = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    outline: "none",
  };

  const errorStyle = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.10)",
    color: "#ffd0d0",
    fontSize: 13,
  };

  const submitStyle = (enabled) => ({
    marginTop: 2,
    padding: "12px 12px",
    borderRadius: 12,
    border: enabled ? "1px solid #fff" : "1px solid rgba(255,255,255,0.10)",
    background: enabled ? "#fff" : "rgba(255,255,255,0.20)",
    color: enabled ? "#111" : "rgba(255,255,255,0.60)",
    fontWeight: 900,
    cursor: enabled ? "pointer" : "not-allowed",
  });

  const footerText = {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.70)",
    paddingBottom: 6,
  };

  return createPortal(
    <div dir={dir}>
      <div
        style={overlayStyle}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          style={modalStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* top */}
          <div style={topStyle}>
            <div style={brandBox}>
              <div style={{ fontWeight: 900, letterSpacing: 0.5 }}>{brand}</div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  opacity: 0.75,
                  marginTop: 5,
                }}
              >
                ACADEMY
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={closeBtn}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* tabs */}
          <div style={tabWrap}>
            <button
              type="button"
              onClick={() => setTab("login")}
              style={tabBtn(tab === "login")}
            >
              {t("התחברות", "Login")}
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              style={tabBtn(tab === "register")}
            >
              {t("הרשמה", "Register")}
            </button>
          </div>

          {/* form */}
          <form onSubmit={submit} style={formStyle}>
            {tab === "login" ? (
              <>
                <Field
                  label={t("שם משתמש", "Username")}
                  value={lUsername}
                  onChange={setLUsername}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
                <Field
                  label={t("סיסמה", "Password")}
                  value={lPassword}
                  onChange={setLPassword}
                  type="password"
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </>
            ) : (
              <>
                <Field
                  label={t("שם משתמש", "Username")}
                  value={rUsername}
                  onChange={setRUsername}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
                <Field
                  label={t("טלפון", "Phone")}
                  value={rPhone}
                  onChange={setRPhone}
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
                <Field
                  label={t("סיסמה", "Password")}
                  value={rPassword}
                  onChange={setRPassword}
                  type="password"
                  inputStyle={inputStyle}
                  labelStyle={labelStyle}
                />
              </>
            )}

            {err ? <div style={errorStyle}>{err}</div> : null}

            <button
              type="submit"
              disabled={!canSubmit}
              style={submitStyle(!!canSubmit)}
            >
              {loading
                ? t("טוען...", "Loading...")
                : tab === "login"
                  ? t("התחבר", "Login")
                  : t("צור חשבון", "Create account")}
            </button>

            <div style={footerText}>
              {tab === "login"
                ? t(
                    "אין לך חשבון? לחץ הרשמה למעלה.",
                    "No account? Click Register above.",
                  )
                : t(
                    "כבר יש לך חשבון? לחץ התחברות למעלה.",
                    "Already have an account? Click Login above.",
                  )}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputStyle,
  labelStyle,
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={labelStyle}>{label}</span>
      <input
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </label>
  );
}
