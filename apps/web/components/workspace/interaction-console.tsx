import type { ReadingUnit } from "@knowtree/shared";
import type { ConsoleOutput, SelectionContext } from "./types";

type ExplainSelectionPayload = {
  citation?: {
    label?: string;
  };
  explanation?: {
    summary?: string;
    key_points?: string[];
    study_hint?: string;
  };
  verification_task?: {
    prompt?: string;
  };
};

function explainPayload(output: ConsoleOutput): ExplainSelectionPayload | null {
  if (output.result?.payload.command !== "explain_selection") return null;

  return output.result.payload as ExplainSelectionPayload;
}

function TerminalResultDetails({ output }: { output: ConsoleOutput }) {
  const payload = explainPayload(output);
  if (!payload) return null;

  return (
    <div className="terminal-result-card">
      <span>{payload.citation?.label ?? "source citation"}</span>
      <b>{payload.explanation?.summary}</b>
      <ul>
        {(payload.explanation?.key_points ?? []).map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {payload.explanation?.study_hint ? <p>{payload.explanation.study_hint}</p> : null}
      {payload.verification_task?.prompt ? (
        <div className="follow-up-task">
          <small>Follow-up verification</small>
          <p>{payload.verification_task.prompt}</p>
        </div>
      ) : null}
      {output.result?.follow_up_actions.length ? (
        <div className="follow-up-actions">
          {output.result.follow_up_actions.map((action) => (
            <span key={`${action.action}-${action.label}`}>{action.label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InteractionConsole({
  activeUnit,
  currentPage,
  selectionContext,
  onCaptureSelection,
  onClearSelection,
  draftText,
  onDraftTextChange,
  visualNodeCount,
  visualRootCount,
  outputs,
  command,
  onCommandChange,
  onRunCommand,
}: {
  activeUnit: ReadingUnit;
  currentPage: number;
  selectionContext: SelectionContext | null;
  onCaptureSelection: () => void;
  onClearSelection: () => void;
  draftText: string;
  onDraftTextChange: (value: string) => void;
  visualNodeCount: number;
  visualRootCount: number;
  outputs: ConsoleOutput[];
  command: string;
  onCommandChange: (value: string) => void;
  onRunCommand: () => void;
}) {
  const selectedText = selectionContext?.text ?? "";
  const sourceSpanId = selectionContext?.source_span?.source_span_id;

  return (
    <section className="interaction-console" aria-label="Interaction Console">
      <div className="console-header">
        <p className="eyebrow">Study Terminal</p>
        <strong>Command and action stream</strong>
        <span>Natural reading actions and advanced commands appear here.</span>
      </div>

      <div className="context-stack" aria-label="Console context stack">
        <span>unit: {activeUnit.title}</span>
        <span>page: {currentPage}</span>
        <span>
          selection: {selectionContext ? `${selectionContext.text.length} chars / page ${selectionContext.page} / ${sourceSpanId ?? selectionContext.source}` : "none"}
        </span>
        <span>
          visual: concept-tree / {visualNodeCount} nodes / {visualRootCount} roots
        </span>
      </div>

      <div className="selection-card">
        <div className="selection-card-header">
          <strong>Selected text</strong>
          <span>
            <button type="button" onClick={onCaptureSelection}>
              Capture sample
            </button>
            <button type="button" onClick={onClearSelection}>
              Clear
            </button>
          </span>
        </div>
        {selectionContext ? (
          <blockquote>
            <small>
              page {selectionContext.page} - {sourceSpanId ? `SourceSpan ${sourceSpanId}` : selectionContext.source}
            </small>
            {selectionContext.text}
          </blockquote>
        ) : (
          <p className="muted">No source text selected yet.</p>
        )}
        <textarea
          value={draftText}
          onChange={(event) => onDraftTextChange(event.target.value)}
          placeholder="Draft a note, question, answer, or evidence explanation here."
          aria-label="Console draft editor"
        />
      </div>

      <form
        className="command-line"
        onSubmit={(event) => {
          event.preventDefault();
          onRunCommand();
        }}
      >
        <span>&gt;</span>
        <input
          value={command}
          onChange={(event) => onCommandChange(event.target.value)}
          placeholder="/ask, /note, /quiz, /submit-tree"
          aria-label="Console command input"
        />
        <button type="submit">Run</button>
      </form>

      <div className="console-output-stream" aria-label="Console output stream">
        {outputs.length === 0 ? (
          <p className="muted">Try `/ask`, `/note`, `/quiz`, or `/submit-tree`.</p>
        ) : (
          outputs.map((output) => (
            <article key={output.id} className={`console-output ${output.kind}`}>
              <strong>{output.kind}</strong>
              <p>{output.text}</p>
              <TerminalResultDetails output={output} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}
