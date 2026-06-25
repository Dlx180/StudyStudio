import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-panel" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="eyebrow">KnowTree companion workspace</p>
          <h1 id="home-title">Study with the source, the structure, and a calm guide beside you.</h1>
          <p>
            Keep the original material in view while KnowTree tracks the current reading unit,
            remembers your learning state, and offers the next gentle step.
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
