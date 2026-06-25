import type { ReactNode } from "react";

export function DockPanel({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={isOpen ? "dock-panel" : "dock-panel collapsed"}>
      <button type="button" className="dock-panel-header" onClick={onToggle} aria-expanded={isOpen}>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <b>{isOpen ? "Hide" : "Show"}</b>
      </button>
      {isOpen ? <div className="dock-panel-body">{children}</div> : null}
    </section>
  );
}
