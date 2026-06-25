import type { ReadingUnit } from "@knowtree/shared";
import { DockPanel } from "./dock-panel";
import { InteractionConsole } from "./interaction-console";
import { UnitTreePanel } from "./unit-tree-panel";
import type { ConceptItem, ConceptTreeNode, ConsoleOutput, SelectionContext, UnitSelectHandler } from "./types";
import { VisualWorkspace } from "./visual-workspace";

export function RightDock({
  units,
  activeUnit,
  currentPage,
  selectionContext,
  unitPanelOpen,
  visualPanelOpen,
  consolePanelOpen,
  treeDraft,
  availableConcepts,
  draftText,
  visualNodeCount,
  visualRootCount,
  outputs,
  command,
  progressPercent,
  onToggleUnitPanel,
  onToggleVisualPanel,
  onToggleConsolePanel,
  onSelectUnit,
  onDropConcept,
  onRemoveConcept,
  onClearTree,
  onCaptureSelection,
  onClearSelection,
  onDraftTextChange,
  onCommandChange,
  onRunCommand,
}: {
  units: ReadingUnit[];
  activeUnit: ReadingUnit;
  currentPage: number;
  selectionContext: SelectionContext | null;
  unitPanelOpen: boolean;
  visualPanelOpen: boolean;
  consolePanelOpen: boolean;
  treeDraft: ConceptTreeNode[];
  availableConcepts: ConceptItem[];
  draftText: string;
  visualNodeCount: number;
  visualRootCount: number;
  outputs: ConsoleOutput[];
  command: string;
  progressPercent: number;
  onToggleUnitPanel: () => void;
  onToggleVisualPanel: () => void;
  onToggleConsolePanel: () => void;
  onSelectUnit: UnitSelectHandler;
  onDropConcept: (conceptId: string, parentId: string | null) => void;
  onRemoveConcept: (conceptId: string) => void;
  onClearTree: () => void;
  onCaptureSelection: () => void;
  onClearSelection: () => void;
  onDraftTextChange: (value: string) => void;
  onCommandChange: (value: string) => void;
  onRunCommand: () => void;
}) {
  return (
    <aside className="right-dock" aria-label="Learning workbench dock">
      <section className="companion-card" aria-label="Personal learning state">
        <p className="eyebrow">Today</p>
        <h2>You are building a readable path through this file.</h2>
        <div className="progress-track" aria-label={`${progressPercent}% complete`}>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <p>One unit at a time is enough. I will keep your place and surface the next useful move.</p>
      </section>

      <DockPanel
        title="UnitTree"
        subtitle={`${activeUnit.title} - page ${currentPage}`}
        isOpen={unitPanelOpen}
        onToggle={onToggleUnitPanel}
      >
        <UnitTreePanel units={units} activeUnit={activeUnit} currentPage={currentPage} onSelectUnit={onSelectUnit} />
      </DockPanel>

      <DockPanel
        title="Visual Workspace"
        subtitle={`${visualNodeCount} visual nodes - ${selectionContext ? "selection attached" : "no selection"}`}
        isOpen={visualPanelOpen}
        onToggle={onToggleVisualPanel}
      >
        <VisualWorkspace
          activeUnit={activeUnit}
          treeDraft={treeDraft}
          availableConcepts={availableConcepts}
          onDropConcept={onDropConcept}
          onRemoveConcept={onRemoveConcept}
          onClearTree={onClearTree}
        />
      </DockPanel>

      <DockPanel title="Console" subtitle="Context, commands, outputs" isOpen={consolePanelOpen} onToggle={onToggleConsolePanel}>
        <InteractionConsole
          activeUnit={activeUnit}
          currentPage={currentPage}
          selectionContext={selectionContext}
          onCaptureSelection={onCaptureSelection}
          onClearSelection={onClearSelection}
          draftText={draftText}
          onDraftTextChange={onDraftTextChange}
          visualNodeCount={visualNodeCount}
          visualRootCount={visualRootCount}
          outputs={outputs}
          command={command}
          onCommandChange={onCommandChange}
          onRunCommand={onRunCommand}
        />
      </DockPanel>
    </aside>
  );
}
