import { useParams, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { resetPassword } from "../api/auth";
import { deriveAuthPassword } from "../utils/crypto";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newAuthPassword = await deriveAuthPassword(newPassword, username);
      const res = await resetPassword(token!, newAuthPassword);
      if (res.success) {
        navigate("/login");
      } else {
        setError(`ERR: ${res.error || "Invalid or expired recovery token."}`);
      }
    } catch {
      setError("ERR: Passphrase override failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="tui-window auth-card">
        <div className="tui-titlebar">
          <span>passwd --override-master</span>
          <span className="tui-badge tui-badge-amber">SPLIT-KEY RESET</span>
        </div>

        <div className="auth-body">
          <div className="prompt-line">
            <span>root@vault:~$</span> passwd --rekey-auth<span className="cursor-blink" />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">--username (required for salt)</label>
              <div className="cli-input-box">
                <span className="cli-prefix">$</span>
                <input
                  className="form-input"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
             <div
                    className="alert"
                    style={{
                        background: "var(--amber-dim)",
                        borderColor: "var(--amber)",
                        color: "var(--amber)",
                    }}
                    >
                    <strong>[WARN] ZERO KNOWLEDGE VAULT:</strong> Resetting a forgotten master
                    passphrase will permanently make your existing encrypted entries unreadable.
                </div>
            <div className="form-group">
              <label className="form-label">--new-master-passphrase</label>
              <div className="cli-input-box">
                <span className="cli-prefix">#</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="************"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "[DERIVING_NEW_KEY...]" : "[COMMIT_NEW_PASSPHRASE]"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}