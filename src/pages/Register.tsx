import { useState, type FormEvent } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { deriveAuthPassword } from "../utils/crypto";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Derive Auth Key locally — master password never leaves the browser
      const authPassword = await deriveAuthPassword(password, username);
      const data = await register(username, authPassword, email);

      if (data.success) {
        navigate("/login");
      } else {
        setError(`INIT_ERR: ${data.error || "Username already exists."}`);
      }
    } catch {
      setError("INIT_ERR: Could not initialize user vault.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="tui-window auth-card">
        <div className="tui-titlebar">
          <span>./init_vault.sh --split-key</span>
          <span className="tui-badge">ZERO-KNOWLEDGE</span>
        </div>

        <div className="auth-body">
          <div className="prompt-line">
            <span>root@vault:~$</span> useradd --split-key-kdf<span className="cursor-blink" />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">--username</label>
              <div className="cli-input-box">
                <span className="cli-prefix">$</span>
                <input
                  className="form-input"
                  placeholder="handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">--recovery-email</label>
              <div className="cli-input-box">
                <span className="cli-prefix">@</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@host.tld"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">--master-passphrase</label>
              <div className="cli-input-box">
                <span className="cli-prefix">#</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  <strong>[WARN] ZERO KNOWLEDGE VAULT:</strong> Make sure to remember your master password as resetting it would make existing records inaccessible.
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "[DERIVING_SPLIT_KEYS...]" : "[CREATE_VAULT ->]"}
            </button>
          </form>

          <div className="auth-links">
            <div>
              Vault already exists?{" "}
              <button type="button" className="link-btn" onClick={() => navigate("/login")}>
                ssh login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}