import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-panel" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="eyebrow">KnowTree companion workspace</p>
          <h1 id="home-title">Study with the source, the structure, and a calm guide beside you.</h1>
          <p>
            Upload a PDF, keep the original material visible, and let KnowTree hold your reading
            path, current state, and next useful move in one quiet workspace.
          </p>
          <Link className="primary-link" href="/workspace">
            Open workspace
          </Link>
        </div>
        <div className="home-preview" aria-label="Workspace preview">
          <div className="preview-toolbar">
            <span>Demo Learning Material</span>
            <strong>Page 3</strong>
          </div>
          <div className="preview-layout">
            <div className="preview-page">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="preview-guide">
              <small>Current unit</small>
              <strong>2. Core Concepts</strong>
              <p>You have enough context for one focused pass.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
