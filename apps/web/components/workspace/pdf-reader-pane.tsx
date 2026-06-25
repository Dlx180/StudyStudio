"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { SelectionAction, SelectionContext } from "./types";

type PdfTextSpan = {
  id: string;
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
};

type PdfTextContentItem = {
  str: string;
  width: number;
  height: number;
  transform: [number, number, number, number, number, number];
};

export function PdfCanvas({
  fileUrl,
  pageNumber,
  onPageStep,
  onTextSelection,
}: {
  fileUrl: string;
  pageNumber: number;
  onPageStep: (direction: 1 | -1) => void;
  onTextSelection: (selection: SelectionContext) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const lastWheelAtRef = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [textSpans, setTextSpans] = useState<PdfTextSpan[]>([]);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setStatus("loading");
      setError(null);
      pdfRef.current = null;

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

        const pdf = await pdfjs.getDocument({ url: fileUrl }).promise;
        if (cancelled) return;

        pdfRef.current = pdf;
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("PDF could not be loaded.");
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      pdfRef.current = null;
    };
  }, [fileUrl]);

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!pdfRef.current || !canvasRef.current) return;

      renderTaskRef.current?.cancel();

      const page = await pdfRef.current.getPage(pageNumber);
      const scale = 1.35;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageSize({ width: viewport.width, height: viewport.height });
      setTextSpans([]);

      const renderTask = page.render({ canvas, canvasContext: context, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
        const textContent = await page.getTextContent();
        if (cancelled) return;

        const spans = textContent.items
          .filter((item) => "str" in item && typeof item.str === "string" && item.str.trim().length > 0)
          .map((item, index) => {
            const textItem = item as unknown as PdfTextContentItem;
            const [, , , fontHeight, x, y] = textItem.transform;
            const fontSize = Math.max(6, Math.abs(fontHeight) * scale);
            const height = Math.max(8, (textItem.height || Math.abs(fontHeight)) * scale);

            return {
              id: `${pageNumber}-${index}`,
              text: textItem.str,
              left: x * scale,
              top: viewport.height - y * scale - height,
              width: Math.max(2, textItem.width * scale),
              height,
              fontSize,
            };
          });

        setTextSpans(spans);
      } catch (renderError) {
        if (!cancelled && renderError instanceof Error && renderError.name !== "RenderingCancelledException") {
          setStatus("error");
          setError("PDF page could not be rendered.");
        }
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pageNumber, status]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < 24) return;

      event.preventDefault();

      const now = Date.now();
      if (now - lastWheelAtRef.current < 450) return;

      lastWheelAtRef.current = now;
      onPageStep(event.deltaY > 0 ? 1 : -1);
    }

    frame.addEventListener("wheel", handleWheel, { passive: false });

    return () => frame.removeEventListener("wheel", handleWheel);
  }, [onPageStep]);

  return (
    <div ref={frameRef} className="pdf-frame">
      {status === "loading" ? <p className="reader-status">Loading PDF...</p> : null}
      {status === "error" ? <p className="reader-status error">{error}</p> : null}
      <div className="pdf-page-shell" style={{ width: pageSize.width || undefined, height: pageSize.height || undefined }}>
        <canvas ref={canvasRef} className="pdf-canvas" aria-label={`PDF page ${pageNumber}`} />
        <div
          className="pdf-text-layer"
          aria-label={`Selectable text for PDF page ${pageNumber}`}
          onMouseUp={() => {
            const text = window.getSelection()?.toString().trim() ?? "";
            if (text) {
              onTextSelection({ text, page: pageNumber, source: "pdf-text-layer" });
            }
          }}
        >
          {textSpans.map((span) => (
            <span
              key={span.id}
              style={{
                left: span.left,
                top: span.top,
                width: span.width,
                height: span.height,
                fontSize: span.fontSize,
              }}
            >
              {span.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PdfReaderPane({
  title,
  currentPage,
  maxPage,
  fileUrl,
  uploadStatus,
  uploadError,
  uploadLabel,
  rightDockOpen,
  selectedText,
  onToggleDock,
  onUploadPdf,
  onCaptureSelection,
  onSelectionAction,
  onTextSelection,
  onPageStep,
}: {
  title: string;
  currentPage: number;
  maxPage: number;
  fileUrl: string | null;
  uploadStatus: "idle" | "uploading" | "error";
  uploadError: string | null;
  uploadLabel: string;
  rightDockOpen: boolean;
  selectedText: string;
  onToggleDock: () => void;
  onUploadPdf: (file: File | null) => void;
  onCaptureSelection: () => void;
  onSelectionAction: (action: SelectionAction) => void;
  onTextSelection: (selection: SelectionContext) => void;
  onPageStep: (direction: 1 | -1) => void;
}) {
  const hasSelection = selectedText.trim().length > 0;

  return (
    <section className="document-pane" aria-label="Original material reader">
      <header className="reader-header">
        <span>
          <p className="eyebrow">Original material</p>
          <h1>{title}</h1>
        </span>
        <button type="button" className="dock-toggle" onClick={onToggleDock}>
          {rightDockOpen ? "Focus reading" : "Show dock"}
        </button>
      </header>

      <label className="upload-strip">
        <span>{uploadLabel}</span>
        <input type="file" accept="application/pdf,.pdf" onChange={(event) => onUploadPdf(event.target.files?.[0] ?? null)} />
      </label>
      <div className="reader-context-actions">
        <button type="button" onClick={onCaptureSelection}>
          Capture sample selection
        </button>
        {hasSelection ? (
          <div className="selection-action-bar" aria-label="Selected text actions">
            <span>{selectedText.length} chars selected</span>
            <button type="button" onClick={() => onSelectionAction("explain")}>
              Explain this
            </button>
            <button type="button" onClick={() => onSelectionAction("quiz")}>
              Quiz me
            </button>
            <button type="button" onClick={() => onSelectionAction("find-source")}>
              Find source
            </button>
            <button type="button" onClick={() => onSelectionAction("note")}>
              Add note
            </button>
          </div>
        ) : (
          <span>Select text directly on the PDF page or capture a sample selection</span>
        )}
      </div>
      {uploadStatus === "uploading" ? <p className="form-status">Uploading PDF...</p> : null}
      {uploadStatus === "error" ? <p className="form-status error">{uploadError}</p> : null}

      {fileUrl ? (
        <PdfCanvas fileUrl={fileUrl} pageNumber={currentPage} onPageStep={onPageStep} onTextSelection={onTextSelection} />
      ) : (
        <div className="page-card">
          <span>PDF placeholder</span>
          <strong>Page {currentPage}</strong>
          <p>
            This pane keeps the source material primary. Upload a PDF to render the real document
            while the UnitTree stays available for navigation.
          </p>
        </div>
      )}
      <nav className="page-controls" aria-label="Page navigation">
        <button onClick={() => onPageStep(-1)}>Previous</button>
        <span>
          Page {currentPage} of {maxPage}
        </span>
        <button onClick={() => onPageStep(1)}>Next</button>
      </nav>
    </section>
  );
}
