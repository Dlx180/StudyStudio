# Testing Strategy

This document defines how to test KnowTree from the MVP onward.

## 1. Testing Goals

Testing should ensure:

1. uploaded resources are handled safely;
2. PDF/PPT viewing and navigation work;
3. UnitReading output is valid and usable;
4. user state is persisted correctly;
5. AI failures do not break the app;
6. user edits are protected;
7. future extensions do not break MVP workflows.

## 2. Test Categories

### 2.1 Unit Tests

Test isolated logic.

Targets:

- schema validation;
- page range utilities;
- current page -> active unit mapping;
- unit tree traversal;
- scope hashing;
- AI output validation;
- state transition rules.

Examples:

```text
Given page 8 and units [1-4, 5-10], active unit should be second unit.
Given AI output with end_page < start_page, validation should fail.
Given state update to mastered, record should persist without modifying unit.
```

### 2.2 Integration Tests

Test combined backend workflows.

Targets:

- upload PDF -> create Resource -> create Page records;
- parse PDF outline -> create FileTree;
- UnitReading job -> persist UnitTree;
- edit unit -> mark modified;
- regenerate tree -> protect edited units;
- ask current unit -> builds correct context.

### 2.3 Frontend Component Tests

Targets:

- UnitTree rendering;
- tree node click;
- active unit highlight;
- state controls;
- error states;
- loading states.

### 2.4 End-to-End Tests

Critical MVP E2E flow:

```text
Create workspace
-> upload PDF
-> open viewer
-> generate UnitTree
-> click unit
-> jump to page
-> mark unit state
-> ask question
-> edit unit title/range
-> reload page
-> verify persisted state and edits
```

### 2.5 AI Contract Tests

AI output must be treated as untrusted.

Test cases:

- valid UnitTree JSON;
- missing title;
- invalid page range;
- cyclic parent references;
- hallucinated page range outside Scope;
- too many units;
- empty units;
- malformed JSON;
- model timeout/error.

Expected behavior:

- validate;
- reject or repair safely;
- fallback to coarse tree;
- show user-friendly error;
- log failure for debugging.

### 2.6 Prompt Regression Tests

Prompt changes can alter behavior. Keep small fixture documents.

Suggested fixtures:

```text
fixtures/pdfs/simple_outline.pdf
fixtures/pdfs/no_outline_lecture.pdf
fixtures/pdfs/long_textbook_chapter.pdf
fixtures/pdfs/sparse_slides_converted.pdf
```

For each fixture, expected properties may include:

- number of units within acceptable range;
- all units have valid page ranges;
- units cover most of Scope;
- major section titles are recognized;
- no page range outside Scope.

Do not require exact wording unless testing a deterministic stub.

### 2.7 Manual QA

Manual tests are important for reading UX.

Checklist:

- PDF scroll feels smooth.
- Tree node click jumps to correct page.
- Current unit highlight feels intuitive.
- Right panel does not block reading.
- User can recover from failed AI generation.
- Long PDF does not trigger full expensive processing by default.
- PPT conversion output is readable.

## 3. Test Fixtures

Create a small fixture set:

1. short PDF with outline;
2. short PDF without outline;
3. 30-slide converted lecture deck;
4. long book-like PDF or synthetic equivalent;
5. malformed/corrupt PDF sample if safe;
6. sparse slide deck with little text.

Do not commit copyrighted course materials unless allowed.

## 4. Mocking AI

Use mock AI outputs in most automated tests.

Recommended approach:

- unit/integration tests use deterministic fixtures;
- one optional test suite can call real AI provider when environment variable is set;
- CI should not require paid AI calls by default.

Example:

```text
RUN_REAL_AI_TESTS=false by default
```

## 5. Performance and Cost Tests

MVP performance checks:

- upload and open ordinary PDF;
- generate UnitTree for 20-40 page Scope;
- ensure long 500+ page book does not deep-process automatically;
- verify cached UnitReading avoids repeated AI call.

Cost safety checks:

- identical UnitReading request hits cache;
- prompt/model version change invalidates cache;
- user-triggered regenerate is explicit.

## 6. Data Migration Tests

Whenever schema changes:

- create migration;
- test migration on sample database;
- verify existing Resource, UnitTree, ReadingUnit, and StateRecord data survive;
- document breaking changes in `docs/decisions.md`.

## 7. Suggested Commands

These commands are placeholders and should be updated after the actual stack is implemented.

```bash
# backend tests
cd apps/api
pytest

# frontend tests
cd apps/web
npm test

# e2e tests
npm run test:e2e

# lint/format
npm run lint
npm run format
```

## 8. Definition of Done for MVP

A feature is done only if:

- code is implemented;
- relevant tests are added or updated;
- errors are handled;
- UI loading/empty states are handled;
- docs are updated if behavior changes;
- AI prompts are versioned if changed;
- migrations are included if schema changes.

## 9. Open Testing Questions / TBD

- Which E2E framework should be used: Playwright or Cypress?
- How many fixture documents should be stored in the repo?
- Should snapshot tests be used for UnitTree outputs?
- How to evaluate answer quality for current-unit Q&A?
- How to measure UnitTree usefulness beyond schema validity?
