import { useState } from "react";
import { deletePassword, getPassword } from "../api/password";

export interface PasswordEntry {
  id: number;
  service_name: string;
  service_username: string;
  password?: string;
  notes?: string;
  site_url?: string;
}

interface PasswordListProps {
  passwords: PasswordEntry[];
  onSelectEntry: (entry: PasswordEntry) => void;
  refreshEntries: () => Promise<void>;
  notify: (msg: string) => void;
}

export default function PasswordList({
  passwords,
  onSelectEntry,
  refreshEntries,
  notify,
}: PasswordListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const triggerCopyFeedback = (key: string, label: string) => {
    setCopiedId(key);
    notify(`[OK] ${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyUsername = (e: React.MouseEvent, entry: PasswordEntry) => {
    e.stopPropagation();
    if (!entry.service_username) return;
    navigator.clipboard.writeText(entry.service_username);
    triggerCopyFeedback(`user-${entry.id}`, `USER(${entry.service_name})`);
  };

  const handleCopyPassword = async (e: React.MouseEvent, entry: PasswordEntry) => {
    e.stopPropagation();
    try {
      const res = await getPassword(entry.id);
      if (res?.password) {
        await navigator.clipboard.writeText(res.password);
        triggerCopyFeedback(`pwd-${entry.id}`, `SECRET(${entry.service_name})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Confirm Permanent Deletion For ${name}:`)) return;
    setDeletingId(id);
    try {
      await deletePassword(id);
      await refreshEntries();
      notify(`[DEL] Purged entry: ${name}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="tui-table-wrapper">
      <table className="tui-table">
        <thead>
          <tr>
            <th style={{ width: "75px" }}>ID</th>
            <th>SERVICE // HOST</th>
            <th>IDENTITY</th>
            <th style={{ textAlign: "right" }}>EXEC_ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {passwords.map((p, idx) => {
            const launchUrl = p.site_url
              ? p.site_url.startsWith("http")
                ? p.site_url
                : `https://${p.site_url}`
              : null;

            return (
              <tr key={p.id} className="tui-row" onClick={() => onSelectEntry(p)}>
                <td style={{ color: "var(--text-muted)" }}>
                  #{String(idx + 1).padStart(3, "0")}
                </td>

                <td>
                  <div className="service-cell">
                    <span className="row-pointer">&gt;</span>
                    {p.service_name}
                  </div>
                  {p.site_url && <div className="url-cell">{p.site_url}</div>}
                </td>

                <td style={{ color: "var(--text-secondary)" }}>
                  {p.service_username || <span style={{ color: "var(--text-muted)" }}>null</span>}
                </td>

                <td>
                  <div className="actions-cell">
                    {p.service_username && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={(e) => handleCopyUsername(e, p)}
                      >
                        {copiedId === `user-${p.id}` ? "[COPIED]" : "[CP_USER]"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={(e) => handleCopyPassword(e, p)}
                    >
                      {copiedId === `pwd-${p.id}` ? "[COPIED]" : "[CP_PASS]"}
                    </button>

                    {launchUrl && (
                      <a
                        href={launchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{ textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                        title="Open URL"
                      >
                        [OPEN ↗]
                      </a>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      disabled={deletingId === p.id}
                      onClick={(e) => handleDelete(e, p.id, p.service_name)}
                    >
                      [RM]
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}