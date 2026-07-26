"use client";

import { useEffect, useState } from "react";

const emptyForm = { name: "", version: "", description: "", icon: "📦", url: "", size: "" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = checking, false = need login, true = in
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [apps, setApps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Try loading apps; if the API 401s on a write later we know we're logged out.
  // We treat "authed" optimistically once login succeeds; persisted via httpOnly cookie.
  useEffect(() => {
    setAuthed(false); // always show login first; cookie (if valid) will be checked by first write attempt
    loadApps();
  }, []);

  async function loadApps() {
    const res = await fetch("/api/apps");
    const data = await res.json();
    if (data.apps) setApps(data.apps);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword("");
    } else {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error || "Login failed");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
  }

  function startEdit(app) {
    setEditingId(app.id);
    setForm({ ...emptyForm, ...app });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.url) {
      setMessage("Name and download URL are required.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/apps", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setAuthed(false);
        setMessage("Session expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
        return;
      }
      setApps(data.apps);
      cancelEdit();
      setMessage(editingId ? "App updated." : "App added.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this app? This can't be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (data.apps) setApps(data.apps);
    } finally {
      setBusy(false);
    }
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: 320,
            background: "var(--bg-raised)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          <div
            className="mono"
            style={{ color: "var(--signal)", fontSize: 12, letterSpacing: "0.1em", marginBottom: 8 }}
          >
            ADMIN
          </div>
          <h1 style={{ fontSize: 20, margin: "0 0 20px" }}>Sign in to manage listings</h1>
          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {loginError && (
            <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{loginError}</div>
          )}
          <button type="submit" style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>
            Sign in
          </button>
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: "var(--ink-dim)", fontSize: 13 }}>
              ← Back to downloads
            </a>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div className="mono" style={{ color: "var(--signal)", fontSize: 12, letterSpacing: "0.1em" }}>
            ADMIN
          </div>
          <h1 style={{ fontSize: 26, margin: "6px 0 0" }}>Manage listings</h1>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/" style={{ color: "var(--ink-dim)", fontSize: 13 }}>
            View site
          </a>
          <button onClick={handleLogout} style={ghostBtn}>
            Sign out
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 16, margin: "0 0 16px" }}>
          {editingId ? "Edit app" : "Add a new app"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Version (e.g. 1.2.0)"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Icon (emoji, optional)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="File size (e.g. 24 MB)"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            style={inputStyle}
          />
        </div>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          style={{ ...inputStyle, width: "100%", marginTop: 12, resize: "vertical" }}
        />
        <input
          placeholder="Direct download URL (GitHub Release asset link) *"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          style={{ ...inputStyle, width: "100%", marginTop: 12 }}
        />

        {message && <div style={{ color: "var(--signal-dim)", fontSize: 13, marginTop: 12 }}>{message}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="submit" disabled={busy} style={primaryBtn}>
            {busy ? "Saving..." : editingId ? "Save changes" : "Add app"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={ghostBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {apps.map((app) => (
          <div
            key={app.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "var(--bg-raised)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "14px 18px",
            }}
          >
            <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{app.icon || "📦"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>
                {app.name} {app.version && <span className="mono" style={{ color: "var(--ink-dim)", fontSize: 12 }}>v{app.version}</span>}
              </div>
              <div style={{ color: "var(--ink-dim)", fontSize: 13 }}>{app.description}</div>
            </div>
            <button onClick={() => startEdit(app)} style={ghostBtn}>
              Edit
            </button>
            <button onClick={() => handleDelete(app.id)} style={{ ...ghostBtn, color: "var(--danger)", borderColor: "var(--danger)" }}>
              Delete
            </button>
          </div>
        ))}
        {apps.length === 0 && (
          <div style={{ color: "var(--ink-dim)", textAlign: "center", padding: 32 }}>
            No apps yet — add your first one above.
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  background: "#12151a",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "var(--ink)",
  fontSize: 14,
  outline: "none",
};

const primaryBtn = {
  background: "var(--signal)",
  color: "#0c0e11",
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
};

const ghostBtn = {
  background: "transparent",
  color: "var(--ink-dim)",
  fontSize: 13,
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid var(--line)",
};
