import { useEffect, useRef } from "react";
import type { ActiveVerificationTask, ConsoleOutput } from "./types";

type ExplainSelectionPayload = {
  citation?: {
    label?: string;
  };
  explanation?: {
    summary?: string;
    key_points?: string[];
    study_hint?: string;
  };
};

function explainPayload(output: ConsoleOutput): ExplainSelectionPayload | null {
  if (output.result?.payload.command !== "explain_selection") return null;

  return output.result.payload as ExplainSelectionPayload;
}

function ConsoleOutputBody({ output }: { output: ConsoleOutput }) {
  const payload = explainPayload(output);

  if (!payload) {
    return <p>{output.text}</p>;
  }

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
    </div>
  );
}

function outputLabel(kind: ConsoleOutput["kind"]) {
  if (kind === "user") return "you";
  if (kind === "quiz") return "check";
  return kind;
}

export function InteractionConsole({
  terminalInput,
  onTerminalInputChange,
  outputs,
  activeVerificationTask,
  onRunCommand,
}: {
  terminalInput: string;
  onTerminalInputChange: (value: string) => void;
  outputs: ConsoleOutput[];
  activeVerificationTask: ActiveVerificationTask | null;
  onRunCommand: () => void;
}) {
  const isAnsweringVerification = Boolean(activeVerificationTask && !activeVerificationTask.submission);
  const outputStreamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outputStream = outputStreamRef.current;
    if (!outputStream) return;

    outputStream.scrollTop = outputStream.scrollHeight;
  }, [outputs.length]);

  return (
    <section className="interaction-console" aria-label="Study Terminal">
      <div className="terminal-shell">
        <div ref={outputStreamRef} className="console-output-stream" aria-label="Terminal output stream">
          {outputs.length === 0 ? (
            <p className="muted">No terminal output yet.</p>
          ) : (
            outputs.map((output) => (
              <article key={output.id} className={`console-output ${output.kind}`}>
                <strong>{outputLabel(output.kind)}</strong>
                <ConsoleOutputBody output={output} />
              </article>
            ))
          )}
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
            value={terminalInput}
            onChange={(event) => onTerminalInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              onRunCommand();
            }}
            placeholder={isAnsweringVerification ? "Understanding check response" : "/ask, /note, /quiz, /submit-tree, /next, /clear"}
            aria-label="Console command input"
          />
        </form>
      </div>
    </section>
  );
}
