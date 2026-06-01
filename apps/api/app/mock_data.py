"""Mock reading workspace data for the first KnowTree development slice."""

MOCK_WORKSPACE = {
    "workspace_id": "local-demo",
    "resource": {
        "resource_id": "resource-demo-pdf",
        "title": "Demo Learning Material",
        "kind": "pdf",
        "page_count": 8,
    },
    "current_page": 1,
    "unit_tree": {
        "tree_id": "unit-tree-demo",
        "resource_id": "resource-demo-pdf",
        "units": [
            {
                "unit_id": "unit-1",
                "title": "1. Course Overview",
                "summary": "Introduces the material and learning goals.",
                "start_page": 1,
                "end_page": 2,
                "state": "reading",
                "children": [],
            },
            {
                "unit_id": "unit-2",
                "title": "2. Core Concepts",
                "summary": "Defines the central ideas used by later units.",
                "start_page": 3,
                "end_page": 5,
                "state": "unread",
                "children": [
                    {
                        "unit_id": "unit-2-1",
                        "title": "2.1 Key Definition",
                        "summary": "A focused subsection for the most important definition.",
                        "start_page": 3,
                        "end_page": 3,
                        "state": "unread",
                        "children": [],
                    }
                ],
            },
            {
                "unit_id": "unit-3",
                "title": "3. Worked Example",
                "summary": "Applies the concepts to a concrete example.",
                "start_page": 6,
                "end_page": 8,
                "state": "unread",
                "children": [],
            },
        ],
    },
}


def get_mock_workspace() -> dict:
    """Return a copy-friendly mock workspace payload for UI and API wiring."""
    return MOCK_WORKSPACE
