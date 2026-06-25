import type { ConceptTreeNode } from "./types";

export function ConceptTreeDraft({
  nodes,
  onDropConcept,
  onRemove,
}: {
  nodes: ConceptTreeNode[];
  onDropConcept: (conceptId: string, parentId: string | null) => void;
  onRemove: (conceptId: string) => void;
}) {
  if (nodes.length === 0) {
    return (
      <div
        className="concept-dropzone empty"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onDropConcept(event.dataTransfer.getData("text/plain"), null);
        }}
      >
        Drop concepts here to start your tree
      </div>
    );
  }

  return (
    <ul className="concept-tree-draft">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className="concept-tree-node"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onDropConcept(event.dataTransfer.getData("text/plain"), node.id);
            }}
          >
            <span>
              <strong>{node.label}</strong>
              <small>{node.hint}</small>
            </span>
            <button type="button" onClick={() => onRemove(node.id)} aria-label={`Remove ${node.label}`}>
              Remove
            </button>
          </div>
          <ConceptTreeDraft nodes={node.children} onDropConcept={onDropConcept} onRemove={onRemove} />
        </li>
      ))}
    </ul>
  );
}
