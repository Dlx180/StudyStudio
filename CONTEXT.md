# Project Context

This file defines the project domain language. It is a glossary, not a feature spec.

## Glossary

**StudyStudio**  
The product shell: an interactive learning IDE where users read source material, perform structured learning interactions, generate evidence, and receive state-based next-step guidance.

**KnowTree**  
The project's existing name and a possible name for the knowledge/tree engine inside StudyStudio. Until a rename is finalized, repository and package names may still use KnowTree.

**Reading Area**  
The left-side trusted source material surface, usually a PDF/PPT reader in the MVP.

**Architecture Tree**  
The right-side tree area in StudyStudio. It can show FileTree, ReadingUnit tree, concept tree, task tree, or state tree views.

**Visual Workspace**  
The right-side visual interaction area where users complete structured tasks such as building concept trees, matching source evidence, or arranging relationships.

**Study Terminal**  
The right-side command and output area for learning commands, context inspection, feedback, evidence logs, and future study planning.

**Resource**  
An original learning material, such as a PDF, PPT/PPTX, webpage, video transcript, GitHub repository, or note.

**Page**  
A stable locator inside a Resource. For converted PPT/PPTX files, a page usually corresponds to a slide.

**SourceSpan**  
A traceable span of original source material, usually tied to a Resource, Page, text range, and optionally layout coordinates.

**FileTree**  
The original structure of a Resource, such as PDF outline, chapters, headings, or slide order.

**ReadingUnit**  
A learning-sized unit that groups one or more source pages or spans for reading, questioning, review, and state tracking.

**UnitTree**  
A learning-oriented tree of ReadingUnits for a specific scope or learning purpose. In the UI, it is one Architecture Tree view.

**InteractionTask**  
A structured learning task requested by the system or user, such as building a concept tree, answering a quiz, or finding source evidence.

**EvidenceEvent**  
A persisted record of learning evidence produced by an interaction, such as a note, quiz answer, concept-tree submission, or source match.

**StateOverlay**  
User/session/mode-specific state over units, trees, tasks, or future knowledge items. It must not overwrite source structures.

**State Kernel**  
The system layer that stores evidence, learner state, task state, and state update logic.

**Scheduler**  
The system layer that chooses the next learning action from current state and evidence.

**NextLearningAct**  
A recommended next action, such as explain, probe, repair, review, practice, or advance.

**KnowledgeItem**  
A future long-term knowledge object, such as a concept, definition, formula, theorem, method, example, or misconception.

**KnowledgeGraph**  
A future long-term graph of KnowledgeItems and relations. It is not required for the MVP StudyStudio loop.
