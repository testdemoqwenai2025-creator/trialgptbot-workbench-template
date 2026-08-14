"use client";

import { useState } from "react";
import { SectionId, apiEndpoints, apiSdks, apiErrorCodes, apiChangelog, ApiEndpoint } from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * API Documentation page — a creative, modern developer surface that
 * reflects the ever-evolving API tooling landscape:
 *
 *   • Hero with API version + base URL + auth scheme
 *   • Sticky side-nav with all endpoints (color-coded by HTTP method)
 *   • Endpoint cards — collapsible, with request/response schemas,
 *     rate limits, tags, and copyable examples
 *   • SDK quickstarts (JS/TS, Python, cURL)
 *   • Error code reference table
 *   • WebSocket + SSE streaming docs
 */
interface ApiDocsSectionProps {
  onNavigate: (id: SectionId) => void;
}

const CATEGORIES: ApiEndpoint["category"][] = [
  "Auth",
  "Tasks",
  "Trials",
  "EDC",
  "Compliance",
  "Edge",
  "Analytics",
  "Webhooks",
];

export function ApiDocsSection({ onNavigate }: ApiDocsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<ApiEndpoint["category"] | "All">("All");
  const [openId, setOpenId] = useState<string | null>(apiEndpoints[0].id);

  const filtered =
    activeCategory === "All"
      ? apiEndpoints
      : apiEndpoints.filter((e) => e.category === activeCategory);

  return (
    <div className="ap-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Settings", target: "settings" }}
      />

      {/* Hero */}
      <section className="ap-hero">
        <div className="ap-hero-content">
          <h1>📖 API Documentation</h1>
          <p>
            REST, WebSocket, and SSE APIs for integrating TrialGPTBot into
            your clinical trial operations. Every endpoint is versioned,
            scoped, audit-logged, and compliant with FDA 21 CFR Part 11 /
            EMA Annex 11. Streaming endpoints use Server-Sent Events for
            one-way pushes and WebSocket for bi-directional traffic.
          </p>
          <div className="ap-hero-meta">
            <span className="ap-hero-meta-item">
              <code>v1.4.0</code> stable
            </span>
            <span className="ap-hero-meta-item">
              <code>https://api.trialgptbot.ai</code>
            </span>
            <span className="ap-hero-meta-item">Auth: Bearer JWT</span>
            <span className="ap-hero-meta-item">Format: JSON</span>
            <span className="ap-hero-meta-item">Streaming: SSE + WS</span>
          </div>
          <div className="ap-hero-actions">
            <button
              type="button"
              className="ap-hero-btn"
              onClick={() => downloadOpenApiSpec()}
            >
              ⬇️ Download OpenAPI 3.1 spec
            </button>
            <a className="ap-hero-btn ap-hero-btn-ghost" href="#playground">
              🧪 Try it in the playground
            </a>
          </div>
        </div>
      </section>

      {/* Layout: side nav + endpoint list */}
      <div className="ap-layout">
        {/* Side nav */}
        <aside className="ap-nav">
          <div className="ap-nav-title">Categories</div>
          <a
            className="ap-nav-link"
            onClick={() => {
              setActiveCategory("All");
              setOpenId(null);
            }}
            style={{
              fontWeight: activeCategory === "All" ? 700 : 500,
              color: activeCategory === "All" ? "#2563eb" : undefined,
            }}
          >
            All ({apiEndpoints.length})
          </a>
          {CATEGORIES.map((cat) => {
            const count = apiEndpoints.filter((e) => e.category === cat).length;
            return (
              <a
                key={cat}
                className="ap-nav-link"
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenId(null);
                }}
                style={{
                  fontWeight: activeCategory === cat ? 700 : 500,
                  color: activeCategory === cat ? "#2563eb" : undefined,
                }}
              >
                <span style={{ flex: 1 }}>{cat}</span>
                <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>{count}</span>
              </a>
            );
          })}

          <div className="ap-nav-title" style={{ marginTop: "0.75rem" }}>
            Quick links
          </div>
          <a
            className="ap-nav-link"
            href="#sdks"
          >
            SDKs
          </a>
          <a
            className="ap-nav-link"
            href="#errors"
          >
            Error codes
          </a>
          <a
            className="ap-nav-link"
            href="#auth"
          >
            Authentication
          </a>
          <a
            className="ap-nav-link"
            href="#streaming"
          >
            Streaming
          </a>
          <a
            className="ap-nav-link"
            href="#playground"
          >
            Playground
          </a>
          <a
            className="ap-nav-link"
            href="#changelog"
          >
            Changelog
          </a>
        </aside>

        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Auth section */}
          <section className="ap-section" id="auth">
            <h2>🔐 Authentication</h2>
            <p>
              All REST endpoints require a Bearer JWT obtained from{" "}
              <code className="aa-code">POST /api/v1/auth/token</code>. Tokens
              are scoped (read:tasks, write:decisions, admin:*) and expire
              after 1 hour; refresh tokens are valid for 30 days. WebSocket
              and SSE connections accept the same JWT as a{" "}
              <code className="aa-code">?token=</code> query parameter.
            </p>
            <div className="ap-code-label">Example — exchange credentials for a token</div>
            <pre className="ap-code-block">{`curl -X POST https://api.trialgptbot.ai/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "dr_chen",
    "password": "***",
    "scopes": ["read:tasks", "write:decisions"]
  }'

# Response:
# {
#   "access_token": "eyJhbGciOi...",
#   "refresh_token": "rft_...",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }`}</pre>
          </section>

          {/* Endpoints */}
          <section className="ap-section">
            <h2>📡 REST endpoints {activeCategory !== "All" && `· ${activeCategory}`}</h2>
            <p>
              {filtered.length} endpoint{filtered.length === 1 ? "" : "s"}. Click an
              endpoint to expand its request/response schemas, rate limits,
              and tags.
            </p>

            {filtered.map((ep) => (
              <EndpointCard
                key={ep.id}
                endpoint={ep}
                open={openId === ep.id}
                onToggle={() =>
                  setOpenId((cur) => (cur === ep.id ? null : ep.id))
                }
              />
            ))}
          </section>

          {/* Streaming section */}
          <section className="ap-section" id="streaming">
            <h2>🌊 Streaming — WebSocket &amp; SSE</h2>
            <p>
              Real-time event delivery uses two transport modes.{" "}
              <strong>WebSocket</strong> for bi-directional traffic (live
              review queues, edge commands) and{" "}
              <strong>Server-Sent Events</strong> for one-way server-to-client
              pushes (sync logs, telemetry, audit events). Both are
              authenticated with the same JWT.
            </p>
            <div className="ap-code-label">
              SSE — live edge sync log stream (JavaScript)
            </div>
            <pre className="ap-code-block">{`const es = new EventSource(
  "/api/edge/sync-stream?token=" + encodeURIComponent(JWT)
);

es.addEventListener("ready", (e) => {
  console.log("stream connected", JSON.parse(e.data));
});

es.addEventListener("sync", (e) => {
  const event = JSON.parse(e.data);
  // { ts, siteId, event: "queue"|"sync_started"|"sync_completed"|"conflict"|"merged", records, detail }
  console.log(\`[\${event.siteId}] \${event.event} — \${event.records} records\`);
});

es.onerror = () => {
  // the browser auto-reconnects; use a manual backoff if you need finer control
};`}</pre>
            <div className="ap-code-label" style={{ marginTop: "0.75rem" }}>
              WebSocket — live review queue (JavaScript)
            </div>
            <pre className="ap-code-block">{`const ws = new WebSocket(
  "wss://api.trialgptbot.ai/v1/review/stream?token=" + encodeURIComponent(JWT)
);

ws.onmessage = (msg) => {
  const event = JSON.parse(msg.data);
  if (event.type === "task.created") {
    appendToReviewQueue(event.task);
  } else if (event.type === "task.decided") {
    updateTaskStatus(event.taskId, event.decision);
  }
};

// Send a decision back over the socket
ws.send(JSON.stringify({
  type: "decision",
  taskId: "TASK-1042",
  decision: "approved",
  signature: { /* e-signature payload */ }
}));`}</pre>
          </section>

          {/* SDKs */}
          <section className="ap-section" id="sdks">
            <h2>📦 SDK quickstarts</h2>
            <p>
              Official SDKs wrap the REST API with typed clients and handle
              token refresh, retries, and pagination automatically.
            </p>
            {apiSdks.map((sdk) => (
              <div key={sdk.id} className="ap-sdk-card">
                <div className="ap-sdk-header">
                  <span className="ap-sdk-name">{sdk.name}</span>
                  <code className="ap-sdk-install">{sdk.install}</code>
                </div>
                <div className="ap-code-label">Example</div>
                <pre className="ap-code-block">{sdk.example}</pre>
                {sdk.repo !== "—" && (
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.4rem" }}>
                    Source:{" "}
                    <a
                      href={`https://${sdk.repo}`}
                      style={{ color: "#2563eb" }}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {sdk.repo}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Errors */}
          <section className="ap-section" id="errors">
            <h2>⚠️ Error codes</h2>
            <p>
              All errors return a JSON body with{" "}
              <code className="aa-code">code</code>,{" "}
              <code className="aa-code">message</code>, and{" "}
              <code className="aa-code">request_id</code> fields. Use the
              request ID when contacting support — it correlates to the
              tamper-evident audit log.
            </p>
            <table className="ap-error-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {apiErrorCodes.map((err) => (
                  <tr key={err.code}>
                    <td className="code">{err.code}</td>
                    <td className="name">{err.name}</td>
                    <td>{err.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* === NEW: Interactive Playground === */}
          <section className="ap-section" id="playground">
            <h2>🧪 Interactive Playground</h2>
            <p>
              Pick any endpoint, set parameters, and send a real (sandboxed)
              request. Responses are simulated locally — no actual backend
              calls are made in this demo. In production this would proxy
              through <code className="aa-code">api.trialgptbot.ai</code>{" "}
              with your bearer token.
            </p>
            <Playground />
          </section>

          {/* === NEW: Changelog === */}
          <section className="ap-section" id="changelog">
            <h2>📝 Changelog</h2>
            <p>
              Recent API versions with their changes. Deprecations are
              supported for at least 6 months before removal.
            </p>
            <div className="ap-changelog">
              {apiChangelog.map((entry) => (
                <div key={entry.version} className="ap-changelog-entry">
                  <div className="ap-changelog-header">
                    <span className="ap-changelog-version">{entry.version}</span>
                    <span className="ap-changelog-date">{entry.date}</span>
                  </div>
                  <ul className="ap-changelog-list">
                    {entry.changes.map((change, i) => (
                      <li
                        key={i}
                        className={`ap-changelog-item type-${change.type}`}
                      >
                        <span className={`ap-changelog-tag type-${change.type}`}>
                          {change.type}
                        </span>
                        <span>{change.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EndpointCard({
  endpoint,
  open,
  onToggle,
}: {
  endpoint: ApiEndpoint;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="ap-endpoint">
      <div
        className="ap-endpoint-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
      >
        <span className={`ap-method-badge ${endpoint.method}`}>
          {endpoint.method}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ap-endpoint-path">{endpoint.path}</div>
          <div className="ap-endpoint-title">{endpoint.title}</div>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && (
        <div className="ap-endpoint-body">
          <div className="ap-endpoint-desc">{endpoint.description}</div>

          {endpoint.tags && endpoint.tags.length > 0 && (
            <div className="ap-tag-row">
              {endpoint.tags.map((t) => (
                <span key={t} className="ap-tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          {endpoint.rateLimit && (
            <div
              style={{
                fontSize: "0.7rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Rate limit:</strong> {endpoint.rateLimit}
            </div>
          )}

          {endpoint.requestSchema && (
            <>
              <div className="ap-code-label">Request body</div>
              <pre className="ap-code-block">{endpoint.requestSchema}</pre>
            </>
          )}

          {endpoint.responseSchema && (
            <>
              <div className="ap-code-label" style={{ marginTop: "0.6rem" }}>
                Response (200 OK)
              </div>
              <pre className="ap-code-block">{endpoint.responseSchema}</pre>
            </>
          )}

          {endpoint.method === "GET" && endpoint.requestSchema === undefined && (
            <>
              <div className="ap-code-label">Example request</div>
              <pre className="ap-code-block">{`curl ${endpoint.path.startsWith("/api") ? `https://api.trialgptbot.ai${endpoint.path}` : endpoint.path} \\
  -H "Authorization: Bearer $TOKEN"`}</pre>
            </>
          )}

          <div style={{ marginTop: "0.6rem" }}>
            <a
              href="#playground"
              className="ap-try-link"
              title="Try this endpoint in the playground"
            >
              🧪 Try in playground →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* === NEW: Interactive Playground === */
function Playground() {
  const getEndpoints = apiEndpoints.filter((e) => e.method === "GET");
  const [selectedId, setSelectedId] = useState(getEndpoints[0]?.id ?? "");
  const [path, setPath] = useState(getEndpoints[0]?.path ?? "");
  const [token, setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const ep = apiEndpoints.find((e) => e.id === id);
    if (ep) setPath(ep.path);
  };

  const handleSend = () => {
    setLoading(true);
    setResponse("");
    setLatencyMs(null);
    const start = Date.now();
    setTimeout(() => {
      const ep = apiEndpoints.find((e) => e.id === selectedId);
      const elapsed = Date.now() - start;
      setLatencyMs(elapsed);
      setResponse(
        ep?.responseSchema ??
          `{
  "message": "Sandbox response for ${ep?.method ?? "GET"} ${path}",
  "requestId": "req_${Date.now()}",
  "timestamp": "${new Date().toISOString()}"
}`,
      );
      setLoading(false);
    }, 600 + Math.random() * 800);
  };

  const handleCopyCurl = () => {
    const ep = apiEndpoints.find((e) => e.id === selectedId);
    const fullUrl = path.startsWith("/api")
      ? `https://api.trialgptbot.ai${path}`
      : path;
    const cmd = `curl -X ${ep?.method ?? "GET"} "${fullUrl}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd).catch(() => {});
    }
  };

  return (
    <div className="ap-playground">
      <div className="ap-playground-controls">
        <div className="ap-playground-row">
          <label className="ap-playground-label">Endpoint</label>
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            className="ap-playground-select"
          >
            {getEndpoints.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.method} {ep.path} — {ep.title}
              </option>
            ))}
          </select>
        </div>
        <div className="ap-playground-row">
          <label className="ap-playground-label">Path (editable)</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="ap-playground-input"
          />
        </div>
        <div className="ap-playground-row">
          <label className="ap-playground-label">Bearer token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="ap-playground-input"
          />
        </div>
        <div className="ap-playground-actions">
          <button
            type="button"
            className="ap-playground-btn ap-playground-btn-primary"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending…" : "▶ Send request"}
          </button>
          <button
            type="button"
            className="ap-playground-btn"
            onClick={handleCopyCurl}
          >
            ⧉ Copy as cURL
          </button>
        </div>
      </div>
      <div className="ap-playground-response">
        <div className="ap-playground-response-header">
          <span>Response</span>
          {latencyMs !== null && (
            <span className="ap-playground-latency">{latencyMs} ms</span>
          )}
        </div>
        <pre className="ap-code-block ap-playground-response-body">
          {loading ? "⏳ Sending request…" : response || "← Send a request to see the response"}
        </pre>
      </div>
    </div>
  );
}

/* === OpenAPI spec generator === */
function downloadOpenApiSpec() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "TrialGPTBot Enterprise API",
      version: "1.4.0",
      description:
        "REST, WebSocket, and SSE APIs for integrating TrialGPTBot into clinical trial operations. FDA 21 CFR Part 11 / EMA Annex 11 compliant.",
      contact: { email: "api@trialgptbot.ai" },
      license: { name: "Proprietary" },
    },
    servers: [
      { url: "https://api.trialgptbot.ai", description: "Production" },
      { url: "https://api.sandbox.trialgptbot.ai", description: "Sandbox" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: Object.fromEntries(
      apiEndpoints
        .filter((e) => e.method !== "WS" && e.method !== "SSE")
        .map((e) => [
          e.path.replace(/\{[^}]+\}/g, "/{id}"),
          {
            [e.method.toLowerCase()]: {
              summary: e.title,
              description: e.description,
              tags: [e.category],
              security: [{ bearerAuth: [] }],
              responses: {
                "200": {
                  description: "Successful response",
                  content: { "application/json": {} },
                },
              },
            },
          },
        ]),
    ),
  };
  const blob = new Blob([JSON.stringify(spec, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trialgptbot-openapi-v1.4.0.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default ApiDocsSection;
