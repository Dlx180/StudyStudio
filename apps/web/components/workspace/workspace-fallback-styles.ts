export const WORKSPACE_FALLBACK_STYLES = `
  :root { color: #172033; background: #f4f7fb; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f7fb; }
  button, input, textarea { font: inherit; }
  .workspace-shell { display: grid; grid-template-columns: minmax(0, 1fr) 460px; gap: 1.25rem; height: 100vh; min-height: 100vh; padding: 1.25rem; }
  .workspace-shell.reader-focus { grid-template-columns: minmax(0, 1fr); }
  .document-pane, .right-dock { min-height: 0; border: 1px solid #dbe4f0; border-radius: 24px; background: #fff; padding: 1.5rem; }
  .right-dock { display: flex; flex-direction: column; gap: .85rem; height: calc(100vh - 2.5rem); max-height: calc(100vh - 2.5rem); overflow: hidden; }
  .reader-header, .reader-context-actions, .dock-panel-header, .selection-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
  .reader-header h1 { margin: 0; }
  .eyebrow { margin: 0 0 .5rem; color: #506386; font-size: .78rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .dock-toggle, .reader-context-actions button, .selection-action-bar button, .page-controls button, .dock-panel-header, .concept-chip, .concept-tree-node button, .selection-card button, .command-line button, .visual-actions button { border: 1px solid #cbd8ea; border-radius: 8px; background: #fff; color: #172033; cursor: pointer; }
  .dock-toggle, .reader-context-actions button, .page-controls button { padding: .55rem .75rem; }
  .upload-strip { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1rem 0; border: 1px solid #cbd8ea; border-radius: 10px; background: #f7f9fd; padding: .75rem .9rem; color: #35435d; cursor: pointer; }
  .reader-context-actions { margin: -.35rem 0 .85rem; color: #60718f; font-size: .86rem; }
  .selection-action-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: .45rem; }
  .selection-action-bar span { color: #506386; font-size: .82rem; }
  .selection-action-bar button:first-of-type { border-color: #2253ff; background: #eef3ff; color: #173ea5; font-weight: 700; }
  .page-card { display: grid; min-height: 62vh; place-items: center; border: 1px dashed #9eb2cf; border-radius: 20px; background: linear-gradient(135deg, #eef4ff, #fff); padding: 2rem; text-align: center; }
  .page-card strong { font-size: clamp(3rem, 12vw, 8rem); }
  .page-card p { max-width: 480px; }
  .pdf-frame { display: grid; min-height: 62vh; max-height: 70vh; place-items: start center; overflow: auto; overscroll-behavior: contain; border: 1px solid #dbe4f0; border-radius: 12px; background: #eef2f7; padding: 1rem; scrollbar-gutter: stable both-edges; }
  .pdf-canvas { display: block; background: #fff; box-shadow: 0 18px 42px rgb(23 32 51 / 16%); }
  .pdf-page-shell { position: relative; display: inline-block; flex: 0 0 auto; line-height: 1; }
  .pdf-text-layer { position: absolute; inset: 0; z-index: 2; overflow: hidden; user-select: text; }
  .pdf-text-layer span { position: absolute; color: transparent; white-space: pre; cursor: text; transform-origin: 0 0; }
  .pdf-text-layer ::selection { background: rgb(34 83 255 / 28%); }
  .page-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; }
  .unit-tree, .unit-children, .concept-tree-draft { list-style: none; margin: 0; padding: 0; }
  .unit-children { margin-left: 1rem; }
  .unit-node { display: grid; width: 100%; margin-bottom: .65rem; padding: .85rem; text-align: left; border-radius: 14px; }
  .unit-node small, .dock-panel-header small, .visual-header span, .console-header small, .console-prompt, .muted { color: #60718f; font-size: .85rem; }
  .unit-node.active { border-color: #2253ff; background: #eef3ff; box-shadow: inset 4px 0 0 #2253ff; }
  .unit-detail { margin-top: 1.25rem; border-radius: 12px; background: #f6f8fc; padding: 1rem; }
  .unit-detail dl { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
  .unit-detail dt { color: #60718f; font-size: .8rem; }
  .unit-detail dd { margin: .2rem 0 0; font-weight: 700; }
  .dock-panel { display: flex; flex-direction: column; min-height: 0; border: 1px solid #dbe4f0; border-radius: 12px; background: #fbfcff; overflow: hidden; }
  .dock-panel:nth-of-type(1) { flex: .85 1 0; }
  .dock-panel:nth-of-type(2) { flex: 1.15 1 0; }
  .dock-panel:nth-of-type(3) { flex: 1.2 1 0; }
  .dock-panel.collapsed { flex: 0 0 auto; background: #fff; }
  .dock-panel-header { flex: 0 0 auto; width: 100%; border: 0; background: transparent; padding: .85rem; text-align: left; }
  .dock-panel-header span, .visual-header { display: grid; gap: .2rem; }
  .console-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
  .console-header span { display: grid; gap: .2rem; min-width: 0; }
  .console-header button { flex: 0 0 auto; border: 1px solid #cbd8ea; border-radius: 8px; background: #fff; color: #172033; cursor: pointer; font-size: .82rem; padding: .42rem .55rem; }
  .dock-panel-header b { color: #506386; font-size: .78rem; }
  .dock-panel-body { min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 0 .85rem .85rem; scrollbar-gutter: stable; }
  .visual-workspace, .interaction-console { display: grid; gap: .85rem; min-height: 0; }
  .interaction-console { grid-template-rows: auto auto auto minmax(0, 1fr) auto; height: 100%; }
  .visual-workspace { grid-template-rows: auto auto minmax(0, 1fr) auto; height: 100%; }
  .concept-workbench { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: .75rem; min-height: 0; overflow: hidden; }
  .concept-pool, .concept-draft, .selection-card { min-height: 0; overflow: auto; border: 1px solid #dbe4f0; border-radius: 10px; background: #fff; padding: .75rem; }
  .concept-pool h4 { margin: 0 0 .65rem; color: #35435d; font-size: .85rem; }
  .concept-chip { display: grid; width: 100%; margin-bottom: .5rem; padding: .6rem; text-align: left; cursor: grab; }
  .concept-chip small, .concept-tree-node small { margin-top: .15rem; color: #60718f; font-size: .75rem; }
  .concept-dropzone { display: grid; min-height: 42px; place-items: center; border: 1px dashed #9eb2cf; border-radius: 8px; background: #f4f7fb; color: #60718f; font-size: .82rem; }
  .concept-dropzone.root { margin-bottom: .65rem; }
  .concept-dropzone.empty { margin-top: .5rem; }
  .concept-tree-draft .concept-tree-draft { margin-left: 1rem; padding-left: .75rem; border-left: 2px solid #dbe4f0; }
  .concept-tree-node { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin: .5rem 0; border: 1px solid #cbd8ea; border-radius: 8px; background: #fff; padding: .6rem; }
  .concept-tree-node span { display: grid; }
  .selection-card { display: grid; gap: .65rem; }
  .selection-card.compact { max-height: 150px; }
  .selection-card-header span { display: flex; flex-wrap: wrap; gap: .4rem; }
  .selection-card blockquote { max-height: 82px; overflow: auto; margin: 0; border-left: 3px solid #2253ff; background: #f6f8fc; color: #35435d; padding: .65rem; }
  .context-stack { display: grid; gap: .35rem; border: 1px solid #dbe4f0; border-radius: 10px; background: #f7f9fd; padding: .65rem; }
  .context-stack span { color: #35435d; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: .78rem; }
  .command-line { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .5rem; align-items: center; border: 1px solid #cbd8ea; border-radius: 10px; background: #172033; padding: .55rem; }
  .command-line span { color: #8fb3ff; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; }
  .command-line input { min-width: 0; border: 0; outline: 0; background: transparent; color: #fff; font: inherit; }
  .command-line input::placeholder { color: #9eb2cf; }
  .terminal-session { display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: .55rem; min-height: 0; overflow: hidden; border: 1px solid #dbe4f0; border-radius: 10px; background: #fbfcff; padding: .65rem; }
  .console-output-stream { display: grid; align-content: start; gap: .55rem; min-height: 0; max-height: none; overflow: auto; overscroll-behavior: contain; padding-right: .15rem; scrollbar-gutter: stable; }
  .console-output { display: grid; gap: .2rem; border: 1px solid #dbe4f0; border-radius: 10px; background: #fff; padding: .65rem; }
  .console-output strong { color: #506386; font-size: .74rem; text-transform: uppercase; }
  .console-output p { margin: 0; color: #172033; font-size: .88rem; }
  .console-output.user { margin-left: 1rem; border-color: #cbd8ea; background: #f7f9fd; }
  .console-output.evidence { border-color: #b8d9c3; background: #f2fbf5; }
  .console-output.source { border-color: #b8c7e8; background: #f4f7ff; }
  .terminal-result-card { display: grid; gap: .45rem; margin-top: .35rem; border: 1px solid #c6d6f2; border-radius: 8px; background: #f7faff; padding: .65rem; }
  .terminal-result-card span, .follow-up-task small { color: #506386; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: .74rem; }
  .terminal-result-card b { color: #172033; font-size: .9rem; }
  .terminal-result-card ul { display: grid; gap: .25rem; margin: 0; padding-left: 1.15rem; }
  .terminal-result-card li, .terminal-result-card p { margin: 0; color: #35435d; font-size: .84rem; }
  .follow-up-task { display: grid; gap: .2rem; border-left: 3px solid #3f7f5f; background: #f2fbf5; padding: .45rem .55rem; }
  .follow-up-actions { display: flex; flex-wrap: wrap; gap: .35rem; }
  .follow-up-actions button { border: 1px solid #b8d9c3; border-radius: 8px; background: #fff; color: #2f5c42; cursor: pointer; font-size: .78rem; padding: .32rem .45rem; }
  .follow-up-actions button:disabled { cursor: default; opacity: .7; }
  .verification-task-card { display: grid; gap: .55rem; max-height: 180px; overflow: auto; border: 1px solid #b8d9c3; border-radius: 10px; background: #f2fbf5; padding: .7rem; }
  .verification-task-card div { display: grid; gap: .25rem; }
  .verification-task-card small { color: #3f6a4f; font-size: .74rem; font-weight: 700; text-transform: uppercase; }
  .verification-task-card strong { color: #172033; font-size: .9rem; }
  .verification-task-card p, .verification-task-card span { margin: 0; color: #35435d; font-size: .82rem; }
  .verification-task-card p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
  .verification-task-card pre { max-height: 180px; overflow: auto; margin: 0; border: 1px solid #dbe4f0; border-radius: 8px; background: #fff; color: #35435d; font-size: .74rem; padding: .6rem; white-space: pre-wrap; }
  @media (max-width: 900px) { .workspace-shell { grid-template-columns: 1fr; } .reader-header, .reader-context-actions, .upload-strip { align-items: stretch; flex-direction: column; } .concept-workbench { grid-template-columns: 1fr; } }
`;
