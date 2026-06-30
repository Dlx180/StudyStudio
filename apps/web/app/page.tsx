import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero-card">
        <p className="eyebrow">StudyStudio MVP</p>
        <h1>Understand a difficult passage, check it, then choose the next step.</h1>
        <p>
          Upload a PDF, keep the original source visible, explain selected text, answer one
          understanding check, and let StudyStudio recommend what to do next.
        </p>
        <Link className="primary-link" href="/workspace">
          Open StudyStudio
        </Link>
      </section>
    </main>
  );
}
