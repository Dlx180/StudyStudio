import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero-card">
        <p className="eyebrow">KnowTree MVP</p>
        <h1>Read original material with an editable UnitTree beside it.</h1>
        <p>
          The first development slice wires a mock Resource, page locator, UnitTree, and state
          labels so the core reading interaction can be validated before PDF upload is added.
        </p>
        <Link className="primary-link" href="/workspace">
          Open mock workspace
        </Link>
      </section>
    </main>
  );
}
