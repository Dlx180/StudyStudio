# KnowTree API

FastAPI shell for the KnowTree MVP backend.

## Local development

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
uvicorn app.main:app --reload
```

## Checks

```bash
cd apps/api
pytest
```
