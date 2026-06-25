"use client";

import { useMemo, useState } from "react";
import type {
  EvidenceEvent,
  InteractionTask,
  ReadingUnit,
  ResourceRef,
  SourceSpan,
  TerminalCommandResult,
  UploadedResource,
  VerificationSubmissionDraft,
  VerificationTaskDraft,
} from "@knowtree/shared";
import { API_BASE_URL, conceptItems, SAMPLE_SELECTION, units } from "./workspace/data";
import { PdfReaderPane } from "./workspace/pdf-reader-pane";
import { RightDock } from "./workspace/right-dock";
import type { ActiveVerificationTask, ConceptTreeNode, ConsoleOutput, EvidenceDraft, SelectionAction, SelectionContext } from "./workspace/types";
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
  const [terminalInput, setTerminalInput] = useState("");
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [activeVerificationTask, setActiveVerificationTask] = useState<ActiveVerificationTask | null>(null);

  const flatUnits = useMemo(() => flattenUnits(units), []);
  const activeUnit = flatUnits.find((unit) => currentPage >= unit.startPage && currentPage <= unit.endPage) ?? units[0];
  const maxPage = resource?.page_count ?? 8;
  const fileUrl = resource ? `${API_BASE_URL}/api/resources/${resource.resource_id}/file` : null;
  const usedConceptIds = useMemo(() => new Set(flattenConceptTree(treeDraft).map((concept) => concept.id)), [treeDraft]);
  const availableConcepts = conceptItems.filter((concept) => !usedConceptIds.has(concept.id));
  const visualNodeCount = countTreeNodes(treeDraft);
  const visualRootCount = treeDraft.length;

  function addOutput(kind: ConsoleOutput["kind"], text: string) {
    setOutputs((current) => [...current, { id: `${Date.now()}-${current.length}`, kind, text }]);
  }

  function addTerminalResultOutput(result: TerminalCommandResult) {
    setOutputs((current) => [...current, { id: result.result_id, kind: result.kind === "answer" ? "answer" : "system", text: result.message, result }]);
  }

  function createVerificationTaskFromResult(result: TerminalCommandResult, announce = true) {
    const followUpTask = result.follow_up_actions
      .map((action) => action.payload?.verification_task)
      .find((task): task is Omit<VerificationTaskDraft, "task_id" | "created_from_result_id" | "selected_text"> => {
        return Boolean(task && typeof task === "object" && "prompt" in task);
      });
    const payloadTask = result.payload.verification_task;
    const verificationTask =
      followUpTask ??
      (payloadTask && typeof payloadTask === "object" && "prompt" in payloadTask
        ? (payloadTask as Omit<VerificationTaskDraft, "task_id" | "created_from_result_id" | "selected_text">)
        : null);

    if (!verificationTask) {
      addOutput("system", "No verification task was available for this result.");
      return;
    }

    const selectedText = typeof result.payload.selection_context === "object" && result.payload.selection_context !== null && "text" in result.payload.selection_context
      ? String(result.payload.selection_context.text)
      : selectionContext?.text ?? "";

    const task: ActiveVerificationTask = {
      ...verificationTask,
      task_id: `verification-task-${Date.now()}`,
      selected_text: selectedText,
      created_from_result_id: result.result_id,
    };

    setActiveVerificationTask(task);
    if (announce) {
      addOutput("quiz", `Understanding check ready: ${task.prompt}`);
    }
  }

  function submitVerificationTask() {
    if (!activeVerificationTask) return;

    const responseText = terminalInput.trim();
    if (!responseText) {
      addOutput("system", "Write your understanding check answer in the Study Terminal input before submitting.");
      return;
    }

    addOutput("user", responseText);

    const submission: VerificationSubmissionDraft = {
      submission_id: `verification-submission-${Date.now()}`,
      task_id: activeVerificationTask.task_id,
      response_text: responseText,
      payload: {
        prompt: activeVerificationTask.prompt,
        source_excerpt: activeVerificationTask.source_excerpt,
        response_text: responseText,
        selected_text: activeVerificationTask.selected_text,
        page: activeVerificationTask.page,
        source: activeVerificationTask.source,
        source_span_id: activeVerificationTask.source_span_id ?? null,
        submitted_at: new Date().toISOString(),
      },
    };

    setActiveVerificationTask({ ...activeVerificationTask, submission });
    setTerminalInput("");
    addOutput("evidence", `Verification submission ready for EvidenceEvent: ${submission.submission_id}.`);
  }

  function clearTerminal() {
    setOutputs([]);
    setActiveVerificationTask(null);
    setTerminalInput("");
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

  function activeResourceRef(): ResourceRef | null {
    if (!resource) return null;

    return {
      resource_id: resource.resource_id,
      title: resource.title,
      kind: resource.kind,
    };
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
      draftLength: terminalInput.trim().length,
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
          source_refs: selectionContext?.source_span ? [selectionContext.source_span] : [],
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
        source_refs: selectionContext?.source_span ? [selectionContext.source_span] : [],
        payload: {
          node_count: evidence.nodeCount,
          root_count: evidence.rootCount,
          selection_length: evidence.selectionLength,
          draft_length: evidence.draftLength,
          draft_text: terminalInput,
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

  function selectedTextPreview() {
    const text = selectionContext?.text.trim() ?? "";
    if (text.length <= 160) return text;
    return `${text.slice(0, 157)}...`;
  }

  async function explainSelection() {
    if (!selectionContext) {
      addOutput("system", "Select source text before running a learning action.");
      return;
    }

    try {
      const result = await postJson<TerminalCommandResult>("/api/terminal-commands/explain-selection", {
        session_id: sessionId,
        unit_id: activeUnit.unitId,
        unit_title: activeUnit.title,
        selection_context: selectionContext,
        source_refs: selectionContext.source_span ? [selectionContext.source_span] : [],
      });

      addTerminalResultOutput(result);
      createVerificationTaskFromResult(result, false);
    } catch (explainFailure) {
      addOutput("system", explainFailure instanceof Error ? `Explain this failed: ${explainFailure.message}` : "Explain this failed.");
    }
  }

  function runSelectionAction(action: SelectionAction) {
    if (!selectionContext) {
      addOutput("system", "Select source text before running a learning action.");
      return;
    }

    const sourceLabel = selectionContext.source_span
      ? `page ${selectionContext.page} / ${selectionContext.source_span.source_span_id}`
      : `page ${selectionContext.page} / ${selectionContext.source}`;
    const preview = selectedTextPreview();

    if (action === "explain") {
      void explainSelection();
    } else if (action === "quiz") {
      addOutput("quiz", `Quiz me (${sourceLabel}): explain the selected passage in your own words, then compare your answer with the source.`);
    } else if (action === "find-source") {
      addOutput("source", `Find source: this selection is attached to ${sourceLabel}.`);
    } else if (action === "note") {
      const note = terminalInput.trim() || preview;
      addOutput("note", `Note draft from ${sourceLabel}: ${note}`);
    }
  }

  function runCommand() {
    if (activeVerificationTask && !activeVerificationTask.submission) {
      submitVerificationTask();
      return;
    }

    const trimmed = terminalInput.trim();
    if (!trimmed) return;

    addOutput("user", trimmed);

    if (trimmed.startsWith("/ask")) {
      const question = trimmed.replace("/ask", "").trim() || "Explain the current context.";
      addOutput("answer", `Mock answer queued for: ${question}`);
    } else if (trimmed.startsWith("/note")) {
      const note = trimmed.replace("/note", "").trim() || (selectionContext?.text ?? "");
      addOutput("note", note ? `Saved note draft: ${note}` : "No note text was provided.");
    } else if (trimmed.startsWith("/quiz")) {
      addOutput("quiz", selectionContext ? "Explain the selected text without looking back at the source." : "Explain the current unit in your own words.");
    } else if (trimmed.startsWith("/submit-tree")) {
      void submitTreeEvidence();
    } else {
      addOutput("system", `Unknown command: ${trimmed}. Try /ask, /note, /quiz, or /submit-tree.`);
    }

    setTerminalInput("");
  }

  async function persistSourceSelection(selection: SelectionContext) {
    const selectedResource = activeResourceRef();
    if (!selectedResource || selection.source !== "pdf-text-layer") {
      setSelectionContext(selection);
      return;
    }

    setSelectionContext({ ...selection, resource: selectedResource });

    try {
      const sourceSpan = await postJson<SourceSpan>("/api/source-spans", {
        resource: selectedResource,
        page: selection.page,
        text: selection.text,
        created_by: "user",
      });

      setSelectionContext({ ...selection, resource: selectedResource, source_span: sourceSpan });
      addOutput("system", `SourceSpan saved: ${sourceSpan.source_span_id} for page ${selection.page}.`);
    } catch (sourceSpanFailure) {
      addOutput("system", sourceSpanFailure instanceof Error ? `SourceSpan save failed: ${sourceSpanFailure.message}` : "SourceSpan save failed.");
    }
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
      setSelectionContext(null);
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
        onSelectionAction={runSelectionAction}
        onTextSelection={(selection) => void persistSourceSelection(selection)}
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
          terminalInput={terminalInput}
          visualNodeCount={visualNodeCount}
          visualRootCount={visualRootCount}
          outputs={outputs}
          activeVerificationTask={activeVerificationTask}
          onToggleUnitPanel={() => setUnitPanelOpen((open) => !open)}
          onToggleVisualPanel={() => setVisualPanelOpen((open) => !open)}
          onToggleConsolePanel={() => setConsolePanelOpen((open) => !open)}
          onSelectUnit={selectUnit}
          onDropConcept={dropConcept}
          onRemoveConcept={removeConcept}
          onClearTree={() => setTreeDraft([])}
          onCaptureSelection={() => setSelectionContext({ text: SAMPLE_SELECTION, page: currentPage, source: "sample" })}
          onClearSelection={() => setSelectionContext(null)}
          onClearTerminal={clearTerminal}
          onTerminalInputChange={setTerminalInput}
          onRunCommand={runCommand}
          onCreateVerificationTask={createVerificationTaskFromResult}
        />
      ) : null}
    </main>
  );
}
