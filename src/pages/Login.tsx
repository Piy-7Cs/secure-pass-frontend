import { useState, type FormEvent } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deriveAuthPassword, deriveVaultKey } from "../utils/crypto";

const ASCII_LOGO = ` ____  _____ ____ _   _ ____  _____ ____   _    ____ ____  
/ ___|| ____/ ___| | | |  _ \\| ____|  _ \\ / \\  / ___/ ___| 
\\___ \\|  _|| |   | | | | |_) |  _| | |_) / _ \\ \\___ \\___ \\ 
 ___) | |__| |___| |_| |  _ <| |___|  __/ ___ \\ ___) |__) |
|____/|_____\\____|\\___/|_| \\_\\_____|_| /_/   \\_\\____/____/ `;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Derive Auth Key (for server) and Vault Key (for RAM) simultaneously
      const [authPassword, vaultKey] = await Promise.all([
        deriveAuthPassword(password, username),
        deriveVaultKey(password, username),
      ]);

      const data = await login(username, authPassword);
      if (!data.success) {
        setError(`AUTH_ERR: ${data.error || "Invalid credentials"}`);
        return;
      }

      loginUser(data.data.access_token, vaultKey);
      navigate("/dashboard");
    } catch {
      setError("AUTH_ERR: Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="tui-window auth-card">
        <div className="tui-titlebar">
          <div className="tui-titlebar-left">
            <span>ssh vault@securepass.local</span>
          </div>
          <span className="tui-badge tui-badge-amber">SPLIT-KEY E2EE</span>
        </div>

        <div className="auth-body">
          <pre className="ascii-banner">{ASCII_LOGO}</pre>
          <div className="prompt-line">
            <span>root@vault:~$</span> ./authenticate --split-kdf<span className="cursor-blink" />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">LOGIN_USER</label>
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

            <div className="form-group">
              <div className="form-label">
                <span>MASTER_PASSPHRASE</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setShowPwd((p) => !p)}
                >
                  {showPwd ? "[MASK]" : "[SHOW]"}
                </button>
              </div>
              <div className="cli-input-box">
                <span className="cli-prefix">#</span>
                <input
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "[DERIVING_SPLIT_KEYS...]" : "[EXEC_LOGIN ->]"}
            </button>
          </form>

          <div className="auth-links">
            <div>
              No vault initialized?{" "}
              <button type="button" className="link-btn" onClick={() => navigate("/register")}>
                ./register.sh
              </button>
            </div>
            <div>
              Lost master passphrase?{" "}
              <button type="button" className="link-btn" onClick={() => navigate("/forgot-password")}>
                ./recover.sh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}