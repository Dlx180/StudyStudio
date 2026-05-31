# AGENTS.md

## Project Context

This project is an AI-assisted learning system based on a knowledge graph.

The core architecture includes:

- File Layer: parse source files such as PDF, PPT, Markdown, and webpages.
- ReadingUnit Layer: split source materials into stable learning units.
- UnitTree Layer: organize ReadingUnits into a hierarchical learning structure.
- KnowledgeGraph Layer: store concepts, prerequisites, relations, examples, and references.
- State Layer: store user-specific learning states separately from the source knowledge structure.

## Key Architectural Rules

- Keep file-derived structures independent from user learning states.
- Do not mix document parsing logic with learning-state management.
- ReadingUnit should be the basic interface between file parsing and higher-level learning structures.
- UnitTree may use LLMs, but its output should preserve references to original source positions.
- StateLayer changes according to learning scenarios such as first learning, review, mastery tracking, and forgetting.
- The underlying KnowledgeGraph should remain stable and reusable.

## Development Rules

- Prefer modular, testable code.
- Use clear interfaces between FileParser, ReadingUnitBuilder, UnitTreeBuilder, KnowledgeGraphManager, and StateManager.
- Add tests when adding core logic.
- Before changing architecture, update docs/decisions.md.
