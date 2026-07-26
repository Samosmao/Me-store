"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setApps(data.apps);
      })
      .catch((e) => setError(e.message));
  }, []);

  const filtered =
    apps?.filter((a) =>
      `${a.name} ${a.description}`.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "64px 24px 96px" }}>
      <header style={{ marginBottom: 48 }}>
        <div
          className="mono"
          style={{
            color: "var(--signal)",
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Download Center
        </div>
        <h1
          className="mono"
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Get the tools, straight from source.
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: 16, marginTop: 14, maxWidth: 520 }}>
          Every build here is hosted on GitHub Releases. Pick what you need
          and download it directly — no account, no waiting.
        </p>
      </header>

      {apps && apps.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps..."
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 28,
            background: "var(--bg-raised)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--ink)",
            fontSize: 14,
            outline: "none",
          }}
        />
      )}

      {error && (
        <div
          className="mono"
          style={{
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          Couldn't load the list: {error}
        </div>
      )}

      {!apps && !error && (
        <div style={{ color: "var(--ink-dim)" }}>Loading apps...</div>
      )}

      {apps && apps.length === 0 && (
        <div
          style={{
            border: "1px dashed var(--line)",
            borderRadius: 10,
            padding: 40,
            textAlign: "center",
            color: "var(--ink-dim)",
          }}
        >
          Nothing published yet. Add your first app from{" "}
          <a href="/admin" style={{ color: "var(--signal)" }}>
            /admin
          </a>
          .
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>

      {apps && apps.length > 0 && filtered.length === 0 && (
        <div style={{ color: "var(--ink-dim)", marginTop: 24 }}>
          No apps match "{query}".
        </div>
      )}

      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--line)",
          color: "var(--ink-dim)",
          fontSize: 13,
        }}
      >
        <a href="/admin" style={{ color: "var(--ink-dim)" }}>
          Manage listings →
        </a>
      </footer>
    </main>
  );
}

function AppRow({ app }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "var(--bg-raised)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1, width: 40, textAlign: "center" }}>
        {app.icon || "📦"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{app.name}</span>
          {app.version && (
            <span
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--signal-dim)",
                border: "1px solid var(--signal-dim)",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              v{app.version}
            </span>
          )}
          {app.size && (
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-dim)" }}>
              {app.size}
            </span>
          )}
        </div>
        {app.description && (
          <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: "6px 0 0" }}>
            {app.description}
          </p>
        )}
      </div>

      <a
        href={app.url}
        download
        style={{
          flexShrink: 0,
          background: "var(--signal)",
          color: "#0c0e11",
          fontWeight: 700,
          fontSize: 13,
          padding: "10px 18px",
          borderRadius: 8,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Download
      </a>
    </div>
  );
}
