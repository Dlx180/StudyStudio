import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero-card">
        <p className="eyebrow">KnowTree MVP</p>
        <h1>Read original material with an editable UnitTree beside it.</h1>
        <p>
          Upload a PDF, keep the original material visible, and use the UnitTree to navigate
          learning-sized reading units beside the document.
        </p>
        <Link className="primary-link" href="/workspace">
          Open workspace
        </Link>
      </section>
    </main>
  );
}
