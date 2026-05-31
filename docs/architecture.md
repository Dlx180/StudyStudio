# Architecture Specification: KnowTree

Status: living architecture document  
Scope: MVP architecture with extension points for later product stages

## 1. Architecture Goals

The architecture should support:

1. a reliable PDF/PPT reading workflow;
2. AI-assisted UnitTree generation;
3. user-correctable reading structures;
4. progressive processing for long documents;
5. clear separation between original resources, generated units, and user state;
6. future extension to personal knowledge graphs, plugins, and shared templates.

The architecture should avoid:

- treating pages as heavy knowledge objects;
- mixing AI output directly with source truth;
- forcing KnowledgeGraph implementation into the MVP;
- binding the implementation to Edge's internal PDF reader;
- rebuilding from scratch for later stages.

## 2. System Overview

```text
Frontend Web App
  ├─ Resource workspace UI
  ├─ PDF/PPT reading pane
  ├─ UnitTree pane
  ├─ state/editing interactions
  └─ AI question panel

Backend API
  ├─ resource management
  ├─ document processing orchestration
  ├─ UnitReading orchestration
  ├─ UnitTree persistence
  ├─ StateOverlay persistence
  └─ AI job cache

Processing Workers
  ├─ PDF text/page extraction
  ├─ PPT/PPTX -> PDF conversion
  ├─ document profiling
  ├─ FileTree extraction
  └─ UnitReading jobs

Storage Layer
  ├─ PostgreSQL metadata
  ├─ object/file storage
  ├─ optional vector index
  └─ prompt/job logs
```

## 3. Recommended Technology Stack

MVP recommendation:

```text
Frontend:
- Next.js / React
- Tailwind CSS
- PDF.js or react-pdf
- tree component; React Flow optional later

Backend:
- FastAPI / Python
- Pydantic schema validation
- SQLAlchemy or equivalent ORM

Database:
- PostgreSQL
- pgvector optional later

Jobs:
- Redis + Celery/RQ, or equivalent background job system

Document processing:
- PyMuPDF for PDF text/page extraction
- LibreOffice headless for PPT/PPTX -> PDF
- pdfplumber/unstructured optional later
- OCR optional later

AI:
- provider abstraction
- prompt versioning
- JSON/schema-validated outputs
- AI job cache
```

## 4. Core Data Model

### 4.1 Workspace

Represents a learning workspace, such as a course, project, or reading collection.

Suggested fields:

```text
Workspace:
- id
- owner_id, nullable for local prototype
- title
- description
- created_at
- updated_at
```

### 4.2 Resource

Represents an uploaded or imported material.

```text
Resource:
- id
- workspace_id
- title
- resource_type: pdf | ppt | pptx | webpage | video | github | note
- original_filename
- storage_uri
- converted_pdf_uri, optional
- file_hash
- page_count
- profile_type: lecture_ppt | textbook | paper | handbook | exercise_set | notes | unknown
- processing_status: uploaded | parsed | profiled | failed
- created_at
- updated_at
```

### 4.3 Page

Lightweight locator within a resource.

```text
Page:
- id
- resource_id
- page_number
- page_hash, optional
- extracted_text, optional
- thumbnail_uri, optional
- extraction_status
```

Notes:

- Do not create heavy LLM-generated metadata for every Page by default.
- For long documents, extracted text may be lazy or partial.

### 4.4 FileTree

Original document structure.

```text
FileTree:
- id
- resource_id
- source: pdf_outline | ppt_order | inferred | manual
- version
- created_at
```

```text
FileTreeNode:
- id
- file_tree_id
- parent_id
- title
- start_page
- end_page
- order_index
- source_confidence, optional
```

### 4.5 Scope

A selected processing range used as input to UnitReading.

A Scope may be persisted or passed as request data.

```text
Scope:
- type: resource | file_tree_node | page_range | multi_resource | selection
- resource_id, optional
- start_page, optional
- end_page, optional
- file_tree_node_id, optional
- resource_ids, optional
- description, optional
```

### 4.6 UnitTree

Generated or edited learning structure over a Scope.

```text
UnitTree:
- id
- workspace_id
- scope_hash
- title
- learning_mode: first_learning | review | exam | project | overview
- source: ai | user | imported | merged
- prompt_version, optional
- model_version, optional
- review_status: draft | confirmed | modified
- created_at
- updated_at
```

### 4.7 ReadingUnit

Central MVP object.

```text
ReadingUnit:
- id
- unit_tree_id
- parent_id
- title
- summary
- role: motivation | prerequisite | core_concept | example | exercise | summary | application | other
- difficulty: easy | medium | hard | unknown
- source_resource_id
- start_page
- end_page
- order_index
- concepts_json, optional
- prerequisites_json, optional
- created_by: ai | user | system
- confidence, optional
- review_status: draft | confirmed | modified
```

### 4.8 StateRecord / StateOverlay

Dynamic user state over a unit, tree, or session.

```text
StateRecord:
- id
- owner_id, nullable for local prototype
- workspace_id
- target_type: reading_unit | unit_tree | page | knowledge_node
- target_id
- tree_id, optional
- session_id, optional
- learning_mode: first_learning | review | exam | project | overview
- status: unseen | reading | understood | weak | mastered | needs_review
- progress_value, optional
- last_interaction_at
- note, optional
```

Rationale:

- State follows learning purpose/session.
- It does not overwrite Resource, FileTree, or UnitTree.

### 4.9 AIJob

Tracks expensive AI processing.

```text
AIJob:
- id
- job_type: document_profile | unit_reading | question_answer | merge_units
- input_hash
- resource_id, optional
- unit_tree_id, optional
- prompt_version
- model_version
- status: queued | running | succeeded | failed
- output_json_uri or output_json
- error_message, optional
- created_at
- completed_at
```

### 4.10 Reserved Future KnowledgeGraph Objects

Do not require these in MVP, but reserve naming and extension points.

```text
KnowledgeNode:
- id
- title
- node_type: concept | skill | formula | method | example | misconception | application

KnowledgeEdge:
- id
- source_node_id
- target_node_id
- relation_type: prerequisite | contains | related | confused_with | applied_in | derived_from

UnitKnowledgeLink:
- id
- reading_unit_id
- knowledge_node_id
- relation_type: mentions | explains | tests | prerequisite_for
```

## 5. Main Processing Pipelines

### 5.1 PDF Upload Pipeline

```text
User uploads PDF
-> store file
-> create Resource
-> extract page count
-> create lightweight Page records
-> extract text where possible
-> extract FileTree from outline/headings if possible
-> run DocumentProfiler
-> wait for Scope selection or default Scope
```

### 5.2 PPT/PPTX Upload Pipeline

```text
User uploads PPT/PPTX
-> store original file
-> convert to PDF using LibreOffice headless
-> create Resource with converted_pdf_uri
-> create Page records where each page maps to a slide
-> run same PDF pipeline
```

### 5.3 UnitReading Pipeline

```text
Input: Scope + document profile + optional user context + learning mode
-> collect relevant page text and FileTree context
-> build compact model input
-> call LLM through provider abstraction
-> validate JSON output
-> create UnitTree and ReadingUnits
-> cache AIJob output
-> render result in UI
```

### 5.4 UnitTree Editing Pipeline

```text
User edits unit title/range/structure
-> update ReadingUnit fields
-> mark review_status = modified
-> preserve AI-generated original if history is implemented
-> do not regenerate or overwrite unless user confirms
```

### 5.5 Question Answering Pipeline

```text
User asks about current unit/page/selection
-> determine context window
-> retrieve current unit page text and nearby unit summaries
-> call AI answer endpoint
-> return answer with page/unit reference where possible
```

Do not pass entire long documents by default.

### 5.6 Future UnitTree Merge Pipeline

```text
Multiple UnitTrees
-> detect similar/repeated units
-> propose merged units
-> produce merged UnitTree or UnitGraph
-> preserve source resource/page references
-> allow user review
```

## 6. UnitReading Interface Contract

### 6.1 Request

```json
{
  "workspace_id": "ws_001",
  "scope": {
    "type": "page_range",
    "resource_id": "res_001",
    "start_page": 1,
    "end_page": 36
  },
  "document_profile": {
    "profile_type": "lecture_ppt",
    "density": "medium",
    "structure_quality": "weak_outline"
  },
  "learning_mode": "first_learning",
  "user_context": {
    "goal": "understand this lecture",
    "background": "basic linear algebra and calculus"
  },
  "options": {
    "max_units": 12,
    "allow_prerequisite_units": true
  }
}
```

### 6.2 Response

```json
{
  "title": "Lecture 3: Linear Regression",
  "units": [
    {
      "temp_id": "u1",
      "parent_temp_id": null,
      "title": "Problem Motivation",
      "summary": "Introduces the prediction problem and why a linear model is useful.",
      "role": "motivation",
      "difficulty": "easy",
      "source_resource_id": "res_001",
      "start_page": 1,
      "end_page": 4,
      "concepts": ["regression", "supervised learning"],
      "prerequisites": []
    }
  ],
  "warnings": [
    "Pages 20-22 have sparse text; unit boundaries may be approximate."
  ]
}
```

### 6.3 Validation Rules

- `start_page <= end_page`.
- Page range must be inside Scope.
- Unit titles must be non-empty.
- Units should be ordered.
- Parent references must form a tree, not a cycle.
- If output is invalid, fallback to a coarse page-range tree.

## 7. Frontend Architecture

Recommended components:

```text
WorkspacePage
  ├─ ResourceSidebar
  ├─ DocumentViewerPane
  │   ├─ PDFViewer
  │   ├─ PageNavigator
  │   └─ SelectionToolbar
  ├─ UnitTreePane
  │   ├─ UnitTreeView
  │   ├─ UnitDetailCard
  │   └─ StateControls
  └─ AIAssistantPanel
```

State synchronization:

- Document viewer exposes current page.
- UnitTree maps current page to active ReadingUnit.
- Clicking ReadingUnit triggers document jump.
- StateControls update StateRecord.

## 8. Backend API Sketch

Potential endpoints:

```text
POST   /workspaces
GET    /workspaces/:id
POST   /workspaces/:id/resources
GET    /resources/:id
GET    /resources/:id/pages
GET    /resources/:id/file-tree
POST   /unit-reading
GET    /unit-trees/:id
PATCH  /reading-units/:id
POST   /reading-units/:id/split
POST   /reading-units/merge
POST   /state-records
PATCH  /state-records/:id
POST   /ai/ask
GET    /ai-jobs/:id
```

Endpoint names are not fixed, but the domain boundaries should remain clear.

## 9. AI Architecture

### 9.1 Provider Abstraction

Do not hard-code provider logic throughout the application.

Use a service layer such as:

```text
AIClient.generate_json(prompt_version, input, schema)
AIClient.answer_question(prompt_version, context, question)
```

### 9.2 Prompt Versioning

Prompt changes can alter product behavior. Store prompt versions.

Suggested path:

```text
/prompts/unit_reading/v1.md
/prompts/document_profile/v1.md
/prompts/ask_current_unit/v1.md
```

### 9.3 Cost Control

- Use compact Scope context.
- Avoid full-document model calls for long books.
- Cache outputs by `input_hash + prompt_version + model_version`.
- Use background jobs for expensive processing.

## 10. Extension Points

### 10.1 KnowledgeGraph Extension

After UnitTree is stable:

```text
ReadingUnit -> concept candidates -> KnowledgeNode candidates -> user/private graph
```

This should be a separate pipeline, not part of core reading display.

### 10.2 Browser Plugin Extension

Browser plugin should import web resources into the same Resource/Scope/UnitReading pipeline.

### 10.3 Public Graph Extension

Public/shared graph must be separate from private user workspace graph.

### 10.4 Local/Desktop Extension

Desktop/local sync may later manage local folders and privacy-sensitive workflows. It should still produce Resource records and Scopes compatible with UnitReading.

## 11. Open Technical Questions / TBD

1. Auth system and account model.
2. Production deployment environment.
3. Object storage provider.
4. Whether to use pgvector in MVP.
5. OCR strategy and scanned PDF support.
6. Best PDF text extraction fallback stack.
7. Whether UnitTree history/versioning is required in MVP.
8. Whether to store original AI output separately from edited UnitTree.
9. Whether StateRecord should include time-spent analytics in MVP.
10. Prompt evaluation dataset format.
