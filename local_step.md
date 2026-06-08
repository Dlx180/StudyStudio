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
