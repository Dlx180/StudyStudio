# Task Board

## Milestone 1: Project Skeleton

### Task 1: Initialize repository structure

Create a minimal full-stack project structure for KnowledgeTree.

Expected modules:

- backend
- frontend
- shared types
- docs
- tests

Do not implement complex LLM logic yet.

---

## Milestone 2: ReadingUnit MVP

### Task 2: Define ReadingUnit schema

ReadingUnit should include:

- id
- source_file_id
- source_type
- title
- content
- page_or_slide_range
- anchors
- metadata

---

## Milestone 3: UnitTree MVP

### Task 3: Define UnitTree schema

UnitTree should organize ReadingUnits into a learning-oriented hierarchy.

The UnitTree should not store user learning state directly.

---

## Milestone 4: StateLayer MVP

### Task 4: Define user learning state

Support states such as:

- unseen
- learning
- reviewing
- mastered
- forgotten
- skipped
