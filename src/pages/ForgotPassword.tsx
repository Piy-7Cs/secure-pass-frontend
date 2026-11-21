import { forgotPassword } from "../api/auth";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(resetEmail);
      if (result.success) {
        setMessage("[OK] Recovery token dispatched to registered email.");
      } else {
        setError(`ERR: ${result.error || "Unable to dispatch recovery link."}`);
      }
    } catch {
      setError("ERR: Mail daemon unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="tui-window auth-card">
        <div className="tui-titlebar">
          <span>./recover.sh --send-token</span>
          <span className="tui-badge tui-badge-amber">RECOVERY</span>
        </div>

        <div className="auth-body">
          <div className="prompt-line">
            <span>root@vault:~$</span> request-reset-token<span className="cursor-blink" />
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">--registered-email</label>
              <div className="cli-input-box">
                <span className="cli-prefix">@</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@host.tld"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div
                    className="alert"
                    style={{
                        background: "var(--amber-dim)",
                        borderColor: "var(--amber)",
                        color: "var(--amber)",
                    }}
                    >
                    <strong>[WARN] ZERO-KNOWLEDGE VAULT:</strong> Resetting a forgotten master
                    passphrase will permanently make your existing encrypted entries unreadable.
                </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "[DISPATCHING...]" : "[SEND_RECOVERY_TOKEN]"}
            </button>
          </form>

          <div className="auth-links">
            <button type="button" className="link-btn" onClick={() => navigate("/login")}>
              &lt;- cd /login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}