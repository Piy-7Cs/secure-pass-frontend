import { useState, type FormEvent } from "react";
import { createEntry, updateEntry } from "../api/password";

interface PasswordFormProps {
  entryId?: number;
  initialData?: {
    service_name: string;
    service_username: string;
    password: string;
    notes: string;
    site_url: string;
  };
  onSuccess: () => void;
  onClose: () => void;
}

function generateStrongPassword(length = 18): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const nums = "23456789";
  const syms = "!@#$%^&*_-+=";
  const all = upper + lower + nums + syms;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  const pwd = [
    upper[array[0] % upper.length],
    lower[array[1] % lower.length],
    nums[array[2] % nums.length],
    syms[array[3] % syms.length],
  ];

  for (let i = 4; i < length; i++) {
    pwd.push(all[array[i] % all.length]);
  }

  return pwd.sort(() => Math.random() - 0.5).join("");
}

function getAsciiStrength(pwd: string) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { bar: "[███░░░░░░░░░] 25% // WEAK", color: "var(--danger)" };
  if (score === 2) return { bar: "[██████░░░░░░] 50% // FAIR", color: "var(--amber)" };
  if (score === 3) return { bar: "[█████████░░░] 75% // GOOD", color: "var(--text-secondary)" };
  return { bar: "[████████████] 100% // STRONG", color: "var(--accent-bright)" };
}

export default function PasswordForm({
  entryId,
  initialData,
  onSuccess,
  onClose,
}: PasswordFormProps) {
  const [serviceName, setServiceName] = useState(initialData?.service_name || "");
  const [serviceUsername, setServiceUsername] = useState(initialData?.service_username || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [siteUrl, setSiteUrl] = useState(initialData?.site_url || "");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const strength = getAsciiStrength(password);

  const handleGenerate = () => {
    setPassword(generateStrongPassword(18));
    setShowPassword(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !password.trim()) {
      setError("ERR: --service and --password flags are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = entryId
        ? await updateEntry(entryId, serviceName, serviceUsername, password, notes, siteUrl)
        : await createEntry(serviceName, serviceUsername, password, notes, siteUrl);

      if (!res) {
        setError("ERR: Write operation failed.");
        setSaving(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("ERR: Unexpected I/O exception while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tui-window modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="tui-titlebar">
          <span>
            {entryId ? `vi /vault/entry_${entryId}.enc` : "touch /vault/new_entry.enc"}
          </span>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            [ESC]
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">--service-name *</label>
              <div className="cli-input-box">
                <span className="cli-prefix">&gt;</span>
                <input
                  className="form-input"
                  placeholder="github, aws-root, protonmail..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">--username</label>
              <div className="cli-input-box">
                <span className="cli-prefix">&gt;</span>
                <input
                  className="form-input"
                  placeholder="admin@domain.com"
                  value={serviceUsername}
                  onChange={(e) => setServiceUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>--secret-key *</span>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleGenerate}>
                    [KEYGEN]
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "[MASK]" : "[SHOW]"}
                  </button>
                </div>
              </div>
              <div className="cli-input-box">
                <span className="cli-prefix">#</span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter secret or run [KEYGEN]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {strength && (
                <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: strength.color }}>
                  ENTROPY: {strength.bar}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">--host-url</label>
              <div className="cli-input-box">
                <span className="cli-prefix">&gt;</span>
                <input
                  className="form-input"
                  placeholder="https://github.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">--notes</label>
              <div className="cli-input-box" style={{ alignItems: "flex-start" }}>
                <span className="cli-prefix" style={{ paddingTop: "0.65rem" }}>
                  //
                </span>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="2FA backup codes, SSH passphrase..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "1.35rem" }}>
              <button type="button" className="btn" onClick={onClose}>
                [ABORT]
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "[WRITING...]" : entryId ? "[:wq UPDATE]" : "[:wq COMMIT]"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}