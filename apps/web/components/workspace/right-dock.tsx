import type { ReadingUnit } from "@knowtree/shared";
import { DockPanel } from "./dock-panel";
import { InteractionConsole } from "./interaction-console";
import { UnitTreePanel } from "./unit-tree-panel";
import type { ActiveVerificationTask, ConceptItem, ConceptTreeNode, ConsoleOutput, SelectionContext, UnitSelectHandler } from "./types";
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
  terminalInput,
  visualNodeCount,
  visualRootCount,
  outputs,
  activeVerificationTask,
  onToggleUnitPanel,
  onToggleVisualPanel,
  onToggleConsolePanel,
  onSelectUnit,
  onDropConcept,
  onRemoveConcept,
  onClearTree,
  onCaptureSelection,
  onClearSelection,
  onClearTerminal,
  onTerminalInputChange,
  onRunCommand,
  onCreateVerificationTask,
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
  terminalInput: string;
  visualNodeCount: number;
  visualRootCount: number;
  outputs: ConsoleOutput[];
  activeVerificationTask: ActiveVerificationTask | null;
  onToggleUnitPanel: () => void;
  onToggleVisualPanel: () => void;
  onToggleConsolePanel: () => void;
  onSelectUnit: UnitSelectHandler;
  onDropConcept: (conceptId: string, parentId: string | null) => void;
  onRemoveConcept: (conceptId: string) => void;
  onClearTree: () => void;
  onCaptureSelection: () => void;
  onClearSelection: () => void;
  onClearTerminal: () => void;
  onTerminalInputChange: (value: string) => void;
  onRunCommand: () => void;
  onCreateVerificationTask: (result: NonNullable<ConsoleOutput["result"]>) => void;
}) {
  return (
    <aside className="right-dock" aria-label="Learning workbench dock">
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

      <DockPanel title="Study Terminal" subtitle="Context, commands, outputs" isOpen={consolePanelOpen} onToggle={onToggleConsolePanel}>
        <InteractionConsole
          activeUnit={activeUnit}
          currentPage={currentPage}
          selectionContext={selectionContext}
          onCaptureSelection={onCaptureSelection}
          onClearSelection={onClearSelection}
          onClearTerminal={onClearTerminal}
          terminalInput={terminalInput}
          onTerminalInputChange={onTerminalInputChange}
          visualNodeCount={visualNodeCount}
          visualRootCount={visualRootCount}
          outputs={outputs}
          activeVerificationTask={activeVerificationTask}
          onRunCommand={onRunCommand}
          onCreateVerificationTask={onCreateVerificationTask}
        />
      </DockPanel>
    </aside>
  );
}
