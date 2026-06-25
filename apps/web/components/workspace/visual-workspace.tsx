import type { ReadingUnit } from "@knowtree/shared";
import { ConceptTreeDraft } from "./concept-tree-draft";
import type { ConceptItem, ConceptTreeNode } from "./types";

export function VisualWorkspace({
  activeUnit,
  treeDraft,
  availableConcepts,
  onDropConcept,
  onRemoveConcept,
  onClearTree,
}: {
  activeUnit: ReadingUnit;
  treeDraft: ConceptTreeNode[];
  availableConcepts: ConceptItem[];
  onDropConcept: (conceptId: string, parentId: string | null) => void;
  onRemoveConcept: (conceptId: string) => void;
  onClearTree: () => void;
}) {
  return (
    <section className="visual-workspace" aria-label="Visual Workspace">
      <div className="visual-header">
        <p className="eyebrow">Visual Workspace</p>
        <strong>Concept Tree Task</strong>
        <span>{activeUnit.title}</span>
      </div>

      <p className="console-prompt">
        Arrange the concepts you have read into a structure that matches your current understanding.
      </p>

      <div className="concept-workbench">
        <div className="concept-pool" aria-label="Concept pool">
          <h4>Concept pool</h4>
          {availableConcepts.length === 0 ? <p className="muted">All concepts are in your draft.</p> : null}
          {availableConcepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              draggable
              className="concept-chip"
              onDragStart={(event) => event.dataTransfer.setData("text/plain", concept.id)}
            >
              <span>{concept.label}</span>
              <small>{concept.hint}</small>
            </button>
          ))}
        </div>

        <div className="concept-draft" aria-label="Concept tree draft">
          <div
            className="concept-dropzone root"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onDropConcept(event.dataTransfer.getData("text/plain"), null);
            }}
          >
            Drop as root
          </div>
          <ConceptTreeDraft nodes={treeDraft} onDropConcept={onDropConcept} onRemove={onRemoveConcept} />
        </div>
      </div>

      <div className="visual-actions">
        <button type="button" onClick={onClearTree}>
          Clear visual draft
        </button>
      </div>
    </section>
  );
}
