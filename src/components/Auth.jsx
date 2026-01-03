import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as authApi from "../api/auth";
import "./Auth.css";

function Auth({ onLogin, currentTheme, onToggleTheme }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login"); // login, register, guest-login, super-admin-login
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mosqueName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    secretCode: "",
  });
  const [guestCode, setGuestCode] = useState("");
  const [adminCreds, setAdminCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Helper to update local registry for Super Admin Panel
  const updateLocalRegistry = (mosqueData) => {
    try {
      const existingMosques = JSON.parse(
        localStorage.getItem("registered_mosques") || "[]"
      );
      
      const index = existingMosques.findIndex((m) => m.id === mosqueData.id);
      
      if (index >= 0) {
        // Update existing
        existingMosques[index] = {
          ...existingMosques[index],
          ...mosqueData
        };
      } else {
        // Add new
        existingMosques.push({
          ...mosqueData,
          createdAt: mosqueData.createdAt || new Date().toISOString(),
        });
      }
      
      localStorage.setItem(
        "registered_mosques",
        JSON.stringify(existingMosques)
      );
    } catch (e) {
      console.error("Failed to update local registry:", e);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.secretCode) {
      setError("Secret Code is required");
      return;
    }

    // Determine if input is email or phone
    const isEmail = formData.email.includes("@");
    const email = isEmail ? formData.email : null;
    const phone = isEmail ? formData.phone : formData.email;

    setLoading(true);
    try {
      const response = await authApi.register({
        name: formData.mosqueName,
        email,
        phone,
        password: formData.password,
        address: formData.address,
        secretCode: formData.secretCode,
      });

      // Update local registry for Super Admin
      updateLocalRegistry(response.mosque);

      // Auto login after register
      onLogin({
        ...response.mosque,
        role: "admin",
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);
      
      // Update local registry for Super Admin
      updateLocalRegistry(response.mosque);

      onLogin({
        ...response.mosque,
        role: "admin",
      });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.guestLogin(guestCode);
      onLogin({
        ...response.mosque,
        role: "guest",
      });
    } catch (err) {
      setError(err.message || "Invalid Secret Code");
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminLogin = (e) => {
    e.preventDefault();

    // Hardcoded Super Admin Credentials (kept for backward compatibility)
    if (
      adminCreds.username === "mmadmin" &&
      adminCreds.password === "sahil@96618"
    ) {
      onLogin({
        id: "super_admin",
        name: "Super Admin",
        role: "super_admin",
      });
    } else {
      setError("Invalid Super Admin credentials");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Send OTP
      if (forgotStep === 1) {
        const response = await authApi.forgotPassword(formData.email);
        // For development, OTP is returned in response
        if (response.otp) {
          setGeneratedOtp(response.otp);
          alert(`Your OTP for Password Reset is: ${response.otp}`);
        }
        setForgotStep(2);
        return;
      }

      // Step 2: Verify OTP
      if (forgotStep === 2) {
        await authApi.verifyOtp(formData.email, otpInput);
        setForgotStep(3);
        return;
      }

      // Step 3: Reset Password
      if (forgotStep === 3) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        await authApi.resetPassword(
          formData.email,
          otpInput,
          formData.password
        );

        alert(
          "Password reset successful! Please login with your new password."
        );
        setMode("login");
        setForgotStep(1);
        setGeneratedOtp("");
        setOtpInput("");
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
          secretCode: "",
        });
      }
    } catch (err) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "forgot-password") {
    return (
      <div className="auth-container">
        <div className="auth-theme-toggle">
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
          >
            {currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="auth-card">
          <button
            className="back-btn"
            onClick={() => {
              setMode("login");
              setForgotStep(1);
              setGeneratedOtp("");
              setOtpInput("");
            }}
          >
            ← {t("Back to Login")}
          </button>
          <div className="auth-header">
            <span className="auth-logo">🔐</span>
            <h2 className="auth-title">{t("Reset Password")}</h2>
            <p className="auth-subtitle">
              {forgotStep === 1 &&
                t("Enter your email or phone to receive OTP")}
              {forgotStep === 2 && t("Enter the 4-digit OTP sent to you")}
              {forgotStep === 3 && t("Create a new password")}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleForgotPassword}>
            {error && <div className="error-message">{error}</div>}

            {forgotStep === 1 && (
              <div className="form-group">
                <label>{t("Email / Phone")}</label>
                <input
                  type="text"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter registered email or phone"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            )}

            {forgotStep === 2 && (
              <div className="form-group">
                <label>{t("OTP Code")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="one-time-code"
                  className="form-input"
                  value={otpInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setOtpInput(val);
                    setError("");
                  }}
                  placeholder="Enter 4-digit OTP"
                  required
                  autoFocus
                  disabled={loading}
                  style={{
                    letterSpacing: "0.5em",
                    textAlign: "center",
                    fontSize: "1.2rem",
                  }}
                />
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={async () => {
                      try {
                        const response = await authApi.forgotPassword(
                          formData.email
                        );
                        if (response.otp) {
                          setGeneratedOtp(response.otp);
                          alert(`Your New OTP is: ${response.otp}`);
                        }
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                    style={{
                      color: "var(--primary-color)",
                      fontSize: "0.9rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {t("Resend OTP")}
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 3 && (
              <>
                <div className="form-group">
                  <label>{t("New Password")}</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>{t("Confirm New Password")}</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? (
                "..."
              ) : (
                <>
                  {forgotStep === 1 && t("Send OTP")}
                  {forgotStep === 2 && t("Verify OTP")}
                  {forgotStep === 3 && t("Reset Password")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "super-admin-login") {
    return (
      <div className="auth-container">
        <div className="auth-theme-toggle">
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
          >
            {currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="auth-card">
          <button className="back-btn" onClick={() => setMode("login")}>
            ← {t("Back to Login")}
          </button>
          <div className="auth-header">
            <span className="auth-logo">🛡️</span>
            <h2 className="auth-title">Super Admin</h2>
            <p className="auth-subtitle">{t("Owner Access Only")}</p>
          </div>

          <form className="auth-form" onSubmit={handleSuperAdminLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>{t("Username")}</label>
              <input
                type="text"
                className="form-input"
                value={adminCreds.username}
                onChange={(e) => {
                  setAdminCreds({ ...adminCreds, username: e.target.value });
                  setError("");
                }}
                placeholder="Username"
                required
              />
            </div>

            <div className="form-group">
              <label>{t("Password")}</label>
              <input
                type="password"
                className="form-input"
                value={adminCreds.password}
                onChange={(e) => {
                  setAdminCreds({ ...adminCreds, password: e.target.value });
                  setError("");
                }}
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", background: "#1e293b" }}
            >
              {t("Login as Owner")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "guest-login") {
    return (
      <div className="auth-container">
        <div className="auth-theme-toggle">
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
          >
            {currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="auth-card">
          <button className="back-btn" onClick={() => setMode("login")}>
            ← {t("Back to Login")}
          </button>
          <div className="auth-header">
            <span className="auth-logo">👁️</span>
            <h2 className="auth-title">{t("Guest Access")}</h2>
            <p className="auth-subtitle">
              {t("Enter the secret code to view mosque data")}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleGuestLogin}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>{t("Secret Code")}</label>
              <input
                type="text"
                className="form-input"
                value={guestCode}
                onChange={(e) => {
                  setGuestCode(e.target.value);
                  setError("");
                }}
                placeholder="Enter secret code provided by mosque admin"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Accessing..." : t("Access Dashboard")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-theme-toggle">
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
        >
          {currentTheme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🕌</span>
          <h2 className="auth-title">Masjid Manager</h2>
          <p className="auth-subtitle">{t("Tracking System")}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            {t("Login")}
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            {t("Register Mosque")}
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={mode === "login" ? handleLogin : handleRegister}
        >
          {error && <div className="error-message">{error}</div>}

          {mode === "register" && (
            <>
              <div className="form-group">
                <label>{t("Mosque Name")}</label>
                <input
                  type="text"
                  name="mosqueName"
                  className="form-input"
                  value={formData.mosqueName}
                  onChange={handleChange}
                  placeholder="e.g. Jama Masjid"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>{t("Address")}</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Mosque Location"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>{t("Secret Code (for Guest Access)")}</label>
                <input
                  type="text"
                  name="secretCode"
                  className="form-input"
                  value={formData.secretCode}
                  onChange={handleChange}
                  placeholder="e.g. 7860 or secret123"
                  required
                  disabled={loading}
                />
                <small
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "var(--text-muted)",
                  }}
                >
                  {t("Share this code with members for read-only access.")}
                </small>
              </div>
            </>
          )}

          <div className="form-group">
            <label>{t("Email / Phone")}</label>
            <input
              type="text"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email or phone number"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{t("Password")}</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              disabled={loading}
            />
            {mode === "login" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "6px",
                }}
              >
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setMode("forgot-password");
                    setError("");
                  }}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--primary-color)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {t("Forgot Password?")}
                </button>
              </div>
            )}
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>{t("Confirm Password")}</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? t("Login")
              : t("Register Mosque")}
          </button>
        </form>

        <div className="auth-footer">
          <button
            className="guest-access-btn"
            onClick={() => setMode("guest-login")}
          >
            👁️ {t("View as Guest (Read Only)")}
          </button>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className="text-btn owner-btn"
              onClick={() => setMode("super-admin-login")}
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: 0.8,
                transition: "all 0.2s",
                padding: "8px 16px",
                borderRadius: "6px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.background = "none";
              }}
            >
              <span>🔒</span> {t("Owner Login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
