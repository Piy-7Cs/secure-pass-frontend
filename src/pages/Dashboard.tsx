import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PasswordForm from "../components/PasswordForm";
import PasswordList, { type PasswordEntry } from "../components/PasswordList";
import { getPassword } from "../api/password";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

interface Props {
  entries: PasswordEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export default function Dashboard({ entries, loading, refresh }: Props) {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  };

  // Keyboard shortcuts: '/' focuses grep, 'n' opens new entry, 'Escape' closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "Escape") {
        setIsAddOpen(false);
        setSelectedEntry(null);
        setEditingEntry(null);
        return;
      }

      if (!isTyping && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (!isTyping && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.service_name?.toLowerCase().includes(q) ||
        e.service_username?.toLowerCase().includes(q) ||
        e.site_url?.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Error logging out", err);
    }
    logoutUser();
    navigate("/login");
  };

  const handleSelectEntry = async (entry: PasswordEntry) => {
    setShowDetailPassword(false);
    setSelectedEntry(entry);
    setLoadingSecret(true);
    try {
      const res = await getPassword(entry.id);
      if (res?.password) {
        setSelectedEntry((prev) => (prev ? { ...prev, password: res.password } : null));
      }
    } catch (err) {
      console.error("Error fetching decrypted password:", err);
    } finally {
      setLoadingSecret(false);
    }
  };

  const copyText = (text?: string, label = "VALUE") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    notify(`[OK] ${label} copied to clipboard`);
  };

  return (
    <div>
      {/* Top Terminal Status Bar */}
      <header className="navbar">
        <div className="navbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--accent-bright)", fontWeight: 700 }}>
              [SECUREPASS 2.0]
            </span>
            <span className="tui-badge">E2EE: AES-256-GCM</span>
            <span className="tui-badge tui-badge-amber">RECORDS: {entries.length}</span>
          </div>

          <button className="btn btn-sm btn-danger" onClick={handleLogout}>
            [LOCK &amp; EXIT]
          </button>
        </div>
      </header>

      <main className="container">
        {/* Command Prompt Bar */}
        <div className="command-bar">
          <div className="grep-box">
            <span className="grep-prompt">vault@local:~$ grep -i</span>
            <input
              ref={searchInputRef}
              className="form-input"
              placeholder='"service, user, or host"... (press /)'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setSearchQuery("")}
              >
                [CLR]
              </button>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            [+ NEW_ENTRY]
          </button>
        </div>

        {/* Main Vault Output */}
        {loading ? (
          <div className="empty-state">
            <p style={{ color: "var(--accent-bright)" }}>
              &gt; Decrypting vault blocks...<span className="cursor-blink" />
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <p style={{ color: "var(--amber)", marginBottom: "0.5rem" }}>
              {searchQuery
                ? `grep: 0 matches found for "${searchQuery}"`
                : "ls: /vault is currently empty (0 records)"}
            </p>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", fontSize: "0.82rem" }}>
              {searchQuery
                ? "Clear query or check spelling."
                : "Initialize your first encrypted credential record."}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                [+ INIT_FIRST_RECORD]
              </button>
            )}
          </div>
        ) : (
          <PasswordList
            passwords={filteredEntries}
            onSelectEntry={handleSelectEntry}
            refreshEntries={refresh}
            notify={notify}
          />
        )}

        {/* Bottom TUI Keybinding Bar */}
        <div className="status-footer">
          <div>
            HOTKEYS: <span className="kbd">/</span> grep_search &nbsp;
            <span className="kbd">N</span> new_entry &nbsp;
            <span className="kbd">ESC</span> close_modal
          </div>
          <div>
            SHOWING {filteredEntries.length}/{entries.length} ENTRIES
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isAddOpen && (
        <PasswordForm
          onSuccess={() => {
            refresh();
            notify("[OK] New credential committed to vault");
          }}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <PasswordForm
          entryId={editingEntry.id}
          initialData={{
            service_name: editingEntry.service_name,
            service_username: editingEntry.service_username || "",
            password: editingEntry.password || "",
            notes: editingEntry.notes || "",
            site_url: editingEntry.site_url || "",
          }}
          onSuccess={() => {
            refresh();
            notify("[OK] Record updated");
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {/* Inspector Modal (cat /vault/entry) */}
      {selectedEntry && (
        <div className="modal-backdrop" onClick={() => setSelectedEntry(null)}>
          <div className="tui-window modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="tui-titlebar">
              <span>cat /vault/{selectedEntry.service_name.toLowerCase().replace(/\s+/g, "_")}.sec</span>
              <button className="btn btn-sm" onClick={() => setSelectedEntry(null)}>
                [ESC]
              </button>
            </div>

            <div className="modal-body">
              <div className="kv-block">
                <div>
                  <div className="kv-key">SERVICE_NAME</div>
                  <div className="kv-val" style={{ fontWeight: 700, color: "var(--accent-bright)" }}>
                    {selectedEntry.service_name}
                  </div>
                </div>
                {selectedEntry.site_url && (
                  <a
                    href={
                      selectedEntry.site_url.startsWith("http")
                        ? selectedEntry.site_url
                        : `https://${selectedEntry.site_url}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ textDecoration: "none" }}
                  >
                    [LAUNCH ↗]
                  </a>
                )}
              </div>

              <div className="kv-block">
                <div>
                  <div className="kv-key">IDENTITY // USERNAME</div>
                  <div className="kv-val">{selectedEntry.service_username || "null"}</div>
                </div>
                {selectedEntry.service_username && (
                  <button
                    className="btn btn-sm"
                    onClick={() => copyText(selectedEntry.service_username, "USERNAME")}
                  >
                    [COPY]
                  </button>
                )}
              </div>

              <div className="kv-block">
                <div>
                  <div className="kv-key">DECRYPTED_SECRET</div>
                  <div className="kv-val" style={{ color: "var(--amber)" }}>
                    {loadingSecret
                      ? "decrypting_aes_block..."
                      : showDetailPassword
                      ? selectedEntry.password
                      : "****************"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => setShowDetailPassword((prev) => !prev)}
                  >
                    {showDetailPassword ? "[MASK]" : "[REVEAL]"}
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyText(selectedEntry.password, "SECRET")}
                  >
                    [COPY]
                  </button>
                </div>
              </div>

              {selectedEntry.notes && (
                <div className="kv-block">
                  <div>
                    <div className="kv-key">METADATA // NOTES</div>
                    <div className="kv-val" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedEntry.notes}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.25rem" }}>
                <button className="btn" onClick={() => setSelectedEntry(null)}>
                  [CLOSE]
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const target = selectedEntry;
                    setSelectedEntry(null);
                    setEditingEntry(target);
                  }}
                >
                  [EDIT_RECORD]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLI Toast */}
      {toast && (
        <div className="toast">
          {toast}
          <span className="cursor-blink" />
        </div>
      )}
    </div>
  );
}