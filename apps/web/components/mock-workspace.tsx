"use client";

import { useMemo, useState } from "react";
import type { EvidenceEvent, InteractionTask, ReadingUnit, UploadedResource } from "@knowtree/shared";
import { API_BASE_URL, conceptItems, SAMPLE_SELECTION, units } from "./workspace/data";
import { PdfReaderPane } from "./workspace/pdf-reader-pane";
import { RightDock } from "./workspace/right-dock";
import type { ConceptTreeNode, ConsoleOutput, EvidenceDraft, SelectionContext } from "./workspace/types";
import { addConceptToTree, countTreeNodes, flattenConceptTree, flattenUnits, removeConceptFromTree } from "./workspace/tree-utils";
import { WORKSPACE_FALLBACK_STYLES } from "./workspace/workspace-fallback-styles";

export function MockWorkspace() {
  const [currentPage, setCurrentPage] = useState(1);
  const [resource, setResource] = useState<UploadedResource | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rightDockOpen, setRightDockOpen] = useState(true);
  const [unitPanelOpen, setUnitPanelOpen] = useState(true);
  const [visualPanelOpen, setVisualPanelOpen] = useState(true);
  const [consolePanelOpen, setConsolePanelOpen] = useState(true);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null);
  const [treeDraft, setTreeDraft] = useState<ConceptTreeNode[]>([]);
  const [draftText, setDraftText] = useState("");
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);

  const flatUnits = useMemo(() => flattenUnits(units), []);
  const activeUnit = flatUnits.find((unit) => currentPage >= unit.startPage && currentPage <= unit.endPage) ?? units[0];
  const maxPage = resource?.page_count ?? 8;
  const fileUrl = resource ? `${API_BASE_URL}/api/resources/${resource.resource_id}/file` : null;
  const usedConceptIds = useMemo(() => new Set(flattenConceptTree(treeDraft).map((concept) => concept.id)), [treeDraft]);
  const availableConcepts = conceptItems.filter((concept) => !usedConceptIds.has(concept.id));
  const visualNodeCount = countTreeNodes(treeDraft);
  const visualRootCount = treeDraft.length;

  function addOutput(kind: ConsoleOutput["kind"], text: string) {
    setOutputs((current) => [{ id: `${Date.now()}-${current.length}`, kind, text }, ...current]);
  }

  async function postJson<TResponse>(path: string, payload: Record<string, unknown>): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(errorPayload?.detail ?? "Request failed.");
    }

    return (await response.json()) as TResponse;
  }

  function stepPage(direction: 1 | -1) {
    setCurrentPage((page) => Math.min(maxPage, Math.max(1, page + direction)));
  }

  function selectUnit(unit: ReadingUnit) {
    setCurrentPage(Math.min(maxPage, Math.max(1, unit.startPage)));
  }

  function dropConcept(conceptId: string, parentId: string | null) {
    const concept = conceptItems.find((item) => item.id === conceptId);
    if (!concept || usedConceptIds.has(concept.id)) return;

    setTreeDraft((current) => addConceptToTree(current, concept, parentId));
  }

  function removeConcept(conceptId: string) {
    setTreeDraft((current) => removeConceptFromTree(current, conceptId));
  }

  async function submitTreeEvidence() {
    const evidence: EvidenceDraft = {
      task: "build_concept_tree",
      nodeCount: visualNodeCount,
      rootCount: visualRootCount,
      selectionLength: selectionContext?.text.length ?? 0,
      draftLength: draftText.trim().length,
      note:
        visualNodeCount === 0
          ? "No visual structure submitted yet."
          : `Recorded a concept-tree draft for ${activeUnit.title}. Next step: compare it with source-backed relationships and the selected text.`,
    };

    try {
      const task = await postJson<InteractionTask>("/api/interaction-tasks", {
        session_id: sessionId,
        task_type: evidence.task,
        unit_id: activeUnit.unitId,
        unit_title: activeUnit.title,
        prompt: "Arrange the concepts you have read into a structure that matches your current understanding.",
        context: {
          page: currentPage,
          resource_id: resource?.resource_id ?? null,
          selection_context: selectionContext,
          visual_node_count: visualNodeCount,
          visual_root_count: visualRootCount,
        },
      });

      const event = await postJson<EvidenceEvent>("/api/evidence-events", {
        session_id: sessionId,
        task_id: task.task_id,
        event_type: "concept_tree_submission",
        unit_id: activeUnit.unitId,
        unit_title: activeUnit.title,
        summary: evidence.note,
        selection_context: selectionContext,
        payload: {
          node_count: evidence.nodeCount,
          root_count: evidence.rootCount,
          selection_length: evidence.selectionLength,
          draft_length: evidence.draftLength,
          draft_text: draftText,
          concept_tree: treeDraft,
          page: currentPage,
          resource_id: resource?.resource_id ?? null,
        },
      });

      addOutput(
        "evidence",
        `${evidence.task}: saved ${event.event_id} for ${task.task_id}. ${evidence.nodeCount} nodes, ${evidence.rootCount} roots, selection ${evidence.selectionLength} chars, draft ${evidence.draftLength} chars. ${evidence.note}`,
      );
    } catch (submitFailure) {
      addOutput("system", submitFailure instanceof Error ? `Evidence save failed: ${submitFailure.message}` : "Evidence save failed.");
    }
  }

  function runCommand() {
    const trimmed = command.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("/ask")) {
      const question = trimmed.replace("/ask", "").trim() || draftText || "Explain the current context.";
      addOutput("answer", `Mock answer queued for: ${question}`);
    } else if (trimmed.startsWith("/note")) {
      const note = trimmed.replace("/note", "").trim() || draftText || (selectionContext?.text ?? "");
      addOutput("note", note ? `Saved note draft: ${note}` : "No note text was provided.");
    } else if (trimmed.startsWith("/quiz")) {
      addOutput("quiz", selectionContext ? "Explain the selected text without looking back at the source." : "Explain the current unit in your own words.");
    } else if (trimmed.startsWith("/submit-tree")) {
      void submitTreeEvidence();
    } else {
      addOutput("system", `Unknown command: ${trimmed}. Try /ask, /note, /quiz, or /submit-tree.`);
    }

    setCommand("");
  }

  async function uploadPdf(file: File | null) {
    if (!file) return;

    setUploadStatus("uploading");
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail ?? "Upload failed.");
      }

      const uploaded = (await response.json()) as UploadedResource;
      setResource(uploaded);
      setCurrentPage(1);
      setUploadStatus("idle");
    } catch (uploadFailure) {
      setUploadStatus("error");
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Upload failed.");
    }
  }

  return (
    <main className={rightDockOpen ? "workspace-shell" : "workspace-shell reader-focus"}>
      <style>{WORKSPACE_FALLBACK_STYLES}</style>
      <PdfReaderPane
        title={resource?.title ?? "Demo Learning Material"}
        currentPage={currentPage}
        maxPage={maxPage}
        fileUrl={fileUrl}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        uploadLabel={resource ? resource.original_filename : "Upload a PDF to replace the placeholder"}
        rightDockOpen={rightDockOpen}
        selectedText={selectionContext?.text ?? ""}
        onToggleDock={() => setRightDockOpen((open) => !open)}
        onUploadPdf={(file) => void uploadPdf(file)}
        onCaptureSelection={() => setSelectionContext({ text: SAMPLE_SELECTION, page: currentPage, source: "sample" })}
        onTextSelection={setSelectionContext}
        onPageStep={stepPage}
      />

      {rightDockOpen ? (
        <RightDock
          units={units}
          activeUnit={activeUnit}
          currentPage={currentPage}
          selectionContext={selectionContext}
          unitPanelOpen={unitPanelOpen}
          visualPanelOpen={visualPanelOpen}
          consolePanelOpen={consolePanelOpen}
          treeDraft={treeDraft}
          availableConcepts={availableConcepts}
          draftText={draftText}
          visualNodeCount={visualNodeCount}
          visualRootCount={visualRootCount}
          outputs={outputs}
          command={command}
          onToggleUnitPanel={() => setUnitPanelOpen((open) => !open)}
          onToggleVisualPanel={() => setVisualPanelOpen((open) => !open)}
          onToggleConsolePanel={() => setConsolePanelOpen((open) => !open)}
          onSelectUnit={selectUnit}
          onDropConcept={dropConcept}
          onRemoveConcept={removeConcept}
          onClearTree={() => setTreeDraft([])}
          onCaptureSelection={() => setSelectionContext({ text: SAMPLE_SELECTION, page: currentPage, source: "sample" })}
          onClearSelection={() => setSelectionContext(null)}
          onDraftTextChange={setDraftText}
          onCommandChange={setCommand}
          onRunCommand={runCommand}
        />
      ) : null}
    </main>
  );
}
