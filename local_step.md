# KnowTree Local Step Log

这个文件用于记录小步骤开发：每次先写清楚本地小目标、改动、验证结果和下一步，再同步到云端提交/PR。

## 使用约定

- 用户本机路径：`E:\project\KnowTree\local_step.md`。
- 云端工作区路径：`/workspace/KnowTree/local_step.md`。
- 云端 agent 不能直接读取 Windows 本机路径，除非你把该文件提交到 GitHub、同步到当前仓库，或把本机目录挂载到云端环境。
- 后续小开发如果涉及实现变更，优先更新本文件中的步骤记录，再更新 `docs/task_board.md` / `docs/changelog.md` 等稳定文档。
- 本文件只记录短周期开发过程；已经确认的产品原则、架构决策和长期任务仍以 `AGENTS.md` 与 `docs/` 下文档为准。

## 合规检查清单

每个小步骤完成前，至少检查：

- 是否仍围绕 MVP 核心阅读工作流推进。
- 是否保持 Resource、FileTree、ReadingUnit、UnitTree、StateOverlay、AIJob 等核心概念不混淆。
- 是否避免把长 prompt 写进 UI 组件。
- 是否记录了测试命令、失败原因或环境限制。
- 如果产生代码改动，是否已提交 commit，并同步准备 PR 说明。

## 2026-06-01 — First development slice

### Goal

Create the smallest runnable project skeleton for the MVP core reading workflow.

### Decisions

- Start with the recommended monorepo layout: `apps/web`, `apps/api`, `packages/shared`, `prompts`, `tests`, and `scripts`.
- Use a mock Resource and UnitTree first, before real PDF upload and AI generation.
- Keep original material primary by placing the document placeholder on the left and UnitTree navigation on the right.
- Keep long AI prompts out of UI components by reserving a versioned prompt directory.

### Changes

- Added a FastAPI backend shell with `/health` and `/api/mock-workspace` endpoints.
- Added a Next.js frontend shell with a mock reading workspace.
- Added shared TypeScript MVP types for Resource and ReadingUnit.
- Added environment and ignore-file patterns for local development.
- Updated project docs to mark the first skeleton tasks in progress/completed.

### Validation

- `cd apps/api && pytest` passed.
- `python -m compileall apps/api/app` passed.
- `npm install` was blocked by the cloud environment registry/proxy policy with HTTP 403.
- `npm --workspace @knowtree/web run build` could not run because frontend dependencies were not installed.

### Next small step

Resolve npm registry/proxy access, install frontend dependencies, verify the mock workspace in a browser, then replace the PDF placeholder with the first real PDF viewer slice.

## 2026-06-22 - PDF upload API slice

### Goal

Implement the smallest backend slice for real PDF Resources before replacing the frontend placeholder reader.

### Decisions

- Keep storage local under `storage/` for the prototype.
- Use a small `resource_store` module instead of introducing a database before the upload flow is proven.
- Support only PDF uploads in this milestone; PPT/PPTX conversion remains later work.
- Treat invalid uploads as request errors and remove failed Resource directories.

### Changes

- Added `POST /api/resources/upload` for PDF upload.
- Added `GET /api/resources/{resource_id}` for stored Resource metadata.
- Added `GET /api/resources/{resource_id}/file` for serving the original PDF to the frontend.
- Added `pypdf` and `python-multipart` runtime dependencies.
- Added upload tests for valid PDFs, non-PDF filenames, and invalid PDF bytes.
- Ignored Python `*.egg-info/` build metadata.

### Validation

- `python -m pip install -e .[dev]` passed.
- `python -m pytest` passed: 5 tests.
- Test run emitted a Starlette/FastAPI TestClient deprecation warning and a local pytest cache warning; neither blocks the current slice.

### Next small step

Connect the web app to the upload endpoint, add a real PDF.js/react-pdf reader in the left pane, and load the served PDF from `/api/resources/{resource_id}/file`.

## 2026-06-22 - Frontend PDF reader slice

### Goal

Replace the workspace PDF placeholder with a real upload-and-render loop.

### Decisions

- Use `pdfjs-dist` directly for the first reader slice.
- Keep the existing UnitTree mock data for now, while page navigation uses the uploaded Resource page count.
- Add CORS for local Next.js development against the FastAPI API.
- Keep Playwright as a dev dependency for local browser smoke tests.

### Changes

- Added a PDF upload control to the workspace.
- Added PDF.js canvas rendering for the selected page.
- Added frontend loading and error states for upload/render failures.
- Updated page controls to use the uploaded PDF page count.
- Updated homepage copy from mock-only language to the real workspace flow.
- Added `pdfjs-dist` and `playwright` to the Node dependencies.

### Validation

- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- `npm --workspace @knowtree/web run build` passed.
- Started API at `http://127.0.0.1:8000` and web app at `http://127.0.0.1:3000`.
- Playwright smoke test uploaded `tmp/visible-test.pdf`, confirmed canvas size `826x1069`, nonwhite pixel sample count `2026`, and page navigation from `Page 1 of 3` to `Page 2 of 3`.

### Next small step

Persist and display real Resource state in the workspace instead of keeping UnitTree data fully mocked, then extract Page text records as the start of Milestone 3.

## 2026-06-23 - Interaction Console prototype

### Goal

Add the first structured interaction surface beside the UnitTree and make PDF reading work with mouse-wheel page navigation.

### Decisions

- Treat the console as a task runner, not a generic chat box.
- Start with a mock `build_concept_tree` task before connecting LLM evaluation.
- Use a concept pool and draft tree to keep the task measurable.
- Keep evidence as a UI-only draft for this slice; persistence comes after EvidenceEvent schema design.

### Changes

- Added mouse-wheel navigation over the PDF frame.
- Added `InteractionConsole` under the current Unit detail panel.
- Added a draggable concept pool with Resource, ReadingUnit, UnitTree, StateOverlay, SourceSpan, and Interaction.
- Added a draft concept tree drop area.
- Added `Submit measurement` and `Clear draft` actions.
- Added mock evidence output with task type, node count, root count, and a note.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- Playwright smoke test uploaded `tmp/visible-test.pdf`, confirmed mouse-wheel navigation from `Page 1 of 3` to `Page 2 of 3`, dragged Resource and UnitTree into the concept draft, and submitted an evidence draft without browser errors.

### Next small step

Split the workspace component into smaller reader/tree/console components, then design the first backend `InteractionTask` and `EvidenceEvent` schemas before adding LLM evaluation.

## 2026-06-23 - IDE-style learning dock

### Goal

Move the workspace toward an IDE-style reading layout where learning tools can be hidden, folded, or used without disrupting the main reading surface.

### Decisions

- Keep the original material as the primary pane.
- Treat the right side as a dock with independent panels instead of one fixed sidebar.
- Add focus reading mode before adding more console capabilities.
- Mock selected text until the PDF text-layer/source-span slice exists.
- Keep selected text, draft notes, concept-tree structure, and evidence in one console flow.

### Changes

- Added `Focus reading` / `Show dock` control.
- Converted the right side into a `right-dock`.
- Added collapsible `UnitTree` and `Console` dock panels.
- Added a sample selection capture action in the reader.
- Added selected-text display inside the Interaction Console.
- Added a draft editor for notes, questions, quiz prompts, and evidence explanations.
- Added selection actions: `Ask`, `Note`, `Quiz`, and `Use as evidence`.
- Added selection and draft character counts to the mock evidence draft.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- Playwright smoke test uploaded `tmp/visible-test.pdf`, confirmed wheel navigation from `Page 1 of 3` to `Page 2 of 3`, hid and restored the right dock, collapsed and reopened the Console panel, captured mock selected text, filled the draft editor, dragged concepts into a tree, and submitted an evidence draft without browser errors.

### Next small step

Extract the workspace into smaller components (`PdfReaderPane`, `RightDock`, `UnitTreePanel`, `InteractionConsole`) and then define backend schemas for `SelectionContext`, `InteractionTask`, and `EvidenceEvent`.

## 2026-06-23 - Visual Workspace and command Console split

### Goal

Separate visual interaction work from the command Console so the right dock behaves more like an IDE: structure on top, visual task workspace in the middle, command/output stream at the bottom.

### Decisions

- Treat concept-tree building as a Visual Workspace task, not a Console subpanel.
- Keep Console focused on context, commands, drafts, and outputs.
- Replace the temporary action-button row with command-style input.
- Keep mock selection capture until the PDF text-layer slice exists.

### Changes

- Added a `Visual Workspace` dock panel above Console.
- Moved the concept pool and concept-tree draft into Visual Workspace.
- Added Console context stack with current unit, page, selection state, and visual-task state.
- Added command input with mock `/ask`, `/note`, `/quiz`, and `/submit-tree` commands.
- Added Console output stream for mock answers, notes, quizzes, evidence, and system messages.
- Kept draft editor and selected-text display inside Console as command context.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- Cleared `.next`, restarted the dev server, and confirmed the CSS chunk returns `200`.
- Playwright smoke test uploaded `tmp/visible-test.pdf`, confirmed wheel navigation from `Page 1 of 3` to `Page 2 of 3`, confirmed the dock panels are `UnitTree`, `Visual Workspace`, and `Console`, captured mock selected text, entered a draft, ran `/submit-tree`, and observed an evidence output without browser errors.
- Note: native browser drag-and-drop is enough for the prototype, but should be replaced with a robust drag/drop library before the visual task becomes a serious evaluation surface.

### Next small step

Split `mock-workspace.tsx` into separate components, then replace mock selected text with a real PDF text-layer/source-span capture path.

## 2026-06-23 - Workspace CSS fallback

### Goal

Fix the in-app browser rendering the workspace as unstyled HTML when the Next dev CSS chunk is stale, missing, or cached incorrectly.

### Findings

- The workspace HTML referenced `/_next/static/css/app/layout.css`.
- The in-app browser displayed current HTML but did not apply the external CSS.
- Local checks showed the dev server can temporarily return a missing/stale CSS chunk after `.next` cache churn.

### Changes

- Added `WORKSPACE_FALLBACK_STYLES` inside the workspace component.
- Rendered a local `<style>` tag in `/workspace` so the core IDE layout does not depend only on the external dev CSS chunk.
- Kept `globals.css` in place as the normal styling source.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- Cleared `.next` and restarted the dev server.
- Confirmed `/workspace` HTML contains the fallback style.
- Playwright computed styles confirmed `.workspace-shell` is `display: grid`, `document-pane` has a `24px` border radius, and `.right-dock` is `display: grid`.

### Next small step

After component extraction, move the fallback toward a more maintainable styling strategy or remove it once dev CSS stability is no longer an issue.

## 2026-06-23 - Production preview for hydrated workspace

### Goal

Restore workspace interactivity in the in-app browser after the page rendered with styles but without React event handlers.

### Findings

- The page SSR HTML loaded, and the fallback styles applied.
- React did not hydrate because Next dev referenced client chunks such as `/main-app.js`, `/app-pages-internals.js`, and `/app/workspace/page.js` that returned `404`.
- Production build output used hashed chunks and served them correctly.

### Changes

- Added `start` to `apps/web/package.json`.
- Added root `web:start` script.
- Switched the running preview on port 3000 from `next dev` to `next start` after `next build`.

### Validation

- Confirmed production preview serves CSS and JS chunks with `200`.
- Playwright smoke test confirmed `Focus reading` hides the dock, `Show dock` restores it, `/quiz` command writes output, and PDF upload still shows `Page 1 of 3`.

### Next small step

Use production preview for in-app browser acceptance until the Next dev chunk mismatch is understood or removed by framework/version changes.

## 2026-06-23 - Workspace component extraction

### Goal

Reduce the large workspace component into focused modules before adding real PDF text selection, InteractionTask schemas, and EvidenceEvent persistence.

### Changes

- Extracted shared workspace types to `components/workspace/types.ts`.
- Extracted mock workspace data and constants to `components/workspace/data.ts`.
- Extracted tree helpers to `components/workspace/tree-utils.ts`.
- Extracted critical fallback styles to `components/workspace/workspace-fallback-styles.ts`.
- Extracted `PdfReaderPane`, `RightDock`, `UnitTreePanel`, `VisualWorkspace`, `InteractionConsole`, `ConceptTreeDraft`, and `DockPanel`.
- Reduced `mock-workspace.tsx` from 821 lines to 180 lines focused on orchestration and state.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests.
- Restarted production preview on port 3000.
- Playwright smoke test confirmed Focus reading hides the dock, Show dock restores it, `/quiz` produces console output, PDF upload renders `Page 1 of 3`, and the right dock still exposes `UnitTree`, `Visual Workspace`, and `Console`.

### Next small step

Implement real PDF text-layer/source-span capture so selected text can replace the current mock selection path.

## 2026-06-23 - PDF text-layer selection slice

### Goal

Replace the mock-only selected-text path with a real PDF text-layer capture path that can feed the Interaction Console.

### Decisions

- Keep the visible PDF render as a canvas for now.
- Overlay transparent PDF text spans from `page.getTextContent()` so users can drag-select source text.
- Attach selected text as `SelectionContext` with text, page, and source metadata.
- Keep the sample capture button temporarily as a fallback while PDF text extraction is improved.

### Changes

- Added a transparent `.pdf-text-layer` above the PDF canvas.
- Added `SelectionContext` with `pdf-text-layer` and `sample` sources.
- Passed PDF text selections from `PdfReaderPane` into the workspace state and Console context stack.
- Updated `/note` and `/quiz` mock commands to use the selected source text context.
- Added matching fallback CSS so production and fallback-styled workspace renders behave consistently.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests, 1 existing FastAPI/Starlette TestClient deprecation warning.
- Restarted production preview on `http://127.0.0.1:3000`.
- Playwright smoke test uploaded `tmp/visible-test.pdf`, found PDF text-layer spans, drag-selected `KnowTree PDF Test Page 1`, confirmed Console context showed `24 chars / page 1 / pdf-text-layer`, ran `/quiz`, and verified focus-reading hide/show still works.

### Next small step

Define backend schemas for `SelectionContext`, `InteractionTask`, and `EvidenceEvent`, then connect Console commands to API-backed task/evidence records.

## 2026-06-23 - Dock panel overflow and terminal scrolling

### Goal

Prevent the right-side learning tools from overflowing the workspace when Console output, UnitTree content, visual drafts, or selected text become long.

### Decisions

- Keep the right dock fixed to the viewport height.
- Let each open dock panel own its scroll area instead of letting the whole page grow.
- Keep Console output stream independently scrollable, similar to a terminal output pane.
- Keep selected source text and visual workspace panes scrollable as their content grows.

### Changes

- Changed the right dock from a natural-height grid to a fixed-height flex column.
- Added `min-height: 0` and `overflow: auto` to dock panel bodies.
- Added proportional flex sizing for UnitTree, Visual Workspace, and Console panels.
- Added independent scrolling for `.console-output-stream`.
- Added overflow handling for selected-text blockquotes, concept pool, and concept draft areas.
- Mirrored the same rules in the inline fallback workspace styles.

### Validation

- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 5 tests, 1 existing FastAPI/Starlette TestClient deprecation warning.
- Restarted production preview on `http://127.0.0.1:3000`.
- Playwright smoke test generated 18 Console outputs and confirmed `.console-output-stream` scrolls independently, all three `.dock-panel-body` elements use `overflow: auto`, and `.right-dock` remains fixed-height with `overflow: hidden`.

### Next small step

Move from mock Console commands to API-backed `InteractionTask` and `EvidenceEvent` records, while keeping the scroll containment behavior as the default right-dock layout rule.

## 2026-06-23 - InteractionTask and EvidenceEvent backend slice

### Goal

Start backendizing the Console by turning `/submit-tree` from a UI-only mock output into persisted `InteractionTask` and `EvidenceEvent` records.

### Decisions

- Use repo-local JSONL storage under the existing `KNOWTREE_STORAGE_DIR` pattern for this prototype slice.
- Keep `InteractionTask` separate from `EvidenceEvent`: the task records what learning work was requested, while the evidence records what the user submitted.
- Add shared TypeScript types before wiring the frontend, so the UI and API speak the same domain vocabulary.
- Only backendize `/submit-tree` first; `/ask`, `/note`, and `/quiz` remain mock commands until context building and AI provider seams are ready.

### Changes

- Added `apps/api/app/interaction_store.py`.
- Added `POST /api/interaction-tasks`.
- Added `POST /api/evidence-events`.
- Added `GET /api/evidence-events` with optional `session_id` filtering.
- Added API tests for task creation, evidence creation, and session filtering.
- Added shared `SelectionContext`, `InteractionTask`, and `EvidenceEvent` TypeScript interfaces.
- Updated frontend `/submit-tree` to create an InteractionTask, create an EvidenceEvent, and show returned backend ids in the Console output.

### Validation

- `python -m pytest apps/api/tests/test_interactions.py --basetemp .pytest-tmp` passed: 3 tests.
- `python -m compileall apps/api/app` passed.
- `npm --workspace @knowtree/web run build` passed.
- `python -m pytest --basetemp .pytest-tmp` passed: 8 tests, 1 existing FastAPI/Starlette TestClient deprecation warning.
- Restarted API on `http://127.0.0.1:8000` and production preview on `http://127.0.0.1:3000`.
- Playwright smoke test ran `/submit-tree`, observed a Console output containing real `evidence-*` and `task-*` ids, then confirmed the same event exists through `GET /api/evidence-events`.

### Next small step

Backendize `/note` and add a current-unit context builder endpoint, then use that context builder as the common input for future `/ask` and `/quiz` AI calls.
